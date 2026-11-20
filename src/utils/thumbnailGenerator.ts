import {
  GeneratedThumbnailResult,
  ThumbnailAnalysisPayload,
  ThumbnailOutputFormat,
  ThumbnailStatusResponse,
  ThumbnailVisualDirection,
} from '../types';

export interface GenerateAutoThumbnailOptions {
  contentType: 'article' | 'tutorial';
  title: string;
  topic?: string;
  summary?: string;
  category?: string;
  focusKeyword?: string;
  targetAudience?: string;
  primarySubject?: string;
  toolsOrObjects?: string;
  headlineOverride?: string;
  showHeadlineOverlay?: boolean;
  format?: ThumbnailOutputFormat;
  variationSeed?: number;
  skipExternalRaster?: boolean;
  brandName?: string;
}

interface BackendThumbnailResponse {
  success: boolean;
  analysis: ThumbnailAnalysisPayload;
  analysisSource: 'gemini-ai' | 'smart-analyzer';
  rasterImageDataUrl: string | null;
  svgFallbackDataUrl: string;
  providerUsed: string;
  providerLabel: string;
  isFreeTier: boolean;
  limitNotice: string;
  variationSeed: number;
}

const DEFAULT_THUMBNAIL_STATUS: ThumbnailStatusResponse = {
  success: true,
  activeDefaultProvider: 'local-canvas-studio',
  freeTierOnlyDefault: true,
  providers: {
    geminiAnalysis: {
      id: 'gemini-4-hydrogen',
      label: 'Gemini 4 Hydrogen (Analisis & Prompt JSON)',
      available: false,
      isFreeTier: true,
      limitNotice: 'Gratis via Gemini API jika server dikonfigurasi, dengan fallback Smart Analyzer lokal.',
    },
    huggingFaceFree: {
      id: 'huggingface-flux-schnell',
      label: 'Hugging Face Free Inference (FLUX.1-schnell)',
      available: false,
      isFreeTier: true,
      limitNotice: 'Opsional gratis bila HF_TOKEN dikonfigurasi di server.',
    },
    publicFreeImageProxy: {
      id: 'pollinations-public-free',
      label: 'Public Free AI Image Proxy (Flux)',
      available: true,
      isFreeTier: true,
      limitNotice: 'Layanan gambar AI publik gratis dengan fallback otomatis ke Studio Grafis 1280×720.',
    },
    localCanvasStudio: {
      id: 'studio-canvas-1280x720',
      label: 'Studio Grafis Editorial 1280×720 (SVG + HTML5 Canvas)',
      available: true,
      isFreeTier: true,
      limitNotice: '100% gratis, cepat, tanpa batas kuota & menghasilkan gambar 1280×720 WebP/PNG.',
    },
    geminiPaidImageNote: {
      id: 'gemini-paid-image-models',
      label: 'Gemini Image / Imagen (Membutuhkan API Key Berbayar)',
      available: false,
      isFreeTier: false,
      requiresPaidKey: true,
      limitNotice: 'Model gambar Gemini berbayar tidak diaktifkan pada mode gratis standar.',
    },
  },
  usageGuidance:
    'Sistem memakai mode gratis: analisis visual AI + layanan gambar gratis dengan fallback instan Studio Grafis 1280×720.',
};

// Client-side lightweight cache for identical status/requests
let cachedStatus: { expiresAt: number; data: ThumbnailStatusResponse } | null = null;

export async function fetchThumbnailProviderStatus(): Promise<ThumbnailStatusResponse> {
  if (cachedStatus && cachedStatus.expiresAt > Date.now()) {
    return cachedStatus.data;
  }
  try {
    const res = await fetch('/api/ai/thumbnail-status');
    if (res.ok) {
      const json = (await res.json()) as ThumbnailStatusResponse;
      if (json && json.success && json.providers) {
        cachedStatus = { expiresAt: Date.now() + 60_000, data: json };
        return json;
      }
    }
  } catch {
    // Use safe default status when backend unreachable
  }
  return DEFAULT_THUMBNAIL_STATUS;
}

export function buildLocalShortHeadline(title: string, fallback = 'Panduan Teknologi IT'): string {
  const cleaned = String(title || fallback)
    .replace(/[:|—–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return fallback;
  const words = cleaned.split(' ').filter(Boolean);
  if (words.length <= 7) return words.join(' ');
  return words.slice(0, 6).join(' ');
}

function classifyDirectionLocally(text: string): {
  visualDirection: ThumbnailVisualDirection;
  visualCategoryLabel: string;
  categoryBadge: string;
} {
  const lower = text.toLowerCase();
  if (/(jaringan|network|router|mikrotik|wifi|wi-fi|ethernet|lan|ip |dns|firewall|switch|vpn)/.test(lower)) {
    return {
      visualDirection: 'NETWORKING',
      visualCategoryLabel: 'B. Networking & Infrastructure',
      categoryBadge: 'JARINGAN & INFRASTRUKTUR',
    };
  }
  if (/(kecerdasan buatan|\bai\b|llm|agent|machine learning|otomasi|automation|chatgpt|gemini|prompt)/.test(lower)) {
    return {
      visualDirection: 'AI_TECH',
      visualCategoryLabel: 'D. Artificial Intelligence & Automation',
      categoryBadge: 'AI & OTOMASI DIGITAL',
    };
  }
  if (/(website|web |react|vite|html|css|typescript|javascript|supabase|vercel|frontend|backend|api|coding)/.test(lower)) {
    return {
      visualDirection: 'WEB_DEV',
      visualCategoryLabel: 'C. Website & Web Development',
      categoryBadge: 'WEB DEVELOPMENT',
    };
  }
  if (/(software|aplikasi|produktivitas|cyber|keamanan|security|ransomware|antivirus|backup|cloud)/.test(lower)) {
    return {
      visualDirection: 'SOFTWARE_APPS',
      visualCategoryLabel: 'E. Software, Cloud & Productivity',
      categoryBadge: 'SOFTWARE & KEAMANAN',
    };
  }
  if (/(windows|laptop|pc|komputer|hardware|ssd|nvme|ram|thermal|bsod|driver|partisi|bios|cpu)/.test(lower)) {
    return {
      visualDirection: 'IT_SUPPORT',
      visualCategoryLabel: 'A. IT Support & Computer Hardware',
      categoryBadge: 'IT SUPPORT & HARDWARE',
    };
  }
  return {
    visualDirection: 'EDUCATION_GENERAL',
    visualCategoryLabel: 'F. General Digital Education',
    categoryBadge: 'EDUKASI TEKNOLOGI',
  };
}

function buildLocalFallbackAnalysis(opts: GenerateAutoThumbnailOptions): ThumbnailAnalysisPayload {
  const combined = `${opts.title} ${opts.topic || ''} ${opts.category || ''} ${opts.focusKeyword || ''} ${opts.toolsOrObjects || ''}`;
  const dir = classifyDirectionLocally(combined);
  const shortHeadline = opts.headlineOverride?.trim() || buildLocalShortHeadline(opts.title);

  return {
    shortHeadline,
    visualDirection: dir.visualDirection,
    visualCategoryLabel: dir.visualCategoryLabel,
    visualConcept: `Ilustrasi editorial modern 16:9 bertema ${opts.category || 'Teknologi IT'} untuk "${opts.title}" dengan fokus visual bersih dan kontras tinggi.`,
    focalObjects: ['modern workstation', 'technical display', 'clean editorial lighting'],
    lightingMood: 'Dark charcoal ambient with crisp lime green studio rim lighting',
    colorAccents: ['#0c0a09', '#1c1917', '#84cc16', '#BEF264'],
    imagePrompt: `Modern editorial technology photography for ${opts.title}, dark charcoal studio lighting, subtle lime green rim accent, clean composition, high resolution 16:9, no text, no letters, no logos, no watermarks.`,
    altText: `Thumbnail ${opts.contentType === 'tutorial' ? 'tutorial' : 'artikel'} ${opts.title} — ${opts.category || 'IT & Teknologi'}`,
    categoryBadge: (opts.category || dir.categoryBadge).toUpperCase().slice(0, 32),
  };
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function drawCoverImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, targetW: number, targetH: number) {
  const iw = img.naturalWidth || targetW;
  const ih = img.naturalHeight || targetH;
  const scale = Math.max(targetW / iw, targetH / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (targetW - dw) / 2;
  const dy = (targetH - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function wrapHeadlineLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 3
): string[] {
  const words = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return ['Panduan Teknologi IT'];

  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) {
        // Put remaining on last line cleanly if not wildly overflowing
        const restIndex = words.indexOf(word);
        const remaining = words.slice(restIndex).join(' ');
        if (ctx.measureText(remaining).width <= maxWidth * 1.05) {
          lines.push(remaining);
          return lines;
        }
      }
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawProceduralStudioBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  direction: ThumbnailVisualDirection,
  variationSeed = 1
) {
  // Base dark charcoal editorial gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#0c0a09');
  grad.addColorStop(0.55, '#141210');
  grad.addColorStop(1, '#1c1917');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle architectural grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.045)';
  ctx.lineWidth = 1;
  const gridStep = variationSeed % 2 === 0 ? 56 : 48;
  for (let x = 0; x <= w; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Soft radial accent glow shifting subtly on variationSeed
  const glowX = w * (0.76 + ((variationSeed % 3) - 1) * 0.05);
  const glowY = h * (0.44 + (((variationSeed + 1) % 3) - 1) * 0.08);
  const radial = ctx.createRadialGradient(glowX, glowY, 30, glowX, glowY, 440);
  radial.addColorStop(0, direction === 'NETWORKING' ? 'rgba(56, 189, 248, 0.22)' : 'rgba(132, 204, 22, 0.24)');
  radial.addColorStop(0.55, 'rgba(132, 204, 22, 0.08)');
  radial.addColorStop(1, 'rgba(12, 10, 9, 0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, w, h);

  // Right-side minimalist technical artwork motif
  ctx.save();
  ctx.translate(820, 150);

  if (direction === 'NETWORKING') {
    drawRoundedRectPath(ctx, 35, 165, 320, 88, 16);
    ctx.fillStyle = '#1c1917';
    ctx.fill();
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    for (let i = 0; i < 4; i++) {
      drawRoundedRectPath(ctx, 64 + i * 44, 194, 30, 26, 4);
      ctx.fillStyle = 'rgba(132, 204, 22, 0.22)';
      ctx.fill();
      ctx.strokeStyle = '#84cc16';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(312, 207, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#BEF264';
    ctx.fill();

    // Signal nodes
    ctx.beginPath();
    ctx.moveTo(195, 165);
    ctx.bezierCurveTo(195, 85, 85, 90, 85, 22);
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(195, 165);
    ctx.bezierCurveTo(195, 85, 315, 90, 315, 36);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(85, 22, 13, 0, Math.PI * 2);
    ctx.fillStyle = '#84cc16';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(315, 36, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
  } else if (direction === 'AI_TECH') {
    ctx.beginPath();
    ctx.arc(195, 195, 142, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(132, 204, 22, 0.22)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(195, 195, 98, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(190, 242, 100, 0.42)';
    ctx.lineWidth = 2;
    ctx.stroke();

    drawRoundedRectPath(ctx, 138, 138, 114, 114, 22);
    ctx.fillStyle = '#1c1917';
    ctx.fill();
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 3;
    ctx.stroke();

    drawRoundedRectPath(ctx, 166, 166, 58, 58, 10);
    ctx.fillStyle = 'rgba(132, 204, 22, 0.22)';
    ctx.fill();
    ctx.strokeStyle = '#BEF264';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    // Workstation / Web / Hardware sleek silhouette
    drawRoundedRectPath(ctx, 25, 42, 355, 232, 18);
    ctx.fillStyle = '#1c1917';
    ctx.fill();
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    drawRoundedRectPath(ctx, 45, 64, 315, 180, 10);
    ctx.fillStyle = '#0c0a09';
    ctx.fill();

    drawRoundedRectPath(ctx, 68, 92, 128, 16, 4);
    ctx.fillStyle = '#BEF264';
    ctx.fill();

    drawRoundedRectPath(ctx, 68, 124, 220, 11, 3);
    ctx.fillStyle = '#57534e';
    ctx.fill();

    drawRoundedRectPath(ctx, 68, 146, 175, 11, 3);
    ctx.fillStyle = '#44403c';
    ctx.fill();

    drawRoundedRectPath(ctx, 68, 182, 95, 34, 7);
    ctx.fillStyle = 'rgba(132, 204, 22, 0.22)';
    ctx.fill();
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

export async function composite1280x720Thumbnail(params: {
  analysis: ThumbnailAnalysisPayload;
  rasterImageDataUrl: string | null;
  svgFallbackDataUrl?: string | null;
  headline: string;
  showHeadlineOverlay: boolean;
  format: ThumbnailOutputFormat;
  variationSeed?: number;
  brandName?: string;
}): Promise<{ dataUrl: string; mimeType: 'image/webp' | 'image/png'; sizeBytes: number; usedRaster: boolean }> {
  const WIDTH = 1280;
  const HEIGHT = 720;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Browser Canvas 2D context tidak tersedia.');
  }

  let usedRaster = false;
  let loadedSvgBackdrop = false;

  if (params.rasterImageDataUrl) {
    try {
      const rasterImg = await loadHtmlImage(params.rasterImageDataUrl);
      drawCoverImage(ctx, rasterImg, WIDTH, HEIGHT);
      usedRaster = true;
    } catch {
      usedRaster = false;
    }
  }

  if (!usedRaster) {
    if (params.svgFallbackDataUrl) {
      try {
        const svgImg = await loadHtmlImage(params.svgFallbackDataUrl);
        drawCoverImage(ctx, svgImg, WIDTH, HEIGHT);
        loadedSvgBackdrop = true;
      } catch {
        drawProceduralStudioBackdrop(ctx, WIDTH, HEIGHT, params.analysis.visualDirection, params.variationSeed);
      }
    } else {
      drawProceduralStudioBackdrop(ctx, WIDTH, HEIGHT, params.analysis.visualDirection, params.variationSeed);
    }

    // Subtle geometric accent shift for visual variety when user hits Regenerate in Studio mode
    if ((params.variationSeed || 1) > 1) {
      const shiftIndex = ((params.variationSeed || 1) - 1) % 3;
      const accentGrad = ctx.createRadialGradient(
        WIDTH * (0.2 + shiftIndex * 0.25),
        HEIGHT * 0.85,
        20,
        WIDTH * (0.2 + shiftIndex * 0.25),
        HEIGHT * 0.85,
        360
      );
      accentGrad.addColorStop(0, 'rgba(132, 204, 22, 0.14)');
      accentGrad.addColorStop(1, 'rgba(12, 10, 9, 0)');
      ctx.fillStyle = accentGrad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  }

  if (usedRaster) {
    // Editorial left-to-right gradient scrim for ultra-high readability over AI raster imagery
    const leftScrim = ctx.createLinearGradient(0, 0, WIDTH * 0.84, 0);
    leftScrim.addColorStop(0, 'rgba(12, 10, 9, 0.93)');
    leftScrim.addColorStop(0.54, 'rgba(12, 10, 9, 0.72)');
    leftScrim.addColorStop(1, 'rgba(12, 10, 9, 0.12)');
    ctx.fillStyle = leftScrim;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const bottomScrim = ctx.createLinearGradient(0, HEIGHT * 0.65, 0, HEIGHT);
    bottomScrim.addColorStop(0, 'rgba(12, 10, 9, 0)');
    bottomScrim.addColorStop(1, 'rgba(12, 10, 9, 0.88)');
    ctx.fillStyle = bottomScrim;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  // Draw crisp editorial typography overlay
  ctx.textBaseline = 'top';
  const headlineText = (params.headline || params.analysis.shortHeadline || 'Panduan Teknologi IT').trim();
  ctx.font = '800 54px Inter, system-ui, -apple-system, sans-serif';
  const lines = params.showHeadlineOverlay ? wrapHeadlineLines(ctx, headlineText, 645, 3) : [];

  // If raster OR procedural backdrop was drawn directly (i.e., SVG backdrop did NOT already draw badge/footer)
  if (!loadedSvgBackdrop) {
    // Category badge
    const badgeText = (params.analysis.categoryBadge || 'TEKNOLOGI IT').toUpperCase();
    ctx.font = '700 17px ui-monospace, SFMono-Regular, Menlo, monospace';
    const badgeWidth = Math.min(500, Math.max(200, ctx.measureText(badgeText).width + 44));
    drawRoundedRectPath(ctx, 112, 178, badgeWidth, 38, 8);
    ctx.fillStyle = 'rgba(132, 204, 22, 0.18)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(132, 204, 22, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#BEF264';
    ctx.fillText(badgeText, 134, 189);

    // Lime vertical bar
    const barHeight = params.showHeadlineOverlay ? Math.max(220, 72 + lines.length * 68) : 92;
    drawRoundedRectPath(ctx, 84, 178, 8, barHeight, 4);
    ctx.fillStyle = '#84cc16';
    ctx.fill();

    // Subtitle & Brand Footer
    const subLabel = String(params.analysis.visualCategoryLabel || '')
      .replace(/^[A-F]\.\s*/, '')
      .slice(0, 48);
    ctx.font = '600 20px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#d6d3d1';
    ctx.fillText(subLabel, 112, 574);

    const footerBrand = `${(params.brandName || 'RISA KURNIAWAN').toUpperCase()} · IT & WEB STUDIO`;
    ctx.font = '700 17px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = '#84cc16';
    ctx.fillText(footerBrand, 112, 616);
  } else if (params.showHeadlineOverlay && lines.length > 0) {
    // SVG backdrop already contains badge (y=180..218) and footer (y=592..632),
    // so extend the vertical lime bar smoothly beside the headline text
    const barHeight = Math.max(120, lines.length * 68 + 14);
    drawRoundedRectPath(ctx, 84, 256, 8, barHeight, 4);
    ctx.fillStyle = '#84cc16';
    ctx.fill();
  }

  // Draw crisp headline lines (never distorted!)
  if (params.showHeadlineOverlay && lines.length > 0) {
    ctx.font = '800 54px Inter, system-ui, -apple-system, sans-serif';
    lines.forEach((line, idx) => {
      const y = 262 + idx * 68;
      // Subtle crisp dark drop shadow for depth over images
      ctx.fillStyle = 'rgba(12, 10, 9, 0.72)';
      ctx.fillText(line, 114, y + 3);
      ctx.fillStyle = '#fafaf9';
      ctx.fillText(line, 112, y);
    });
  }

  const mimeType: 'image/webp' | 'image/png' = params.format === 'png' ? 'image/png' : 'image/webp';
  const quality = mimeType === 'image/webp' ? 0.84 : undefined;
  let dataUrl = canvas.toDataURL(mimeType, quality);

  // Fallback if WebP unsupported in older environments
  let finalMime = mimeType;
  if (mimeType === 'image/webp' && !dataUrl.startsWith('data:image/webp')) {
    dataUrl = canvas.toDataURL('image/png');
    finalMime = 'image/png';
  }

  const base64Part = dataUrl.split(',')[1] || '';
  const sizeBytes = Math.round((base64Part.length * 3) / 4);

  return { dataUrl, mimeType: finalMime, sizeBytes, usedRaster };
}

// Prevent accidental burst duplicate requests
const inflightRequests = new Map<string, Promise<GeneratedThumbnailResult>>();

export async function generateAutoThumbnail(
  opts: GenerateAutoThumbnailOptions
): Promise<GeneratedThumbnailResult> {
  const format: ThumbnailOutputFormat = opts.format === 'png' ? 'png' : 'webp';
  const showHeadlineOverlay = opts.showHeadlineOverlay !== false;
  const variationSeed = Number(opts.variationSeed) || 1;
  const inflightKey = JSON.stringify({
    type: opts.contentType,
    t: opts.title.trim().toLowerCase(),
    h: (opts.headlineOverride || '').trim().toLowerCase(),
    o: showHeadlineOverlay,
    f: format,
    s: variationSeed,
    skip: Boolean(opts.skipExternalRaster),
  });

  const existing = inflightRequests.get(inflightKey);
  if (existing) return existing;

  const task = (async (): Promise<GeneratedThumbnailResult> => {
    let backendPayload: BackendThumbnailResponse | null = null;
    try {
      const res = await fetch('/api/ai/generate-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: opts.contentType,
          title: opts.title,
          topic: opts.topic,
          summary: opts.summary,
          category: opts.category,
          focusKeyword: opts.focusKeyword,
          targetAudience: opts.targetAudience,
          primarySubject: opts.primarySubject,
          toolsOrObjects: opts.toolsOrObjects,
          headlineOverride: opts.headlineOverride,
          showHeadlineOverlay,
          variationSeed,
          skipExternalRaster: opts.skipExternalRaster,
        }),
      });
      if (res.ok) {
        const json = (await res.json()) as BackendThumbnailResponse;
        if (json && json.success && json.analysis) {
          backendPayload = json;
        }
      }
    } catch {
      // Seamless local client fallback below
    }

    const analysis = backendPayload?.analysis || buildLocalFallbackAnalysis(opts);
    const headline = opts.headlineOverride?.trim() || analysis.shortHeadline;

    const composited = await composite1280x720Thumbnail({
      analysis,
      rasterImageDataUrl: backendPayload?.rasterImageDataUrl || null,
      svgFallbackDataUrl: backendPayload?.svgFallbackDataUrl || null,
      headline,
      showHeadlineOverlay,
      format,
      variationSeed,
      brandName: opts.brandName,
    });

    const providerUsed = composited.usedRaster
      ? backendPayload?.providerUsed || 'pollinations-public-free'
      : 'studio-canvas-1280x720';
    const providerLabel = composited.usedRaster
      ? backendPayload?.providerLabel || 'Public Free AI Image + 1280×720 Compositor'
      : 'Studio Grafis Editorial 1280×720 (Gratis Tanpa Batas)';
    const limitNotice = composited.usedRaster
      ? backendPayload?.limitNotice || 'Menggunakan penyedia gambar AI gratis publik + compositor lokal.'
      : 'Menggunakan Studio Grafis Editorial 1280×720 lokal (100% gratis, resolusi presisi, tanpa biaya API).';

    return {
      imageDataUrl: composited.dataUrl,
      mimeType: composited.mimeType,
      format: composited.mimeType === 'image/png' ? 'png' : 'webp',
      width: 1280,
      height: 720,
      sizeBytes: composited.sizeBytes,
      headline,
      showHeadlineOverlay,
      analysis,
      providerUsed,
      providerLabel,
      isFreeTier: true,
      limitNotice,
      analysisSource: backendPayload?.analysisSource || 'smart-analyzer',
      variationSeed,
      generatedAt: new Date().toISOString(),
    };
  })().finally(() => {
    inflightRequests.delete(inflightKey);
  });

  inflightRequests.set(inflightKey, task);
  return task;
}

export async function downloadThumbnailDataUrl(
  imageDataUrl: string,
  filenameBase: string,
  targetFormat: ThumbnailOutputFormat = 'webp'
): Promise<void> {
  if (!imageDataUrl) return;
  const safeBase =
    String(filenameBase || 'thumbnail-1280x720')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'thumbnail-1280x720';

  let downloadHref = imageDataUrl;
  let ext = targetFormat === 'png' ? 'png' : 'webp';

  try {
    const img = await loadHtmlImage(imageDataUrl);
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawCoverImage(ctx, img, 1280, 720);
      const mime = ext === 'png' ? 'image/png' : 'image/webp';
      const reEncoded = canvas.toDataURL(mime, ext === 'webp' ? 0.9 : undefined);
      if (reEncoded.startsWith(`data:${mime}`)) {
        downloadHref = reEncoded;
      } else {
        downloadHref = canvas.toDataURL('image/png');
        ext = 'png';
      }
    }
  } catch {
    // Direct download fallback if canvas conversion fails
  }

  const link = document.createElement('a');
  link.href = downloadHref;
  link.download = `${safeBase}-1280x720.${ext}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
