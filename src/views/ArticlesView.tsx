import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, Clock, ArrowRight, RotateCcw, Sparkles, Tag, Calendar, User } from 'lucide-react';
import { useAppData } from '../context/DataContext';
import { Article, ArticleCategory } from '../types';
import { getRoutePath } from '../utils/routes';

interface ArticlesViewProps {
  onSelectArticle: (slug: string) => void;
}

export const ArticlesView: React.FC<ArticlesViewProps> = ({ onSelectArticle }) => {
  const { articles } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<'newest' | 'readTime' | 'featured'>('newest');

  const categories: ArticleCategory[] = [
    'Semua',
    'Tren Teknologi',
    'Perangkat Keras & Gadget',
    'Keamanan Siber',
    'Sistem Operasi & Software',
    'Produktivitas IT'
  ];

  const filteredArticles = useMemo(() => {
    let result = [...articles];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'Semua') {
      result = result.filter((a) => a.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
      }
      if (sortBy === 'readTime') return a.readTimeMinutes - b.readTimeMinutes;
      return b.id.localeCompare(a.id); // default newest
    });

    return result;
  }, [articles, searchQuery, selectedCategory, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'Semua' || sortBy !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2 border-b border-stone-200 pb-5">
        <div className="text-xs font-semibold tracking-wider uppercase text-stone-500">
          EDITORIAL & WAWASAN TEKNOLOGI
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-950 tracking-tight">
          Artikel & Opini IT
        </h1>
        <p className="text-stone-600 max-w-3xl text-sm sm:text-base leading-relaxed">
          Kumpulan artikel mendalam, analisis tren kecerdasan buatan, perbandingan hardware, panduan keamanan siber,
          serta strategi optimasi infrastruktur komputasi untuk profesional dan pengguna teknologi.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3.5 bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Cari artikel berdasarkan judul, topik, teknologi, atau tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs font-medium text-stone-500 whitespace-nowrap">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
            >
              <option value="newest">Artikel Terbaru</option>
              <option value="featured">Artikel Unggulan</option>
              <option value="readTime">Waktu Baca Tercepat</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
          <span className="text-xs font-medium text-stone-500 mr-2">Kategori:</span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  isSelected
                    ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100 hover:border-stone-300'
                }`}
              >
                {cat}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="ml-auto inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Articles Count Status */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <div>
          Menampilkan <span className="font-semibold text-stone-800">{filteredArticles.length}</span> artikel
          {selectedCategory !== 'Semua' && ` di kategori "${selectedCategory}"`}
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#65a30d]" />
          <span>Dapat dibuat otomatis oleh AI dari Admin Dashboard</span>
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-900">Tidak ada artikel yang cocok</h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Tidak ditemukan artikel untuk kata kunci atau filter yang Anda pilih. Coba ubah pencarian atau reset filter.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article.slug)}
              className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:border-stone-400 transition-all duration-200 flex flex-col cursor-pointer shadow-xs hover:shadow-md"
            >
              {/* Thumbnail Header */}
              <div className="relative h-38 sm:h-40 bg-stone-100 overflow-hidden">
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback visual if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-80" />

                {/* Badges on Thumbnail */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-stone-900/80 backdrop-blur-xs text-white rounded">
                    {article.category}
                  </span>
                  {article.isAiGenerated && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 bg-[#84cc16]/90 text-stone-950 font-bold rounded">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI Generated
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-xs text-stone-200">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{article.publishedDate}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{article.readTimeMinutes} mnt baca</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h2 className="text-base font-bold text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h2>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2.5 border-t border-stone-100">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded-sm"
                      >
                        <Tag className="w-2.5 h-2.5 text-stone-400" />
                        {tag}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="text-[10px] text-stone-400 font-medium self-center">
                        +{article.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-stone-500 flex items-center gap-1 text-[11px]">
                      <User className="w-3 h-3 text-stone-400" />
                      {article.author}
                    </span>
                    <a
                      href={getRoutePath('article-detail', article.slug)}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                        e.preventDefault();
                        e.stopPropagation();
                        onSelectArticle(article.slug);
                      }}
                      className="inline-flex items-center gap-1 text-stone-900 font-semibold group-hover:translate-x-0.5 transition-transform text-xs"
                    >
                      Baca Artikel
                      <ArrowRight className="w-3.5 h-3.5 text-[#65a30d]" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
