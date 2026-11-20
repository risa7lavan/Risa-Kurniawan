import React, { useEffect, useState } from 'react';
import {
  Image as ImageIcon,
  RefreshCw,
  Download,
  Check,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import {
  GeneratedThumbnailResult,
  ThumbnailOutputFormat,
  ThumbnailStatusResponse,
} from '../types';
import {
  buildLocalShortHeadline,
  downloadThumbnailDataUrl,
  fetchThumbnailProviderStatus,
} from '../utils/thumbnailGenerator';

interface AiThumbnailGeneratorPanelProps {
  contentType: 'article' | 'tutorial';
  title: string;
  slug?: string;
  currentThumbnail?: string;
  autoEnabled: boolean;
  onToggleAuto: (enabled: boolean) => void;
  result: GeneratedThumbnailResult | null;
  isGenerating: boolean;
  errorMessage?: string | null;
  showHeadlineOverlay: boolean;
  onChangeShowHeadlineOverlay: (val: boolean) => void;
  format: ThumbnailOutputFormat;
  onChangeFormat: (fmt: ThumbnailOutputFormat) => void;
  onGenerateRequested: (options?: {
    regenerate?: boolean;
    headlineOverride?: string;
    showHeadlineOverlay?: boolean;
    format?: ThumbnailOutputFormat;
  }) => void;
  onApplyThumbnail: (
    imageDataUrl: string,
    altText?: string,
    meta?: { headline?: string; visualConcept?: string }
  ) => void;
  isApplied?: boolean;
  compact?: boolean;
}

export const AiThumbnailGeneratorPanel: React.FC<AiThumbnailGeneratorPanelProps> = ({
  contentType,
  title,
  slug,
  currentThumbnail,
  autoEnabled,
  onToggleAuto,
  result,
  isGenerating,
  errorMessage,
  showHeadlineOverlay,
  onChangeShowHeadlineOverlay,
  format,
  onChangeFormat,
  onGenerateRequested,
  onApplyThumbnail,
  isApplied = false,
  compact = false,
}) => {
  const [providerStatus, setProviderStatus] = useState<ThumbnailStatusResponse | null>(null);
  const [headlineInput, setHeadlineInput] = useState('');
  const [showPromptDetails, setShowPromptDetails] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState(false);

  useEffect(() => {
    let mounted = true;
    void fetchThumbnailProviderStatus().then((status) => {
      if (mounted) setProviderStatus(status);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (result?.headline) {
      setHeadlineInput(result.headline);
    } else if (title && !headlineInput) {
      setHeadlineInput(buildLocalShortHeadline(title));
    }
  }, [result?.headline, title]);

  const activePreviewUrl = result?.imageDataUrl || currentThumbnail || '';
  const sizeKb = result ? Math.max(1, Math.round(result.sizeBytes / 1024)) : null;

  const handleDownload = async () => {
    if (!activePreviewUrl) return;
    await downloadThumbnailDataUrl(activePreviewUrl, slug || title || 'thumbnail-ai', format);
    setDownloadFeedback(true);
    setTimeout(() => setDownloadFeedback(false), 2000);
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/90 overflow-hidden shadow-2xs">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-stone-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider uppercase text-[#84cc16]">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>AI AUTOMATIC THUMBNAIL GENERATOR</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#84cc16] text-stone-950 text-[10px] font-extrabold uppercase">
              Gratis · 1280×720
            </span>
          </div>
          <p className="text-[11px] text-stone-300">
            Analisis konten {contentType === 'tutorial' ? 'tutorial' : 'artikel'} otomatis &rarr; desain visual 16:9 siap tayang tanpa menulis prompt manual.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-[11px] font-semibold text-stone-200 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={autoEnabled}
            onChange={(e) => onToggleAuto(e.target.checked)}
            className="rounded border-stone-600 text-[#84cc16] focus:ring-[#84cc16]"
          />
          <span>Auto-Generate Saat Konten Dibuat</span>
        </label>
      </div>

      {/* Body */}
      <div className={`p-4 space-y-4 ${compact ? 'text-xs' : ''}`}>
        {/* Provider Status & Honest Free-Tier Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-stone-200 text-[11px]">
          <div className="flex items-start sm:items-center gap-2 text-stone-700">
            <Info className="w-3.5 h-3.5 text-[#65a30d] shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <span className="font-bold text-stone-900">Status Mesin Gambar: </span>
              {result?.providerLabel ||
                providerStatus?.providers?.localCanvasStudio?.label ||
                'Mode Gratis (AI Public Proxy + Studio Grafis 1280×720)'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-stone-500 shrink-0">
            16:9 ({result?.width || 1280} × {result?.height || 720} px)
            {sizeKb ? ` · ~${sizeKb} KB` : ''}
          </span>
        </div>

        {/* Error fallback notice */}
        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left: 16:9 Thumbnail Preview */}
          <div className="lg:col-span-7 space-y-2">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-stone-300 bg-stone-900 shadow-xs flex items-center justify-center">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center gap-2 text-stone-200 p-4 text-center">
                  <Loader2 className="w-7 h-7 animate-spin text-[#84cc16]" />
                  <span className="text-xs font-semibold">
                    Menganalisis topik &amp; merender thumbnail 1280×720...
                  </span>
                </div>
              ) : activePreviewUrl ? (
                <img
                  src={activePreviewUrl}
                  alt={result?.analysis.altText || title || 'Pratinjau Thumbnail AI 1280x720'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 space-y-2 text-stone-400">
                  <ImageIcon className="w-8 h-8 mx-auto opacity-60" />
                  <p className="text-xs">
                    Klik <strong className="text-stone-200">Generate Thumbnail</strong> untuk membuat thumbnail 16:9 otomatis.
                  </p>
                </div>
              )}

              {activePreviewUrl && !isGenerating && (
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-stone-950/80 text-white font-mono text-[10px] border border-stone-700">
                    1280×720 {format.toUpperCase()}
                  </span>
                  {isApplied && (
                    <span className="px-2 py-0.5 rounded bg-[#84cc16] text-stone-950 font-bold text-[10px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Terpasang
                    </span>
                  )}
                </div>
              )}
            </div>

            {result && (
              <div className="text-[11px] text-stone-600 flex flex-wrap items-center justify-between gap-2 px-1">
                <span>
                  <strong className="text-stone-800">Alt Text SEO:</strong> {result.analysis.altText}
                </span>
              </div>
            )}
          </div>

          {/* Right: Controls & Actions */}
          <div className="lg:col-span-5 space-y-3 bg-white p-3.5 rounded-xl border border-stone-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
              <Sliders className="w-3.5 h-3.5 text-[#65a30d]" />
              <span>Pengaturan Visual Thumbnail</span>
            </div>

            {/* Editable short headline (3-8 words) */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-stone-700">
                Headline Singkat di Thumbnail (3–8 kata)
              </label>
              <input
                type="text"
                value={headlineInput}
                onChange={(e) => setHeadlineInput(e.target.value)}
                placeholder={buildLocalShortHeadline(title)}
                className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
              />
            </div>

            {/* Headline Overlay + Output Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              <label className="flex items-center gap-2 text-[11px] font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHeadlineOverlay}
                  onChange={(e) => onChangeShowHeadlineOverlay(e.target.checked)}
                  className="rounded border-stone-300 text-stone-900 focus:ring-[#84cc16]"
                />
                <span>Tampilkan Headline &amp; Badge Editorial</span>
              </label>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] font-semibold text-stone-700">Format File:</span>
                <div className="inline-flex p-0.5 rounded-lg bg-stone-100 border border-stone-200 text-[11px]">
                  <button
                    type="button"
                    onClick={() => onChangeFormat('webp')}
                    className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                      format === 'webp' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    WebP (Ringan)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeFormat('png')}
                    className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                      format === 'png' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    PNG (Lossless)
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={isGenerating || !title.trim()}
                onClick={() =>
                  onGenerateRequested({
                    regenerate: false,
                    headlineOverride: headlineInput.trim() || undefined,
                    showHeadlineOverlay,
                    format,
                  })
                }
                className="px-3 py-2 bg-[#84cc16] hover:bg-[#a3e635] disabled:opacity-50 text-stone-950 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Thumbnail</span>
              </button>

              <button
                type="button"
                disabled={isGenerating || !title.trim()}
                onClick={() =>
                  onGenerateRequested({
                    regenerate: true,
                    headlineOverride: headlineInput.trim() || undefined,
                    showHeadlineOverlay,
                    format,
                  })
                }
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-900 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1.5 cursor-pointer border border-stone-200 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate Thumbnail</span>
              </button>

              <button
                type="button"
                disabled={!activePreviewUrl || isGenerating}
                onClick={() => void handleDownload()}
                className="px-3 py-2 bg-white hover:bg-stone-50 disabled:opacity-50 text-stone-800 font-semibold rounded-lg text-[11px] flex items-center justify-center gap-1.5 cursor-pointer border border-stone-200 transition-colors"
              >
                {downloadFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Terunduh!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Thumbnail</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={!result?.imageDataUrl || isGenerating}
                onClick={() => {
                  if (result?.imageDataUrl) {
                    onApplyThumbnail(result.imageDataUrl, result.analysis.altText, {
                      headline: headlineInput.trim() || result.headline,
                      visualConcept: result.analysis.visualConcept,
                    });
                  }
                }}
                className={`px-3 py-2 disabled:opacity-50 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  isApplied
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-stone-950 hover:bg-stone-800 text-white'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Use This Thumbnail</span>
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Auto-Analysis & Prompt Inspection (Zero manual prompt needed) */}
        {result && (
          <div className="border border-stone-200 rounded-lg bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPromptDetails((v) => !v)}
              className="w-full px-3.5 py-2 flex items-center justify-between text-left text-[11px] font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              <span>
                Konsep Visual &amp; Prompt Otomatis AI ({result.analysis.visualCategoryLabel}) —{' '}
                {result.analysisSource === 'gemini-ai' ? 'Gemini AI Analyzer' : 'Smart Analyzer'}
              </span>
              {showPromptDetails ? (
                <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              )}
            </button>
            {showPromptDetails && (
              <div className="px-3.5 pb-3 pt-2 border-t border-stone-100 space-y-2 text-[11px] text-stone-600">
                <div>
                  <strong className="text-stone-800">Konsep Visual:</strong> {result.analysis.visualConcept}
                </div>
                <div>
                  <strong className="text-stone-800">Objek Utama:</strong>{' '}
                  {result.analysis.focalObjects.join(', ')}
                </div>
                <div>
                  <strong className="text-stone-800">Pencahayaan &amp; Atmosfer:</strong>{' '}
                  {result.analysis.lightingMood}
                </div>
                <div className="p-2 bg-stone-50 border border-stone-200 rounded font-mono text-[10px] text-stone-700 break-words">
                  {result.analysis.imagePrompt}
                </div>
                <div className="text-[10px] text-stone-500">
                  Catatan kuota: {result.limitNotice} Model Gemini Image/Imagen berbayar tidak diaktifkan pada alur gratis standar.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
