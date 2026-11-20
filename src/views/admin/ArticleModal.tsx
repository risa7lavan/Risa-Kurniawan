import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Quote, BookOpen } from 'lucide-react';
import {
  Article,
  ArticleCategory,
  ArticleSection,
  GeneratedThumbnailResult,
  ThumbnailOutputFormat
} from '../../types';
import { ImageUploader } from '../../components/ImageUploader';
import { AiThumbnailGeneratorPanel } from '../../components/AiThumbnailGeneratorPanel';
import { generateAutoThumbnail } from '../../utils/thumbnailGenerator';

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
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [imageAltText, setImageAltText] = useState('');
  const [thumbnailHeadline, setThumbnailHeadline] = useState('');
  const [thumbnailVisualConcept, setThumbnailVisualConcept] = useState('');
  const [thumbResult, setThumbResult] = useState<GeneratedThumbnailResult | null>(null);
  const [thumbLoading, setThumbLoading] = useState(false);
  const [thumbError, setThumbError] = useState<string | null>(null);
  const [thumbShowOverlay, setThumbShowOverlay] = useState(true);
  const [thumbFormat, setThumbFormat] = useState<ThumbnailOutputFormat>('webp');
  const [thumbSeed, setThumbSeed] = useState(1);
  const [sections, setSections] = useState<ArticleSection[]>([
    { heading: 'Pendahuluan Masalah', body: '', highlight: '' }
  ]);
  const [formError, setFormError] = useState<string | null>(null);

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
      setSeoTitle(article.seoTitle || '');
      setMetaDescription(article.metaDescription || '');
      setFocusKeyword(article.focusKeyword || '');
      setImageAltText(article.imageAltText || '');
      setThumbnailHeadline(article.thumbnailHeadline || '');
      setThumbnailVisualConcept(article.thumbnailVisualConcept || '');
      setThumbResult(null);
      setThumbError(null);
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
      setSeoTitle('');
      setMetaDescription('');
      setFocusKeyword('');
      setImageAltText('');
      setThumbnailHeadline('');
      setThumbnailVisualConcept('');
      setThumbResult(null);
      setThumbError(null);
      setFormError(null);
      setSections([
        { heading: 'Latar Belakang & Analisis', body: '', highlight: '' },
        { heading: 'Pembahasan Utama', body: '', highlight: '' }
      ]);
    }
  }, [article, isOpen]);

  const handleGenerateModalThumbnail = async (opts?: {
    regenerate?: boolean;
    headlineOverride?: string;
    showHeadlineOverlay?: boolean;
    format?: ThumbnailOutputFormat;
  }) => {
    if (!title.trim()) return;
    const nextSeed = opts?.regenerate ? thumbSeed + 1 : thumbSeed;
    if (opts?.regenerate) setThumbSeed(nextSeed);

    setThumbLoading(true);
    setThumbError(null);
    try {
      const res = await generateAutoThumbnail({
        contentType: 'article',
        title: title.trim(),
        summary: summary.trim(),
        category,
        focusKeyword: focusKeyword.trim() || undefined,
        toolsOrObjects: tagsInput,
        headlineOverride: opts?.headlineOverride,
        showHeadlineOverlay:
          opts?.showHeadlineOverlay !== undefined ? opts.showHeadlineOverlay : thumbShowOverlay,
        format: opts?.format || thumbFormat,
        variationSeed: nextSeed,
        brandName: author.trim() || 'Risa Kurniawan'
      });
      setThumbResult(res);
      setThumbnail(res.imageDataUrl);
      if (res.analysis.altText) setImageAltText(res.analysis.altText);
      setThumbnailHeadline(res.headline);
      setThumbnailVisualConcept(res.analysis.visualConcept);
    } catch (err: any) {
      setThumbError(`Gagal membuat thumbnail: ${err?.message || 'Coba ulangi.'}`);
    } finally {
      setThumbLoading(false);
    }
  };

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
      setFormError('Judul dan ringkasan wajib diisi.');
      return;
    }
    setFormError(null);

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
      seoTitle: seoTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      focusKeyword: focusKeyword.trim() || undefined,
      imageAltText: imageAltText.trim() || undefined,
      thumbnailHeadline: thumbnailHeadline.trim() || undefined,
      thumbnailVisualConcept: thumbnailVisualConcept.trim() || undefined,
      supportingKeywords: article?.supportingKeywords,
      introduction: article?.introduction,
      practicalInsights: article?.practicalInsights,
      faqs: article?.faqs,
      references: article?.references,
      internalLinkingSuggestions: article?.internalLinkingSuggestions,
      featuredImageRecommendation: article?.featuredImageRecommendation,
      isFeatured,
      isAiGenerated: article?.isAiGenerated ?? false,
      publishStatus: article?.publishStatus,
      scheduledAt: article?.scheduledAt,
      removedFromLiveAt: article?.removedFromLiveAt,
      tags: tags.length > 0 ? tags : ['IT', 'Teknologi'],
      sections: sections.filter((s) => s.heading.trim() || s.body.trim()),
      conclusion: conclusion.trim()
    };

    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-stone-800" />
            <h2 className="text-lg font-bold text-stone-900">
              {article ? 'Edit Artikel IT' : 'Tambah Artikel IT Baru'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {formError}
            </div>
          )}
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

            <div className="md:col-span-2 space-y-4">
              <ImageUploader
                label="Tautan Gambar / Thumbnail"
                value={thumbnail}
                onChange={setThumbnail}
                placeholder="/images/... atau URL gambar"
                helpText="Unggah gambar dari perangkat, masukkan URL, atau buat otomatis dengan AI di bawah."
              />

              <AiThumbnailGeneratorPanel
                contentType="article"
                title={title}
                slug={slug}
                currentThumbnail={thumbnail}
                autoEnabled={false}
                onToggleAuto={() => {}}
                result={thumbResult}
                isGenerating={thumbLoading}
                errorMessage={thumbError}
                showHeadlineOverlay={thumbShowOverlay}
                onChangeShowHeadlineOverlay={setThumbShowOverlay}
                format={thumbFormat}
                onChangeFormat={setThumbFormat}
                onGenerateRequested={(opts) => void handleGenerateModalThumbnail(opts)}
                onApplyThumbnail={(dataUrl, altText, meta) => {
                  setThumbnail(dataUrl);
                  if (altText) setImageAltText(altText);
                  if (meta?.headline) setThumbnailHeadline(meta.headline);
                  if (meta?.visualConcept) setThumbnailVisualConcept(meta.visualConcept);
                }}
                isApplied={Boolean(thumbResult?.imageDataUrl) && thumbnail === thumbResult?.imageDataUrl}
                compact
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

            <div className="md:col-span-2 p-3.5 bg-stone-50 border border-stone-200 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2 text-[11px] font-bold uppercase tracking-wider text-stone-700">
                Pengaturan SEO Artikel (Opsional)
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-600">SEO Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Judul khusus untuk mesin pencari..."
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded text-xs text-stone-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-600">Focus Keyword</label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="Kata kunci utama artikel..."
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded text-xs text-stone-900"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold text-stone-600">
                  Meta Description ({metaDescription.length} karakter)
                </label>
                <textarea
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Deskripsi 140-160 karakter untuk Google Search..."
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded text-xs text-stone-900"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold text-stone-600">Alt Text Gambar Utama</label>
                <input
                  type="text"
                  value={imageAltText}
                  onChange={(e) => setImageAltText(e.target.value)}
                  placeholder="Deskripsi alt text gambar untuk aksesibilitas & SEO..."
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded text-xs text-stone-900"
                />
              </div>
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
