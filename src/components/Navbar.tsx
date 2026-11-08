import React, { useState, useEffect } from 'react';
import { Search, Menu, X, ArrowUpRight, Lock } from 'lucide-react';
import { useAppData } from '../context/DataContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, slug?: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenSearch
}) => {
  const { profile } = useAppData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Beranda' },
    { id: 'projects', label: 'Proyek Web' },
    { id: 'services', label: 'Jasa' },
    { id: 'tutorials', label: 'Tutorial IT' },
    { id: 'articles', label: 'Artikel' },
    { id: 'about', label: 'Tentang' }
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#FBFBFA]/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs'
          : 'bg-[#FBFBFA] border-b border-stone-200/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => handleLinkClick('home')}
          className="text-left group cursor-pointer focus:outline-none shrink-0"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#84cc16] rounded-xs" aria-hidden="true" />
            <span className="font-extrabold tracking-tight text-lg text-stone-900 group-hover:text-stone-700 transition-colors whitespace-nowrap">
              {profile.brandTitle}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Desk View) */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-stone-600"
        >
          {navLinks.map((link) => {
            const isActive =
              currentView === link.id ||
              (link.id === 'projects' && currentView === 'project-detail') ||
              (link.id === 'tutorials' && currentView === 'tutorial-detail') ||
              (link.id === 'articles' && currentView === 'article-detail');

            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`transition-colors py-1 cursor-pointer whitespace-nowrap shrink-0 relative ${
                  isActive
                    ? 'text-stone-950 font-semibold'
                    : 'hover:text-stone-950 text-stone-600'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-950 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Quick Tools */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            type="button"
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md border border-stone-200 transition-colors cursor-pointer"
            title="Cari proyek, tutorial, dan desain (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Cari</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-stone-100 text-stone-500 border border-stone-200 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Admin Dashboard Portal Button */}
          <button
            onClick={() => handleLinkClick('admin')}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-md border border-stone-200 transition-colors cursor-pointer"
            title="Masuk ke Panel Admin (Kelola Konten)"
          >
            <Lock className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* Primary CTA Button */}
          <button
            onClick={() => handleLinkClick('contact')}
            type="button"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            <span>Hubungi Saya</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#BEF264]" />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu navigasi'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 bg-[#FBFBFA] px-4 pt-2 pb-6 space-y-1 shadow-lg">
          <div className="py-2 mb-2 flex items-center justify-between border-b border-stone-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Menu Navigasi
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-stone-700 flex items-center gap-1 font-semibold hover:text-stone-900"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>
          {navLinks.map((link) => {
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <div className="pt-3">
            <button
              onClick={() => handleLinkClick('contact')}
              className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-stone-900 text-white flex items-center justify-center gap-2"
            >
              <span>Hubungi Saya</span>
              <ArrowUpRight className="w-4 h-4 text-[#BEF264]" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
