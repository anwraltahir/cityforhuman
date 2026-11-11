/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
import {
  INITIAL_CHAPTERS,
  INITIAL_USERS,
  INITIAL_DISCUSSIONS,
  INITIAL_COMMENTS,
  INITIAL_ARTICLES,
  INITIAL_SITE_SETTINGS,
} from '../data/initialData';

const STORAGE_KEYS = {
  CURRENT_USER: 'cfh_current_user',
  USERS: 'cfh_users',
  CHAPTERS: 'cfh_chapters',
  DISCUSSIONS: 'cfh_discussions',
  COMMENTS: 'cfh_comments',
  ARTICLES: 'cfh_articles',
  NOTIFICATIONS: 'cfh_notifications',
  REPORTS: 'cfh_reports',
  MODERATION_LOG: 'cfh_moderation_log',
  SITE_SETTINGS: 'cfh_site_settings',
};

class DataStore {
  private users: User[] = [];
  private chapters: Chapter[] = [];
  private discussions: Discussion[] = [];
  private comments: Comment[] = [];
  private articles: Article[] = [];
  private notifications: NotificationItem[] = [];
  private reports: ReportItem[] = [];
  private moderationLog: ModerationAction[] = [];
  private siteSettings: SiteSettings = INITIAL_SITE_SETTINGS;
  private currentUser: User | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      this.users = this.loadFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
      this.chapters = this.loadFromStorage(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
      this.discussions = this.loadFromStorage(STORAGE_KEYS.DISCUSSIONS, INITIAL_DISCUSSIONS);
      this.comments = this.loadFromStorage(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
      this.articles = this.loadFromStorage(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES);
      this.notifications = this.loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, [
        {
          id: 'notif_welcome',
          userId: 'user_author_osman',
          title: 'مرحباً بك في مجتمع مدن الإنسان',
          message: 'تم إطلاق المنصة بنجاح لمناقشة أفكار الكتاب والتخطيط الحضري الإنساني.',
          type: 'system',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ]);
      this.reports = this.loadFromStorage(STORAGE_KEYS.REPORTS, []);
      this.moderationLog = this.loadFromStorage(STORAGE_KEYS.MODERATION_LOG, [
        {
          id: 'mod_1',
          moderatorName: 'عثمان الطيب',
          action: 'تهيئة النظام',
          target: 'منصة مدن الإنسان',
          details: 'إطلاق النظام مع الفصول العشرة وحساب الإدارة المعتمد',
          timestamp: new Date().toISOString(),
        },
      ]);
      this.siteSettings = this.loadFromStorage(STORAGE_KEYS.SITE_SETTINGS, INITIAL_SITE_SETTINGS);

      // Default current user to Osman (Admin) for instant exploration, or saved user
      const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      } else {
        this.currentUser = this.users[0] || null;
      }

      // Ensure author Osman's avatar, bio, and email are synchronized with official asset
      const osman = this.users.find((u) => u.id === 'user_author_osman');
      if (osman) {
        osman.avatar = '/src/assets/images/author_osman_square.jpeg';
        osman.bio = INITIAL_USERS[0].bio;
        osman.email = 'osman7777@gmail.com';
      }
      this.siteSettings.contactEmail = 'osman7777@gmail.com';
      if (this.currentUser && this.currentUser.id === 'user_author_osman') {
        this.currentUser.avatar = '/src/assets/images/author_osman_square.jpeg';
        this.currentUser.bio = INITIAL_USERS[0].bio;
        this.currentUser.email = 'osman7777@gmail.com';
      }
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
      }
    } catch {
      this.users = INITIAL_USERS;
      this.chapters = INITIAL_CHAPTERS;
      this.discussions = INITIAL_DISCUSSIONS;
      this.comments = INITIAL_COMMENTS;
      this.articles = INITIAL_ARTICLES;
      this.siteSettings = INITIAL_SITE_SETTINGS;
      this.currentUser = INITIAL_USERS[0];
    }
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item) return JSON.parse(item);
    } catch {
      // Fallback
    }
    return fallback;
  }

  private saveToStorage(key: string, data: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.notifyListeners();
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
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

  // --- Auth & Users ---
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.notifyListeners();
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public register(name: string, username: string, email: string): { success: boolean; user?: User; error?: string } {
    if (this.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'البريد الإلكتروني مسجل بالفعل' };
    }
    if (this.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'اسم المستخدم مستخدم مسبقاً' };
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      username,
      email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=C1E2B9&textColor=268F0C`,
      role: 'member',
      status: 'active',
      joinedAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.saveToStorage(STORAGE_KEYS.USERS, this.users);
    this.setCurrentUser(newUser);

    // Welcome notification
    this.createNotification({
      userId: newUser.id,
      title: 'أهلاً بك في مجتمع مدن الإنسان!',
      message: 'نسعد بمشاركتك في الحوار حول مستقبل مدننا الإنسانية ومناقشة فصول الكتاب.',
      type: 'system',
    });

    return { success: true, user: newUser };
  }

  public login(emailOrUsername: string): { success: boolean; user?: User; error?: string } {
    const trimmed = emailOrUsername.trim().toLowerCase();
    const user = this.users.find(
      (u) =>
        u.email.toLowerCase() === trimmed ||
        u.username.toLowerCase() === trimmed ||
        (u.id === 'user_author_osman' &&
          (trimmed === 'osman7777@gmail.com' || trimmed === 'admin@cityforhuman.com'))
    );

    if (!user) {
      return { success: false, error: 'لم يتم العثور على حساب بهذه البيانات' };
    }

    if (user.status === 'suspended') {
      return { success: false, error: 'هذا الحساب معطل حالياً من قِبل إدارة المنصة' };
    }

    this.setCurrentUser(user);
    return { success: true, user };
  }

  public logout() {
    this.setCurrentUser(null);
  }

  public updateUserProfile(userId: string, data: Partial<Pick<User, 'name' | 'bio' | 'avatar'>>) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;

    if (data.name) user.name = data.name;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.avatar) user.avatar = data.avatar;

    this.saveToStorage(STORAGE_KEYS.USERS, this.users);

    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = { ...user };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    }
    this.notifyListeners();
  }

  public setUserStatus(userId: string, status: 'active' | 'suspended', moderatorName: string) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;
    user.status = status;
    this.saveToStorage(STORAGE_KEYS.USERS, this.users);

    this.addModerationLog({
      moderatorName,
      action: status === 'suspended' ? 'تعطيل حساب مستخدم' : 'تفعيل حساب مستخدم',
      target: user.name,
      details: `تم تعديل حالة حساب @${user.username} إلى ${status === 'suspended' ? 'معطل' : 'نشط'}`,
    });
  }

  public setUserRole(userId: string, role: UserRole, moderatorName: string) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;
    user.role = role;
    this.saveToStorage(STORAGE_KEYS.USERS, this.users);

    this.addModerationLog({
      moderatorName,
      action: 'تغيير صلاحيات مستخدم',
      target: user.name,
      details: `تم تغيير رتبة @${user.username} إلى ${role}`,
    });
  }

  // --- Chapters ---
  public getChapters(): Chapter[] {
    return [...this.chapters].sort((a, b) => a.order - b.order);
  }

  public getChapterById(id: number): Chapter | undefined {
    return this.chapters.find((c) => c.id === id);
  }

  public updateChapter(id: number, data: Partial<Chapter>, moderatorName: string) {
    const chapter = this.chapters.find((c) => c.id === id);
    if (!chapter) return;
    Object.assign(chapter, data);
    this.saveToStorage(STORAGE_KEYS.CHAPTERS, this.chapters);

    this.addModerationLog({
      moderatorName,
      action: 'تعديل بيانات الفصل',
      target: chapter.title,
      details: `تم تحديث محتوى أو ترتيب الفصل رقم ${chapter.id}`,
    });
  }

  // --- Discussions ---
  public getDiscussions(chapterId?: number, query?: string, sort: 'latest' | 'active' | 'views' = 'latest'): Discussion[] {
    let list = [...this.discussions];

    if (chapterId) {
      list = list.filter((d) => d.chapterId === chapterId);
    }

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q));
    }

    // Always keep pinned items on top
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sort === 'active') {
        const aActivity = a.commentsCount * 2 + a.likes.length;
        const bActivity = b.commentsCount * 2 + b.likes.length;
        return bActivity - aActivity;
      }
      if (sort === 'views') {
        return b.views - a.views;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public getDiscussionById(id: string): Discussion | undefined {
    return this.discussions.find((d) => d.id === id);
  }

  public incrementDiscussionViews(id: string) {
    const disc = this.discussions.find((d) => d.id === id);
    if (!disc) return;
    disc.views += 1;
    this.saveToStorage(STORAGE_KEYS.DISCUSSIONS, this.discussions);
  }

  public createDiscussion(params: {
    chapterId: number;
    title: string;
    content: string;
    imageUrl?: string;
  }): Discussion | null {
    if (!this.currentUser) return null;

    const newDisc: Discussion = {
      id: `disc_${Date.now()}`,
      chapterId: params.chapterId,
      title: params.title.trim(),
      content: params.content.trim(),
      authorId: this.currentUser.id,
      authorName: this.currentUser.name,
      authorAvatar: this.currentUser.avatar,
      authorRole: this.currentUser.role,
      imageUrl: params.imageUrl?.trim() || undefined,
      views: 1,
      likes: [],
      followers: [this.currentUser.id],
      commentsCount: 0,
      isPinned: false,
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.discussions.unshift(newDisc);

    // Update chapter discussion count
    const ch = this.chapters.find((c) => c.id === params.chapterId);
    if (ch) {
      ch.discussionsCount += 1;
      this.saveToStorage(STORAGE_KEYS.CHAPTERS, this.chapters);
    }

    this.saveToStorage(STORAGE_KEYS.DISCUSSIONS, this.discussions);
    return newDisc;
  }

  public toggleLikeDiscussion(discussionId: string): boolean {
    if (!this.currentUser) return false;
    const disc = this.discussions.find((d) => d.id === discussionId);
    if (!disc) return false;

    const index = disc.likes.indexOf(this.currentUser.id);
    let isLikedNow = false;

    if (index >= 0) {
      disc.likes.splice(index, 1);
    } else {
      disc.likes.push(this.currentUser.id);
      isLikedNow = true;

      // Notify author if not self
      if (disc.authorId !== this.currentUser.id) {
        this.createNotification({
          userId: disc.authorId,
          title: 'إعجاب بنقاشك',
          message: `أعجب ${this.currentUser.name} بنقاشك: "${disc.title.slice(0, 40)}..."`,
          type: 'like',
          targetType: 'discussion',
          targetId: disc.id,
        });
      }
    }

    this.saveToStorage(STORAGE_KEYS.DISCUSSIONS, this.discussions);
    return isLikedNow;
  }

  public toggleFollowDiscussion(discussionId: string): boolean {
    if (!this.currentUser) return false;
    const disc = this.discussions.find((d) => d.id === discussionId);
    if (!disc) return false;

    const index = disc.followers.indexOf(this.currentUser.id);
    let isFollowingNow = false;

    if (index >= 0) {
      disc.followers.splice(index, 1);
    } else {
      disc.followers.push(this.currentUser.id);
      isFollowingNow = true;
    }

    this.saveToStorage(STORAGE_KEYS.DISCUSSIONS, this.discussions);
    return isFollowingNow;
  }

  public setDiscussionPinned(discussionId: string, isPinned: boolean, moderatorName: string) {
    const disc = this.discussions.find((d) => d.id === discussionId);
    if (!disc) return;
    disc.isPinned = isPinned;
    this.saveToStorage(STORAGE_KEYS.DISCUSSIONS, this.discussions);

    this.addModerationLog({
      moderatorName,
      action: isPinned ? 'تثبيت نقاش' : 'إلغاء تثبيت نقاش',
      target: disc.title,
      details: `تم ${isPinned ? 'تثبيت' : 'إلغاء تثبيت'} الموضوع في الفصل ${disc.chapterId}`,
    });
  }

  public setDiscussionLocked(discussionId: string, isLocked: boolean, moderatorName: string) {
    const disc = this.discussions.find((d) => d.id === discussionId);
    if (!disc) return;
    disc.isLocked = isLocked;
    this.saveToStorage(STORAGE_KEYS.DISCUSSIONS, this.discussions);

    this.addModerationLog({
      moderatorName,
      action: isLocked ? 'إغلاق نقاش' : 'إعادة فتح نقاش',
      target: disc.title,
      details: `تم ${isLocked ? 'إغلاق' : 'فتح'} الردود على هذا النقاش`,
    });
  }

  public deleteDiscussion(discussionId: string, moderatorName: string) {
    const disc = this.discussions.find((d) => d.id === discussionId);
    if (!disc) return;

    this.discussions = this.discussions.filter((d) => d.id !== discussionId);
    this.comments = this.comments.filter((c) => c.discussionId !== discussionId);

    const ch = this.chapters.find((c) => c.id === disc.chapterId);
    if (ch && ch.discussionsCount > 0) {
      ch.discussionsCount -= 1;
      this.saveToStorage(STORAGE_KEYS.CHAPTERS, this.chapters);
    }

    this.saveToStorage(STORAGE_KEYS.DISCUSSIONS, this.discussions);
    this.saveToStorage(STORAGE_KEYS.COMMENTS, this.comments);

    this.addModerationLog({
      moderatorName,
      action: 'حذف موضوع نقاش',
      target: disc.title,
      details: 'تم حذف النقاش وتعليقاته المرتبطة',
    });
  }

  // --- Comments ---
  public getCommentsTree(discussionId: string, sort: 'latest' | 'oldest' | 'active' = 'latest'): Comment[] {
    const discussionComments = this.comments.filter((c) => c.discussionId === discussionId);

    // Build parent-children map
    const parents: Comment[] = [];
    const childrenMap = new Map<string, Comment[]>();

    discussionComments.forEach((c) => {
      if (c.parentId) {
        const arr = childrenMap.get(c.parentId) || [];
        arr.push({ ...c, replies: [] });
        childrenMap.set(c.parentId, arr);
      } else {
        parents.push({ ...c, replies: [] });
      }
    });

    // Attach children recursively
    const attachChildren = (parent: Comment) => {
      const children = childrenMap.get(parent.id) || [];
      children.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      parent.replies = children;
      children.forEach(attachChildren);
    };

    parents.forEach(attachChildren);

    // Sort top-level parents
    if (sort === 'active') {
      parents.sort((a, b) => (b.likes.length + (b.replies?.length || 0)) - (a.likes.length + (a.replies?.length || 0)));
    } else if (sort === 'oldest') {
      parents.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      parents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return parents;
  }

  public addComment(params: {
    discussionId: string;
    content: string;
    parentId?: string | null;
  }): Comment | null {
    if (!this.currentUser) return null;

    const disc = this.discussions.find((d) => d.id === params.discussionId);
    if (!disc || disc.isLocked) return null;

    const newComment: Comment = {
      id: `comm_${Date.now()}`,
      discussionId: params.discussionId,
      parentId: params.parentId || null,
      authorId: this.currentUser.id,
      authorName: this.currentUser.name,
      authorAvatar: this.currentUser.avatar,
      authorRole: this.currentUser.role,
      content: params.content.trim(),
      likes: [],
      createdAt: new Date().toISOString(),
    };

    this.comments.push(newComment);
    disc.commentsCount += 1;

    // Increment chapter comment count
    const ch = this.chapters.find((c) => c.id === disc.chapterId);
    if (ch) ch.commentsCount += 1;

    this.saveToStorage(STORAGE_KEYS.COMMENTS, this.comments);
    this.saveToStorage(STORAGE_KEYS.DISCUSSIONS, this.discussions);
    this.saveToStorage(STORAGE_KEYS.CHAPTERS, this.chapters);

    // Notification handling:
    // If it's a reply to a comment, notify that comment's author
    if (params.parentId) {
      const parentComm = this.comments.find((c) => c.id === params.parentId);
      if (parentComm && parentComm.authorId !== this.currentUser.id) {
        this.createNotification({
          userId: parentComm.authorId,
          title: 'رد جديد على تعليقك',
          message: `رد ${this.currentUser.name} على تعليقك في نقاش "${disc.title.slice(0, 35)}..."`,
          type: 'reply',
          targetType: 'discussion',
          targetId: disc.id,
        });
      }
    } else {
      // Notify discussion author
      if (disc.authorId !== this.currentUser.id) {
        this.createNotification({
          userId: disc.authorId,
          title: 'تعليق جديد على موضوعك',
          message: `أضاف ${this.currentUser.name} تعليقاً على نقاشك "${disc.title.slice(0, 35)}..."`,
          type: 'reply',
          targetType: 'discussion',
          targetId: disc.id,
        });
      }
    }

    // Notify other followers
    disc.followers.forEach((followerId) => {
      if (followerId !== this.currentUser?.id && followerId !== disc.authorId) {
        this.createNotification({
          userId: followerId,
          title: 'تفاعل جديد في نقاش تتابعه',
          message: `أُضيف رد جديد في نقاش: "${disc.title.slice(0, 35)}..."`,
          type: 'follow',
          targetType: 'discussion',
          targetId: disc.id,
        });
      }
    });

    return newComment;
  }

  public editComment(commentId: string, content: string): boolean {
    const comment = this.comments.find((c) => c.id === commentId);
    if (!comment) return false;
    if (this.currentUser?.id !== comment.authorId && this.currentUser?.role !== 'admin') return false;

    comment.content = content.trim();
    comment.isEdited = true;
    this.saveToStorage(STORAGE_KEYS.COMMENTS, this.comments);
    return true;
  }

  public deleteComment(commentId: string, moderatorName?: string): boolean {
    const comment = this.comments.find((c) => c.id === commentId);
    if (!comment) return false;

    const disc = this.discussions.find((d) => d.id === comment.discussionId);

    // Delete comment and any nested direct replies
    const toDeleteIds = new Set<string>([commentId]);
    const findChildren = (pid: string) => {
      this.comments.forEach((c) => {
        if (c.parentId === pid) {
          toDeleteIds.add(c.id);
          findChildren(c.id);
        }
      });
    };
    findChildren(commentId);

    const deletedCount = toDeleteIds.size;
    this.comments = this.comments.filter((c) => !toDeleteIds.has(c.id));

    if (disc) {
      disc.commentsCount = Math.max(0, disc.commentsCount - deletedCount);
      const ch = this.chapters.find((c) => c.id === disc.chapterId);
      if (ch) ch.commentsCount = Math.max(0, ch.commentsCount - deletedCount);
    }

    this.saveToStorage(STORAGE_KEYS.COMMENTS, this.comments);
    this.saveToStorage(STORAGE_KEYS.DISCUSSIONS, this.discussions);
    this.saveToStorage(STORAGE_KEYS.CHAPTERS, this.chapters);

    if (moderatorName) {
      this.addModerationLog({
        moderatorName,
        action: 'حذف تعليق',
        target: comment.authorName,
        details: `حذف تعليق مخالف في الموضوع: ${disc?.title || ''}`,
      });
    }

    return true;
  }

  public toggleLikeComment(commentId: string): boolean {
    if (!this.currentUser) return false;
    const comment = this.comments.find((c) => c.id === commentId);
    if (!comment) return false;

    const index = comment.likes.indexOf(this.currentUser.id);
    let isLikedNow = false;

    if (index >= 0) {
      comment.likes.splice(index, 1);
    } else {
      comment.likes.push(this.currentUser.id);
      isLikedNow = true;
    }

    this.saveToStorage(STORAGE_KEYS.COMMENTS, this.comments);
    return isLikedNow;
  }

  // --- Reader Articles ---
  public getArticles(status: 'all' | 'approved' | 'pending' | 'rejected' = 'approved'): Article[] {
    if (status === 'all') {
      return [...this.articles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return this.articles
      .filter((a) => a.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getArticleById(id: string): Article | undefined {
    return this.articles.find((a) => a.id === id);
  }

  public submitArticle(params: {
    title: string;
    category: string;
    excerpt: string;
    content: string;
    coverImage?: string;
  }): Article | null {
    if (!this.currentUser) return null;

    const newArticle: Article = {
      id: `art_${Date.now()}`,
      title: params.title.trim(),
      category: params.category,
      excerpt: params.excerpt.trim(),
      content: params.content.trim(),
      coverImage: params.coverImage || '/src/assets/images/urban_plaza_articles_1794401625775.jpg',
      authorId: this.currentUser.id,
      authorName: this.currentUser.name,
      authorAvatar: this.currentUser.avatar,
      authorBio: this.currentUser.bio,
      status: 'pending', // Directly goes to moderation queue!
      views: 0,
      createdAt: new Date().toISOString(),
    };

    this.articles.unshift(newArticle);
    this.saveToStorage(STORAGE_KEYS.ARTICLES, this.articles);

    this.createNotification({
      userId: this.currentUser.id,
      title: 'تم استلام مقالك للمراجعة',
      message: `تم إرسال مقالك "${newArticle.title}" بنجاح، وسيظهر للمجتمع بعد اعتماده من فريق التحرير.`,
      type: 'article_status',
      targetType: 'article',
      targetId: newArticle.id,
    });

    return newArticle;
  }

  public reviewArticle(
    articleId: string,
    status: 'approved' | 'rejected' | 'needs_revision',
    notes: string,
    moderatorName: string
  ) {
    const article = this.articles.find((a) => a.id === articleId);
    if (!article) return;

    article.status = status;
    article.moderatorNotes = notes;
    if (status === 'approved' && !article.publishedAt) {
      article.publishedAt = new Date().toISOString();
    }

    this.saveToStorage(STORAGE_KEYS.ARTICLES, this.articles);

    // Notify author
    const statusArabic =
      status === 'approved'
        ? 'تمت الموافقة على نشر مقالك'
        : status === 'rejected'
        ? 'تم رفض نشر المقال'
        : 'طلب تعديل على مقالك';

    this.createNotification({
      userId: article.authorId,
      title: statusArabic,
      message: `${statusArabic}: "${article.title}". ${notes ? `ملاحظات: ${notes}` : ''}`,
      type: 'article_status',
      targetType: 'article',
      targetId: article.id,
    });

    this.addModerationLog({
      moderatorName,
      action: `مراجعة مقال (${status})`,
      target: article.title,
      details: notes || 'تم تحديث حالة النشر',
    });
  }

  // --- Notifications ---
  public getNotificationsForUser(userId: string): NotificationItem[] {
    return this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getUnreadNotificationCount(userId: string): number {
    return this.notifications.filter((n) => n.userId === userId && !n.isRead).length;
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (!notif) return;
    notif.isRead = true;
    this.saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  public markAllNotificationsAsRead(userId: string) {
    this.notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    this.saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  public createNotification(params: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>) {
    const notif: NotificationItem = {
      ...params,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(notif);
    this.saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  // --- Reports & Moderation ---
  public submitReport(params: {
    targetType: 'discussion' | 'comment' | 'article';
    targetId: string;
    targetTitle: string;
    reason: string;
    details: string;
  }): ReportItem | null {
    if (!this.currentUser) return null;

    const report: ReportItem = {
      id: `rep_${Date.now()}`,
      reporterId: this.currentUser.id,
      reporterName: this.currentUser.name,
      targetType: params.targetType,
      targetId: params.targetId,
      targetTitle: params.targetTitle,
      reason: params.reason,
      details: params.details,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.reports.unshift(report);
    this.saveToStorage(STORAGE_KEYS.REPORTS, this.reports);

    return report;
  }

  public getReports(status: 'all' | 'pending' | 'resolved' = 'all'): ReportItem[] {
    if (status === 'all') return [...this.reports];
    return this.reports.filter((r) => r.status === status);
  }

  public resolveReport(reportId: string, resolution: string, moderatorName: string, status: 'resolved' | 'dismissed') {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) return;

    report.status = status;
    report.resolution = resolution;
    this.saveToStorage(STORAGE_KEYS.REPORTS, this.reports);

    // Notify reporter
    this.createNotification({
      userId: report.reporterId,
      title: 'تحديث بشأن بلاغك',
      message: `تم التعامل مع بلاغك حول "${report.targetTitle}": ${resolution}`,
      type: 'report_action',
    });

    this.addModerationLog({
      moderatorName,
      action: status === 'resolved' ? 'معالجة بلاغ' : 'تجاهل بلاغ',
      target: report.targetTitle,
      details: resolution,
    });
  }

  public getModerationLogs(): ModerationAction[] {
    return [...this.moderationLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private addModerationLog(log: Omit<ModerationAction, 'id' | 'timestamp'>) {
    const item: ModerationAction = {
      ...log,
      id: `mod_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.moderationLog.unshift(item);
    this.saveToStorage(STORAGE_KEYS.MODERATION_LOG, this.moderationLog);
  }

  // --- Admin Stats ---
  public getAdminStats() {
    return {
      totalUsers: this.users.length,
      activeUsers: this.users.filter((u) => u.status === 'active').length,
      totalDiscussions: this.discussions.length,
      totalComments: this.comments.length,
      publishedArticles: this.articles.filter((a) => a.status === 'approved').length,
      pendingArticles: this.articles.filter((a) => a.status === 'pending').length,
      openReports: this.reports.filter((r) => r.status === 'pending').length,
      totalViews: this.discussions.reduce((sum, d) => sum + d.views, 0) + this.articles.reduce((sum, a) => sum + a.views, 0),
    };
  }

  // --- Site Settings ---
  public getSiteSettings(): SiteSettings {
    return { ...this.siteSettings };
  }

  public updateSiteSettings(settings: Partial<SiteSettings>, moderatorName: string) {
    this.siteSettings = { ...this.siteSettings, ...settings };
    this.saveToStorage(STORAGE_KEYS.SITE_SETTINGS, this.siteSettings);

    this.addModerationLog({
      moderatorName,
      action: 'تحديث إعدادات الموقع',
      target: 'إعدادات المنصة',
      details: 'تم تعديل البيانات التعريفية أو نصوص الصفحة الرئيسية',
    });
  }
}

export const store = new DataStore();
