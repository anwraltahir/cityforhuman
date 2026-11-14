/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { User, Chapter, Discussion, Article, ReportItem, ModerationAction, SiteSettings } from '../types';
import { store } from '../services/storage';
import { useToast } from './Toast';
import { CoverManager } from './CoverManager';
import { InterestList } from './InterestList';
import {
  X,
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Layers,
  Flag,
  Settings,
  History,
  ShieldCheck,
  Search,
  Check,
  Ban,
  UserCheck,
  Pin,
  Lock,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Edit,
  Save,
  Menu,
  BellRing,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onClose: () => void;
  onSelectDiscussion: (discussionId: string) => void;
  onSelectArticle: (articleId: string) => void;
}

type TabType =
  | 'overview'
  | 'users'
  | 'discussions'
  | 'articles'
  | 'chapters'
  | 'reports'
  | 'settings'
  | 'interest'
  | 'logs';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onClose,
  onSelectDiscussion,
  onSelectArticle,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  // Mobile: sidebar is a slide-in drawer; close it whenever a tab is picked
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => setNavOpen(false), [activeTab]);

  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [discussionSearch, setDiscussionSearch] = useState('');
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<number | 'all'>('all');

  // Article review note modal/prompt
  const [reviewArticleId, setReviewArticleId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | 'needs_revision'>('approved');

  // Chapter editing
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [editChapterTitle, setEditChapterTitle] = useState('');
  const [editChapterSubtitle, setEditChapterSubtitle] = useState('');
  const [editChapterDesc, setEditChapterDesc] = useState('');

  // Site Settings
  const [settings, setSettings] = useState<SiteSettings>(() => store.getSiteSettings());

  // Data
  const stats = store.getAdminStats();
  const usersList = store.getUsers();
  const discussionsList = store.getDiscussions();
  const articlesList = store.getArticles('all');
  const chaptersList = store.getChapters();
  const reportsList = store.getReports('all');
  const logsList = store.getModerationLogs();

  // Filtered Users
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filtered Discussions
  let filteredDiscussions = discussionsList.filter(
    (d) =>
      d.title.toLowerCase().includes(discussionSearch.toLowerCase()) ||
      d.authorName.toLowerCase().includes(discussionSearch.toLowerCase())
  );
  if (selectedChapterFilter !== 'all') {
    filteredDiscussions = filteredDiscussions.filter((d) => d.chapterId === selectedChapterFilter);
  }

  // User Actions
  const handleToggleUserStatus = (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    store.setUserStatus(user.id, nextStatus, currentUser.name);
    showToast(
      `تم ${nextStatus === 'suspended' ? 'تعطيل' : 'تفعيل'} حساب ${user.name}`,
      'info'
    );
  };

  const handleChangeUserRole = (userId: string, role: User['role']) => {
    store.setUserRole(userId, role, currentUser.name);
    showToast('تم تحديث رتبة وصلاحيات المستخدم بنجاح', 'success');
  };

  // Discussion Actions
  const handleTogglePin = (disc: Discussion) => {
    store.setDiscussionPinned(disc.id, !disc.isPinned, currentUser.name);
    showToast(disc.isPinned ? 'تم إلغاء تثبيت النقاش' : 'تم تثبيت النقاش في الأعلى', 'success');
  };

  const handleToggleLock = (disc: Discussion) => {
    store.setDiscussionLocked(disc.id, !disc.isLocked, currentUser.name);
    showToast(disc.isLocked ? 'تمت إعادة فتح الردود على النقاش' : 'تم إغلاق النقاش', 'info');
  };

  const handleDeleteDiscussion = (disc: Discussion) => {
    if (window.confirm(`هل أنت متأكد من حذف الموضوع: "${disc.title}"؟`)) {
      store.deleteDiscussion(disc.id, currentUser.name);
      showToast('تم حذف الموضوع وتعليقاته', 'info');
    }
  };

  // Article Actions
  const handleOpenReviewModal = (
    articleId: string,
    action: 'approved' | 'rejected' | 'needs_revision'
  ) => {
    setReviewArticleId(articleId);
    setReviewAction(action);
    setReviewNote(
      action === 'approved'
        ? 'تمت مراجعة المقال واعتماده للنشر في مجتمع مدن الإنسان.'
        : action === 'rejected'
        ? 'المقال لا يتوافق مع المعايير الفكرية والموضوعية الحالية للمنصة.'
        : 'يرجى مراجعة وتعديل النقاط الموضحة في متن المقال.'
    );
  };

  const handleConfirmReview = () => {
    if (!reviewArticleId) return;
    store.reviewArticle(reviewArticleId, reviewAction, reviewNote, currentUser.name);
    setReviewArticleId(null);
    showToast('تم تسجيل قرار مراجعة المقال وإشعار الكاتب', 'success');
  };

  // Chapter Edit
  const handleStartEditChapter = (ch: Chapter) => {
    setEditingChapterId(ch.id);
    setEditChapterTitle(ch.title);
    setEditChapterSubtitle(ch.subtitle);
    setEditChapterDesc(ch.description);
  };

  const handleSaveChapter = (chId: number) => {
    store.updateChapter(
      chId,
      {
        title: editChapterTitle,
        subtitle: editChapterSubtitle,
        description: editChapterDesc,
      },
      currentUser.name
    );
    setEditingChapterId(null);
    showToast('تم تحديث بيانات الفصل بنجاح', 'success');
  };

  // Report Resolution
  const handleResolveReport = (report: ReportItem, status: 'resolved' | 'dismissed') => {
    const resolution = prompt(
      status === 'resolved' ? 'أدخل إجراء المعالجة المتخذ:' : 'سبب تجاهل البلاغ:',
      status === 'resolved' ? 'تم اتخاذ الإجراء الإداري اللازم تجاه المحتوى' : 'المحتوى لا يخالف الشروط'
    );
    if (resolution !== null) {
      store.resolveReport(report.id, resolution, currentUser.name, status);
      showToast('تم تحديث حالة البلاغ', 'success');
    }
  };

  // Site Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSiteSettings(settings, currentUser.name);
    showToast('تم حفظ إعدادات المنصة بنجاح', 'success');
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[#FAF8F5] text-right overflow-hidden animate-in fade-in">
      {/* Mobile backdrop */}
      {navOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setNavOpen(false)} />
      )}

      {/* Sidebar Navigation (drawer on mobile, static column on desktop) */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] overflow-y-auto transition-transform duration-200 md:static md:z-auto md:w-64 md:translate-x-0 bg-white border-l border-[#E5DDD0] flex flex-col justify-between shrink-0 shadow-sm ${
          navOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          {/* Brand & Badge */}
          <div className="p-5 border-b border-[#F0EAE1]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#268F0C] bg-[#268F0C]/10 px-2 py-0.5 rounded">
                لوحة الإدارة
              </span>
              <ShieldCheck className="w-5 h-5 text-[#268F0C]" />
            </div>
            <h2 className="text-base font-extrabold text-stone-900 mt-2">مدن الإنسان</h2>
            <p className="text-xs text-stone-400">إدارة المجتمع والمحتوى</p>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#268F0C] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-[#FAF8F5] hover:text-stone-900'
              }`}
            >
              <span>نظرة عامة وإحصاءات</span>
              <LayoutDashboard className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#268F0C] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-[#FAF8F5] hover:text-stone-900'
              }`}
            >
              <span>إدارة المستخدمين ({usersList.length})</span>
              <Users className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('discussions')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'discussions'
                  ? 'bg-[#268F0C] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-[#FAF8F5] hover:text-stone-900'
              }`}
            >
              <span>إدارة النقاشات ({discussionsList.length})</span>
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'articles'
                  ? 'bg-[#268F0C] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-[#FAF8F5] hover:text-stone-900'
              }`}
            >
              <span>مراجعة المقالات ({stats.pendingArticles} بانتظار)</span>
              <FileText className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('chapters')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'chapters'
                  ? 'bg-[#268F0C] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-[#FAF8F5] hover:text-stone-900'
              }`}
            >
              <span>إدارة الفصول العشرة</span>
              <Layers className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-[#268F0C] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-[#FAF8F5] hover:text-stone-900'
              }`}
            >
              <span>البلاغات ({stats.openReports} مفتوح)</span>
              <Flag className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#268F0C] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-[#FAF8F5] hover:text-stone-900'
              }`}
            >
              <span>إعدادات الموقع العام</span>
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('interest')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'interest'
                  ? 'bg-[#268F0C] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-[#FAF8F5] hover:text-stone-900'
              }`}
            >
              <span>المهتمون بالكتاب</span>
              <BellRing className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-[#268F0C] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-[#FAF8F5] hover:text-stone-900'
              }`}
            >
              <span>سجل العمليات الإدارية</span>
              <History className="w-4 h-4" />
            </button>
          </nav>
        </div>

        {/* Exit Button */}
        <div className="p-4 border-t border-[#F0EAE1]">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
            <span>الخروج من لوحة الإدارة</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Top bar */}
        <div className="h-14 md:h-16 bg-white border-b border-[#E5DDD0] px-3 md:px-6 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setNavOpen(true)}
              aria-label="القائمة"
              className="md:hidden p-2 -mr-1 rounded-xl text-stone-700 hover:bg-[#FAF8F5] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm md:text-base font-bold text-stone-900 truncate">
              {activeTab === 'overview' && 'لوحة المعلومات الرئيسية ومؤشرات الأداء'}
              {activeTab === 'users' && 'سجل وإدارة المستخدمين والصلاحيات'}
              {activeTab === 'discussions' && 'إدارة موضوعات النقاش والحوار'}
              {activeTab === 'articles' && 'مراجعة واعتماد مقالات القراء'}
              {activeTab === 'chapters' && 'إدارة الفصول العشرة والمحتوى التوجيهي'}
              {activeTab === 'reports' && 'مركز البلاغات والمشاركات المخالفة'}
              {activeTab === 'settings' && 'إعدادات المنصة والبيانات التعريفية'}
              {activeTab === 'interest' && 'المسجّلون للإعلام عند صدور الكتاب'}
              {activeTab === 'logs' && 'سجل الرقابة والإجراءات الإدارية'}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              aria-label="الخروج من لوحة الإدارة"
              className="md:hidden p-2 rounded-xl text-stone-600 hover:bg-[#FAF8F5] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="hidden sm:inline text-xs text-stone-500 font-medium">المسؤول: {currentUser.name}</span>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-[#D5CCBE]"
            />
          </div>
        </div>

        {/* Dynamic Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#E5DDD0] shadow-2xs">
                  <p className="text-xs text-stone-500 font-medium">إجمالي المستخدمين</p>
                  <p className="text-2xl font-black text-stone-900 mt-1 tabular-nums">
                    {stats.totalUsers}
                  </p>
                  <span className="text-[10px] text-[#268F0C] font-semibold mt-1 block">
                    {stats.activeUsers} حساب نشط
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E5DDD0] shadow-2xs">
                  <p className="text-xs text-stone-500 font-medium">إجمالي النقاشات</p>
                  <p className="text-2xl font-black text-stone-900 mt-1 tabular-nums">
                    {stats.totalDiscussions}
                  </p>
                  <span className="text-[10px] text-stone-400 font-semibold mt-1 block">
                    موزعة على الفصول
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E5DDD0] shadow-2xs">
                  <p className="text-xs text-stone-500 font-medium">إجمالي التعليقات</p>
                  <p className="text-2xl font-black text-stone-900 mt-1 tabular-nums">
                    {stats.totalComments}
                  </p>
                  <span className="text-[10px] text-stone-400 font-semibold mt-1 block">ردود متداخلة</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E5DDD0] shadow-2xs">
                  <p className="text-xs text-stone-500 font-medium">مقالات منشورة</p>
                  <p className="text-2xl font-black text-[#268F0C] mt-1 tabular-nums">
                    {stats.publishedArticles}
                  </p>
                  <span className="text-[10px] text-stone-400 font-semibold mt-1 block">معتمدة رسمياً</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E5DDD0] shadow-2xs">
                  <p className="text-xs text-stone-500 font-medium">مقالات قيد المراجعة</p>
                  <p className="text-2xl font-black text-[#E84200] mt-1 tabular-nums">
                    {stats.pendingArticles}
                  </p>
                  <span className="text-[10px] text-[#E84200] font-semibold mt-1 block">
                    تحتاج قرارك
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E5DDD0] shadow-2xs">
                  <p className="text-xs text-stone-500 font-medium">بلاغات مفتوحة</p>
                  <p className="text-2xl font-black text-red-600 mt-1 tabular-nums">
                    {stats.openReports}
                  </p>
                  <span className="text-[10px] text-red-500 font-semibold mt-1 block">
                    تتطلب تدخلاً
                  </span>
                </div>
              </div>

              {/* Recent Activity Logs Stream */}
              <div className="bg-white p-6 rounded-3xl border border-[#E5DDD0] shadow-2xs">
                <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
                  <h3 className="text-sm font-bold text-stone-900">آخر الإجراءات والنشاطات الإدارية</h3>
                  <History className="w-4 h-4 text-stone-400" />
                </div>

                <div className="divide-y divide-[#F2ECE3] mt-2">
                  {logsList.slice(0, 6).map((log) => (
                    <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{log.action}</span>
                          <span className="text-stone-400">·</span>
                          <span className="text-stone-600">{log.target}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">{log.details}</p>
                      </div>
                      <div className="text-left text-[10px] text-stone-400 tabular-nums">
                        <span className="block font-semibold text-stone-700">{log.moderatorName}</span>
                        <span>{formatDate(log.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="ابحث بالاسم أو البريد..."
                    className="w-full pr-9 pl-4 py-2 bg-white border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]"
                  />
                </div>
                <span className="text-xs text-stone-500">{filteredUsers.length} مستخدم</span>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5DDD0] overflow-x-auto shadow-2xs">
                <table className="w-full min-w-[640px] text-right text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#E5DDD0] text-stone-600">
                    <tr>
                      <th className="p-3.5 font-bold">المستخدم</th>
                      <th className="p-3.5 font-bold">البريد الإلكتروني</th>
                      <th className="p-3.5 font-bold">الرتبة</th>
                      <th className="p-3.5 font-bold">الحالة</th>
                      <th className="p-3.5 font-bold">تاريخ الانضمام</th>
                      <th className="p-3.5 font-bold text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE3]">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#FAF8F5]">
                        <td className="p-3.5 flex items-center gap-2.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#D5CCBE]"
                          />
                          <div>
                            <span className="block font-bold text-stone-900">{u.name}</span>
                            <span className="block text-[10px] text-stone-400">@{u.username}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-stone-600">{u.email}</td>
                        <td className="p-3.5">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeUserRole(u.id, e.target.value as User['role'])}
                            className="bg-transparent border border-[#DDD5C7] rounded-lg p-1 text-[11px] font-bold text-stone-800 focus:outline-none focus:border-[#268F0C]"
                          >
                            <option value="member">عضو</option>
                            <option value="moderator">مشرف</option>
                            <option value="admin">مدير عام</option>
                          </select>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {u.status === 'active' ? 'نشط' : 'معطل'}
                          </span>
                        </td>
                        <td className="p-3.5 text-stone-400 tabular-nums">{formatDate(u.joinedAt)}</td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                              u.status === 'active'
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {u.status === 'active' ? 'تعطيل الحساب' : 'إعادة تفعيل'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DISCUSSIONS */}
          {activeTab === 'discussions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={discussionSearch}
                    onChange={(e) => setDiscussionSearch(e.target.value)}
                    placeholder="ابحث في النقاشات..."
                    className="w-full pr-9 pl-4 py-2 bg-white border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#268F0C]"
                  />
                </div>

                <select
                  value={selectedChapterFilter}
                  onChange={(e) =>
                    setSelectedChapterFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                  }
                  className="p-2 bg-white border border-[#DDD5C7] rounded-xl text-xs font-semibold text-stone-800"
                >
                  <option value="all">كل الفصول</option>
                  {chaptersList.map((c) => (
                    <option key={c.id} value={c.id}>
                      الفصل {c.id}: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {filteredDiscussions.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-2xl bg-white border border-[#E5DDD0] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-stone-400">
                        <span className="font-bold text-[#268F0C]">الفصل {d.chapterId}</span>
                        <span>·</span>
                        <span className="text-stone-700 font-semibold">{d.authorName}</span>
                        <span>·</span>
                        <span className="tabular-nums">{formatDate(d.createdAt)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 mt-1">{d.title}</h4>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-1">{d.content}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleTogglePin(d)}
                        className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                          d.isPinned
                            ? 'bg-[#E84200] text-white'
                            : 'bg-[#FAF8F5] text-stone-600 hover:bg-[#EFEAE2]'
                        }`}
                        title="تثبيت"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleLock(d)}
                        className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                          d.isLocked
                            ? 'bg-stone-800 text-white'
                            : 'bg-[#FAF8F5] text-stone-600 hover:bg-[#EFEAE2]'
                        }`}
                        title="إغلاق الردود"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onSelectDiscussion(d.id);
                        }}
                        className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EFEAE2] text-stone-800 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        معاينة
                      </button>

                      <button
                        onClick={() => handleDeleteDiscussion(d)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ARTICLES REVIEW */}
          {activeTab === 'articles' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {articlesList.map((art) => (
                  <div
                    key={art.id}
                    className="p-5 rounded-2xl bg-white border border-[#E5DDD0] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            art.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : art.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : art.status === 'needs_revision'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {art.status === 'approved'
                            ? 'معتمد ومنشور'
                            : art.status === 'pending'
                            ? 'بانتظار المراجعة'
                            : art.status === 'needs_revision'
                            ? 'مطلوب تعديل'
                            : 'مرفوض'}
                        </span>
                        <span className="text-stone-400">·</span>
                        <span className="text-stone-600 font-bold">{art.category}</span>
                        <span className="text-stone-400">·</span>
                        <span className="text-stone-500">الكاتب: {art.authorName}</span>
                      </div>
                      <h4 className="text-base font-extrabold text-stone-900">{art.title}</h4>
                      <p className="text-xs text-stone-600 line-clamp-2">{art.excerpt}</p>
                      {art.moderatorNotes && (
                        <p className="text-[11px] text-[#E84200] font-semibold mt-1">
                          ملاحظة الإشراف: {art.moderatorNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectArticle(art.id);
                        }}
                        className="px-3 py-1.5 bg-[#FAF8F5] text-stone-700 hover:bg-[#EFEAE2] rounded-lg text-xs font-bold"
                      >
                        قراءة المقال
                      </button>

                      {art.status !== 'approved' && (
                        <button
                          onClick={() => handleOpenReviewModal(art.id, 'approved')}
                          className="px-3 py-1.5 bg-[#268F0C] text-white hover:bg-[#1f7309] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>اعتماد ونشر</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenReviewModal(art.id, 'needs_revision')}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>طلب تعديل</span>
                      </button>

                      {art.status !== 'rejected' && (
                        <button
                          onClick={() => handleOpenReviewModal(art.id, 'rejected')}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>رفض</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CHAPTERS */}
          {activeTab === 'chapters' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500">
                يمكنك تعديل بيانات ووصف الفصول العشرة للكتاب لتوجيه حوارات القراء بشكل أفضل.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chaptersList.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-5 rounded-2xl bg-white border border-[#E5DDD0] shadow-2xs space-y-2"
                  >
                    {editingChapterId === ch.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#268F0C]">تعديل الفصل {ch.id}</span>
                          <button
                            onClick={() => setEditingChapterId(null)}
                            className="text-xs text-stone-400"
                          >
                            إلغاء
                          </button>
                        </div>
                        <input
                          type="text"
                          value={editChapterTitle}
                          onChange={(e) => setEditChapterTitle(e.target.value)}
                          className="w-full p-2 text-xs font-bold border rounded-lg"
                        />
                        <input
                          type="text"
                          value={editChapterSubtitle}
                          onChange={(e) => setEditChapterSubtitle(e.target.value)}
                          className="w-full p-2 text-xs border rounded-lg"
                        />
                        <textarea
                          value={editChapterDesc}
                          onChange={(e) => setEditChapterDesc(e.target.value)}
                          rows={3}
                          className="w-full p-2 text-xs border rounded-lg"
                        />
                        <button
                          onClick={() => handleSaveChapter(ch.id)}
                          className="px-4 py-1.5 bg-[#268F0C] text-white text-xs font-bold rounded-lg flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>حفظ التعديلات</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-400">الفصل {ch.id}</span>
                          <button
                            onClick={() => handleStartEditChapter(ch)}
                            className="p-1 hover:bg-stone-100 rounded text-stone-500"
                            title="تعديل"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="text-base font-extrabold text-stone-900">{ch.title}</h4>
                        <p className="text-xs font-bold text-[#E84200]">{ch.subtitle}</p>
                        <p className="text-xs text-stone-600 line-clamp-3">{ch.description}</p>
                        <div className="pt-2 flex items-center gap-3 text-[11px] text-stone-400 tabular-nums">
                          <span>{ch.discussionsCount} موضوع</span>
                          <span>·</span>
                          <span>{ch.commentsCount} مشاركة</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {reportsList.length === 0 ? (
                <div className="p-12 text-center text-stone-400 bg-white rounded-2xl border">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-[#268F0C]" />
                  <p className="text-sm font-bold">لا توجد بلاغات مفتوحة. المنصة نظيفة تماماً!</p>
                </div>
              ) : (
                reportsList.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-5 rounded-2xl bg-white border border-[#E5DDD0] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rep.status === 'pending'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {rep.status === 'pending' ? 'مفتوح بانتظار القرار' : 'تمت المعالجة'}
                        </span>
                        <span className="text-stone-400">·</span>
                        <span className="text-stone-600">المُبلّغ: {rep.reporterName}</span>
                        <span className="text-stone-400">·</span>
                        <span className="text-stone-400 tabular-nums">{formatDate(rep.createdAt)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 mt-1">
                        السبب: {rep.reason} ({rep.targetType}: {rep.targetTitle})
                      </h4>
                      {rep.details && (
                        <p className="text-xs text-stone-600 mt-1 bg-[#FAF8F5] p-2 rounded-lg">
                          تفاصيل: {rep.details}
                        </p>
                      )}
                      {rep.resolution && (
                        <p className="text-xs text-[#268F0C] font-semibold mt-1">
                          الإجراء المتخذ: {rep.resolution}
                        </p>
                      )}
                    </div>

                    {rep.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleResolveReport(rep, 'resolved')}
                          className="px-3 py-1.5 bg-[#268F0C] text-white rounded-lg text-xs font-bold"
                        >
                          معالجة المخالفة
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep, 'dismissed')}
                          className="px-3 py-1.5 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold hover:bg-stone-200"
                        >
                          تجاهل البلاغ
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 7: SITE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <CoverManager />
            <form onSubmit={handleSaveSettings} className="max-w-2xl bg-white p-4 sm:p-6 rounded-3xl border border-[#E5DDD0] space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">اسم الكتاب</label>
                <input
                  type="text"
                  value={settings.bookTitle}
                  onChange={(e) => setSettings({ ...settings, bookTitle: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">العنوان الفرعي للكتاب</label>
                <input
                  type="text"
                  value={settings.bookSubtitle}
                  onChange={(e) => setSettings({ ...settings, bookSubtitle: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">اسم المؤلف</label>
                <input
                  type="text"
                  value={settings.authorName}
                  onChange={(e) => setSettings({ ...settings, authorName: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">نبذة عن المؤلف</label>
                <textarea
                  value={settings.authorBio}
                  onChange={(e) => setSettings({ ...settings, authorBio: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">رسالة المجتمع في الواجهة</label>
                <textarea
                  value={settings.communityIntro}
                  onChange={(e) => setSettings({ ...settings, communityIntro: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">رابط الموقع الرسمي</label>
                <input
                  type="url"
                  value={settings.officialDomain}
                  onChange={(e) => setSettings({ ...settings, officialDomain: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-stone-900"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#268F0C] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs"
              >
                حفظ التغييرات العامة
              </button>
            </form>
            </div>
          )}

          {/* TAB 8: AUDIT LOGS */}
          {activeTab === 'interest' && <InterestList />}

          {activeTab === 'logs' && (
            <div className="bg-white rounded-2xl border border-[#E5DDD0] p-6 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-stone-900 pb-3 border-b border-[#F0EAE1]">
                سجل النشاطات الرقابية والإدارية الكامل
              </h3>
              <div className="divide-y divide-[#F2ECE3]">
                {logsList.map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{log.action}</span>
                        <span className="text-stone-400">·</span>
                        <span className="text-[#268F0C] font-semibold">{log.target}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">{log.details}</p>
                    </div>
                    <div className="text-left text-[10px] text-stone-400 tabular-nums">
                      <span className="block font-bold text-stone-700">{log.moderatorName}</span>
                      <span>{formatDate(log.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Article Review Decision Prompt Modal */}
      {reviewArticleId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#DDD5C7] shadow-2xl text-right space-y-4">
            <h3 className="text-base font-bold text-stone-900">
              قرار مراجعة المقال: {reviewAction === 'approved' ? 'موافقة ونشر' : reviewAction === 'rejected' ? 'رفض' : 'طلب تعديل'}
            </h3>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ملاحظات أو توضيح موجه للكاتب:
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl text-xs text-stone-900"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewArticleId(null)}
                className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmReview}
                className="px-5 py-2 bg-[#268F0C] text-white text-xs font-bold rounded-xl"
              >
                تأكيد القرار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
