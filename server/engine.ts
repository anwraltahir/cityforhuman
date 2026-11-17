/**
 * Server-side data engine: the single source of truth for all community data.
 * Every visitor reads the same state; every change runs here with permission checks.
 * Stored in ./data/db.json (gitignored), written atomically.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
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
} from '../src/types';
import {
  INITIAL_CHAPTERS,
  INITIAL_USERS,
  INITIAL_DISCUSSIONS,
  INITIAL_COMMENTS,
  INITIAL_ARTICLES,
  INITIAL_SITE_SETTINGS,
} from '../src/data/initialData';

export type StoredUser = User & { passwordHash?: string };

export interface DB {
  version: 1;
  importedLocal: boolean;
  users: StoredUser[];
  chapters: Chapter[];
  discussions: Discussion[];
  comments: Comment[];
  articles: Article[];
  notifications: NotificationItem[];
  reports: ReportItem[];
  moderationLog: ModerationAction[];
  settings: SiteSettings;
}

export class ActionError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const now = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;
const isPrivileged = (u?: User | null) => !!u && (u.role === 'admin' || u.role === 'moderator');
const isAdmin = (u?: User | null) => !!u && u.role === 'admin';

/** Trimmed string with a length cap; throws on empty when required. */
const str = (v: unknown, max: number, label: string, required = true) => {
  const s = String(v ?? '').trim();
  if (required && !s) throw new ActionError(`يرجى كتابة ${label}`);
  if (s.length > max) throw new ActionError(`${label} أطول من المسموح (${max} حرفاً)`);
  return s;
};
/** Optional image URL: site path or http(s) link only. */
const imageUrl = (v: unknown) => {
  const s = String(v ?? '').trim();
  if (!s) return undefined;
  if (s.length > 1000 || !/^(https?:\/\/|\/)[^\s"'<>]+$/.test(s)) throw new ActionError('رابط الصورة غير صالح');
  return s;
};

// ---------------------------------------------------------------- passwords
export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
};
export const checkPassword = (password: string, stored: string) => {
  const [, salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const a = crypto.scryptSync(password, salt, 64);
  const b = Buffer.from(hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// ---------------------------------------------------------------- storage
export class Engine {
  db: DB;
  private file: string;

  constructor(dataDir: string) {
    this.file = path.join(dataDir, 'db.json');
    this.db = this.load(dataDir);
  }

  private load(dataDir: string): DB {
    try {
      return JSON.parse(fs.readFileSync(this.file, 'utf8'));
    } catch {
      // First run: seed from the initial data, keeping admin edits already saved in content.json
      const db: DB = {
        version: 1,
        importedLocal: false,
        users: structuredClone(INITIAL_USERS),
        chapters: structuredClone(INITIAL_CHAPTERS),
        discussions: structuredClone(INITIAL_DISCUSSIONS),
        comments: structuredClone(INITIAL_COMMENTS),
        articles: structuredClone(INITIAL_ARTICLES),
        notifications: [],
        reports: [],
        moderationLog: [
          {
            id: 'mod_init',
            moderatorName: 'النظام',
            action: 'تهيئة قاعدة البيانات',
            target: 'منصة مدن الإنسان',
            details: 'نقل بيانات المنصة إلى الخادم لتظهر لجميع الزوار',
            timestamp: now(),
          },
        ],
        settings: structuredClone(INITIAL_SITE_SETTINGS),
      };
      try {
        const content = JSON.parse(fs.readFileSync(path.join(dataDir, 'content.json'), 'utf8'));
        if (content.settings) db.settings = { ...db.settings, ...content.settings };
        if (content.chapters) {
          db.chapters = db.chapters.map((ch) => ({ ...ch, ...(content.chapters[String(ch.id)] || {}) }));
        }
      } catch {
        // no earlier content edits
      }
      this.db = db;
      this.save();
      return db;
    }
  }

  save() {
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.db));
    fs.renameSync(tmp, this.file);
  }

  user(id?: string | null) {
    return id ? this.db.users.find((u) => u.id === id) : undefined;
  }

  // ---------------------------------------------------------------- read model
  /** What a given viewer may see. Emails, other users' notifications, reports and logs stay private. */
  stateFor(viewer?: StoredUser | null) {
    const priv = isPrivileged(viewer);
    const { db } = this;
    const publicUser = ({ passwordHash: _ph, ...u }: StoredUser): User =>
      priv || u.id === viewer?.id ? u : { ...u, email: '' };

    // Counts are derived from real data so they can never drift
    const chapters = db.chapters.map((ch) => {
      const discIds = new Set(db.discussions.filter((d) => d.chapterId === ch.id).map((d) => d.id));
      return {
        ...ch,
        discussionsCount: discIds.size,
        commentsCount: db.comments.filter((c) => discIds.has(c.discussionId)).length,
      };
    });
    const discussions = db.discussions.map((d) => ({
      ...d,
      commentsCount: db.comments.filter((c) => c.discussionId === d.id).length,
    }));

    return {
      me: viewer ? publicUser(viewer) : null,
      users: db.users.map(publicUser),
      chapters,
      discussions,
      comments: db.comments,
      articles: priv ? db.articles : db.articles.filter((a) => a.status === 'approved' || a.authorId === viewer?.id),
      notifications: viewer ? db.notifications.filter((n) => n.userId === viewer.id) : [],
      reports: priv ? db.reports : [],
      moderationLog: priv ? db.moderationLog : [],
      settings: db.settings,
      importedLocal: db.importedLocal,
    };
  }

  // ---------------------------------------------------------------- helpers
  private log(actor: User, action: string, target: string, details: string) {
    this.db.moderationLog.unshift({ id: newId('mod'), moderatorName: actor.name, action, target, details, timestamp: now() });
    this.db.moderationLog = this.db.moderationLog.slice(0, 1000);
  }

  private notify(n: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>) {
    if (!this.user(n.userId)) return;
    this.db.notifications.unshift({ ...n, id: newId('notif'), isRead: false, createdAt: now() });
    this.db.notifications = this.db.notifications.slice(0, 5000);
  }

  private needUser(actor?: StoredUser | null): StoredUser {
    if (!actor) throw new ActionError('يرجى تسجيل الدخول أولاً', 401);
    if (actor.status === 'suspended') throw new ActionError('هذا الحساب معطل حالياً من قِبل إدارة المنصة', 403);
    return actor;
  }
  private needMod(actor?: StoredUser | null) {
    const u = this.needUser(actor);
    if (!isPrivileged(u)) throw new ActionError('هذه العملية للإدارة فقط', 403);
    return u;
  }
  private needAdmin(actor?: StoredUser | null) {
    const u = this.needUser(actor);
    if (!isAdmin(u)) throw new ActionError('هذه العملية للمدير العام فقط', 403);
    return u;
  }
  private disc(id: unknown) {
    const d = this.db.discussions.find((x) => x.id === id);
    if (!d) throw new ActionError('النقاش غير موجود', 404);
    return d;
  }
  private comment(id: unknown) {
    const c = this.db.comments.find((x) => x.id === id);
    if (!c) throw new ActionError('التعليق غير موجود', 404);
    return c;
  }
  private article(id: unknown) {
    const a = this.db.articles.find((x) => x.id === id);
    if (!a) throw new ActionError('المقال غير موجود', 404);
    return a;
  }
  /** Keep the author's denormalized name/avatar on their posts in sync with their profile. */
  private syncAuthor(u: User) {
    for (const list of [this.db.discussions, this.db.comments] as (Discussion | Comment)[][]) {
      for (const x of list) if (x.authorId === u.id) Object.assign(x, { authorName: u.name, authorAvatar: u.avatar, authorRole: u.role });
    }
    for (const a of this.db.articles) if (a.authorId === u.id) Object.assign(a, { authorName: u.name, authorAvatar: u.avatar, authorBio: u.bio });
  }

  // ---------------------------------------------------------------- accounts
  register(body: Record<string, unknown>): StoredUser {
    const name = str(body.name, 80, 'الاسم');
    const username = str(body.username, 40, 'اسم المستخدم').toLowerCase();
    const email = str(body.email, 150, 'البريد الإلكتروني').toLowerCase();
    const password = String(body.password ?? '');
    if (!/^[a-z0-9_.]{3,40}$/.test(username)) throw new ActionError('اسم المستخدم: حروف إنجليزية وأرقام و _ فقط (3 أحرف على الأقل)');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ActionError('البريد الإلكتروني غير صحيح');
    if (password.length < 8) throw new ActionError('كلمة المرور يجب ألا تقل عن 8 أحرف');
    if (this.db.users.some((u) => u.email.toLowerCase() === email)) throw new ActionError('البريد الإلكتروني مسجل بالفعل');
    if (this.db.users.some((u) => u.username.toLowerCase() === username)) throw new ActionError('اسم المستخدم مستخدم مسبقاً');

    const user: StoredUser = {
      id: newId('user'),
      name,
      username,
      email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=C1E2B9&textColor=268F0C`,
      role: 'member',
      status: 'active',
      joinedAt: now(),
      passwordHash: hashPassword(password),
    };
    this.db.users.push(user);
    this.notify({
      userId: user.id,
      title: 'أهلاً بك في مجتمع مدن الإنسان!',
      message: 'نسعد بمشاركتك في الحوار حول مستقبل مدننا الإنسانية ومناقشة فصول الكتاب.',
      type: 'system',
    });
    this.save();
    return user;
  }

  /** Accounts without a stored password (the seeded admin) fall back to ADMIN_PASSWORD. */
  login(identifier: unknown, password: unknown, adminPassword: string): StoredUser {
    const id = String(identifier ?? '').trim().toLowerCase();
    const pw = String(password ?? '');
    const user = this.db.users.find(
      (u) =>
        u.email.toLowerCase() === id ||
        u.username.toLowerCase() === id ||
        (u.id === 'user_author_osman' && id === 'admin@cityforhuman.com')
    );
    const ok =
      !!user &&
      (user.passwordHash
        ? checkPassword(pw, user.passwordHash)
        : isPrivileged(user) && !!adminPassword && pw === adminPassword);
    if (!user || !ok) throw new ActionError('البريد/اسم المستخدم أو كلمة المرور غير صحيحة', 401);
    if (user.status === 'suspended') throw new ActionError('هذا الحساب معطل حالياً من قِبل إدارة المنصة', 403);
    return user;
  }

  // ---------------------------------------------------------------- actions
  /** Runs one named action as `actor`. Returns an action-specific result. */
  run(type: string, a: Record<string, unknown>, actor: StoredUser | null): unknown {
    const result = this.dispatch(type, a || {}, actor);
    this.save();
    return result;
  }

  private dispatch(type: string, a: Record<string, unknown>, actor: StoredUser | null): unknown {
    switch (type) {
      // ---------- profile & users
      case 'updateProfile': {
        const me = this.needUser(actor);
        const target = a.userId && a.userId !== me.id ? (this.needAdmin(actor), this.user(String(a.userId))) : me;
        if (!target) throw new ActionError('المستخدم غير موجود', 404);
        if (a.name !== undefined) target.name = str(a.name, 80, 'الاسم');
        if (a.bio !== undefined) target.bio = str(a.bio, 500, 'النبذة', false);
        if (a.avatar !== undefined) target.avatar = imageUrl(a.avatar) || target.avatar;
        this.syncAuthor(target);
        return true;
      }
      case 'changePassword': {
        const me = this.needUser(actor);
        if (me.passwordHash && !checkPassword(String(a.current ?? ''), me.passwordHash)) {
          throw new ActionError('كلمة المرور الحالية غير صحيحة');
        }
        const next = String(a.next ?? '');
        if (next.length < 8) throw new ActionError('كلمة المرور يجب ألا تقل عن 8 أحرف');
        me.passwordHash = hashPassword(next);
        return true;
      }
      case 'resetUserPassword': {
        const admin = this.needAdmin(actor);
        const u = this.user(String(a.userId));
        if (!u) throw new ActionError('المستخدم غير موجود', 404);
        const pw = String(a.password ?? '');
        if (pw.length < 8) throw new ActionError('كلمة المرور يجب ألا تقل عن 8 أحرف');
        u.passwordHash = hashPassword(pw);
        this.log(admin, 'إعادة تعيين كلمة مرور', u.name, `تم تعيين كلمة مرور مؤقتة لحساب @${u.username}`);
        return true;
      }
      case 'setUserStatus': {
        const mod = this.needMod(actor);
        const u = this.user(String(a.userId));
        if (!u) throw new ActionError('المستخدم غير موجود', 404);
        if (u.id === mod.id) throw new ActionError('لا يمكنك تعطيل حسابك');
        if (isAdmin(u) && !isAdmin(mod)) throw new ActionError('لا يمكن للمشرف تعطيل حساب المدير', 403);
        u.status = a.status === 'suspended' ? 'suspended' : 'active';
        this.log(mod, u.status === 'suspended' ? 'تعطيل حساب مستخدم' : 'تفعيل حساب مستخدم', u.name,
          `تم تعديل حالة حساب @${u.username} إلى ${u.status === 'suspended' ? 'معطل' : 'نشط'}`);
        return true;
      }
      case 'setUserRole': {
        const admin = this.needAdmin(actor);
        const u = this.user(String(a.userId));
        if (!u) throw new ActionError('المستخدم غير موجود', 404);
        const role = String(a.role) as UserRole;
        if (!['member', 'moderator', 'admin'].includes(role)) throw new ActionError('رتبة غير صالحة');
        if (u.id === admin.id && role !== 'admin') throw new ActionError('لا يمكنك إزالة صلاحية المدير عن نفسك');
        u.role = role;
        this.syncAuthor(u);
        this.log(admin, 'تغيير صلاحيات مستخدم', u.name, `تم تغيير رتبة @${u.username} إلى ${role}`);
        return true;
      }

      // ---------- chapters & settings
      case 'updateChapter': {
        const mod = this.needMod(actor);
        const ch = this.db.chapters.find((c) => c.id === Number(a.id));
        if (!ch) throw new ActionError('الفصل غير موجود', 404);
        const d = (a.data || {}) as Partial<Chapter>;
        if (d.title !== undefined) ch.title = str(d.title, 200, 'عنوان الفصل');
        if (d.subtitle !== undefined) ch.subtitle = str(d.subtitle, 300, 'العنوان الفرعي', false);
        if (d.description !== undefined) ch.description = str(d.description, 5000, 'وصف الفصل', false);
        if (Array.isArray(d.keyThemes)) ch.keyThemes = d.keyThemes.map((t) => str(t, 100, 'المحور')).slice(0, 20);
        if (d.order !== undefined) ch.order = Number(d.order) || ch.order;
        if (d.isActive !== undefined) ch.isActive = !!d.isActive;
        this.log(mod, 'تعديل بيانات الفصل', ch.title, `تم تحديث محتوى أو ترتيب الفصل رقم ${ch.id}`);
        return true;
      }
      case 'updateSettings': {
        const mod = this.needMod(actor);
        const s = (a.settings || {}) as Partial<SiteSettings>;
        const fields: (keyof SiteSettings)[] = ['bookTitle', 'bookSubtitle', 'authorName', 'authorBio', 'communityIntro', 'officialDomain', 'contactEmail'];
        for (const f of fields) if (s[f] !== undefined) (this.db.settings as unknown as Record<string, string>)[f] = str(s[f], 3000, 'الحقل', false);
        this.log(mod, 'تحديث إعدادات الموقع', 'إعدادات المنصة', 'تم تعديل البيانات التعريفية أو نصوص الصفحة الرئيسية');
        return true;
      }

      // ---------- discussions
      case 'createDiscussion': {
        const me = this.needUser(actor);
        const chapterId = Number(a.chapterId);
        if (!this.db.chapters.some((c) => c.id === chapterId)) throw new ActionError('اختر فصلاً صحيحاً');
        const d: Discussion = {
          id: newId('disc'),
          chapterId,
          title: str(a.title, 200, 'عنوان النقاش'),
          content: str(a.content, 10000, 'محتوى النقاش'),
          authorId: me.id,
          authorName: me.name,
          authorAvatar: me.avatar,
          authorRole: me.role,
          imageUrl: imageUrl(a.imageUrl),
          views: 1,
          likes: [],
          followers: [me.id],
          commentsCount: 0,
          isPinned: false,
          isLocked: false,
          createdAt: now(),
          updatedAt: now(),
        };
        this.db.discussions.unshift(d);
        return d;
      }
      case 'editDiscussion': {
        const me = this.needUser(actor);
        const d = this.disc(a.id);
        if (d.authorId !== me.id && !isPrivileged(me)) throw new ActionError('لا تملك صلاحية تعديل هذا النقاش', 403);
        if (a.title !== undefined) d.title = str(a.title, 200, 'عنوان النقاش');
        if (a.content !== undefined) d.content = str(a.content, 10000, 'محتوى النقاش');
        if (a.imageUrl !== undefined) d.imageUrl = imageUrl(a.imageUrl);
        if (a.chapterId !== undefined && isPrivileged(me)) {
          const chapterId = Number(a.chapterId);
          if (!this.db.chapters.some((c) => c.id === chapterId)) throw new ActionError('اختر فصلاً صحيحاً');
          d.chapterId = chapterId;
        }
        d.updatedAt = now();
        if (d.authorId !== me.id) this.log(me, 'تعديل نقاش', d.title, 'تم تعديل محتوى النقاش من الإدارة');
        return true;
      }
      case 'viewDiscussion': {
        this.disc(a.id).views += 1;
        return true;
      }
      case 'toggleLikeDiscussion': {
        const me = this.needUser(actor);
        const d = this.disc(a.id);
        const i = d.likes.indexOf(me.id);
        if (i >= 0) {
          d.likes.splice(i, 1);
          return false;
        }
        d.likes.push(me.id);
        if (d.authorId !== me.id) {
          this.notify({ userId: d.authorId, title: 'إعجاب بنقاشك', message: `أعجب ${me.name} بنقاشك: "${d.title.slice(0, 40)}..."`, type: 'like', targetType: 'discussion', targetId: d.id });
        }
        return true;
      }
      case 'toggleFollowDiscussion': {
        const me = this.needUser(actor);
        const d = this.disc(a.id);
        const i = d.followers.indexOf(me.id);
        if (i >= 0) {
          d.followers.splice(i, 1);
          return false;
        }
        d.followers.push(me.id);
        return true;
      }
      case 'setDiscussionPinned': {
        const mod = this.needMod(actor);
        const d = this.disc(a.id);
        d.isPinned = !!a.value;
        this.log(mod, d.isPinned ? 'تثبيت نقاش' : 'إلغاء تثبيت نقاش', d.title, `تم ${d.isPinned ? 'تثبيت' : 'إلغاء تثبيت'} الموضوع في الفصل ${d.chapterId}`);
        return true;
      }
      case 'setDiscussionLocked': {
        const mod = this.needMod(actor);
        const d = this.disc(a.id);
        d.isLocked = !!a.value;
        this.log(mod, d.isLocked ? 'إغلاق نقاش' : 'إعادة فتح نقاش', d.title, `تم ${d.isLocked ? 'إغلاق' : 'فتح'} الردود على هذا النقاش`);
        return true;
      }
      case 'deleteDiscussion': {
        const me = this.needUser(actor);
        const d = this.disc(a.id);
        if (d.authorId !== me.id && !isPrivileged(me)) throw new ActionError('لا تملك صلاحية حذف هذا النقاش', 403);
        this.db.discussions = this.db.discussions.filter((x) => x.id !== d.id);
        this.db.comments = this.db.comments.filter((c) => c.discussionId !== d.id);
        if (isPrivileged(me)) this.log(me, 'حذف موضوع نقاش', d.title, 'تم حذف النقاش وتعليقاته المرتبطة');
        return true;
      }

      // ---------- comments
      case 'addComment': {
        const me = this.needUser(actor);
        const d = this.disc(a.discussionId);
        if (d.isLocked && !isPrivileged(me)) throw new ActionError('هذا النقاش مغلق أمام الردود الجديدة');
        const parentId = a.parentId ? String(a.parentId) : null;
        const parent = parentId ? this.comment(parentId) : null;
        if (parent && parent.discussionId !== d.id) throw new ActionError('رد غير صالح');
        const c: Comment = {
          id: newId('comm'),
          discussionId: d.id,
          parentId,
          authorId: me.id,
          authorName: me.name,
          authorAvatar: me.avatar,
          authorRole: me.role,
          content: str(a.content, 5000, 'التعليق'),
          likes: [],
          createdAt: now(),
        };
        this.db.comments.push(c);
        d.updatedAt = now();

        if (parent) {
          if (parent.authorId !== me.id) {
            this.notify({ userId: parent.authorId, title: 'رد جديد على تعليقك', message: `رد ${me.name} على تعليقك في نقاش "${d.title.slice(0, 35)}..."`, type: 'reply', targetType: 'discussion', targetId: d.id });
          }
        } else if (d.authorId !== me.id) {
          this.notify({ userId: d.authorId, title: 'تعليق جديد على موضوعك', message: `أضاف ${me.name} تعليقاً على نقاشك "${d.title.slice(0, 35)}..."`, type: 'reply', targetType: 'discussion', targetId: d.id });
        }
        for (const f of d.followers) {
          if (f !== me.id && f !== d.authorId) {
            this.notify({ userId: f, title: 'تفاعل جديد في نقاش تتابعه', message: `أُضيف رد جديد في نقاش: "${d.title.slice(0, 35)}..."`, type: 'follow', targetType: 'discussion', targetId: d.id });
          }
        }
        return c;
      }
      case 'editComment': {
        const me = this.needUser(actor);
        const c = this.comment(a.id);
        if (c.authorId !== me.id && !isPrivileged(me)) throw new ActionError('لا تملك صلاحية تعديل هذا التعليق', 403);
        c.content = str(a.content, 5000, 'التعليق');
        c.isEdited = true;
        return true;
      }
      case 'deleteComment': {
        const me = this.needUser(actor);
        const c = this.comment(a.id);
        if (c.authorId !== me.id && !isPrivileged(me)) throw new ActionError('لا تملك صلاحية حذف هذا التعليق', 403);
        const gone = new Set([c.id]);
        let grew = true;
        while (grew) {
          grew = false;
          for (const x of this.db.comments) if (x.parentId && gone.has(x.parentId) && !gone.has(x.id)) { gone.add(x.id); grew = true; }
        }
        this.db.comments = this.db.comments.filter((x) => !gone.has(x.id));
        if (c.authorId !== me.id) {
          const d = this.db.discussions.find((x) => x.id === c.discussionId);
          this.log(me, 'حذف تعليق', c.authorName, `حذف تعليق مخالف في الموضوع: ${d?.title || ''}`);
        }
        return true;
      }
      case 'toggleLikeComment': {
        const me = this.needUser(actor);
        const c = this.comment(a.id);
        const i = c.likes.indexOf(me.id);
        if (i >= 0) {
          c.likes.splice(i, 1);
          return false;
        }
        c.likes.push(me.id);
        return true;
      }

      // ---------- articles
      case 'submitArticle': {
        const me = this.needUser(actor);
        const art: Article = {
          id: newId('art'),
          title: str(a.title, 200, 'عنوان المقال'),
          category: str(a.category, 60, 'التصنيف'),
          excerpt: str(a.excerpt, 600, 'الملخص'),
          content: str(a.content, 50000, 'نص المقال'),
          coverImage: imageUrl(a.coverImage) || '/images/urban_plaza_articles_1794401625775.jpg',
          authorId: me.id,
          authorName: me.name,
          authorAvatar: me.avatar,
          authorBio: me.bio,
          status: isPrivileged(me) ? 'approved' : 'pending',
          views: 0,
          createdAt: now(),
          ...(isPrivileged(me) ? { publishedAt: now() } : {}),
        };
        this.db.articles.unshift(art);
        if (art.status === 'pending') {
          this.notify({ userId: me.id, title: 'تم استلام مقالك للمراجعة', message: `تم إرسال مقالك "${art.title}" بنجاح، وسيظهر للمجتمع بعد اعتماده من فريق التحرير.`, type: 'article_status', targetType: 'article', targetId: art.id });
        }
        return art;
      }
      case 'editArticle': {
        const me = this.needUser(actor);
        const art = this.article(a.id);
        if (art.authorId !== me.id && !isPrivileged(me)) throw new ActionError('لا تملك صلاحية تعديل هذا المقال', 403);
        if (a.title !== undefined) art.title = str(a.title, 200, 'عنوان المقال');
        if (a.category !== undefined) art.category = str(a.category, 60, 'التصنيف');
        if (a.excerpt !== undefined) art.excerpt = str(a.excerpt, 600, 'الملخص');
        if (a.content !== undefined) art.content = str(a.content, 50000, 'نص المقال');
        if (a.coverImage !== undefined) art.coverImage = imageUrl(a.coverImage) || art.coverImage;
        // An author's edit to a published article goes back to review
        if (!isPrivileged(me) && art.status === 'approved') art.status = 'pending';
        if (art.authorId !== me.id) this.log(me, 'تعديل مقال', art.title, 'تم تعديل المقال من الإدارة');
        return true;
      }
      case 'viewArticle': {
        this.article(a.id).views += 1;
        return true;
      }
      case 'reviewArticle': {
        const mod = this.needMod(actor);
        const art = this.article(a.id);
        const status = String(a.status) as Article['status'];
        if (!['approved', 'rejected', 'needs_revision'].includes(status)) throw new ActionError('حالة غير صالحة');
        const notes = str(a.notes, 2000, 'الملاحظات', false);
        art.status = status;
        art.moderatorNotes = notes;
        if (status === 'approved' && !art.publishedAt) art.publishedAt = now();
        const label = status === 'approved' ? 'تمت الموافقة على نشر مقالك' : status === 'rejected' ? 'تم رفض نشر المقال' : 'طلب تعديل على مقالك';
        this.notify({ userId: art.authorId, title: label, message: `${label}: "${art.title}". ${notes ? `ملاحظات: ${notes}` : ''}`, type: 'article_status', targetType: 'article', targetId: art.id });
        this.log(mod, `مراجعة مقال (${status})`, art.title, notes || 'تم تحديث حالة النشر');
        return true;
      }
      case 'deleteArticle': {
        const me = this.needUser(actor);
        const art = this.article(a.id);
        if (art.authorId !== me.id && !isPrivileged(me)) throw new ActionError('لا تملك صلاحية حذف هذا المقال', 403);
        this.db.articles = this.db.articles.filter((x) => x.id !== art.id);
        if (art.authorId !== me.id) this.log(me, 'حذف مقال', art.title, 'تم حذف المقال من الإدارة');
        return true;
      }

      // ---------- notifications
      case 'markNotificationRead': {
        const me = this.needUser(actor);
        const n = this.db.notifications.find((x) => x.id === a.id && x.userId === me.id);
        if (n) n.isRead = true;
        return true;
      }
      case 'markAllNotificationsRead': {
        const me = this.needUser(actor);
        for (const n of this.db.notifications) if (n.userId === me.id) n.isRead = true;
        return true;
      }

      // ---------- reports
      case 'submitReport': {
        const me = this.needUser(actor);
        const targetType = String(a.targetType) as ReportItem['targetType'];
        if (!['discussion', 'comment', 'article'].includes(targetType)) throw new ActionError('نوع البلاغ غير صالح');
        const rep: ReportItem = {
          id: newId('rep'),
          reporterId: me.id,
          reporterName: me.name,
          targetType,
          targetId: str(a.targetId, 100, 'المعرف'),
          targetTitle: str(a.targetTitle, 300, 'العنوان', false),
          reason: str(a.reason, 200, 'سبب البلاغ'),
          details: str(a.details, 2000, 'التفاصيل', false),
          status: 'pending',
          createdAt: now(),
        };
        this.db.reports.unshift(rep);
        return rep;
      }
      case 'resolveReport': {
        const mod = this.needMod(actor);
        const rep = this.db.reports.find((r) => r.id === a.id);
        if (!rep) throw new ActionError('البلاغ غير موجود', 404);
        const resolution = str(a.resolution, 2000, 'الإجراء', false);
        rep.status = a.status === 'dismissed' ? 'dismissed' : 'resolved';
        rep.resolution = resolution;
        this.notify({ userId: rep.reporterId, title: 'تحديث بشأن بلاغك', message: `تم التعامل مع بلاغك حول "${rep.targetTitle}": ${resolution}`, type: 'report_action' });
        this.log(mod, rep.status === 'resolved' ? 'معالجة بلاغ' : 'تجاهل بلاغ', rep.targetTitle, resolution);
        return true;
      }

      // ---------- one-time import of content created before the server database existed
      case 'importLocal': {
        const admin = this.needAdmin(actor);
        if (this.db.importedLocal) return { imported: 0 };
        this.db.importedLocal = true;
        const known = (list: { id: string }[], id: string) => list.some((x) => x.id === id);
        let imported = 0;
        const users = Array.isArray(a.users) ? (a.users as User[]) : [];
        const ensureAuthor = (id: string) => {
          if (this.user(id)) return true;
          const u = users.find((x) => x?.id === id);
          if (!u) return false;
          this.db.users.push({
            id: u.id, name: String(u.name).slice(0, 80), username: String(u.username).slice(0, 40), email: String(u.email || '').slice(0, 150),
            avatar: String(u.avatar || ''), bio: u.bio ? String(u.bio).slice(0, 500) : undefined, role: 'member', status: 'active', joinedAt: String(u.joinedAt || now()),
          });
          return true;
        };
        for (const d of (Array.isArray(a.discussions) ? a.discussions : []) as Discussion[]) {
          if (!d?.id || known(this.db.discussions, d.id) || !ensureAuthor(d.authorId)) continue;
          this.db.discussions.push({ ...d, likes: d.likes || [], followers: d.followers || [] });
          imported++;
        }
        for (const c of (Array.isArray(a.comments) ? a.comments : []) as Comment[]) {
          if (!c?.id || known(this.db.comments, c.id) || !known(this.db.discussions, c.discussionId) || !ensureAuthor(c.authorId)) continue;
          const { replies: _r, ...clean } = c;
          this.db.comments.push({ ...clean, likes: c.likes || [] });
          imported++;
        }
        for (const art of (Array.isArray(a.articles) ? a.articles : []) as Article[]) {
          if (!art?.id || known(this.db.articles, art.id) || !ensureAuthor(art.authorId)) continue;
          this.db.articles.push(art);
          imported++;
        }
        // Apply the admin's local pin/lock choices to seeded discussions
        for (const d of (Array.isArray(a.discussions) ? a.discussions : []) as Discussion[]) {
          const s = this.db.discussions.find((x) => x.id === d?.id);
          if (s) Object.assign(s, { isPinned: !!d.isPinned, isLocked: !!d.isLocked, title: s.title, content: s.content });
        }
        // Seeded discussions the admin had deleted locally
        const localIds = new Set(((a.discussions as Discussion[]) || []).map((d) => d?.id));
        if (Array.isArray(a.discussions)) {
          const removed = INITIAL_DISCUSSIONS.filter((d) => !localIds.has(d.id)).map((d) => d.id);
          this.db.discussions = this.db.discussions.filter((d) => !removed.includes(d.id));
        }
        if (imported) this.log(admin, 'استيراد بيانات', 'محتوى محلي', `تم نقل ${imported} عنصراً من متصفح الإدارة إلى الخادم`);
        return { imported };
      }

      default:
        throw new ActionError('عملية غير معروفة', 400);
    }
  }
}
