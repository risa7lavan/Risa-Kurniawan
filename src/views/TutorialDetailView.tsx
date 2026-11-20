import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Terminal,
  ShieldCheck,
  Target,
  Image as ImageIcon,
  Layers
} from 'lucide-react';
import { useAppData } from '../context/DataContext';

interface TutorialDetailViewProps {
  slug: string;
  onBack: () => void;
  onSelectTutorial: (slug: string) => void;
}

export const TutorialDetailView: React.FC<TutorialDetailViewProps> = ({
  slug,
  onBack,
  onSelectTutorial
}) => {
  const { publishedTutorials: tutorials } = useAppData();
  const [copiedCodeId, setCopiedCodeId] = useState<number | null>(null);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showVisualGuide, setShowVisualGuide] = useState(false);

  const tutorial = tutorials.find((t) => t.slug === slug);

  if (!tutorial) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">Tutorial Tidak Ditemukan</h2>
        <p className="text-stone-600 text-sm">
          Panduan teknis yang Anda cari tidak tersedia dalam direktori basis pengetahuan.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Kembali ke Daftar Tutorial
        </button>
      </div>
    );
  }

  const handleCopyCode = (code: string, stepIndex: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(stepIndex);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2500);
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const relatedTutorials = tutorials
    .filter((t) => t.id !== tutorial.id && (tutorial.relatedTutorialSlugs?.includes(t.slug) || t.category === tutorial.category))
    .slice(0, 3);

  const hasCausesInTroubleshooting = tutorial.troubleshootingTips.some((t) => Boolean(t.cause));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-7">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors cursor-pointer py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Tutorial</span>
        </button>
      </div>

      {/* Article Header */}
      <header className="space-y-3 border-b border-stone-200 pb-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
          <span className="font-semibold text-stone-800">{tutorial.category}</span>
          <span aria-hidden="true">·</span>
          <span>Tingkat: {tutorial.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>{tutorial.readTimeMinutes} menit pengerjaan</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>Dipublikasikan: {tutorial.publishedDate}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-950 tracking-tight leading-tight">
          {tutorial.title}
        </h1>

        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-3xl">
          {tutorial.summary}
        </p>

        {/* Action bar */}
        <div className="flex items-center justify-between pt-1.5">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
              {tutorial.steps.length} Langkah Terstruktur
            </span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md text-xs font-medium transition-colors cursor-pointer border border-stone-200"
          >
            {shareFeedback ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Tautan Disalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-stone-500" />
                <span>Bagikan Panduan</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Hero Thumbnail */}
      {tutorial.thumbnail && (
        <div className="rounded-xl overflow-hidden border border-stone-200 aspect-video max-h-[420px] w-full bg-stone-900 shadow-xs">
          <img
            src={tutorial.thumbnail}
            alt={tutorial.imageAltText || tutorial.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Main Layout: Article + Table of Contents Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Table of Contents & Metadata (4 Cols on desktop) */}
        <aside className="lg:col-span-4 order-2 lg:order-1 space-y-4 sm:space-y-5">
          {/* Table of Contents Box */}
          <div className="sticky top-24 p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-800">
              <BookOpen className="w-4 h-4 text-stone-500" />
              <span>Daftar Isi Tutorial</span>
            </div>
            <nav className="space-y-1.5 text-xs">
              {tutorial.tableOfContents.map((toc) => (
                <button
                  key={toc.id}
                  onClick={() => scrollToHeading(toc.id)}
                  className="w-full text-left py-1 text-stone-600 hover:text-stone-950 hover:underline block leading-relaxed transition-colors cursor-pointer"
                >
                  {toc.title}
                </button>
              ))}
              {tutorial.verification && (
                <button
                  onClick={() => scrollToHeading('verifikasi-hasil')}
                  className="w-full text-left py-1 text-stone-600 hover:text-stone-950 hover:underline block leading-relaxed cursor-pointer"
                >
                  Hasil Akhir &amp; Verifikasi
                </button>
              )}
              <button
                onClick={() => scrollToHeading('pemecahan-masalah')}
                className="w-full text-left py-1 text-stone-600 hover:text-stone-950 hover:underline block leading-relaxed cursor-pointer"
              >
                Pemecahan Masalah Umum
              </button>
              <button
                onClick={() => scrollToHeading('faq-section')}
                className="w-full text-left py-1 text-stone-600 hover:text-stone-950 hover:underline block leading-relaxed cursor-pointer"
              >
                Pertanyaan yang Sering Diajukan (FAQ)
              </button>
            </nav>

            {/* Prerequisites & Tools */}
            <div className="pt-4 border-t border-stone-200 space-y-3 text-xs">
              <div className="font-bold text-stone-900">Alat &amp; Software:</div>
              <ul className="space-y-1 text-stone-600 list-disc pl-4">
                {tutorial.toolsNeeded.map((tool, i) => (
                  <li key={i}>{tool}</li>
                ))}
              </ul>
              {tutorial.systemRequirements && (
                <div className="pt-2 border-t border-stone-200/70 space-y-1 text-[11px] text-stone-600">
                  <div className="font-bold text-stone-800">Lingkungan Sistem:</div>
                  {tutorial.systemRequirements.os && (
                    <div>
                      <span className="font-semibold text-stone-700">OS:</span> {tutorial.systemRequirements.os}
                    </div>
                  )}
                  {tutorial.systemRequirements.hardware && (
                    <div>
                      <span className="font-semibold text-stone-700">Perangkat:</span>{' '}
                      {tutorial.systemRequirements.hardware}
                    </div>
                  )}
                  {tutorial.systemRequirements.access && (
                    <div>
                      <span className="font-semibold text-stone-700">Akses:</span> {tutorial.systemRequirements.access}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Right Column: Steps & Technical Content (8 Cols) */}
        <main className="lg:col-span-8 order-1 lg:order-2 space-y-6 sm:space-y-7">
          {/* Pendahuluan (Master Prompt) */}
          {tutorial.introduction && (
            <section className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-white p-4 sm:p-5 rounded-xl border border-stone-200">
              {tutorial.introduction}
            </section>
          )}

          {/* Tujuan Tutorial */}
          {tutorial.objectives && tutorial.objectives.length > 0 && (
            <section className="p-4 bg-[#84cc16]/10 rounded-xl border border-[#84cc16]/35 space-y-2 text-xs sm:text-sm">
              <h2 className="font-bold text-stone-950 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#65a30d]" />
                <span>Tujuan &amp; Hasil yang Dicapai</span>
              </h2>
              <ul className="space-y-1 text-stone-800 list-disc pl-5">
                {tutorial.objectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Risk Warning Box if critical */}
          {tutorial.riskWarning && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                <span>{tutorial.riskWarning.title}</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                {tutorial.riskWarning.message}
              </p>
            </div>
          )}

          {/* Persyaratan Awal (Wajib & Opsional) */}
          <section className="p-4 bg-stone-100/60 rounded-xl border border-stone-200 space-y-3 text-xs sm:text-sm">
            <div className="space-y-1.5">
              <h3 className="font-bold text-stone-900">Persiapan &amp; Prasyarat Wajib:</h3>
              <ul className="space-y-1 text-stone-600 list-disc pl-5">
                {tutorial.prerequisites.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            {tutorial.optionalPrerequisites && tutorial.optionalPrerequisites.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-stone-200">
                <h4 className="font-semibold text-stone-800 text-xs">Persiapan Opsional (Disarankan):</h4>
                <ul className="space-y-1 text-stone-600 list-disc pl-5 text-xs">
                  {tutorial.optionalPrerequisites.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Gambaran Proses */}
          {tutorial.processOverview && (
            <section className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5 text-xs sm:text-sm">
              <h2 className="font-bold text-stone-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-stone-500" />
                <span>Gambaran Alur Proses</span>
              </h2>
              <p className="text-stone-700 leading-relaxed">{tutorial.processOverview}</p>
            </section>
          )}

          {/* Step by Step Breakdown */}
          <section className="space-y-4 sm:space-y-5">
            {tutorial.steps.map((step, idx) => {
              const tocItem = tutorial.tableOfContents[idx];
              const anchorId = tocItem ? tocItem.id : `step-${step.stepNumber}`;

              return (
                <article
                  key={step.stepNumber}
                  id={anchorId}
                  className="p-4 sm:p-5 bg-white rounded-xl border border-stone-200 space-y-3 scroll-mt-24 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-stone-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      0{step.stepNumber}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-stone-950 tracking-tight">
                      {step.title}
                    </h2>
                  </div>

                  {step.objective && (
                    <div className="pl-9.5 text-xs text-stone-600">
                      <span className="font-semibold text-stone-800">Tujuan langkah:</span> {step.objective}
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-9.5">
                    {step.description}
                  </p>

                  {step.actions && step.actions.length > 0 && (
                    <ol className="pl-14 pr-2 space-y-1 text-xs sm:text-sm text-stone-700 list-decimal">
                      {step.actions.map((act, aIdx) => (
                        <li key={aIdx} className="leading-relaxed">
                          {act}
                        </li>
                      ))}
                    </ol>
                  )}

                  {/* Code snippet with copy button */}
                  {step.codeSnippet && (
                    <div className="pl-9.5 pt-0.5">
                      <div className="relative bg-stone-900 text-stone-100 rounded-lg overflow-hidden font-mono text-xs">
                        <div className="px-3.5 py-1.5 bg-stone-950 text-stone-400 text-[11px] flex items-center justify-between border-b border-stone-800">
                          <span className="flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-[#BEF264]" />
                            <span>{step.codeSnippet.label || step.codeSnippet.language}</span>
                          </span>
                          <button
                            onClick={() => handleCopyCode(step.codeSnippet!.code, idx)}
                            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedCodeId === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Salin Kode</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 overflow-x-auto leading-relaxed text-stone-200">
                          {step.codeSnippet.code}
                        </pre>
                      </div>
                    </div>
                  )}

                  {step.expectedResult && (
                    <div className="pl-9.5 pt-0.5">
                      <div className="p-2.5 bg-emerald-50/80 rounded-lg border border-emerald-200 text-xs text-emerald-900 leading-relaxed flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <span className="font-semibold">Hasil yang diharapkan:</span> {step.expectedResult}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Note block */}
                  {step.note && (
                    <div className="pl-9.5 pt-0.5">
                      <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 leading-relaxed">
                        <span className="font-semibold text-stone-800">Catatan:</span> {step.note}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>

          {/* Panduan Screenshot Opsional */}
          {tutorial.screenshotRecommendations && tutorial.screenshotRecommendations.length > 0 && (
            <section className="bg-stone-50 rounded-xl border border-stone-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowVisualGuide((v) => !v)}
                className="w-full p-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-stone-500" />
                  <span>
                    Panduan Visual &amp; Rekomendasi Tangkapan Layar ({tutorial.screenshotRecommendations.length} Bagian)
                  </span>
                </span>
                {showVisualGuide ? (
                  <ChevronUp className="w-4 h-4 text-stone-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                )}
              </button>
              {showVisualGuide && (
                <div className="p-4 pt-0 space-y-2.5 border-t border-stone-200 bg-white">
                  {tutorial.screenshotRecommendations.map((fig) => (
                    <div key={fig.figureNumber} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-1">
                      <div className="font-bold text-stone-900">
                        Gambar {fig.figureNumber}: {fig.title}
                      </div>
                      <div className="text-stone-600">
                        <span className="font-semibold text-stone-800">Area layar:</span> {fig.screenArea}
                      </div>
                      {fig.annotation && (
                        <div className="text-stone-600">
                          <span className="font-semibold text-stone-800">Penanda:</span> {fig.annotation}
                        </div>
                      )}
                      <div className="text-stone-500 italic">{fig.caption}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Hasil Akhir & Verifikasi */}
          {tutorial.verification && (
            <section id="verifikasi-hasil" className="p-4 sm:p-5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2.5 scroll-mt-24">
              <h2 className="text-base sm:text-lg font-bold text-emerald-950 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Hasil Akhir &amp; Cara Verifikasi</span>
              </h2>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">{tutorial.verification.summary}</p>
              {tutorial.verification.indicators && tutorial.verification.indicators.length > 0 && (
                <ul className="space-y-1 text-xs sm:text-sm text-emerald-900 list-disc pl-5">
                  {tutorial.verification.indicators.map((ind, idx) => (
                    <li key={idx}>{ind}</li>
                  ))}
                </ul>
              )}
              {tutorial.verification.expectedOutput && (
                <div className="p-2.5 bg-white rounded-lg border border-emerald-200 text-xs font-mono text-emerald-950">
                  Contoh keluaran sukses: {tutorial.verification.expectedOutput}
                </div>
              )}
              {tutorial.verification.testMethod && (
                <p className="text-xs text-emerald-800 leading-relaxed">
                  <span className="font-semibold">Metode uji:</span> {tutorial.verification.testMethod}
                </p>
              )}
            </section>
          )}

          {/* Pemecahan Masalah Umum */}
          <section id="pemecahan-masalah" className="space-y-3 pt-2 scroll-mt-24">
            <h2 className="text-lg sm:text-xl font-bold text-stone-950 tracking-tight">
              Pemecahan Masalah yang Sering Terjadi
            </h2>
            {hasCausesInTroubleshooting ? (
              <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead className="bg-stone-100 text-stone-800 border-b border-stone-200">
                    <tr>
                      <th className="p-3 font-bold">Permasalahan</th>
                      <th className="p-3 font-bold">Kemungkinan Penyebab</th>
                      <th className="p-3 font-bold">Solusi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {tutorial.troubleshootingTips.map((tip, i) => (
                      <tr key={i} className="align-top">
                        <td className="p-3 font-semibold text-stone-900">{tip.issue}</td>
                        <td className="p-3 text-stone-600">{tip.cause || '-'}</td>
                        <td className="p-3 text-stone-700">{tip.resolution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tutorial.troubleshootingTips.map((tip, i) => (
                  <div key={i} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm space-y-1">
                    <div className="font-bold text-stone-900">Kendala: &quot;{tip.issue}&quot;</div>
                    <div className="text-stone-600 leading-relaxed">
                      <span className="font-semibold text-stone-800">Solusi:</span> {tip.resolution}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Tips & Rekomendasi Keamanan */}
          {tutorial.tipsAndRecommendations && (
            <section className="p-4 sm:p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-xs sm:text-sm">
              <h2 className="text-base sm:text-lg font-bold text-stone-950 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#65a30d]" />
                <span>Tips Praktis, Hal yang Harus Dihindari &amp; Keamanan</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tutorial.tipsAndRecommendations.bestPractices?.length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Praktik Terbaik</h3>
                    <ul className="space-y-1 text-stone-700 list-disc pl-4 text-xs">
                      {tutorial.tipsAndRecommendations.bestPractices.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {tutorial.tipsAndRecommendations.avoidMistakes?.length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Hindari Kesalahan Ini</h3>
                    <ul className="space-y-1 text-stone-700 list-disc pl-4 text-xs">
                      {tutorial.tipsAndRecommendations.avoidMistakes.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {tutorial.tipsAndRecommendations.securityTips?.length > 0 && (
                <div className="pt-2 border-t border-stone-200 space-y-1">
                  <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Keamanan Sistem &amp; Data</h3>
                  <ul className="space-y-1 text-stone-700 list-disc pl-4 text-xs">
                    {tutorial.tipsAndRecommendations.securityTips.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* FAQ Accordion */}
          <section id="faq-section" className="space-y-3 pt-2 scroll-mt-24">
            <h2 className="text-lg sm:text-xl font-bold text-stone-950 tracking-tight flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-stone-500" />
              <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
            </h2>
            <div className="space-y-2">
              {tutorial.faqs.map((faq, i) => {
                const isOpen = openFaqIndex === i;
                return (
                  <div key={i} className="bg-white rounded-lg border border-stone-200 overflow-hidden">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full p-3.5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Kesimpulan */}
          <section className="p-4 sm:p-5 bg-stone-900 text-white rounded-xl space-y-2">
            <h3 className="font-bold text-sm sm:text-base tracking-tight text-[#BEF264]">
              Kesimpulan &amp; Tindak Lanjut
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {tutorial.conclusion}
            </p>
          </section>

          {/* Referensi Resmi */}
          {tutorial.references && tutorial.references.length > 0 && (
            <section className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#65a30d]" />
                Referensi &amp; Dokumentasi Resmi
              </h2>
              <ul className="space-y-1.5 text-xs text-stone-600">
                {tutorial.references.map((ref, idx) => (
                  <li key={idx}>
                    <span className="font-semibold text-stone-900">{ref.title}</span>
                    {ref.publisher ? <span> — {ref.publisher}</span> : null}
                    {ref.url && (ref.url.startsWith('http://') || ref.url.startsWith('https://')) ? (
                      <>
                        {' '}
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="text-[#4d7c0f] hover:underline break-all"
                        >
                          ({ref.url})
                        </a>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Related Articles */}
          {relatedTutorials.length > 0 && (
            <section className="pt-4 border-t border-stone-200 space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-stone-900">
                Panduan Terkait Lainnya
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedTutorials.map((rel) => (
                  <button
                    key={rel.id}
                    onClick={() => {
                      onSelectTutorial(rel.slug);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-3.5 bg-white rounded-xl border border-stone-200 hover:border-stone-400 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[11px] text-stone-500 mb-1">{rel.category}</div>
                    <div className="font-bold text-sm text-stone-900 group-hover:text-stone-700 leading-snug">
                      {rel.title}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
