/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Client data store. The server (server/engine.ts) is the single source of truth:
 * every change is sent to /api/action and the server returns the fresh state, so an
 * edit made on one device shows on every other device. The last state is cached in
 * localStorage only to render instantly on the next visit.
 */

import {
  User,
  Chapter,
  Discussion,
  Comment,
  Article,
  NotificationItem,
  ReportItem,
  ModerationAction,
  SiteSettings,
  UserRole,
} from '../types';
import { INITIAL_CHAPTERS, INITIAL_SITE_SETTINGS } from '../data/initialData';

interface ServerState {
  me: User | null;
  users: User[];
  chapters: Chapter[];
  discussions: Discussion[];
  comments: Comment[];
  articles: Article[];
  notifications: NotificationItem[];
  reports: ReportItem[];
  moderationLog: ModerationAction[];
  settings: SiteSettings;
  importedLocal: boolean;
}

/** Result of a server action: `error` holds an Arabic message ready for a toast. */
export interface ActResult<T = unknown> {
  ok: boolean;
  result?: T;
  error?: string;
}

const SESSION_KEY = 'cfh_session';
const CACHE_KEY = 'cfh_state_cache';
const REFRESH_MS = 30_000;

// Keys used by the old browser-only version (read once for migration, then removed)
const LEGACY_KEYS = [
  'cfh_current_user', 'cfh_users', 'cfh_chapters', 'cfh_discussions', 'cfh_comments', 'cfh_articles',
  'cfh_notifications', 'cfh_reports', 'cfh_moderation_log', 'cfh_site_settings', 'cfh_admin_verified', 'cfh_admin_token',
];

const emptyState = (): ServerState => ({
  me: null,
  users: [],
  chapters: INITIAL_CHAPTERS.map((c) => ({ ...c, discussionsCount: 0, commentsCount: 0 })),
  discussions: [],
  comments: [],
  articles: [],
  notifications: [],
  reports: [],
  moderationLog: [],
  settings: INITIAL_SITE_SETTINGS,
  importedLocal: true,
});

const safeGet = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const safeSet = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // storage unavailable (private mode): the site still works, just without the cache
  }
};

class DataStore {
  private state: ServerState = emptyState();
  private token: string = safeGet(SESSION_KEY) || '';
  private loaded = false;
  private hadCache = false;
  private listeners: Set<() => void> = new Set();
  private viewed = new Set<string>();

  constructor() {
    // Render instantly from the last known state, then refresh from the server
    try {
      const cached = safeGet(CACHE_KEY);
      if (cached) {
        this.state = { ...emptyState(), ...JSON.parse(cached) };
        this.hadCache = true;
        if (!this.token) this.state.me = null;
      }
    } catch {
      // ignore a corrupt cache
    }
    this.refresh();
    if (typeof window !== 'undefined') {
      window.setInterval(() => {
        if (document.visibilityState === 'visible') this.refresh();
      }, REFRESH_MS);
      window.addEventListener('focus', () => this.refresh());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') this.refresh();
      });
    }
  }

  // ------------------------------------------------------------ sync plumbing
  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) h.Authorization = `Bearer ${this.token}`;
    return h;
  }

  private apply(state: ServerState) {
    this.state = state;
    this.loaded = true;
    // Token expired or account suspended: the server no longer recognises us
    if (this.token && !state.me) this.setToken('');
    safeSet(CACHE_KEY, JSON.stringify({ ...state, me: null, notifications: [], reports: [], moderationLog: [] }));
    this.notifyListeners();
    this.migrateLegacy();
  }

  private setToken(token: string) {
    this.token = token;
    safeSet(SESSION_KEY, token || null);
  }

  /** Re-read everything from the server. */
  public async refresh(): Promise<void> {
    try {
      const r = await fetch('/api/state', { headers: this.headers(), cache: 'no-store' });
      const data = await r.json();
      if (data.ok) this.apply(data.state);
    } catch {
      // offline: keep showing the cached state
    }
  }

  private async act<T = unknown>(type: string, args: Record<string, unknown> = {}): Promise<ActResult<T>> {
    try {
      const r = await fetch('/api/action', { method: 'POST', headers: this.headers(), body: JSON.stringify({ type, args }) });
      const data = await r.json().catch(() => ({}));
      if (data.token) this.setToken(data.token);
      if (data.state) this.apply(data.state);
      if (!r.ok || !data.ok) return { ok: false, error: data.error || 'تعذر تنفيذ العملية' };
      return { ok: true, result: data.result as T };
    } catch {
      return { ok: false, error: 'تعذر الاتصال بالخادم، تحقق من الإنترنت وحاول مجدداً' };
    }
  }

  /**
   * One-time move of data that the old version kept only in this browser.
   * Runs for the admin when the server has not imported yet; the legacy keys are
   * then removed everywhere once the server reports the import is done.
   */
  private migrating = false;
  private async migrateLegacy() {
    if (this.migrating || !safeGet('cfh_discussions')) return;
    if (this.state.importedLocal) {
      LEGACY_KEYS.forEach((k) => safeSet(k, null));
      return;
    }
    if (this.state.me?.role !== 'admin') return;
    this.migrating = true;
    const read = (k: string) => {
      try {
        return JSON.parse((safeGet(k) || 'null').split('/src/assets/images/').join('/images/'));
      } catch {
        return null;
      }
    };
    const res = await this.act('importLocal', {
      users: read('cfh_users') || [],
      discussions: read('cfh_discussions') || [],
      comments: read('cfh_comments') || [],
      articles: read('cfh_articles') || [],
    });
    if (res.ok) LEGACY_KEYS.forEach((k) => safeSet(k, null));
    this.migrating = false;
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  /** True once there is something real to show (server data or the cached copy). */
  public isReady(): boolean {
    return this.loaded || this.hadCache;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  // ------------------------------------------------------------ session & users
  public getCurrentUser(): User | null {
    return this.state.me;
  }

  /** Session token for admin-only HTTP endpoints (covers, interest list). */
  public getAdminToken(): string {
    return this.token;
  }

  private async auth(path: string, body: Record<string, unknown>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.ok) return { success: false, error: data.error || 'تعذر تسجيل الدخول' };
      this.setToken(data.token);
      this.apply(data.state);
      return { success: true, user: data.state.me };
    } catch {
      return { success: false, error: 'تعذر الاتصال بالخادم' };
    }
  }

  public register(name: string, username: string, email: string, password: string) {
    return this.auth('/api/auth/register', { name, username, email, password });
  }

  public login(identifier: string, password: string) {
    return this.auth('/api/auth/login', { identifier, password });
  }

  public logout() {
    this.setToken('');
    this.state = { ...this.state, me: null, notifications: [], reports: [], moderationLog: [] };
    this.notifyListeners();
    this.refresh();
  }

  public getUsers(): User[] {
    return [...this.state.users];
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public updateUserProfile(userId: string, data: Partial<Pick<User, 'name' | 'bio' | 'avatar'>>) {
    return this.act('updateProfile', { userId, ...data });
  }

  public changePassword(current: string, next: string) {
    return this.act('changePassword', { current, next });
  }

  public setUserStatus(userId: string, status: 'active' | 'suspended') {
    return this.act('setUserStatus', { userId, status });
  }

  public resetUserPassword(userId: string, password: string) {
    return this.act('resetUserPassword', { userId, password });
  }

  public setUserRole(userId: string, role: UserRole) {
    return this.act('setUserRole', { userId, role });
  }

  // ------------------------------------------------------------ chapters
  public getChapters(): Chapter[] {
    return [...this.state.chapters].sort((a, b) => a.order - b.order);
  }

  public getChapterById(id: number): Chapter | undefined {
    return this.state.chapters.find((c) => c.id === id);
  }

  public updateChapter(id: number, data: Partial<Chapter>) {
    return this.act('updateChapter', { id, data });
  }

  // ------------------------------------------------------------ discussions
  public getDiscussions(chapterId?: number, query?: string, sort: 'latest' | 'active' | 'views' = 'latest'): Discussion[] {
    let list = [...this.state.discussions];
    if (chapterId) list = list.filter((d) => d.chapterId === chapterId);
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q));
    }
    // Pinned items always stay on top
    return list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (sort === 'active') return b.commentsCount * 2 + b.likes.length - (a.commentsCount * 2 + a.likes.length);
      if (sort === 'views') return b.views - a.views;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public getDiscussionById(id: string): Discussion | undefined {
    return this.state.discussions.find((d) => d.id === id);
  }

  /** Counts a view once per page load. */
  public incrementDiscussionViews(id: string) {
    if (this.viewed.has(id)) return;
    this.viewed.add(id);
    this.act('viewDiscussion', { id });
  }

  public createDiscussion(params: { chapterId: number; title: string; content: string; imageUrl?: string }) {
    return this.act<Discussion>('createDiscussion', params);
  }

  public editDiscussion(id: string, data: { title?: string; content?: string; imageUrl?: string; chapterId?: number }) {
    return this.act('editDiscussion', { id, ...data });
  }

  public toggleLikeDiscussion(id: string) {
    return this.act<boolean>('toggleLikeDiscussion', { id });
  }

  public toggleFollowDiscussion(id: string) {
    return this.act<boolean>('toggleFollowDiscussion', { id });
  }

  public setDiscussionPinned(id: string, value: boolean) {
    return this.act('setDiscussionPinned', { id, value });
  }

  public setDiscussionLocked(id: string, value: boolean) {
    return this.act('setDiscussionLocked', { id, value });
  }

  public deleteDiscussion(id: string) {
    return this.act('deleteDiscussion', { id });
  }

  // ------------------------------------------------------------ comments
  public getCommentsTree(discussionId: string, sort: 'latest' | 'oldest' | 'active' = 'latest'): Comment[] {
    const own = this.state.comments.filter((c) => c.discussionId === discussionId);
    const parents: Comment[] = [];
    const children = new Map<string, Comment[]>();
    own.forEach((c) => {
      if (c.parentId) {
        const arr = children.get(c.parentId) || [];
        arr.push({ ...c, replies: [] });
        children.set(c.parentId, arr);
      } else {
        parents.push({ ...c, replies: [] });
      }
    });
    const attach = (p: Comment) => {
      const kids = children.get(p.id) || [];
      kids.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      p.replies = kids;
      kids.forEach(attach);
    };
    parents.forEach(attach);
    const time = (c: Comment) => new Date(c.createdAt).getTime();
    if (sort === 'active') parents.sort((a, b) => b.likes.length + (b.replies?.length || 0) - (a.likes.length + (a.replies?.length || 0)));
    else if (sort === 'oldest') parents.sort((a, b) => time(a) - time(b));
    else parents.sort((a, b) => time(b) - time(a));
    return parents;
  }

  public addComment(params: { discussionId: string; content: string; parentId?: string | null }) {
    return this.act<Comment>('addComment', params);
  }

  public editComment(id: string, content: string) {
    return this.act('editComment', { id, content });
  }

  public deleteComment(id: string) {
    return this.act('deleteComment', { id });
  }

  public toggleLikeComment(id: string) {
    return this.act<boolean>('toggleLikeComment', { id });
  }

  // ------------------------------------------------------------ articles
  public getArticles(status: 'all' | 'approved' | 'pending' | 'rejected' = 'approved'): Article[] {
    const list = status === 'all' ? [...this.state.articles] : this.state.articles.filter((a) => a.status === status);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getArticleById(id: string): Article | undefined {
    return this.state.articles.find((a) => a.id === id);
  }

  public incrementArticleViews(id: string) {
    if (this.viewed.has(id)) return;
    this.viewed.add(id);
    this.act('viewArticle', { id });
  }

  public submitArticle(params: { title: string; category: string; excerpt: string; content: string; coverImage?: string }) {
    return this.act<Article>('submitArticle', params);
  }

  public editArticle(id: string, data: Partial<Pick<Article, 'title' | 'category' | 'excerpt' | 'content' | 'coverImage'>>) {
    return this.act('editArticle', { id, ...data });
  }

  public deleteArticle(id: string) {
    return this.act('deleteArticle', { id });
  }

  public reviewArticle(id: string, status: 'approved' | 'rejected' | 'needs_revision', notes: string) {
    return this.act('reviewArticle', { id, status, notes });
  }

  // ------------------------------------------------------------ notifications
  public getNotificationsForUser(userId: string): NotificationItem[] {
    return this.state.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getUnreadNotificationCount(userId: string): number {
    return this.state.notifications.filter((n) => n.userId === userId && !n.isRead).length;
  }

  public markNotificationAsRead(id: string) {
    return this.act('markNotificationRead', { id });
  }

  public markAllNotificationsAsRead() {
    return this.act('markAllNotificationsRead');
  }

  // ------------------------------------------------------------ reports & moderation
  public submitReport(params: { targetType: 'discussion' | 'comment' | 'article'; targetId: string; targetTitle: string; reason: string; details: string }) {
    return this.act<ReportItem>('submitReport', params);
  }

  public getReports(status: 'all' | 'pending' | 'resolved' = 'all'): ReportItem[] {
    return status === 'all' ? [...this.state.reports] : this.state.reports.filter((r) => r.status === status);
  }

  public resolveReport(id: string, resolution: string, status: 'resolved' | 'dismissed') {
    return this.act('resolveReport', { id, resolution, status });
  }

  public getModerationLogs(): ModerationAction[] {
    return [...this.state.moderationLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getAdminStats() {
    const { users, discussions, comments, articles, reports } = this.state;
    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === 'active').length,
      totalDiscussions: discussions.length,
      totalComments: comments.length,
      publishedArticles: articles.filter((a) => a.status === 'approved').length,
      pendingArticles: articles.filter((a) => a.status === 'pending').length,
      openReports: reports.filter((r) => r.status === 'pending').length,
      totalViews: discussions.reduce((s, d) => s + d.views, 0) + articles.reduce((s, a) => s + a.views, 0),
    };
  }

  // ------------------------------------------------------------ site settings
  public getSiteSettings(): SiteSettings {
    return { ...this.state.settings };
  }

  public updateSiteSettings(settings: Partial<SiteSettings>) {
    return this.act('updateSettings', { settings });
  }
}

export const store = new DataStore();
