import React, { useState, useEffect, useCallback } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { DataProvider, useAppData } from './context/DataContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { LightboxModal } from './components/LightboxModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { SeoManager } from './components/SeoManager';
import { getRoutePath, parseCurrentLocation } from './utils/routes';

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
  const [currentView, setCurrentView] = useState<string>(() => parseCurrentLocation().view);
  const [activeProjectSlug, setActiveProjectSlug] = useState<string | null>(() => parseCurrentLocation().projectSlug);
  const [activeTutorialSlug, setActiveTutorialSlug] = useState<string | null>(() => parseCurrentLocation().tutorialSlug);
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(() => parseCurrentLocation().articleSlug);

  // Lightbox state for any visual designs
  const [lightboxItem, setLightboxItem] = useState<DesignItem | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync view state from browser URL (supports clean paths & legacy #hash links)
  const syncRouteFromUrl = useCallback(() => {
    const parsed = parseCurrentLocation();
    setCurrentView(parsed.view);
    setActiveProjectSlug(parsed.projectSlug);
    setActiveTutorialSlug(parsed.tutorialSlug);
    setActiveArticleSlug(parsed.articleSlug);

    // Normalize legacy #hash URLs to clean SEO-friendly paths seamlessly
    if (parsed.wasHash) {
      const cleanPath = getRoutePath(
        parsed.view,
        parsed.projectSlug || parsed.tutorialSlug || parsed.articleSlug || undefined
      );
      try {
        window.history.replaceState({}, '', cleanPath);
      } catch {
        // Fallback if replaceState is restricted
      }
    }
  }, []);

  useEffect(() => {
    syncRouteFromUrl();
    window.addEventListener('popstate', syncRouteFromUrl);
    window.addEventListener('hashchange', syncRouteFromUrl);
    return () => {
      window.removeEventListener('popstate', syncRouteFromUrl);
      window.removeEventListener('hashchange', syncRouteFromUrl);
    };
  }, [syncRouteFromUrl]);

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
    const targetPath = getRoutePath(view, slug);
    setCurrentView(view);
    setActiveProjectSlug(view === 'project-detail' && slug ? slug : null);
    setActiveTutorialSlug(view === 'tutorial-detail' && slug ? slug : null);
    setActiveArticleSlug(view === 'article-detail' && slug ? slug : null);

    try {
      if (window.location.pathname !== targetPath || window.location.hash) {
        window.history.pushState({}, '', targetPath);
      }
    } catch {
      window.location.hash = view === 'home' ? '' : targetPath.replace(/^\//, '');
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
    return (
      <>
        <SeoManager currentView="admin" />
        {!isAdminLoggedIn ? (
          <AdminLogin onBackToSite={() => navigateTo('home')} />
        ) : (
          <AdminDashboard onBackToSite={() => navigateTo('home')} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#191B1F]">
      <SeoManager
        currentView={currentView}
        activeProjectSlug={activeProjectSlug}
        activeTutorialSlug={activeTutorialSlug}
        activeArticleSlug={activeArticleSlug}
      />
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
