import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertTriangle, Code, HelpCircle } from 'lucide-react';
import { Tutorial, TutorialCategory, TutorialDifficulty, TutorialStep } from '../../types';
import { ImageUploader } from '../../components/ImageUploader';

interface TutorialModalProps {
  isOpen: boolean;
  tutorial: Tutorial | null;
  onClose: () => void;
  onSave: (data: Omit<Tutorial, 'id'>) => void;
}

const CATEGORIES: TutorialCategory[] = [
  'Instalasi Windows',
  'Pemecahan Masalah Komputer',
  'Perangkat Keras & Peningkatan',
  'Jaringan',
  'Perangkat Lunak & Produktivitas',
  'Tips & Trik IT'
];

const DIFFICULTIES: TutorialDifficulty[] = ['Pemula', 'Menengah', 'Lanjutan'];

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  tutorial,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'meta' | 'steps' | 'troubleshoot' | 'faq'>('meta');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<TutorialCategory>('Instalasi Windows');
  const [difficulty, setDifficulty] = useState<TutorialDifficulty>('Pemula');
  const [readTimeMinutes, setReadTimeMinutes] = useState(10);
  const [publishedDate, setPublishedDate] = useState('2025');
  const [summary, setSummary] = useState('');
  const [thumbnail, setThumbnail] = useState('/images/tutorial_it_hardware_lab_1793775539803.jpg');
  const [isFeatured, setIsFeatured] = useState(false);
  const [conclusion, setConclusion] = useState('');

  // Prerequisites & Tools
  const [prerequisites, setPrerequisites] = useState<string[]>(['']);
  const [toolsNeeded, setToolsNeeded] = useState<string[]>(['']);

  // Risk Warning
  const [hasRiskWarning, setHasRiskWarning] = useState(false);
  const [riskTitle, setRiskTitle] = useState('Peringatan Risiko Format Drive');
  const [riskMessage, setRiskMessage] = useState('Pastikan mencadangkan seluruh data sebelum partisi diformat.');

  // Steps
  const [steps, setSteps] = useState<TutorialStep[]>([
    {
      stepNumber: 1,
      title: 'Langkah Awal',
      description: 'Penjelasan detail langkah pertama...',
      codeSnippet: { language: 'bash', code: '' }
    }
  ]);

  // Troubleshooting
  const [troubleshoots, setTroubleshoots] = useState<{ issue: string; resolution: string }[]>([
    { issue: '', resolution: '' }
  ]);

  // FAQ
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([
    { question: '', answer: '' }
  ]);

  useEffect(() => {
    if (tutorial) {
      setTitle(tutorial.title);
      setSlug(tutorial.slug);
      setCategory(tutorial.category);
      setDifficulty(tutorial.difficulty);
      setReadTimeMinutes(tutorial.readTimeMinutes);
      setPublishedDate(tutorial.publishedDate);
      setSummary(tutorial.summary);
      setThumbnail(tutorial.thumbnail);
      setIsFeatured(!!tutorial.isFeatured);
      setConclusion(tutorial.conclusion);

      setPrerequisites(tutorial.prerequisites.length ? tutorial.prerequisites : ['']);
      setToolsNeeded(tutorial.toolsNeeded.length ? tutorial.toolsNeeded : ['']);

      if (tutorial.riskWarning) {
        setHasRiskWarning(true);
        setRiskTitle(tutorial.riskWarning.title);
        setRiskMessage(tutorial.riskWarning.message);
      } else {
        setHasRiskWarning(false);
      }

      setSteps(tutorial.steps.length ? tutorial.steps : [{ stepNumber: 1, title: '', description: '' }]);
      setTroubleshoots(tutorial.troubleshootingTips.length ? tutorial.troubleshootingTips : [{ issue: '', resolution: '' }]);
      setFaqs(tutorial.faqs.length ? tutorial.faqs : [{ question: '', answer: '' }]);
    } else {
      setTitle('');
      setSlug('');
      setCategory('Instalasi Windows');
      setDifficulty('Pemula');
      setReadTimeMinutes(10);
      setPublishedDate(new Date().getFullYear().toString());
      setSummary('');
      setThumbnail('/images/tutorial_it_hardware_lab_1793775539803.jpg');
      setIsFeatured(false);
      setConclusion('');
      setPrerequisites(['']);
      setToolsNeeded(['']);
      setHasRiskWarning(false);
      setSteps([
        {
          stepNumber: 1,
          title: 'Langkah Pertama',
          description: 'Rincian panduan langkah pertama...'
        }
      ]);
      setTroubleshoots([{ issue: '', resolution: '' }]);
      setFaqs([{ question: '', answer: '' }]);
    }
    setActiveTab('meta');
  }, [tutorial, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!tutorial) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
      );
    }
  };

  // Steps handling
  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        stepNumber: steps.length + 1,
        title: `Langkah ${steps.length + 1}`,
        description: ''
      }
    ]);
  };

  const handleStepChange = (index: number, field: keyof TutorialStep, val: any) => {
    const next = [...steps];
    next[index] = { ...next[index], [field]: val };
    setSteps(next);
  };

  const handleRemoveStep = (index: number) => {
    const filtered = steps.filter((_, i) => i !== index);
    const renumbered = filtered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(renumbered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tableOfContents = steps.map((s, idx) => ({
      id: `langkah-${idx + 1}`,
      title: `${idx + 1}. ${s.title || `Langkah ${idx + 1}`}`
    }));

    onSave({
      slug: slug.trim() || `tutorial-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim(),
      category,
      difficulty,
      readTimeMinutes: Number(readTimeMinutes) || 10,
      publishedDate: publishedDate.trim() || '2025',
      thumbnail: thumbnail.trim(),
      isFeatured,
      isDemoData: false,
      prerequisites: prerequisites.filter((p) => p.trim().length > 0),
      toolsNeeded: toolsNeeded.filter((t) => t.trim().length > 0),
      riskWarning: hasRiskWarning
        ? {
            title: riskTitle.trim() || 'Peringatan Risiko',
            message: riskMessage.trim(),
            severity: 'danger'
          }
        : undefined,
      tableOfContents,
      steps: steps.map((s, idx) => ({
        stepNumber: idx + 1,
        title: s.title.trim(),
        description: s.description.trim(),
        codeSnippet: s.codeSnippet?.code?.trim()
          ? {
              language: s.codeSnippet.language || 'bash',
              code: s.codeSnippet.code.trim(),
              label: s.codeSnippet.label || 'Command'
            }
          : undefined,
        note: s.note?.trim() || undefined
      })),
      troubleshootingTips: troubleshoots.filter((t) => t.issue.trim().length > 0),
      faqs: faqs.filter((f) => f.question.trim().length > 0),
      conclusion: conclusion.trim()
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#FBFBFA] rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              {tutorial ? 'Edit Tutorial IT Support' : 'Tambah Tutorial IT Baru'}
            </h2>
            <p className="text-xs text-stone-500">
              Dokumentasi langkah demi langkah, peringatan risiko, dan FAQ pemecahan masalah.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-stone-200 bg-stone-100/70 px-6 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('meta')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'meta'
                ? 'border-stone-900 text-stone-950 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            1. Informasi & Ringkasan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'steps'
                ? 'border-stone-900 text-stone-950 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            2. Langkah-Langkah ({steps.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('troubleshoot')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'troubleshoot'
                ? 'border-stone-900 text-stone-950 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            3. Troubleshooting & Kendala
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'faq'
                ? 'border-stone-900 text-stone-950 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            4. FAQ & Kesimpulan
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {activeTab === 'meta' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Judul Tutorial *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                    placeholder="Contoh: Cara Mengatasi Laptop Lemot & Disk 100%"
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
                    placeholder="cara-mengatasi-laptop-lemot"
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
                  <label className="font-semibold text-stone-700">Tingkat Kesulitan</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  >
                    {DIFFICULTIES.map((diff) => (
                      <option key={diff} value={diff}>
                        {diff}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Estimasi Durasi (Menit)</label>
                  <input
                    type="number"
                    min="1"
                    value={readTimeMinutes}
                    onChange={(e) => setReadTimeMinutes(parseInt(e.target.value) || 5)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Ringkasan Tutorial</label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Ringkasan isi artikel untuk pembaca..."
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <ImageUploader
                label="Tautan Gambar / Thumbnail"
                value={thumbnail}
                onChange={setThumbnail}
                placeholder="/images/... atau URL gambar"
                helpText="Unggah gambar dari perangkat atau masukkan URL gambar."
              />

              {/* Risk Warning Box */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                <label className="flex items-center gap-2 font-semibold text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasRiskWarning}
                    onChange={(e) => setHasRiskWarning(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Sertakan Kotak Peringatan Risiko (Misal: Risiko Kehilangan Data)</span>
                </label>

                {hasRiskWarning && (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={riskTitle}
                      onChange={(e) => setRiskTitle(e.target.value)}
                      placeholder="Judul Peringatan Risiko"
                      className="w-full p-2 bg-white border border-amber-300 rounded text-amber-950 font-bold focus:outline-none"
                    />
                    <textarea
                      rows={2}
                      value={riskMessage}
                      onChange={(e) => setRiskMessage(e.target.value)}
                      placeholder="Pesan bahaya atau keharusan backup sebelum eksekusi..."
                      className="w-full p-2 bg-white border border-amber-300 rounded text-amber-950 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Featured toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-stone-800 font-semibold">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span>Tampilkan sebagai Tutorial Unggulan di Beranda</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800 text-sm">
                  Daftar Langkah-Langkah Panduan ({steps.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="px-3 py-1.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Langkah</span>
                </button>
              </div>

              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-xl border border-stone-200 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs bg-stone-900 text-white px-2 py-0.5 rounded font-mono">
                        Langkah {idx + 1}
                      </span>
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-stone-600">Judul Langkah</label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                        placeholder="Misal: Membuka Command Prompt sebagai Administrator"
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-stone-600">Instruksi Langkah</label>
                      <textarea
                        rows={3}
                        value={step.description}
                        onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                        placeholder="Uraikan detail yang harus dilakukan pengguna..."
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-stone-600 flex items-center gap-1">
                        <Code className="w-3.5 h-3.5" />
                        <span>Blok Perintah / Script Terminal (Opsional)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={step.codeSnippet?.code || ''}
                        onChange={(e) =>
                          handleStepChange(idx, 'codeSnippet', {
                            language: 'bash',
                            code: e.target.value,
                            label: 'Command Prompt'
                          })
                        }
                        placeholder="ipconfig /flushdns"
                        className="w-full p-2 bg-stone-900 text-stone-100 font-mono text-[11px] rounded focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'troubleshoot' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800">Pemecahan Kendala Sering Terjadi</span>
                <button
                  type="button"
                  onClick={() => setTroubleshoots([...troubleshoots, { issue: '', resolution: '' }])}
                  className="text-stone-900 hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kendala</span>
                </button>
              </div>

              {troubleshoots.map((t, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-500">Kasus #{idx + 1}</span>
                    {troubleshoots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setTroubleshoots(troubleshoots.filter((_, i) => i !== idx))}
                        className="text-stone-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={t.issue}
                    onChange={(e) => {
                      const next = [...troubleshoots];
                      next[idx].issue = e.target.value;
                      setTroubleshoots(next);
                    }}
                    placeholder="Kendala: misal 'No drives were found saat instalasi'"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 font-semibold focus:bg-white focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={t.resolution}
                    onChange={(e) => {
                      const next = [...troubleshoots];
                      next[idx].resolution = e.target.value;
                      setTroubleshoots(next);
                    }}
                    placeholder="Solusi tindakan yang harus dilakukan..."
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:bg-white focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800">Pertanyaan yang Sering Diajukan (FAQ)</span>
                <button
                  type="button"
                  onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
                  className="text-stone-900 hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah FAQ</span>
                </button>
              </div>

              {faqs.map((f, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-500">FAQ #{idx + 1}</span>
                    {faqs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                        className="text-stone-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={f.question}
                    onChange={(e) => {
                      const next = [...faqs];
                      next[idx].question = e.target.value;
                      setFaqs(next);
                    }}
                    placeholder="Pertanyaan: misal 'Apakah lisensi Windows akan hilang?'"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 font-semibold focus:bg-white focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={f.answer}
                    onChange={(e) => {
                      const next = [...faqs];
                      next[idx].answer = e.target.value;
                      setFaqs(next);
                    }}
                    placeholder="Jawaban rinci..."
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:bg-white focus:outline-none"
                  />
                </div>
              ))}

              <div className="space-y-1 pt-2 border-t border-stone-100">
                <label className="font-semibold text-stone-700">Kesimpulan Artikel</label>
                <textarea
                  rows={2}
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                  placeholder="Pesan penutup atau takeaways untuk pembaca..."
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
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
              Simpan Tutorial
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
