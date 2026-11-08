import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { DesignItem, DesignCategory } from '../../types';

interface DesignModalProps {
  isOpen: boolean;
  design: DesignItem | null;
  onClose: () => void;
  onSave: (data: Omit<DesignItem, 'id'>) => void;
}

const CATEGORIES: DesignCategory[] = [
  'Poster & Banner',
  'Logo & Branding',
  'Desain Media Sosial',
  'Kreatif Periklanan',
  'Desain Produk',
  'Karya Kreatif Lainnya'
];

export const DesignModal: React.FC<DesignModalProps> = ({
  isOpen,
  design,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<DesignCategory>('Poster & Banner');
  const [year, setYear] = useState('2025');
  const [clientOrContext, setClientOrContext] = useState('');
  const [role, setRole] = useState('Desainer Grafis');
  const [dimensions, setDimensions] = useState('A1 / 300 DPI');
  const [mainImage, setMainImage] = useState('/images/design_branding_poster_1793775538701.jpg');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [toolsInput, setToolsInput] = useState('');
  const [toolsUsed, setToolsUsed] = useState<string[]>(['Adobe Illustrator', 'Photoshop']);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (design) {
      setTitle(design.title);
      setSlug(design.slug);
      setCategory(design.category);
      setYear(design.year);
      setClientOrContext(design.clientOrContext);
      setRole(design.role);
      setDimensions(design.dimensions || '');
      setMainImage(design.mainImage);
      setShortDescription(design.shortDescription);
      setFullDescription(design.fullDescription);
      setToolsUsed(design.toolsUsed);
      setIsFeatured(!!design.isFeatured);
    } else {
      setTitle('');
      setSlug('');
      setCategory('Poster & Banner');
      setYear(new Date().getFullYear().toString());
      setClientOrContext('Proyek Eksplorasi Pribadi');
      setRole('Desainer Visual');
      setDimensions('A1 (594 x 841 mm) · 300 DPI');
      setMainImage('/images/design_branding_poster_1793775538701.jpg');
      setShortDescription('');
      setFullDescription('');
      setToolsUsed(['Adobe Illustrator', 'Photoshop']);
      setIsFeatured(false);
    }
  }, [design, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!design) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
      );
    }
  };

  const handleAddTool = () => {
    if (toolsInput.trim() && !toolsUsed.includes(toolsInput.trim())) {
      setToolsUsed([...toolsUsed, toolsInput.trim()]);
      setToolsInput('');
    }
  };

  const handleRemoveTool = (tool: string) => {
    setToolsUsed(toolsUsed.filter((t) => t !== tool));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      slug: slug.trim() || `design-${Date.now()}`,
      title: title.trim(),
      category,
      year: year.trim() || '2025',
      clientOrContext: clientOrContext.trim() || 'Proyek Mandiri',
      role: role.trim() || 'Desainer Visual',
      toolsUsed: toolsUsed.length ? toolsUsed : ['Figma', 'Illustrator'],
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      mainImage: mainImage.trim(),
      additionalImages: [mainImage.trim()],
      dimensions: dimensions.trim(),
      isFeatured,
      isDemoData: false
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#FBFBFA] rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              {design ? 'Edit Karya Desain Grafis' : 'Tambah Karya Desain Baru'}
            </h2>
            <p className="text-xs text-stone-500">
              Kelola karya visual, software yang digunakan, dan tampilan lightbox.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Judul Karya *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                placeholder="Poster Tipografi Eksibisi"
                className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Slug URL *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="poster-tipografi-eksibisi"
                className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Tahun Pembuatan</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2025"
                className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Dimensi / Format</label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="A1 / 1080x1350 px"
                className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Konteks / Klien</label>
              <input
                type="text"
                value={clientOrContext}
                onChange={(e) => setClientOrContext(e.target.value)}
                placeholder="Studi Desain Komunikasi / Klien UMKM"
                className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Peran Saya</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Brand Identity Designer / Art Director"
                className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Tautan Gambar Utama *</label>
            <input
              type="text"
              value={mainImage}
              onChange={(e) => setMainImage(e.target.value)}
              required
              placeholder="/images/... atau URL gambar eksternal"
              className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Ringkasan Singkat (untuk thumbnail)</label>
            <textarea
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Deskripsi singkat karya..."
              className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Deskripsi Lengkap (tampil di Lightbox)</label>
            <textarea
              rows={3}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Ulasan konsep desain visual, alasan pemilihan font, komposisi layout..."
              className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
            />
          </div>

          {/* Tools Used */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className="font-semibold text-stone-700 block">Software yang Digunakan</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={toolsInput}
                onChange={(e) => setToolsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTool();
                  }
                }}
                placeholder="Ketik software (misal: Adobe Illustrator, Figma, Blender) lalu Tambah"
                className="flex-1 p-2 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTool}
                className="px-3 py-2 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800"
              >
                Tambah
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {toolsUsed.map((tool) => (
                <span
                  key={tool}
                  className="inline-flex items-center gap-1.5 bg-stone-200 text-stone-800 px-2.5 py-1 rounded font-mono text-[11px]"
                >
                  <span>{tool}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTool(tool)}
                    className="text-stone-500 hover:text-red-600"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Featured checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-stone-800 font-semibold">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <span>Tampilkan sebagai Desain Unggulan di Beranda</span>
            </label>
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
            >
              Simpan Desain
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
