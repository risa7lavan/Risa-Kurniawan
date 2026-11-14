import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, FileText, Layout, Image, BookOpen, Briefcase } from 'lucide-react';
import { useAppData } from '../context/DataContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (type: 'project' | 'tutorial' | 'article' | 'design' | 'service', slug: string) => void;
}

interface SearchResultItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  snippet: string;
  type: 'project' | 'tutorial' | 'article' | 'design' | 'service';
  typeLabel: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult
}) => {
  const { projects, services, publishedTutorials: tutorials, publishedArticles: articles } = useAppData();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search logic across all content collections
  const results: SearchResultItem[] = React.useMemo(() => {
    if (!query.trim()) {
      // Show default top picks when query is empty
      const topProjects = projects.slice(0, 2).map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        snippet: p.shortDescription,
        type: 'project' as const,
        typeLabel: 'Proyek Web'
      }));
      const topServices = services.slice(0, 2).map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        category: s.category,
        snippet: s.shortDescription,
        type: 'service' as const,
        typeLabel: 'Jasa & Solusi'
      }));
      const topTutorials = tutorials.slice(0, 2).map((t) => ({
        id: t.id,
        slug: t.slug,
        title: t.title,
        category: t.category,
        snippet: t.summary,
        type: 'tutorial' as const,
        typeLabel: 'Tutorial IT'
      }));
      const topArticles = articles.slice(0, 2).map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        category: a.category,
        snippet: a.summary,
        type: 'article' as const,
        typeLabel: 'Artikel IT'
      }));
      return [...topProjects, ...topServices, ...topTutorials, ...topArticles];
    }

    const q = query.toLowerCase();

    const matchedProjects: SearchResultItem[] = projects
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.client && p.client.toLowerCase().includes(q)) ||
          p.techStack.some((tech) => tech.toLowerCase().includes(q)) ||
          (p.features && p.features.some((f) => f.toLowerCase().includes(q)))
      )
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        snippet: p.shortDescription,
        type: 'project',
        typeLabel: 'Portofolio Web'
      }));

    const matchedServices: SearchResultItem[] = services
      .filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q) ||
          s.fullDescription.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.features.some((f) => f.toLowerCase().includes(q))
      )
      .map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        category: s.category,
        snippet: s.shortDescription,
        type: 'service',
        typeLabel: 'Jasa & Solusi'
      }));

    const matchedTutorials: SearchResultItem[] = tutorials
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.toolsNeeded.some((tool) => tool.toLowerCase().includes(q))
      )
      .map((t) => ({
        id: t.id,
        slug: t.slug,
        title: t.title,
        category: t.category,
        snippet: t.summary,
        type: 'tutorial',
        typeLabel: 'Tutorial IT'
      }));

    const matchedArticles: SearchResultItem[] = articles
      .filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.tags.some((tag) => tag.toLowerCase().includes(q))
      )
      .map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        category: a.category,
        snippet: a.summary,
        type: 'article',
        typeLabel: 'Artikel IT'
      }));

    return [...matchedProjects, ...matchedServices, ...matchedTutorials, ...matchedArticles];
  }, [query, projects, services, tutorials, articles]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      if (results[selectedIndex]) {
        const item = results[selectedIndex];
        onSelectResult(item.type, item.slug);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-stone-900/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#FBFBFA] rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 border-b border-stone-200 bg-white">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Cari proyek web, tutorial IT, desain grafis, teknologi..."
            className="w-full px-3 py-4 text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs text-stone-400 bg-stone-100 border border-stone-200 rounded font-mono">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center justify-between">
            <span>{query ? `Hasil Pencarian (${results.length})` : 'Rekomendasi Konten'}</span>
            <span className="text-[11px] font-normal text-stone-400">Gunakan panah ↑ ↓ dan Enter</span>
          </div>

          {results.length === 0 ? (
            <div className="py-12 text-center text-stone-500">
              <BookOpen className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-medium">Tidak ada hasil yang cocok dengan &quot;{query}&quot;</p>
              <p className="text-xs text-stone-400 mt-1">
                Coba gunakan kata kunci seperti &quot;Windows&quot;, &quot;SSD&quot;, &quot;Poster&quot;, &quot;React&quot;, atau &quot;Wi-Fi&quot;.
              </p>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    onSelectResult(item.type, item.slug);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer flex items-start gap-3 ${
                    isSelected ? 'bg-stone-200/60 text-stone-950' : 'hover:bg-stone-100 text-stone-800'
                  }`}
                >
                  <div
                    className={`p-2 rounded-md shrink-0 mt-0.5 ${
                      item.type === 'project'
                        ? 'bg-blue-50 text-blue-700'
                        : item.type === 'service'
                        ? 'bg-lime-50 text-lime-800'
                        : item.type === 'tutorial'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.type === 'article'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {item.type === 'project' && <Layout className="w-4 h-4" />}
                    {item.type === 'service' && <Briefcase className="w-4 h-4" />}
                    {item.type === 'tutorial' && <BookOpen className="w-4 h-4" />}
                    {item.type === 'article' && <FileText className="w-4 h-4" />}
                    {item.type === 'design' && <Image className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-0.5">
                      <span className="font-medium text-stone-700">{item.typeLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{item.category}</span>
                    </div>
                    <div className="font-semibold text-sm text-stone-900 truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                      {item.snippet}
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 self-center transition-transform ${
                      isSelected ? 'translate-x-1 text-stone-900' : 'text-stone-300'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 bg-white border border-stone-300 rounded font-mono text-[10px]">
                ↑
              </kbd>{' '}
              <kbd className="px-1 py-0.5 bg-white border border-stone-300 rounded font-mono text-[10px]">
                ↓
              </kbd>{' '}
              Pilih
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-white border border-stone-300 rounded font-mono text-[10px]">
                ↵
              </kbd>{' '}
              Buka Halaman
            </span>
          </div>
          <span>Tekan ESC untuk tutup</span>
        </div>
      </div>
    </div>
  );
};
