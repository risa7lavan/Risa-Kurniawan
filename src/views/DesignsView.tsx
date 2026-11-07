import React, { useState, useMemo } from 'react';
import { Search, X, Eye, Filter, RotateCcw, Image, Sparkles } from 'lucide-react';
import { useAppData } from '../context/DataContext';
import { DesignItem, DesignCategory } from '../types';

interface DesignsViewProps {
  onOpenLightbox: (item: DesignItem) => void;
}

export const DesignsView: React.FC<DesignsViewProps> = ({ onOpenLightbox }) => {
  const { designs } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<'newest' | 'alphabetical'>('newest');

  const categories: DesignCategory[] = [
    'Semua',
    'Poster & Banner',
    'Logo & Branding',
    'Desain Media Sosial',
    'Kreatif Periklanan',
    'Desain Produk',
    'Karya Kreatif Lainnya'
  ];

  const filteredDesigns = useMemo(() => {
    let result = [...designs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.shortDescription.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.clientOrContext.toLowerCase().includes(q) ||
          d.toolsUsed.some((tool) => tool.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'Semua') {
      result = result.filter((d) => d.category === selectedCategory);
    }

    result.sort((a, b) => {
      if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
      return parseInt(b.year) - parseInt(a.year);
    });

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('Semua');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'Semua' || sortBy !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-3 border-b border-stone-200 pb-8">
        <div className="text-xs font-semibold tracking-wider uppercase text-stone-500">
          PAMERAN VISUAL
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight">
          Portofolio Desain Grafis & Merek
        </h1>
        <p className="text-base text-stone-600 max-w-3xl leading-relaxed">
          Koleksi karya komunikasi visual, poster tipografi, eksplorasi identitas merek, desain produk, dan aset kampanye media sosial terkurasi.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari karya desain, software (Illustrator, Figma, Photoshop)..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none"
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

          <div className="md:col-span-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 focus:bg-white focus:outline-none"
            >
              <option value="newest">Urutkan: Tahun Terbaru</option>
              <option value="alphabetical">Urutkan: Alfabetis (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Categories Pills/Buttons */}
        <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 font-medium shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Kategori:</span>
          </span>
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
            Menampilkan <span className="font-semibold text-stone-900">{filteredDesigns.length}</span> karya desain visual
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-stone-600 hover:text-stone-950 flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredDesigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-4">
          <Image className="w-10 h-10 mx-auto text-stone-300" />
          <h3 className="text-base font-bold text-stone-800">
            Tidak ada karya desain yang sesuai dengan kriteria
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Gunakan filter lain atau ketik kata kunci seperti &quot;Poster&quot;, &quot;Branding&quot;, atau &quot;Illustrator&quot;.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {filteredDesigns.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenLightbox(item)}
              className="group bg-white rounded-xl border border-stone-200 overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-[3/4] bg-stone-950 overflow-hidden">
                <img
                  src={item.mainImage}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-stone-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-2.5 bg-white/90 text-stone-950 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-1.5 text-xs font-semibold">
                    <Eye className="w-4 h-4" />
                    <span>Perbesar</span>
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2 border-t border-stone-100">
                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span className="font-medium text-stone-700">{item.category}</span>
                  <span className="font-mono">{item.year}</span>
                </div>

                <h3 className="font-bold text-sm text-stone-900 line-clamp-1 leading-snug group-hover:text-stone-700">
                  {item.title}
                </h3>

                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                  {item.shortDescription}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {item.toolsUsed.map((tool) => (
                    <span
                      key={tool}
                      className="text-[10px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
