import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  Sparkles,
  BookOpen,
  FileText,
  Clock,
  Send,
  Trash2,
  Edit,
  Loader2,
  CheckCircle2,
  Layers,
  Calendar,
  RefreshCw,
  Zap,
  Power,
  Activity,
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react';
import {
  AiAutopilotConfig,
  Article,
  ArticleCategory,
  Tutorial,
  TutorialCategory,
  TutorialDifficulty
} from '../../types';
import {
  formatPublishedDateFromIso,
  formatScheduleDateTime,
  getCountdownLabel,
  getDefaultScheduleInputValue,
  isContentPendingSchedule,
  toDateTimeLocalValue
} from '../../utils/publishing';
import {
  generateAiArticleContent,
  generateAiTopics,
  generateAiTutorialContent
} from '../../utils/aiContentGenerator';
import { generateAutoThumbnail } from '../../utils/thumbnailGenerator';

interface AiSchedulePanelProps {
  tutorials: Tutorial[];
  articles: Article[];
  profileName: string;
  nowTick: number;
  aiAutopilot: AiAutopilotConfig;
  isRunningAutopilot: boolean;
  onUpdateAiAutopilot: (updates: Partial<AiAutopilotConfig>) => void;
  onRunAutopilotNow: (force?: boolean) => Promise<{
    success: boolean;
    ran?: boolean;
    type?: 'article' | 'tutorial';
    title?: string;
    message?: string;
    error?: string;
  }>;
  onNotify: (msg: string, isError?: boolean) => void;
  onAddTutorial: (item: Omit<Tutorial, 'id'>) => Tutorial;
  onUpdateTutorial: (id: string, updates: Partial<Tutorial>) => void;
  onDeleteTutorial: (id: string) => void;
  onAddArticle: (item: Omit<Article, 'id'>) => Article;
  onUpdateArticle: (id: string, updates: Partial<Article>) => void;
  onDeleteArticle: (id: string) => void;
  onEditTutorial: (t: Tutorial) => void;
  onEditArticle: (a: Article) => void;
  onPersist: (successMsg: string) => Promise<{ success: boolean; error?: string }>;
}

interface UnifiedScheduledEntry {
  kind: 'article' | 'tutorial';
  id: string;
  title: string;
  summary: string;
  category: string;
  scheduledAt?: string;
  publishedDate: string;
  isAiGenerated?: boolean;
  thumbnail?: string;
  imageAltText?: string;
  article?: Article;
  tutorial?: Tutorial;
}

export const AiSchedulePanel: React.FC<AiSchedulePanelProps> = ({
  tutorials,
  articles,
  profileName,
  nowTick,
  aiAutopilot,
  isRunningAutopilot,
  onUpdateAiAutopilot,
  onRunAutopilotNow,
  onNotify,
  onAddTutorial,
  onUpdateTutorial,
  onDeleteTutorial,
  onAddArticle,
  onUpdateArticle,
  onDeleteArticle,
  onEditTutorial,
  onEditArticle,
  onPersist
}) => {
  // Scheduler Creation Form State
  const [contentType, setContentType] = useState<'article' | 'tutorial'>('article');
  const [scheduleMode, setScheduleMode] = useState<'single' | 'batch'>('single');
  const [singleTopic, setSingleTopic] = useState('');
  const [batchTopics, setBatchTopics] = useState('');
  const [articleCategory, setArticleCategory] = useState<ArticleCategory>('Tren Teknologi');
  const [tutorialCategory, setTutorialCategory] = useState<TutorialCategory>('Pemecahan Masalah Komputer');
  const [tutorialDifficulty, setTutorialDifficulty] = useState<TutorialDifficulty>('Pemula');
  const [scheduleDateTime, setScheduleDateTime] = useState<string>(() => getDefaultScheduleInputValue(24));
  const [batchIntervalHours, setBatchIntervalHours] = useState<number>(24);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [autoGenerateThumbnail, setAutoGenerateThumbnail] = useState(true);

  // Category-specific AI Topic Suggestions
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);

  // Inline reschedule drafts keyed by `${kind}-${id}`
  const [rescheduleDrafts, setRescheduleDrafts] = useState<Record<string, string>>({});
  const [filterKind, setFilterKind] = useState<'all' | 'article' | 'tutorial'>('all');
  const [pendingDeleteItem, setPendingDeleteItem] = useState<UnifiedScheduledEntry | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const activeCategory = contentType === 'article' ? articleCategory : tutorialCategory;

  const handleGenerateCategoryTopics = async () => {
    setIsGeneratingTopics(true);
    try {
      const existingTitles =
        contentType === 'article' ? articles.map((a) => a.title) : tutorials.map((t) => t.title);
      const { topics } = await generateAiTopics({
        type: contentType,
        category: activeCategory,
        difficulty: tutorialDifficulty,
        count: 5,
        excludeTopics: existingTitles
      });
      setSuggestedTopics(topics);
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  const handleApplyTopicToForm = (topic: string) => {
    if (scheduleMode === 'single') {
      setSingleTopic(topic);
      return;
    }
    const existingLines = batchTopics
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (!existingLines.includes(topic)) {
      setBatchTopics([...existingLines, topic].join('\n'));
    }
  };

  const handleFillAllTopicsToBatch = () => {
    if (suggestedTopics.length === 0) return;
    const existingLines = batchTopics
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const merged = Array.from(new Set([...existingLines, ...suggestedTopics]));
    setBatchTopics(merged.join('\n'));
  };

  const pendingQueue = useMemo<UnifiedScheduledEntry[]>(() => {
    const tutItems: UnifiedScheduledEntry[] = tutorials
      .filter((t) => isContentPendingSchedule(t, nowTick))
      .map((t) => ({
        kind: 'tutorial',
        id: t.id,
        title: t.title,
        summary: t.summary,
        category: t.category,
        scheduledAt: t.scheduledAt,
        publishedDate: t.publishedDate,
        isAiGenerated: t.isAiGenerated,
        thumbnail: t.thumbnail,
        imageAltText: t.imageAltText,
        tutorial: t
      }));

    const artItems: UnifiedScheduledEntry[] = articles
      .filter((a) => isContentPendingSchedule(a, nowTick))
      .map((a) => ({
        kind: 'article',
        id: a.id,
        title: a.title,
        summary: a.summary,
        category: a.category,
        scheduledAt: a.scheduledAt,
        publishedDate: a.publishedDate,
        isAiGenerated: a.isAiGenerated,
        thumbnail: a.thumbnail,
        imageAltText: a.imageAltText,
        article: a
      }));

    return [...artItems, ...tutItems]
      .filter((item) => filterKind === 'all' || item.kind === filterKind)
      .sort((a, b) => {
        const tA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity;
        const tB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity;
        return tA - tB;
      });
  }, [tutorials, articles, nowTick, filterKind]);

  const recentAiPublished = useMemo<UnifiedScheduledEntry[]>(() => {
    const tutItems: UnifiedScheduledEntry[] = tutorials
      .filter((t) => t.isAiGenerated && t.publishStatus !== 'archived' && !isContentPendingSchedule(t, nowTick))
      .map((t) => ({
        kind: 'tutorial',
        id: t.id,
        title: t.title,
        summary: t.summary,
        category: t.category,
        scheduledAt: t.scheduledAt,
        publishedDate: t.publishedDate,
        isAiGenerated: t.isAiGenerated,
        thumbnail: t.thumbnail,
        imageAltText: t.imageAltText,
        tutorial: t
      }));

    const artItems: UnifiedScheduledEntry[] = articles
      .filter((a) => a.isAiGenerated && a.publishStatus !== 'archived' && !isContentPendingSchedule(a, nowTick))
      .map((a) => ({
        kind: 'article',
        id: a.id,
        title: a.title,
        summary: a.summary,
        category: a.category,
        scheduledAt: a.scheduledAt,
        publishedDate: a.publishedDate,
        isAiGenerated: a.isAiGenerated,
        thumbnail: a.thumbnail,
        imageAltText: a.imageAltText,
        article: a
      }));

    return [...artItems, ...tutItems].slice(0, 8);
  }, [tutorials, articles, nowTick]);

  const applyPresetOffset = (mode: '1h' | 'tomorrow-morning' | 'tomorrow-evening' | '3d') => {
    const now = new Date();
    let target = new Date(now);
    if (mode === '1h') {
      target = new Date(now.getTime() + 60 * 60 * 1000);
    } else if (mode === 'tomorrow-morning') {
      target.setDate(now.getDate() + 1);
      target.setHours(8, 0, 0, 0);
    } else if (mode === 'tomorrow-evening') {
      target.setDate(now.getDate() + 1);
      target.setHours(19, 0, 0, 0);
    } else if (mode === '3d') {
      target.setDate(now.getDate() + 3);
      target.setHours(9, 0, 0, 0);
    }
    setScheduleDateTime(toDateTimeLocalValue(target));
  };

  const handleGenerateAndSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const topicsList =
      scheduleMode === 'single'
        ? [singleTopic.trim()].filter(Boolean)
        : batchTopics
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);

    if (topicsList.length === 0) {
      onNotify('Silakan isi minimal satu topik konten yang akan dibuat dan dijadwalkan oleh AI.', true);
      return;
    }

    if (!scheduleDateTime) {
      onNotify('Silakan pilih tanggal dan jam jadwal tayang terlebih dahulu.', true);
      return;
    }

    const baseDate = new Date(scheduleDateTime);
    if (Number.isNaN(baseDate.getTime())) {
      onNotify('Format tanggal dan waktu jadwal tidak valid.', true);
      return;
    }

    if (baseDate.getTime() <= Date.now()) {
      onNotify('Pilih waktu jadwal di masa depan agar konten masuk ke antrean jadwal posting.', true);
      return;
    }

    setIsGeneratingSchedule(true);
    try {
      for (let i = 0; i < topicsList.length; i++) {
        const topic = topicsList[i];
        const targetTime = new Date(baseDate.getTime() + i * batchIntervalHours * 60 * 60 * 1000);
        const scheduledIso = targetTime.toISOString();
        const scheduledDisplayDate = formatPublishedDateFromIso(scheduledIso);

        setGenerationProgress(
          `Menyusun konten AI (${i + 1}/${topicsList.length}): "${topic.slice(0, 48)}${topic.length > 48 ? '...' : ''}"`
        );

        if (contentType === 'tutorial') {
          const { tutorial } = await generateAiTutorialContent({
            topic,
            category: tutorialCategory,
            difficulty: tutorialDifficulty,
            authorName: profileName
          });
          let thumbFields: Partial<Tutorial> = {};
          if (autoGenerateThumbnail) {
            setGenerationProgress(
              `Membuat thumbnail 1280×720 AI (${i + 1}/${topicsList.length}) untuk "${tutorial.title.slice(0, 36)}..."`
            );
            try {
              const thumb = await generateAutoThumbnail({
                contentType: 'tutorial',
                title: tutorial.title,
                topic,
                summary: tutorial.summary,
                category: tutorial.category,
                focusKeyword: tutorial.focusKeyword,
                toolsOrObjects: tutorial.toolsNeeded?.join(', '),
                format: 'webp',
                brandName: profileName
              });
              thumbFields = {
                thumbnail: thumb.imageDataUrl,
                imageAltText: thumb.analysis.altText,
                thumbnailHeadline: thumb.headline,
                thumbnailVisualConcept: thumb.analysis.visualConcept
              };
            } catch {
              // Keep default thumbnail on error
            }
          }
          onAddTutorial({
            ...tutorial,
            ...thumbFields,
            publishedDate: scheduledDisplayDate,
            publishStatus: 'scheduled',
            scheduledAt: scheduledIso,
            isAiGenerated: true
          });
        } else {
          const { article } = await generateAiArticleContent({
            topic,
            category: articleCategory,
            authorName: profileName
          });
          let thumbFields: Partial<Article> = {};
          if (autoGenerateThumbnail) {
            setGenerationProgress(
              `Membuat thumbnail 1280×720 AI (${i + 1}/${topicsList.length}) untuk "${article.title.slice(0, 36)}..."`
            );
            try {
              const thumb = await generateAutoThumbnail({
                contentType: 'article',
                title: article.title,
                topic,
                summary: article.summary,
                category: article.category,
                focusKeyword: article.focusKeyword,
                toolsOrObjects: article.tags?.join(', '),
                format: 'webp',
                brandName: profileName
              });
              thumbFields = {
                thumbnail: thumb.imageDataUrl,
                imageAltText: thumb.analysis.altText,
                thumbnailHeadline: thumb.headline,
                thumbnailVisualConcept: thumb.analysis.visualConcept
              };
            } catch {
              // Keep default thumbnail on error
            }
          }
          onAddArticle({
            ...article,
            ...thumbFields,
            publishedDate: scheduledDisplayDate,
            publishStatus: 'scheduled',
            scheduledAt: scheduledIso,
            isAiGenerated: true
          });
        }
      }

      setGenerationProgress('Menyimpan seluruh jadwal posting ke database Supabase...');
      await onPersist(
        `${topicsList.length} ${contentType === 'article' ? 'Artikel' : 'Tutorial'} AI berhasil dibuat & dijadwalkan ke Supabase!`
      );

      if (scheduleMode === 'single') {
        setSingleTopic('');
      } else {
        setBatchTopics('');
      }
    } finally {
      setIsGeneratingSchedule(false);
      setGenerationProgress('');
    }
  };

  const handlePublishNow = async (item: UnifiedScheduledEntry) => {
    const todayFormatted = formatPublishedDateFromIso();
    if (item.kind === 'article') {
      onUpdateArticle(item.id, {
        publishStatus: 'published',
        publishedDate: todayFormatted,
        scheduledAt: undefined
      });
    } else {
      onUpdateTutorial(item.id, {
        publishStatus: 'published',
        publishedDate: todayFormatted,
        scheduledAt: undefined
      });
    }
    await onPersist(`"${item.title}" langsung diterbitkan & disinkronkan ke website live!`);
  };

  const handleReschedule = async (item: UnifiedScheduledEntry) => {
    const key = `${item.kind}-${item.id}`;
    const draftValue = rescheduleDrafts[key];
    if (!draftValue) return;
    const nextDate = new Date(draftValue);
    if (Number.isNaN(nextDate.getTime())) {
      onNotify('Format waktu jadwal tidak valid.', true);
      return;
    }
    if (nextDate.getTime() <= Date.now()) {
      onNotify('Waktu jadwal baru harus di masa depan. Gunakan tombol "Terbitkan Sekarang" jika ingin langsung tayang.', true);
      return;
    }

    const nextIso = nextDate.toISOString();
    const nextPublishedDate = formatPublishedDateFromIso(nextIso);

    if (item.kind === 'article') {
      onUpdateArticle(item.id, {
        publishStatus: 'scheduled',
        scheduledAt: nextIso,
        publishedDate: nextPublishedDate
      });
    } else {
      onUpdateTutorial(item.id, {
        publishStatus: 'scheduled',
        scheduledAt: nextIso,
        publishedDate: nextPublishedDate
      });
    }

    setRescheduleDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    await onPersist(`Jadwal tayang "${item.title}" berhasil diperbarui ke ${formatScheduleDateTime(nextIso)}!`);
  };

  const handleConfirmDeleteScheduled = async () => {
    if (!pendingDeleteItem) return;
    setIsDeletingItem(true);
    try {
      if (pendingDeleteItem.kind === 'article') {
        onDeleteArticle(pendingDeleteItem.id);
      } else {
        onDeleteTutorial(pendingDeleteItem.id);
      }
      await onPersist('Konten terjadwal dihapus dari antrean live (tetap tersimpan di Arsip Database Supabase).');
      setPendingDeleteItem(null);
    } finally {
      setIsDeletingItem(false);
    }
  };

  const articleQueueCount = pendingQueue.filter((i) => i.kind === 'article').length;
  const tutorialQueueCount = pendingQueue.filter((i) => i.kind === 'tutorial').length;

  const handleToggleAutopilot = async () => {
    const nextEnabled = !aiAutopilot.enabled;
    const nextRunAt =
      nextEnabled && !aiAutopilot.nextRunAt
        ? new Date(Date.now() + (aiAutopilot.intervalHours || 24) * 3600_000).toISOString()
        : aiAutopilot.nextRunAt;
    onUpdateAiAutopilot({ enabled: nextEnabled, nextRunAt });
    await onPersist(
      nextEnabled
        ? 'AI Auto-Pilot DIAKTIFKAN dan tersimpan ke Supabase!'
        : 'AI Auto-Pilot dinonaktifkan dan tersimpan ke Supabase.'
    );
  };

  const handleRunAutopilotCycle = async () => {
    const res = await onRunAutopilotNow(true);
    if (res.success && res.ran) {
      onNotify(
        res.message || `Konten "${res.title}" otomatis dibuat dan langsung terbit ke Supabase!`
      );
    } else if (res.success) {
      onNotify(res.message || 'Siklus Auto-Pilot selesai diperiksa.');
    } else {
      onNotify(res.error || 'Gagal menjalankan Auto-Pilot.', true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1 border-b border-stone-200 pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#65a30d] uppercase tracking-wider">
          <CalendarClock className="w-4 h-4" />
          Auto-Pilot &amp; Penjadwalan Publikasi AI
        </div>
        <h1 className="text-2xl font-extrabold text-stone-950 tracking-tight">
          Auto-Pilot &amp; Schedule Posting AI (Generate s/d Posting Otomatis)
        </h1>
        <p className="text-xs text-stone-600 max-w-3xl">
          Aktifkan mode <strong>AI Auto-Pilot</strong> agar sistem secara berkala memilih topik baru sesuai kategori,
          menulis konten lengkap (Artikel/Tutorial), dan langsung menerbitkannya ke Supabase serta website live secara otomatis,
          atau jadwalkan daftar topik batch di bawah ini.
        </p>
      </div>

      {/* FULL AI AUTOPILOT CONTROL CARD */}
      <div className="bg-stone-950 text-white rounded-2xl border border-stone-800 p-6 space-y-5 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#84cc16]">
              <Zap className="w-3.5 h-3.5" />
              <span>AI Auto-Pilot Penuh (Zero-Click Generate &amp; Posting)</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                  aiAutopilot.enabled
                    ? 'bg-[#84cc16] text-stone-950'
                    : 'bg-stone-800 text-stone-400 border border-stone-700'
                }`}
              >
                {aiAutopilot.enabled ? 'AKTIF' : 'NONAKTIF'}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white">
              Mesin Publikasi Otomatis Berkala ke Website &amp; Supabase
            </h2>
            <p className="text-xs text-stone-400 max-w-2xl">
              Ketika aktif, AI memilih topik segar, menyusun konten memakai{' '}
              <strong className="text-stone-200">
                Master Prompt Terbaru (Artikel 12-Format SEO EYD V / Tutorial 18-Format Teknis)
              </strong>
              , melampirkan{' '}
              <strong className="text-[#84cc16]">Thumbnail AI 1280×720 Gratis</strong>, lalu langsung menerbitkannya
              otomatis ke Supabase sesuai interval &amp; Vercel Cron harian.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => void handleToggleAutopilot()}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                aiAutopilot.enabled
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-stone-950'
                  : 'bg-stone-800 hover:bg-stone-700 text-white border border-stone-700'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{aiAutopilot.enabled ? 'Matikan Auto-Pilot' : 'Aktifkan Auto-Pilot'}</span>
            </button>

            <button
              type="button"
              disabled={isRunningAutopilot}
              onClick={() => void handleRunAutopilotCycle()}
              className="px-4 py-2.5 rounded-xl bg-[#84cc16] hover:bg-[#a3e635] disabled:opacity-60 text-stone-950 font-extrabold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              {isRunningAutopilot ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menjalankan Auto-Pilot...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Jalankan 1 Siklus Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Autopilot Settings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-400">Jenis Konten Otomatis</label>
            <select
              value={aiAutopilot.contentType}
              onChange={(e) =>
                onUpdateAiAutopilot({ contentType: e.target.value as 'alternate' | 'article' | 'tutorial' })
              }
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-[#84cc16]"
            >
              <option value="alternate">Bergantian (Artikel &amp; Tutorial)</option>
              <option value="article">Hanya Artikel IT</option>
              <option value="tutorial">Hanya Tutorial IT</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-400">Frekuensi Posting</label>
            <select
              value={aiAutopilot.intervalHours}
              onChange={(e) => onUpdateAiAutopilot({ intervalHours: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-[#84cc16]"
            >
              <option value={6}>Setiap 6 Jam</option>
              <option value={12}>Setiap 12 Jam</option>
              <option value={24}>Setiap 24 Jam (Harian)</option>
              <option value={48}>Setiap 2 Hari</option>
              <option value={72}>Setiap 3 Hari</option>
              <option value={168}>Setiap 1 Minggu</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-400">Kategori Artikel</label>
            <select
              value={aiAutopilot.articleCategory}
              onChange={(e) => onUpdateAiAutopilot({ articleCategory: e.target.value as ArticleCategory })}
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-[#84cc16]"
            >
              <option value="Semua">Semua Kategori (Rotasi Otomatis)</option>
              <option value="Tren Teknologi">Tren Teknologi</option>
              <option value="Perangkat Keras & Gadget">Perangkat Keras &amp; Gadget</option>
              <option value="Keamanan Siber">Keamanan Siber</option>
              <option value="Sistem Operasi & Software">Sistem Operasi &amp; Software</option>
              <option value="Produktivitas IT">Produktivitas IT</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-400">Kategori Tutorial</label>
            <select
              value={aiAutopilot.tutorialCategory}
              onChange={(e) => onUpdateAiAutopilot({ tutorialCategory: e.target.value as TutorialCategory })}
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-[#84cc16]"
            >
              <option value="Semua">Semua Kategori (Rotasi Otomatis)</option>
              <option value="Pemecahan Masalah Komputer">Pemecahan Masalah Komputer</option>
              <option value="Instalasi Windows">Instalasi Windows</option>
              <option value="Perangkat Keras & Peningkatan">Perangkat Keras &amp; Peningkatan</option>
              <option value="Jaringan">Jaringan</option>
              <option value="Perangkat Lunak & Produktivitas">Perangkat Lunak &amp; Produktivitas</option>
              <option value="Tips & Trik IT">Tips &amp; Trik IT</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-400">Level Tutorial</label>
            <select
              value={aiAutopilot.tutorialDifficulty}
              onChange={(e) =>
                onUpdateAiAutopilot({ tutorialDifficulty: e.target.value as TutorialDifficulty })
              }
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-[#84cc16]"
            >
              <option value="Pemula">Pemula</option>
              <option value="Menengah">Menengah</option>
              <option value="Lanjutan">Lanjutan</option>
            </select>
          </div>
        </div>

        {/* Live Telemetry & Last History */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-stone-800 text-xs">
          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-0.5">
            <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
              Total Auto-Posting AI
            </div>
            <div className="text-lg font-extrabold text-[#84cc16] tabular-nums">
              {aiAutopilot.totalAutoPosted || 0} Konten
            </div>
            {aiAutopilot.lastPostedTitle && (
              <div className="text-[11px] text-stone-400 truncate">
                Terakhir: {aiAutopilot.lastPostedTitle}
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-0.5">
            <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
              Eksekusi Terakhir
            </div>
            <div className="text-sm font-bold text-white">
              {aiAutopilot.lastRunAt ? formatScheduleDateTime(aiAutopilot.lastRunAt) : 'Belum pernah berjalan'}
            </div>
            <div className="text-[11px] text-stone-400">
              Mode berikutnya:{' '}
              <span className="text-stone-200 font-semibold">
                {aiAutopilot.contentType === 'alternate'
                  ? aiAutopilot.lastCreatedType === 'article'
                    ? 'Tutorial IT'
                    : 'Artikel IT'
                  : aiAutopilot.contentType === 'article'
                  ? 'Artikel IT'
                  : 'Tutorial IT'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-0.5">
            <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
              Jadwal Siklus Berikutnya
            </div>
            <div className="text-sm font-bold text-white">
              {aiAutopilot.enabled && aiAutopilot.nextRunAt
                ? getCountdownLabel(aiAutopilot.nextRunAt, nowTick)
                : 'Menunggu aktivasi'}
            </div>
            <div className="text-[11px] text-stone-400">
              {aiAutopilot.enabled && aiAutopilot.nextRunAt
                ? formatScheduleDateTime(aiAutopilot.nextRunAt)
                : 'Vercel Cron harian (/api/ai/autopilot) siap aktif'}
            </div>
          </div>
        </div>

        {/* Recent Autopilot Log */}
        {Array.isArray(aiAutopilot.history) && aiAutopilot.history.length > 0 && (
          <div className="pt-2 border-t border-stone-800 space-y-2">
            <div className="text-[11px] font-bold text-stone-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#84cc16]" />
              <span>Riwayat Publikasi Auto-Pilot Terbaru (Master Prompt + Thumbnail 1280×720)</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {aiAutopilot.history.slice(0, 4).map((entry) => {
                const matchedItem =
                  entry.type === 'article'
                    ? articles.find((a) => a.title === entry.title)
                    : tutorials.find((t) => t.title === entry.title);
                const previewThumb = matchedItem?.thumbnail;

                return (
                  <div
                    key={entry.id}
                    className="p-2.5 rounded-lg bg-stone-900/90 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {previewThumb && (
                        <div className="w-16 aspect-video rounded overflow-hidden border border-stone-700 shrink-0 bg-stone-950">
                          <img
                            src={previewThumb}
                            alt={matchedItem?.imageAltText || entry.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-[#84cc16]/20 text-[#84cc16] font-bold uppercase shrink-0">
                            {entry.type === 'article' ? 'Artikel' : 'Tutorial'}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-mono text-[10px] shrink-0">
                            {entry.source === 'gemini-ai' ? 'Gemini Master Prompt' : 'Smart Master Prompt'}
                          </span>
                          {(entry.hasThumbnail || previewThumb) && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/70 text-[10px] font-semibold shrink-0">
                              Thumb 1280×720
                            </span>
                          )}
                        </div>
                        <div className="text-stone-200 font-medium truncate">{entry.title}</div>
                      </div>
                    </div>
                    <span className="text-stone-400 font-mono shrink-0">
                      {entry.category} · {formatScheduleDateTime(entry.ranAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase">Total Antrean Terjadwal</span>
            <div className="text-2xl font-extrabold text-stone-950 tabular-nums mt-0.5">
              {pendingQueue.length}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <CalendarClock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase">Artikel AI Menunggu</span>
            <div className="text-2xl font-extrabold text-stone-950 tabular-nums mt-0.5">
              {articleQueueCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase">Tutorial AI Menunggu</span>
            <div className="text-2xl font-extrabold text-stone-950 tabular-nums mt-0.5">
              {tutorialQueueCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-lime-50 text-[#4d7c0f] border border-lime-200">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Form: Auto-Generate AI + Schedule Posting */}
      <form
        onSubmit={handleGenerateAndSchedule}
        className="bg-white p-6 rounded-xl border border-stone-200 space-y-5 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#65a30d]" />
              <span>Buat & Jadwalkan Konten AI Baru</span>
            </h2>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Pilih jenis konten (Artikel atau Tutorial), atur mode tunggal atau batch, lalu tentukan waktu tayang.
            </p>
          </div>

          {/* Mode Toggle: Single vs Batch */}
          <div className="inline-flex p-1 bg-stone-100 rounded-lg border border-stone-200 text-xs self-start">
            <button
              type="button"
              onClick={() => setScheduleMode('single')}
              className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-colors ${
                scheduleMode === 'single' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              1 Topik (Tunggal)
            </button>
            <button
              type="button"
              onClick={() => setScheduleMode('batch')}
              className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                scheduleMode === 'batch' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Batch Multi-Topik</span>
            </button>
          </div>
        </div>

        {/* Step 1: Content Type & Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800">Jenis Konten AI</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setContentType('article');
                  setSuggestedTopics([]);
                }}
                className={`px-3 py-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  contentType === 'article'
                    ? 'bg-stone-950 text-white border-stone-950'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#84cc16]" />
                <span>Artikel IT</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setContentType('tutorial');
                  setSuggestedTopics([]);
                }}
                className={`px-3 py-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  contentType === 'tutorial'
                    ? 'bg-stone-950 text-white border-stone-950'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#84cc16]" />
                <span>Tutorial IT</span>
              </button>
            </div>
          </div>

          {contentType === 'article' ? (
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-stone-800">Kategori Artikel</label>
              <select
                value={articleCategory}
                onChange={(e) => {
                  setArticleCategory(e.target.value as ArticleCategory);
                  setSuggestedTopics([]);
                }}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#84cc16]"
              >
                <option value="Tren Teknologi">Tren Teknologi</option>
                <option value="Perangkat Keras & Gadget">Perangkat Keras & Gadget</option>
                <option value="Keamanan Siber">Keamanan Siber</option>
                <option value="Sistem Operasi & Software">Sistem Operasi & Software</option>
                <option value="Produktivitas IT">Produktivitas IT</option>
              </select>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800">Kategori Tutorial</label>
                <select
                  value={tutorialCategory}
                  onChange={(e) => {
                    setTutorialCategory(e.target.value as TutorialCategory);
                    setSuggestedTopics([]);
                  }}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#84cc16]"
                >
                  <option value="Pemecahan Masalah Komputer">Pemecahan Masalah Komputer</option>
                  <option value="Instalasi Windows">Instalasi Windows</option>
                  <option value="Perangkat Keras & Peningkatan">Perangkat Keras & Peningkatan</option>
                  <option value="Jaringan">Jaringan</option>
                  <option value="Perangkat Lunak & Produktivitas">Perangkat Lunak & Produktivitas</option>
                  <option value="Tips & Trik IT">Tips & Trik IT</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800">Tingkat Kesulitan</label>
                <select
                  value={tutorialDifficulty}
                  onChange={(e) => setTutorialDifficulty(e.target.value as TutorialDifficulty)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#84cc16]"
                >
                  <option value="Pemula">Pemula</option>
                  <option value="Menengah">Menengah</option>
                  <option value="Lanjutan">Lanjutan</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Step 1.5: AI Category-Aware Topic Generator */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#65a30d]" />
                <span>
                  Ide Topik {contentType === 'article' ? 'Artikel' : 'Tutorial'} AI Sesuai Kategori ({activeCategory})
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                {scheduleMode === 'single'
                  ? 'Generate 5 ide topik spesifik kategori ini lalu klik salah satu untuk mengisi kolom topik.'
                  : 'Generate 5 ide topik kategori ini lalu masukkan sekaligus ke daftar Batch Multi-Topik.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {scheduleMode === 'batch' && suggestedTopics.length > 0 && (
                <button
                  type="button"
                  onClick={handleFillAllTopicsToBatch}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg text-[11px] cursor-pointer"
                >
                  Masukkan Semua ke Batch
                </button>
              )}
              <button
                type="button"
                disabled={isGeneratingTopics}
                onClick={() => void handleGenerateCategoryTopics()}
                className="px-3.5 py-1.5 bg-[#84cc16] hover:bg-[#a3e635] disabled:opacity-60 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {isGeneratingTopics ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyusun Topik...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>
                      {suggestedTopics.length > 0 ? 'Generate Topik Lainnya' : 'Generate Topik Sesuai Kategori'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {suggestedTopics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-200">
              {suggestedTopics.map((topicItem, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTopicToForm(topicItem)}
                  className="text-left text-xs px-3 py-1.5 bg-white hover:bg-lime-50 hover:border-[#84cc16] text-stone-800 rounded-lg border border-stone-200 transition-colors cursor-pointer"
                >
                  {scheduleMode === 'batch' ? '+ ' : ''}
                  {topicItem}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Topic(s) Input */}
        {scheduleMode === 'single' ? (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800">
              Topik {contentType === 'article' ? 'Artikel' : 'Tutorial'} yang Akan Dibuat AI *
            </label>
            <input
              type="text"
              value={singleTopic}
              onChange={(e) => setSingleTopic(e.target.value)}
              placeholder={
                contentType === 'article'
                  ? 'Contoh: Strategi Backup Otomatis Cloud untuk Usaha Kecil Menengah'
                  : 'Contoh: Cara Memperbaiki Wi-Fi Limited Access di Windows 11'
              }
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
              <span>Daftar Topik (1 Topik per Baris) *</span>
              <span className="text-[11px] font-normal text-stone-500">
                AI akan men-generate & menjadwalkan setiap baris secara berurutan
              </span>
            </label>
            <textarea
              rows={4}
              value={batchTopics}
              onChange={(e) => setBatchTopics(e.target.value)}
              placeholder={
                contentType === 'article'
                  ? 'Perbandingan SSD NVMe Gen4 vs Gen5 untuk Produktivitas\nTips Mengamankan Akun Email Bisnis dari Phishing\nTren Otomasi AI untuk Manajemen Inventaris UMKM'
                  : 'Cara Reset Pengaturan Jaringan Windows via CMD\nPanduan Membersihkan Cache Update Windows agar SSD Lega\nCara Cek Kesehatan Baterai Laptop Windows Tanpa Aplikasi'
              }
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
            />
          </div>
        )}

        {/* Step 3: Schedule Date/Time & Interval */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#65a30d]" />
              <span>
                {scheduleMode === 'single'
                  ? 'Tanggal & Jam Tayang Otomatis *'
                  : 'Jadwal Tayang Konten Pertama *'}
              </span>
            </label>
            <input
              type="datetime-local"
              value={scheduleDateTime}
              onChange={(e) => setScheduleDateTime(e.target.value)}
              required
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
            />
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPresetOffset('1h')}
                className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
              >
                +1 Jam Lagi
              </button>
              <button
                type="button"
                onClick={() => applyPresetOffset('tomorrow-morning')}
                className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
              >
                Besok 08:00
              </button>
              <button
                type="button"
                onClick={() => applyPresetOffset('tomorrow-evening')}
                className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
              >
                Besok 19:00
              </button>
              <button
                type="button"
                onClick={() => applyPresetOffset('3d')}
                className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
              >
                3 Hari Lagi
              </button>
            </div>
          </div>

          {scheduleMode === 'batch' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#65a30d]" />
                <span>Interval Publikasi Antar Topik</span>
              </label>
              <select
                value={batchIntervalHours}
                onChange={(e) => setBatchIntervalHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#84cc16]"
              >
                <option value={6}>Setiap 6 Jam</option>
                <option value={12}>Setiap 12 Jam</option>
                <option value={24}>Setiap 1 Hari (24 Jam)</option>
                <option value={48}>Setiap 2 Hari</option>
                <option value={72}>Setiap 3 Hari</option>
                <option value={168}>Setiap 1 Minggu</option>
              </select>
              <p className="text-[11px] text-stone-500">
                Topik baris ke-1 tayang pada waktu mulai, baris berikutnya bertambah sesuai interval di atas.
              </p>
            </div>
          )}
        </div>

        {/* Step 3.5: Master Prompt + AI Automatic Thumbnail Generator Toggle */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start sm:items-center gap-2.5 text-xs text-stone-800">
            <ImageIcon className="w-4 h-4 text-[#65a30d] shrink-0 mt-0.5 sm:mt-0" />
            <div className="space-y-0.5">
              <div className="font-bold text-stone-950">
                Master Prompt Terbaru + AI Automatic Thumbnail Generator (1280×720 Gratis)
              </div>
              <p className="text-[11px] text-stone-600">
                Setiap konten terjadwal memakai Master Prompt Artikel (12-format SEO) / Tutorial (18-format teknis) &amp;
                otomatis dibuatkan thumbnail WebP 1280×720 relevan.
              </p>
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-bold text-stone-900 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={autoGenerateThumbnail}
              onChange={(e) => setAutoGenerateThumbnail(e.target.checked)}
              className="rounded border-stone-300 text-stone-900 focus:ring-[#84cc16]"
            />
            <span>{autoGenerateThumbnail ? 'Auto-Thumbnail 1280×720: AKTIF' : 'Tanpa Auto-Thumbnail'}</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isGeneratingSchedule}
          className="w-full py-3 bg-stone-950 hover:bg-stone-800 disabled:bg-stone-400 text-white font-bold rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          {isGeneratingSchedule ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#84cc16]" />
              <span>{generationProgress || 'Memproses Jadwal AI...'}</span>
            </>
          ) : (
            <>
              <CalendarClock className="w-4 h-4 text-[#84cc16]" />
              <span>
                {scheduleMode === 'single'
                  ? `Generate ${contentType === 'article' ? 'Artikel' : 'Tutorial'} AI & Jadwalkan Posting`
                  : `Generate Batch ${contentType === 'article' ? 'Artikel' : 'Tutorial'} & Jadwalkan Semua`}
              </span>
            </>
          )}
        </button>
      </form>

      {/* Scheduled Queue List */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-stone-900">
              Antrean Jadwal Posting ({pendingQueue.length})
            </h2>
            <p className="text-[11px] text-stone-500">
              Konten di bawah otomatis tayang di website publik saat waktu jadwalnya tercapai.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterKind('all')}
              className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                filterKind === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilterKind('article')}
              className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                filterKind === 'article' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              Artikel
            </button>
            <button
              type="button"
              onClick={() => setFilterKind('tutorial')}
              className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                filterKind === 'tutorial' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              Tutorial
            </button>
          </div>
        </div>

        {pendingQueue.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <CalendarClock className="w-8 h-8 text-stone-300 mx-auto" />
            <div className="text-sm font-bold text-stone-800">Belum Ada Antrean Jadwal Posting</div>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Buat konten baru melalui formulir di atas atau klik tombol &quot;Jadwalkan Posting&quot; setelah men-generate
              di tab Generator Tutorial AI / Generator Artikel AI.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-200">
            {pendingQueue.map((item) => {
              const key = `${item.kind}-${item.id}`;
              const draftVal =
                rescheduleDrafts[key] ?? (item.scheduledAt ? toDateTimeLocalValue(item.scheduledAt) : '');
              const hasChangedTime =
                item.scheduledAt &&
                draftVal &&
                draftVal !== toDateTimeLocalValue(item.scheduledAt);

              return (
                <div key={key} className="p-4 sm:p-5 space-y-3 hover:bg-stone-50/70 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start gap-3.5 flex-1">
                      {item.thumbnail && (
                        <div className="w-full sm:w-36 aspect-video rounded-lg overflow-hidden border border-stone-200 bg-stone-900 shrink-0">
                          <img
                            src={item.thumbnail}
                            alt={item.imageAltText || item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span
                            className={`px-2 py-0.5 rounded font-bold uppercase ${
                              item.kind === 'article'
                                ? 'bg-stone-900 text-white'
                                : 'bg-[#84cc16] text-stone-950'
                            }`}
                          >
                            {item.kind === 'article' ? 'Artikel AI' : 'Tutorial AI'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                            {item.category}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                            <Clock className="w-3 h-3" />
                            <span>{getCountdownLabel(item.scheduledAt, nowTick)}</span>
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-stone-900">{item.title}</h3>
                        <p className="text-xs text-stone-600 line-clamp-2">{item.summary}</p>
                        <div className="text-[11px] font-mono text-stone-500">
                          Jadwal Tayang: <strong className="text-stone-800">{formatScheduleDateTime(item.scheduledAt)}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="datetime-local"
                          value={draftVal}
                          onChange={(e) =>
                            setRescheduleDrafts((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-[11px] font-mono text-stone-900"
                        />
                        {hasChangedTime && (
                          <button
                            type="button"
                            onClick={() => void handleReschedule(item)}
                            className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3 text-[#84cc16]" />
                            <span>Simpan</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => void handlePublishNow(item)}
                          className="px-3 py-1.5 bg-[#84cc16] hover:bg-[#a3e635] text-stone-950 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Terbitkan Sekarang</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (item.kind === 'article' && item.article) onEditArticle(item.article);
                            if (item.kind === 'tutorial' && item.tutorial) onEditTutorial(item.tutorial);
                          }}
                          className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer"
                          title="Edit Isi Konten"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setPendingDeleteItem(item)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                          title="Hapus dari Antrean & Website Live"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Auto-Published AI History */}
      {recentAiPublished.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Konten AI Sudah Tayang ({recentAiPublished.length})</span>
            </h3>
          </div>
          <div className="divide-y divide-stone-100">
            {recentAiPublished.map((item) => (
              <div
                key={`pub-${item.kind}-${item.id}`}
                className="px-4 py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Tayang
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">
                      {item.kind === 'article' ? 'Artikel' : 'Tutorial'} · {item.category}
                    </span>
                  </div>
                  <div className="font-semibold text-stone-900 truncate mt-0.5">{item.title}</div>
                </div>
                <span className="text-[11px] font-mono text-stone-500 shrink-0">{item.publishedDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Scheduled Content Delete */}
      {pendingDeleteItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs"
          onClick={() => !isDeletingItem && setPendingDeleteItem(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-stone-900">Hapus dari Antrean & Website Live?</h3>
                <p className="text-xs text-stone-500">
                  Konten diarsipkan di database Supabase dan tidak akan tayang ke website live.
                </p>
              </div>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
              <div className="font-bold text-stone-900">{pendingDeleteItem.title}</div>
              <div className="text-stone-500">{pendingDeleteItem.category}</div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={isDeletingItem}
                onClick={() => setPendingDeleteItem(null)}
                className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeletingItem}
                onClick={() => void handleConfirmDeleteScheduled()}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                {isDeletingItem ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Ya, Hapus dari Antrean</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
