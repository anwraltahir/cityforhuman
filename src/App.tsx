/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

function MainApp() {
  const { showToast } = useToast();

  // Platform Core State
  const [currentUser, setCurrentUser] = useState<User | null>(() => store.getCurrentUser());
  const [chapters, setChapters] = useState<Chapter[]>(() => store.getChapters());
  const [discussions, setDiscussions] = useState<Discussion[]>(() => store.getDiscussions());
  const [articles, setArticles] = useState<Article[]>(() => store.getArticles());

  // Views & Routing State
  const [viewMode, setViewMode] = useState<'main' | 'chapter_detail' | 'discussion_detail' | 'article_detail'>('main');
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [activeNavSection, setActiveNavSection] = useState('home');

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
    };
    const unsub = store.subscribe(syncData);
    return () => unsub();
  }, []);

  // Navigation handlers
  const handleNavigateSection = (sectionId: string) => {
    setActiveNavSection(sectionId);
    if (viewMode !== 'main') {
      setViewMode('main');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSelectChapter = (chapterId: number) => {
    setSelectedChapterId(chapterId);
    setViewMode('chapter_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDiscussion = (discId: string) => {
    setSelectedDiscussionId(discId);
    setViewMode('discussion_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArticle = (artId: string) => {
    setSelectedArticleId(artId);
    setViewMode('article_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-[#C1E2B9] selection:text-[#194b10]">
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

            <ChaptersGrid chapters={chapters} onSelectChapter={handleSelectChapter} />

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

        {viewMode === 'chapter_detail' && selectedChapter && (
          <ChapterDetailView
            chapter={selectedChapter}
            discussions={discussions}
            onBack={() => setViewMode('main')}
            onSelectDiscussion={handleSelectDiscussion}
            onOpenNewDiscussion={(chId) => handleOpenNewDiscussion(chId)}
          />
        )}

        {viewMode === 'discussion_detail' && selectedDiscussionId && (
          <DiscussionDetailView
            discussionId={selectedDiscussionId}
            currentUser={currentUser}
            chapters={chapters}
            onBack={() => setViewMode('main')}
            onSelectChapter={handleSelectChapter}
            onOpenAuth={() => setAuthModal({ open: true, tab: 'login' })}
            onOpenShare={handleOpenShare}
            onOpenReport={handleOpenReport}
          />
        )}

        {viewMode === 'article_detail' && selectedArticle && (
          <ArticleDetailView
            article={selectedArticle}
            onBack={() => setViewMode('main')}
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
