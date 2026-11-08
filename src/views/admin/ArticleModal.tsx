import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Quote, BookOpen } from 'lucide-react';
import { Article, ArticleCategory, ArticleSection } from '../../types';
import { ImageUploader } from '../../components/ImageUploader';

interface ArticleModalProps {
  isOpen: boolean;
  article: Article | null;
  onClose: () => void;
  onSave: (data: Omit<Article, 'id'>) => void;
}

const CATEGORIES: ArticleCategory[] = [
  'Tren Teknologi',
  'Perangkat Keras & Gadget',
  'Keamanan Siber',
  'Sistem Operasi & Software',
  'Produktivitas IT'
];

export const ArticleModal: React.FC<ArticleModalProps> = ({
  isOpen,
  article,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('Tren Teknologi');
  const [readTimeMinutes, setReadTimeMinutes] = useState(6);
  const [publishedDate, setPublishedDate] = useState('Jan 2025');
  const [author, setAuthor] = useState('Risa Kurniawan');
  const [summary, setSummary] = useState('');
  const [thumbnail, setThumbnail] = useState('/images/hero_creative_workspace_1793775537391.jpg');
  const [isFeatured, setIsFeatured] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [sections, setSections] = useState<ArticleSection[]>([
    { heading: 'Pendahuluan Masalah', body: '', highlight: '' }
  ]);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setSlug(article.slug);
      setCategory(article.category);
      setReadTimeMinutes(article.readTimeMinutes);
      setPublishedDate(article.publishedDate);
      setAuthor(article.author);
      setSummary(article.summary);
      setThumbnail(article.thumbnail || '');
      setIsFeatured(!!article.isFeatured);
      setTagsInput(article.tags ? article.tags.join(', ') : '');
      setConclusion(article.conclusion || '');
      setSections(
        article.sections && article.sections.length > 0
          ? article.sections
          : [{ heading: 'Pendahuluan', body: '', highlight: '' }]
      );
    } else {
      setTitle('');
      setSlug('');
      setCategory('Tren Teknologi');
      setReadTimeMinutes(6);
      setPublishedDate(new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }));
      setAuthor('Risa Kurniawan');
      setSummary('');
      setThumbnail('/images/hero_creative_workspace_1793775537391.jpg');
      setIsFeatured(false);
      setTagsInput('Hardware, AI, Tips IT');
      setConclusion('');
      setSections([
        { heading: 'Latar Belakang & Analisis', body: '', highlight: '' },
        { heading: 'Pembahasan Utama', body: '', highlight: '' }
      ]);
    }
  }, [article, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!article) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleAddSection = () => {
    setSections([...sections, { heading: '', body: '', highlight: '' }]);
  };

  const handleRemoveSection = (index: number) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSectionChange = (index: number, field: keyof ArticleSection, val: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: val };
    setSections(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      alert('Judul dan ringkasan wajib diisi.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const data: Omit<Article, 'id'> = {
      title: title.trim(),
      slug: slug.trim() || `artikel-${Date.now()}`,
      category,
      readTimeMinutes: Number(readTimeMinutes) || 5,
      publishedDate: publishedDate.trim() || '2025',
      author: author.trim() || 'Risa Kurniawan',
      summary: summary.trim(),
      thumbnail: thumbnail.trim() || '/images/hero_creative_workspace_1793775537391.jpg',
      isFeatured,
      isAiGenerated: article?.isAiGenerated ?? false,
      tags: tags.length > 0 ? tags : ['IT', 'Teknologi'],
      sections: sections.filter((s) => s.heading.trim() || s.body.trim()),
      conclusion: conclusion.trim()
    };

    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-stone-800" />
            <h2 className="text-lg font-bold text-stone-900">
              {article ? 'Edit Artikel IT' : 'Tambah Artikel IT Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-stone-700">Judul Artikel *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Contoh: SSD NVMe vs SATA: Mana Pilihan Terbaik..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Slug URL *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ssd-nvme-vs-sata-panduan"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Kategori Artikel</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Penulis</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Waktu Baca (Menit)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={readTimeMinutes}
                  onChange={(e) => setReadTimeMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Tanggal Terbit</label>
                <input
                  type="text"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                  placeholder="Contoh: 12 Jan 2025"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-stone-700">Ringkasan / Sinopsis Singkat *</label>
              <textarea
                rows={2}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Penjelasan singkat 1-2 kalimat untuk kartu artikel..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
              />
            </div>

            <div className="md:col-span-2">
              <ImageUploader
                label="Tautan Gambar / Thumbnail"
                value={thumbnail}
                onChange={setThumbnail}
                placeholder="/images/... atau URL gambar"
                helpText="Unggah gambar dari perangkat atau masukkan URL gambar."
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-stone-700">Tag (pisahkan dengan koma)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Hardware, AI, Tips IT, Jaringan"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 focus:ring-[#84cc16]"
                />
                <span>Tampilkan sebagai Artikel Unggulan (Featured) di Beranda</span>
              </label>
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Bagian Paragraf & Analisis</h3>
                <p className="text-xs text-stone-500">Susun struktur artikel dengan sub-heading dan kutipan sorot.</p>
              </div>
              <button
                type="button"
                onClick={handleAddSection}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Bagian
              </button>
            </div>

            <div className="space-y-4">
              {sections.map((sec, idx) => (
                <div key={idx} className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700">Bagian #{idx + 1}</span>
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(idx)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={sec.heading}
                    onChange={(e) => handleSectionChange(idx, 'heading', e.target.value)}
                    placeholder="Sub-Judul Bagian..."
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-[#84cc16]"
                  />

                  <textarea
                    rows={4}
                    value={sec.body}
                    onChange={(e) => handleSectionChange(idx, 'body', e.target.value)}
                    placeholder="Isi pembahasan mendalam..."
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs text-stone-800 focus:ring-2 focus:ring-[#84cc16]"
                  />

                  <div className="flex items-center gap-2">
                    <Quote className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <input
                      type="text"
                      value={sec.highlight || ''}
                      onChange={(e) => handleSectionChange(idx, 'highlight', e.target.value)}
                      placeholder="Kutipan inti / highlight khusus (opsional)..."
                      className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs italic text-stone-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conclusion */}
          <div className="space-y-1 pt-4 border-t border-stone-200">
            <label className="text-xs font-semibold text-stone-700">Kesimpulan / Intisari Penutup</label>
            <textarea
              rows={3}
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              placeholder="Rangkuman atau rekomendasi akhir bagi pembaca..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-stone-900 text-white rounded-lg text-sm font-semibold hover:bg-stone-800 transition-colors"
            >
              Simpan Artikel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
