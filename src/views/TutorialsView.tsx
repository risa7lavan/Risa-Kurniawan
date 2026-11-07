import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, Clock, ArrowRight, RotateCcw, AlertTriangle, Layers } from 'lucide-react';
import { useAppData } from '../context/DataContext';
import { Tutorial, TutorialCategory, TutorialDifficulty } from '../types';

interface TutorialsViewProps {
  onSelectTutorial: (slug: string) => void;
}

export const TutorialsView: React.FC<TutorialsViewProps> = ({ onSelectTutorial }) => {
  const { tutorials } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<'newest' | 'fastest' | 'alphabetical'>('newest');

  const categories: TutorialCategory[] = [
    'Semua',
    'Instalasi Windows',
    'Pemecahan Masalah Komputer',
    'Perangkat Keras & Peningkatan',
    'Jaringan'
  ];

  const difficulties: ('Semua' | TutorialDifficulty)[] = ['Semua', 'Pemula', 'Menengah', 'Lanjutan'];

  const filteredTutorials = useMemo(() => {
    let result = [...tutorials];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.toolsNeeded.some((tool) => tool.toLowerCase().includes(q))
      );
    }

    // Category
    if (selectedCategory !== 'Semua') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Difficulty
    if (selectedDifficulty !== 'Semua') {
      result = result.filter((t) => t.difficulty === selectedDifficulty);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'fastest') return a.readTimeMinutes - b.readTimeMinutes;
      if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
      return b.id.localeCompare(a.id); // default newest
    });

    return result;
  }, [searchQuery, selectedCategory, selectedDifficulty, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua');
    setSelectedDifficulty('Semua');
    setSortBy('newest');
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== 'Semua' || selectedDifficulty !== 'Semua' || sortBy !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2 border-b border-stone-200 pb-5">
        <div className="text-xs font-semibold tracking-wider uppercase text-stone-500">
          BASIS PENGETAHUAN TEKNIS
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-950 tracking-tight">
          Tutorial & Panduan IT Support
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-3xl leading-relaxed">
          Kumpulan dokumentasi teknis langkah demi langkah mengenai komputer, laptop, instalasi sistem operasi Windows, optimalisasi jaringan lokal, dan penanganan kerusakan perangkat keras.
        </p>
      </div>

      {/* Control Bar */}
      <div className="space-y-3 bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tutorial, masalah (mis: Wi-Fi, BSOD, SSD, USB)..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Difficulty Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 focus:bg-white focus:outline-none"
            >
              <option value="Semua">Semua Tingkat Kesulitan</option>
              <option value="Pemula">Tingkat: Pemula</option>
              <option value="Menengah">Tingkat: Menengah</option>
              <option value="Lanjutan">Tingkat: Lanjutan</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 focus:bg-white focus:outline-none"
            >
              <option value="newest">Urutkan: Panduan Terbaru</option>
              <option value="fastest">Urutkan: Durasi Baca Tercepat</option>
              <option value="alphabetical">Urutkan: Judul (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Categories Tab */}
        <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 font-medium shrink-0 mr-1">Kategori:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Counter & Reset */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
          <div>
            Menampilkan <span className="font-semibold text-stone-900">{filteredTutorials.length}</span> artikel panduan
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-stone-600 hover:text-stone-950 flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Tutorials Grid */}
      {filteredTutorials.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center space-y-3">
          <BookOpen className="w-8 h-8 mx-auto text-stone-300" />
          <h3 className="text-base font-bold text-stone-800">
            Tidak ada tutorial yang cocok dengan kriteria pencarian
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Silakan coba kata kunci lain atau bersihkan filter untuk menampilkan seluruh topik.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-3.5 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredTutorials.map((tut) => (
            <article
              key={tut.id}
              onClick={() => onSelectTutorial(tut.slug)}
              className="group bg-white rounded-xl border border-stone-200 hover:border-stone-400 p-4 sm:p-5 flex flex-col justify-between transition-all cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-semibold text-stone-800 text-[11px] bg-stone-100 px-2 py-0.5 rounded">{tut.category}</span>
                  <span className="font-mono bg-stone-100 px-2 py-0.5 rounded text-[10px] text-stone-700">
                    {tut.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-base text-stone-900 group-hover:text-stone-700 leading-snug transition-colors line-clamp-2">
                  {tut.title}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {tut.summary}
                </p>

                {tut.riskWarning && (
                  <div className="p-2 bg-amber-50/80 rounded-md border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{tut.riskWarning.title}</span>
                  </div>
                )}
              </div>

              <div className="pt-3.5 border-t border-stone-100 mt-3.5 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>{tut.readTimeMinutes} menit</span>
                  <span aria-hidden="true">·</span>
                  <span>{tut.steps.length} langkah</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-stone-900 group-hover:translate-x-1 transition-transform text-xs">
                  <span>Buka Panduan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
