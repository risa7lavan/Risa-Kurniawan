import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DesignItem } from '../types';

interface LightboxModalProps {
  item: DesignItem | null;
  items: DesignItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: DesignItem) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  item,
  items,
  isOpen,
  onClose,
  onSelect
}) => {
  useEffect(() => {
    if (!isOpen || !item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        navigatePrev();
      } else if (e.key === 'ArrowRight') {
        navigateNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, item, items]);

  if (!isOpen || !item) return null;

  const currentIndex = items.findIndex((i) => i.id === item.id);

  const navigatePrev = () => {
    if (currentIndex > 0) {
      onSelect(items[currentIndex - 1]);
    } else {
      onSelect(items[items.length - 1]);
    }
  };

  const navigateNext = () => {
    if (currentIndex < items.length - 1) {
      onSelect(items[currentIndex + 1]);
    } else {
      onSelect(items[0]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-stone-950/90 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[92vh] bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 shadow-2xl overflow-hidden flex flex-col lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-20 p-2.5 bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
          aria-label="Tutup pratinjau"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Preview Column */}
        <div className="relative flex-1 bg-stone-950 flex items-center justify-center p-4 sm:p-8 min-h-[340px] lg:min-h-[600px] overflow-hidden select-none">
          <img
            src={item.mainImage}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
          />

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigatePrev();
            }}
            type="button"
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-stone-900/80 hover:bg-stone-800 text-white rounded-full border border-stone-700/60 backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
            aria-label="Karya Sebelumnya (Panah Kiri)"
            title="Karya Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateNext();
            }}
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-stone-900/80 hover:bg-stone-800 text-white rounded-full border border-stone-700/60 backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
            aria-label="Karya Selanjutnya (Panah Kanan)"
            title="Karya Selanjutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 text-xs font-mono text-stone-400 bg-stone-900/70 px-2.5 py-1 rounded-md backdrop-blur-xs">
            {currentIndex + 1} / {items.length}
          </div>
        </div>

        {/* Details Column */}
        <div className="w-full lg:w-96 p-6 sm:p-8 bg-stone-900 flex flex-col justify-between overflow-y-auto border-t lg:border-t-0 lg:border-l border-stone-800">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
                <span>{item.category}</span>
                <span aria-hidden="true">·</span>
                <span>{item.year}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                {item.title}
              </h3>
            </div>

            <div className="space-y-3 py-3 border-y border-stone-800 text-xs">
              <div className="flex justify-between items-center text-stone-300">
                <span className="text-stone-400">Konteks / Klien:</span>
                <span className="font-medium text-stone-200 text-right">{item.clientOrContext}</span>
              </div>
              <div className="flex justify-between items-center text-stone-300">
                <span className="text-stone-400">Peran:</span>
                <span className="font-medium text-stone-200">{item.role}</span>
              </div>
              {item.dimensions && (
                <div className="flex justify-between items-center text-stone-300">
                  <span className="text-stone-400">Dimensi / Format:</span>
                  <span className="font-mono text-stone-200">{item.dimensions}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Deskripsi Karya
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {item.fullDescription}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Perangkat Lunak yang Digunakan
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {item.toolsUsed.map((tool) => (
                  <span
                    key={tool}
                    className="text-xs text-stone-300 bg-stone-800 px-2 py-0.5 rounded border border-stone-700 font-mono"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-stone-800 text-xs text-stone-400 flex items-center justify-between">
            <span>Gunakan panah ← → untuk navigasi</span>
            <span className="text-stone-400">ESC untuk keluar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
