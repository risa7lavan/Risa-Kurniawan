import React, { useState, useEffect, useCallback } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { DataProvider, useAppData } from './context/DataContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { LightboxModal } from './components/LightboxModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

import { HomeView } from './views/HomeView';
import { ProjectsView } from './views/ProjectsView';
import { ProjectDetailView } from './views/ProjectDetailView';
import { TutorialsView } from './views/TutorialsView';
import { TutorialDetailView } from './views/TutorialDetailView';
import { ArticlesView } from './views/ArticlesView';
import { ArticleDetailView } from './views/ArticleDetailView';
import { ServicesView } from './views/ServicesView';
import { DesignsView } from './views/DesignsView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';

import { AdminLogin } from './views/admin/AdminLogin';
import { AdminDashboard } from './views/admin/AdminDashboard';

import { DesignItem } from './types';

function AppContent() {
  const { designs, isAdminLoggedIn } = useAppData();
  const [currentView, setCurrentView] = useState<string>('home');
  const [activeProjectSlug, setActiveProjectSlug] = useState<string | null>(null);
  const [activeTutorialSlug, setActiveTutorialSlug] = useState<string | null>(null);
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(null);

  // Lightbox state for any visual designs
  const [lightboxItem, setLightboxItem] = useState<DesignItem | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Parse URL hash on initial load and handle hash changes
  const handleHashChange = useCallback(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash || hash === 'home') {
      setCurrentView('home');
      setActiveProjectSlug(null);
      setActiveTutorialSlug(null);
      setActiveArticleSlug(null);
    } else if (hash.startsWith('project/')) {
      const slug = hash.replace('project/', '');
      setCurrentView('project-detail');
      setActiveProjectSlug(slug);
    } else if (hash.startsWith('tutorial/')) {
      const slug = hash.replace('tutorial/', '');
      setCurrentView('tutorial-detail');
      setActiveTutorialSlug(slug);
    } else if (hash.startsWith('article/')) {
      const slug = hash.replace('article/', '');
      setCurrentView('article-detail');
      setActiveArticleSlug(slug);
    } else if (['projects', 'services', 'tutorials', 'articles', 'designs', 'about', 'contact', 'admin'].includes(hash)) {
      setCurrentView(hash);
      setActiveProjectSlug(null);
      setActiveTutorialSlug(null);
      setActiveArticleSlug(null);
    }
  }, []);

  useEffect(() => {
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [handleHashChange]);

  // Global keyboard shortcuts (Cmd+K / Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = (view: string, slug?: string) => {
    if (view === 'project-detail' && slug) {
      window.location.hash = `project/${slug}`;
    } else if (view === 'tutorial-detail' && slug) {
      window.location.hash = `tutorial/${slug}`;
    } else if (view === 'article-detail' && slug) {
      window.location.hash = `article/${slug}`;
    } else {
      window.location.hash = view;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLightbox = (item: DesignItem) => {
    setLightboxItem(item);
    setIsLightboxOpen(true);
  };

  const handleSelectSearchResult = (type: 'project' | 'tutorial' | 'article' | 'design' | 'service', slug: string) => {
    if (type === 'project') {
      navigateTo('project-detail', slug);
    } else if (type === 'tutorial') {
      navigateTo('tutorial-detail', slug);
    } else if (type === 'article') {
      navigateTo('article-detail', slug);
    } else if (type === 'service') {
      navigateTo('services');
    } else if (type === 'design') {
      const found = designs.find((d) => d.slug === slug);
      if (found) {
        handleOpenLightbox(found);
      } else {
        navigateTo('designs');
      }
    }
  };

  // If in admin view
  if (currentView === 'admin') {
    if (!isAdminLoggedIn) {
      return <AdminLogin onBackToSite={() => navigateTo('home')} />;
    }
    return <AdminDashboard onBackToSite={() => navigateTo('home')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#191B1F]">
      {/* Primary Sticky Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigate={navigateTo}
            onOpenLightbox={handleOpenLightbox}
          />
        )}

        {currentView === 'projects' && (
          <ProjectsView
            onSelectProject={(slug) => navigateTo('project-detail', slug)}
          />
        )}

        {currentView === 'project-detail' && activeProjectSlug && (
          <ProjectDetailView
            slug={activeProjectSlug}
            onBack={() => navigateTo('projects')}
            onSelectProject={(slug) => navigateTo('project-detail', slug)}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'services' && (
          <ServicesView onNavigate={navigateTo} />
        )}

        {currentView === 'tutorials' && (
          <TutorialsView
            onSelectTutorial={(slug) => navigateTo('tutorial-detail', slug)}
          />
        )}

        {currentView === 'tutorial-detail' && activeTutorialSlug && (
          <TutorialDetailView
            slug={activeTutorialSlug}
            onBack={() => navigateTo('tutorials')}
            onSelectTutorial={(slug) => navigateTo('tutorial-detail', slug)}
          />
        )}

        {currentView === 'articles' && (
          <ArticlesView
            onSelectArticle={(slug) => navigateTo('article-detail', slug)}
          />
        )}

        {currentView === 'article-detail' && activeArticleSlug && (
          <ArticleDetailView
            slug={activeArticleSlug}
            onBack={() => navigateTo('articles')}
            onSelectArticle={(slug) => navigateTo('article-detail', slug)}
          />
        )}

        {currentView === 'designs' && (
          <DesignsView onOpenLightbox={handleOpenLightbox} />
        )}

        {currentView === 'about' && (
          <AboutView
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'contact' && <ContactView />}
      </main>

      {/* Primary Footer */}
      <Footer
        onNavigate={navigateTo}
      />

      {/* Interactive Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Optional Lightbox Modal */}
      <LightboxModal
        item={lightboxItem}
        items={designs}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onSelect={(item) => setLightboxItem(item)}
      />

      {/* Floating WhatsApp Quick Action */}
      <FloatingWhatsApp currentView={currentView} />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
      <SpeedInsights />
      <Analytics />
    </DataProvider>
  );
}
