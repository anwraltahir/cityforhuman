/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotFound } from './components/NotFound';
import React, { useState, useEffect } from 'react';
import { User, Chapter, Discussion, Article } from './types';
import { store } from './services/storage';
import { ToastProvider, useToast } from './components/Toast';

// Component imports
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AboutBookSection } from './components/AboutBookSection';
import { ChaptersGrid } from './components/ChaptersGrid';
import { RecentDiscussions } from './components/RecentDiscussions';
import { ReaderArticlesSection } from './components/ReaderArticlesSection';
import { AuthorSection } from './components/AuthorSection';
import { Footer } from './components/Footer';

// View & Modal imports
import { ChapterDetailView } from './components/ChapterDetailView';
import { DiscussionDetailView } from './components/DiscussionDetailView';
import { ArticleDetailView } from './components/ArticleDetailView';
import { NewDiscussionModal } from './components/NewDiscussionModal';
import { NewArticleModal } from './components/NewArticleModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { ShareModal } from './components/ShareModal';
import { ReportModal } from './components/ReportModal';
import { LegalModal } from './components/LegalModals';
import { AdminDashboard } from './components/AdminDashboard';

type ViewMode = 'main' | 'chapters' | 'chapter_detail' | 'discussion_detail' | 'article_detail' | 'not_found';
interface Route {
  view: ViewMode;
  chapterId?: number;
  discussionId?: string;
  articleId?: string;
}

/** URL -> page. Unknown paths fall back to the home page. */
const parseRoute = (pathname: string): Route => {
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (parts[0] === 'discussions' && parts[1]) return { view: 'discussion_detail', discussionId: parts[1] };
  if (parts[0] === 'articles' && parts[1]) return { view: 'article_detail', articleId: parts[1] };
  if (parts[0] === 'chapters' && parts[1] && /^\d+$/.test(parts[1])) return { view: 'chapter_detail', chapterId: Number(parts[1]) };
  if (parts[0] === 'chapters' && parts.length === 1) return { view: 'chapters' };
  if (parts.length === 0) return { view: 'main' };
  return { view: 'not_found' };
};

/** Page -> URL. */
const routePath = (r: Route): string => {
  if (r.view === 'discussion_detail' && r.discussionId) return `/discussions/${encodeURIComponent(r.discussionId)}`;
  if (r.view === 'article_detail' && r.articleId) return `/articles/${encodeURIComponent(r.articleId)}`;
  if (r.view === 'chapter_detail' && r.chapterId) return `/chapters/${r.chapterId}`;
  if (r.view === 'chapters') return '/chapters';
  if (r.view === 'not_found') return window.location.pathname; // keep the unknown URL as typed
  return '/';
};

function MainApp() {
  const { showToast } = useToast();

  // Platform Core State
  const [currentUser, setCurrentUser] = useState<User | null>(() => store.getCurrentUser());
  const [chapters, setChapters] = useState<Chapter[]>(() => store.getChapters());
  const [discussions, setDiscussions] = useState<Discussion[]>(() => store.getDiscussions());
  const [articles, setArticles] = useState<Article[]>(() => store.getArticles());
  const [ready, setReady] = useState(() => store.isReady());

  // Views & Routing State
  // The page shown is driven by the URL, so shared links open the right page
  const initialRoute = parseRoute(window.location.pathname);
  const [viewMode, setViewMode] = useState<ViewMode>(initialRoute.view);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(initialRoute.chapterId ?? null);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(initialRoute.discussionId ?? null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(initialRoute.articleId ?? null);
  const [activeNavSection, setActiveNavSection] = useState(
    initialRoute.view === 'chapters' || initialRoute.view === 'chapter_detail' ? 'chapters' : 'home'
  );

  // Keep the address bar in sync with the page (new history entry per page)
  useEffect(() => {
    const path = routePath({
      view: viewMode,
      chapterId: selectedChapterId ?? undefined,
      discussionId: selectedDiscussionId ?? undefined,
      articleId: selectedArticleId ?? undefined,
    });
    if (path !== window.location.pathname) window.history.pushState(null, '', path);
  }, [viewMode, selectedChapterId, selectedDiscussionId, selectedArticleId]);

  // Tab title per page (also what people see when they bookmark or share)
  useEffect(() => {
    const site = 'مدن الإنسان – City for Human';
    let title = '';
    if (viewMode === 'discussion_detail' && selectedDiscussionId) title = store.getDiscussionById(selectedDiscussionId)?.title || '';
    else if (viewMode === 'article_detail' && selectedArticleId) title = store.getArticleById(selectedArticleId)?.title || '';
    else if (viewMode === 'chapter_detail' && selectedChapterId) title = store.getChapterById(selectedChapterId)?.title || '';
    else if (viewMode === 'chapters') title = 'فصول الكتاب';
    const missing =
      viewMode === 'not_found' ||
      (viewMode !== 'main' && viewMode !== 'chapters' && !title);
    if (missing) {
      const what =
        viewMode === 'discussion_detail' ? 'النقاش' : viewMode === 'article_detail' ? 'المقال' : viewMode === 'chapter_detail' ? 'الفصل' : 'الصفحة';
      document.title = `${what} غير موجود${what === 'الصفحة' ? 'ة' : ''} | مدن الإنسان`;
      return;
    }
    document.title = title ? `${title} | ${site}` : `${site} | مجتمع كتاب مدن الإنسان للكاتب عثمان الطيب`;
  }, [viewMode, selectedChapterId, selectedDiscussionId, selectedArticleId, discussions, articles, chapters]);

  // Browser back/forward
  useEffect(() => {
    const onPop = () => {
      const r = parseRoute(window.location.pathname);
      setSelectedChapterId(r.chapterId ?? null);
      setSelectedDiscussionId(r.discussionId ?? null);
      setSelectedArticleId(r.articleId ?? null);
      setViewMode(r.view);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Modals
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'login' | 'register' }>({
    open: false,
    tab: 'login',
  });
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [newDiscussionModal, setNewDiscussionModal] = useState<{ open: boolean; chapterId?: number }>({
    open: false,
  });
  const [newArticleModalOpen, setNewArticleModalOpen] = useState(false);
  const [shareData, setShareData] = useState<{ title: string; url: string } | null>(null);
  const [reportData, setReportData] = useState<{
    targetType: 'discussion' | 'comment' | 'article';
    targetId: string;
    title: string;
  } | null>(null);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  // Subscribe to storage changes
  useEffect(() => {
    const syncData = () => {
      setCurrentUser(store.getCurrentUser());
      setChapters(store.getChapters());
      setDiscussions(store.getDiscussions());
      setArticles(store.getArticles());
      setReady(store.isReady());
    };
    const unsub = store.subscribe(syncData);
    return () => unsub();
  }, []);

  // Navigation handlers
  // Scroll once the section exists in the rendered page (after a view switch it
  // appears a frame or two later). Sections carry scroll-margin-top for the header.
  const scrollToSection = (id: string, tries = 0) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else if (tries < 30) requestAnimationFrame(() => scrollToSection(id, tries + 1));
  };

  const handleNavigateSection = (sectionId: string) => {
    setActiveNavSection(sectionId);
    // The chapters index is its own page, not a section of the home page
    if (sectionId === 'chapters') {
      setViewMode('chapters');
      return;
    }
    if (viewMode !== 'main') setViewMode('main');
    requestAnimationFrame(() => scrollToSection(sectionId));
  };

  // Open detail pages at the top. Runs after the new view has rendered, and jumps
  // instantly: a smooth scroll started before render gets cut short on phones.
  useEffect(() => {
    if (viewMode !== 'main') window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [viewMode, selectedChapterId, selectedDiscussionId, selectedArticleId]);

  const handleSelectChapter = (chapterId: number) => {
    setSelectedChapterId(chapterId);
    setActiveNavSection('chapters');
    setViewMode('chapter_detail');
  };

  const handleSelectDiscussion = (discId: string) => {
    setSelectedDiscussionId(discId);
    setViewMode('discussion_detail');
  };

  const handleSelectArticle = (artId: string) => {
    setSelectedArticleId(artId);
    setViewMode('article_detail');
  };

  const handleOpenNewDiscussion = (chId?: number) => {
    if (!currentUser) {
      setAuthModal({ open: true, tab: 'login' });
      showToast('يرجى تسجيل الدخول أو إنشاء حساب لبدء نقاش جديد', 'info');
      return;
    }
    setNewDiscussionModal({ open: true, chapterId: chId });
  };

  const handleOpenNewArticle = () => {
    if (!currentUser) {
      setAuthModal({ open: true, tab: 'login' });
      showToast('يرجى تسجيل الدخول لتقديم مقال للمراجعة والنشر', 'info');
      return;
    }
    setNewArticleModalOpen(true);
  };

  const handleOpenShare = (title: string, url: string) => {
    setShareData({ title, url });
  };

  const handleOpenReport = (
    targetType: 'discussion' | 'comment' | 'article',
    targetId: string,
    title: string
  ) => {
    if (!currentUser) {
      setAuthModal({ open: true, tab: 'login' });
      showToast('يرجى تسجيل الدخول لتقديم بلاغ للإشراف', 'info');
      return;
    }
    setReportData({ targetType, targetId, title });
  };

  const selectedChapter = selectedChapterId ? chapters.find((c) => c.id === selectedChapterId) : undefined;
  const selectedArticle = selectedArticleId ? articles.find((a) => a.id === selectedArticleId) : undefined;

  if (!ready) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-[#FAF8F5]" dir="rtl">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <div className="w-9 h-9 border-[3px] border-[#C1E2B9] border-t-[#268F0C] rounded-full animate-spin" />
          <span className="text-sm font-semibold">جارٍ تحميل مدن الإنسان…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-[#C1E2B9] selection:text-[#194b10]">
      {/* Universal Header */}
      <Header
        currentUser={currentUser}
        onOpenAuth={(tab = 'login') => setAuthModal({ open: true, tab })}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        activeSection={activeNavSection}
        onNavigate={handleNavigateSection}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {viewMode === 'main' && (
          <>
            <HeroSection
              onDiscoverBook={() => handleNavigateSection('about')}
              onJoinDiscussion={() => handleNavigateSection('discussions')}
              onSelectChapter={handleSelectChapter}
            />

            <AboutBookSection onExploreChapters={() => handleNavigateSection('chapters')} />

            <RecentDiscussions
              discussions={discussions}
              chapters={chapters}
              onSelectDiscussion={handleSelectDiscussion}
              onOpenNewDiscussion={() => handleOpenNewDiscussion()}
              onSelectChapter={handleSelectChapter}
            />

            <ReaderArticlesSection
              articles={articles}
              onSelectArticle={handleSelectArticle}
              onOpenSubmitArticle={handleOpenNewArticle}
            />

            <AuthorSection />
          </>
        )}

        {viewMode === 'chapters' && <ChaptersGrid chapters={chapters} onSelectChapter={handleSelectChapter} />}

        {viewMode === 'chapter_detail' && !selectedChapter && (
          <NotFound
            title="الفصل غير موجود"
            message="لا يوجد فصل بهذا الرقم في كتاب «مدن الإنسان». تصفّح فهرس الفصول العشرة."
            backLabel="العودة إلى فصول الكتاب"
            onBack={() => handleNavigateSection('chapters')}
          />
        )}

        {viewMode === 'article_detail' && !selectedArticle && (
          <NotFound
            title="المقال غير موجود"
            message="لم يتم العثور على هذا المقال، ربما حُذف أو لم يُنشر بعد."
            backLabel="العودة إلى مقالات القراء"
            onBack={() => handleNavigateSection('articles')}
          />
        )}

        {viewMode === 'not_found' && (
          <NotFound
            title="الصفحة غير موجودة"
            message="الرابط الذي فتحته غير صحيح أو أن الصفحة لم تعد موجودة."
            backLabel="العودة إلى الصفحة الرئيسية"
            onBack={() => handleNavigateSection('home')}
          />
        )}

        {viewMode === 'chapter_detail' && selectedChapter && (
          <ChapterDetailView
            chapter={selectedChapter}
            onBack={() => handleNavigateSection('chapters')}
            onGoToDiscussions={() => handleNavigateSection('discussions')}
          />
        )}

        {viewMode === 'discussion_detail' && selectedDiscussionId && (
          <DiscussionDetailView
            discussionId={selectedDiscussionId}
            currentUser={currentUser}
            chapters={chapters}
            onBack={() => handleNavigateSection('discussions')}
            onSelectChapter={handleSelectChapter}
            onOpenAuth={() => setAuthModal({ open: true, tab: 'login' })}
            onOpenShare={handleOpenShare}
            onOpenReport={handleOpenReport}
          />
        )}

        {viewMode === 'article_detail' && selectedArticle && (
          <ArticleDetailView
            article={selectedArticle}
            onBack={() => handleNavigateSection('articles')}
            onOpenShare={handleOpenShare}
          />
        )}
      </main>

      {/* Universal Footer */}
      <Footer
        onNavigate={handleNavigateSection}
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenTerms={() => setLegalModalType('terms')}
      />

      {/* MODALS & DRAWERS */}
      {authModal.open && (
        <AuthModal
          initialTab={authModal.tab}
          onClose={() => setAuthModal({ open: false, tab: 'login' })}
          onSuccess={() => setAuthModal({ open: false, tab: 'login' })}
          onOpenLegal={(type) => setLegalModalType(type)}
        />
      )}

      {profileModalOpen && currentUser && (
        <UserProfileModal
          user={currentUser}
          onClose={() => setProfileModalOpen(false)}
          onSelectDiscussion={handleSelectDiscussion}
        />
      )}

      {adminOpen && currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator') && (
        <AdminDashboard
          currentUser={currentUser}
          onClose={() => setAdminOpen(false)}
          onSelectDiscussion={handleSelectDiscussion}
          onSelectArticle={handleSelectArticle}
        />
      )}

      {notificationsOpen && currentUser && (
        <NotificationsDrawer
          userId={currentUser.id}
          onClose={() => setNotificationsOpen(false)}
          onSelectDiscussion={handleSelectDiscussion}
          onSelectArticle={handleSelectArticle}
        />
      )}

      {newDiscussionModal.open && (
        <NewDiscussionModal
          chapters={chapters}
          defaultChapterId={newDiscussionModal.chapterId}
          onClose={() => setNewDiscussionModal({ open: false })}
          onSuccess={(newId) => handleSelectDiscussion(newId)}
        />
      )}

      {newArticleModalOpen && (
        <NewArticleModal
          onClose={() => setNewArticleModalOpen(false)}
          onSuccess={() => {
            setArticles(store.getArticles());
          }}
        />
      )}

      {shareData && (
        <ShareModal
          title={shareData.title}
          url={shareData.url}
          onClose={() => setShareData(null)}
        />
      )}

      {reportData && (
        <ReportModal
          targetType={reportData.targetType}
          targetId={reportData.targetId}
          targetTitle={reportData.title}
          onClose={() => setReportData(null)}
        />
      )}

      {legalModalType && (
        <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
