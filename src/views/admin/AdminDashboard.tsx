import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layout,
  BookOpen,
  FileText,
  User,
  Wrench,
  Database,
  LogOut,
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Layers,
  Star,
  Terminal,
  Clock,
  Check,
  Loader2,
  HelpCircle,
  Copy,
  ChevronRight,
  Briefcase,
  Palette,
  Image as ImageIcon,
  MessageSquare,
  Phone,
  Globe,
  Sliders,
  Award,
  CalendarDays,
  FileCheck2,
  ShieldCheck,
  KeyRound,
  UserPlus,
  Users,
  CalendarClock,
  Zap,
  Archive,
  RotateCcw
} from 'lucide-react';
import { useAppData } from '../../context/DataContext';
import {
  Project,
  Tutorial,
  Article,
  ServiceItem,
  UserProfile,
  ValueItem,
  TimelineItem,
  TutorialCategory,
  TutorialDifficulty,
  ArticleCategory,
  AdminUser,
  AdminRole,
  SocialMediaItem,
  GeneratedThumbnailResult,
  ThumbnailOutputFormat
} from '../../types';
import { ProjectModal } from './ProjectModal';
import { TutorialModal } from './TutorialModal';
import { ArticleModal } from './ArticleModal';
import { ServiceModal } from './ServiceModal';
import { AdminUserModal } from './AdminUserModal';
import { AiSchedulePanel } from './AiSchedulePanel';
import { ImageUploader } from '../../components/ImageUploader';
import { AiThumbnailGeneratorPanel } from '../../components/AiThumbnailGeneratorPanel';
import {
  formatPublishedDateFromIso,
  formatScheduleDateTime,
  getDefaultScheduleInputValue,
  isContentArchived,
  isContentPendingSchedule
} from '../../utils/publishing';
import {
  generateAiArticleContent,
  generateAiTopics,
  generateAiTutorialContent
} from '../../utils/aiContentGenerator';
import { generateAutoThumbnail } from '../../utils/thumbnailGenerator';

interface AdminDashboardProps {
  onBackToSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToSite }) => {
  const {
    projects,
    services,
    tutorials,
    articles,
    profile,
    logout,
    adminUsers,
    currentAdmin,
    addAdminUser,
    updateAdminUser,
    deleteAdminUser,
    addProject,
    updateProject,
    deleteProject,
    addService,
    updateService,
    deleteService,
    addTutorial,
    updateTutorial,
    deleteTutorial,
    restoreTutorial,
    addArticle,
    updateArticle,
    deleteArticle,
    restoreArticle,
    updateProfile,
    addSkillGroup,
    deleteSkillGroup,
    addTool,
    deleteTool,
    resetAllData,
    exportDataJSON,
    importDataJSON,
    syncStatus,
    lastSavedAt,
    syncErrorMessage,
    saveToDatabase,
    refreshFromDatabase,
    nowTick,
    aiAutopilot,
    isRunningAutopilot,
    updateAiAutopilot,
    runAutopilotNow
  } = useAppData();

  const pendingScheduleCount =
    tutorials.filter((t) => isContentPendingSchedule(t, nowTick)).length +
    articles.filter((a) => isContentPendingSchedule(a, nowTick)).length;

  const [isDbGuideOpen, setIsDbGuideOpen] = useState(false);
  const [dbDiagStatus, setDbDiagStatus] = useState<any>(null);
  const [isTestingDiag, setIsTestingDiag] = useState(false);
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleTestDatabaseConnection = async () => {
    setIsTestingDiag(true);
    try {
      const res = await fetch(`/api/status?t=${Date.now()}`);
      const data = await res.json();
      setDbDiagStatus(data);
    } catch (err: any) {
      setDbDiagStatus({ success: false, error: err?.message || 'Gagal menghubungi server' });
    } finally {
      setIsTestingDiag(false);
    }
  };

  const handleManualSaveToCloud = async () => {
    setIsManualSaving(true);
    const result = await saveToDatabase();
    setIsManualSaving(false);
    if (result.success) {
      showToast('Seluruh perubahan berhasil disimpan secara permanen ke database Supabase!');
    } else {
      showToast(`Gagal menyimpan ke Supabase: ${result.error || 'Periksa koneksi database'}`, true);
    }
  };

  const persistWithToast = async (successMsg: string) => {
    const result = await saveToDatabase();
    if (result.success) {
      showToast(successMsg);
    } else {
      showToast(`Tersimpan lokal saja — gagal ke Supabase: ${result.error || 'Cek Status Cloud'}`, true);
    }
    return result;
  };

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'ai-tutorial'
    | 'ai-article'
    | 'ai-schedule'
    | 'projects'
    | 'services'
    | 'tutorials'
    | 'articles'
    | 'profile'
    | 'skills'
    | 'admins'
    | 'backup'
  >('overview');

  // Modals state
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const [tutorialModalOpen, setTutorialModalOpen] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);

  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Admin User modal & action states
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [selectedAdminToEdit, setSelectedAdminToEdit] = useState<AdminUser | null>(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [deleteConfirmAdmin, setDeleteConfirmAdmin] = useState<AdminUser | null>(null);

  // Search queries inside admin tables
  const [projectSearch, setProjectSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [tutorialSearch, setTutorialSearch] = useState('');
  const [articleSearch, setArticleSearch] = useState('');
  const [designSearch, setDesignSearch] = useState('');
  const [tutorialViewMode, setTutorialViewMode] = useState<'live' | 'archived'>('live');
  const [articleViewMode, setArticleViewMode] = useState<'live' | 'archived'>('live');
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<
    | { kind: 'tutorial'; item: Tutorial }
    | { kind: 'article'; item: Article }
    | { kind: 'project'; item: Project }
    | { kind: 'service'; item: ServiceItem }
    | { kind: 'skill'; index: number; label: string }
    | { kind: 'reset' }
    | null
  >(null);
  const [isExecutingDelete, setIsExecutingDelete] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIsError, setToastIsError] = useState(false);

  const showToast = (msg: string, isError = false) => {
    setToastMessage(msg);
    setToastIsError(isError);
    setTimeout(() => setToastMessage(null), isError ? 6000 : 3500);
  };

  // =========================================================================
  // AI GENERATOR: TUTORIAL IT SUPPORT
  // =========================================================================
  const [aiTutTopic, setAiTutTopic] = useState('');
  const [aiTutCategory, setAiTutCategory] = useState<TutorialCategory>('Pemecahan Masalah Komputer');
  const [aiTutDifficulty, setAiTutDifficulty] = useState<TutorialDifficulty>('Pemula');
  const [aiTutLoading, setAiTutLoading] = useState(false);
  const [aiTutStatusText, setAiTutStatusText] = useState('');
  const [aiTutResult, setAiTutResult] = useState<Omit<Tutorial, 'id'> | null>(null);
  const [aiTutScheduleAt, setAiTutScheduleAt] = useState<string>(() => getDefaultScheduleInputValue(24));
  const [aiTutSuggestedTopics, setAiTutSuggestedTopics] = useState<string[]>([]);
  const [aiTutTopicsLoading, setAiTutTopicsLoading] = useState(false);
  const [aiTutAutoPublish, setAiTutAutoPublish] = useState(true);
  const [aiTutPublishedNotice, setAiTutPublishedNotice] = useState<string | null>(null);
  const [aiTutShowAdvanced, setAiTutShowAdvanced] = useState(false);
  const [aiTutCustomTitle, setAiTutCustomTitle] = useState('');
  const [aiTutAudience, setAiTutAudience] = useState('Pemula (Mudah diikuti tanpa keahlian sebelumnya)');
  const [aiTutGoal, setAiTutGoal] = useState('Panduan Teknis, Konfigurasi & Troubleshooting');
  const [aiTutDevice, setAiTutDevice] = useState('Komputer / Laptop');
  const [aiTutOs, setAiTutOs] = useState('Windows 10 / Windows 11');
  const [aiTutSoftware, setAiTutSoftware] = useState('Command Prompt / PowerShell, Device Manager');
  const [aiTutSoftwareVersion, setAiTutSoftwareVersion] = useState('');
  const [aiTutLength, setAiTutLength] = useState('Lengkap & Mendalam sesuai kebutuhan');
  const [aiTutThumbAuto, setAiTutThumbAuto] = useState(true);
  const [aiTutThumbResult, setAiTutThumbResult] = useState<GeneratedThumbnailResult | null>(null);
  const [aiTutThumbLoading, setAiTutThumbLoading] = useState(false);
  const [aiTutThumbError, setAiTutThumbError] = useState<string | null>(null);
  const [aiTutThumbShowHeadline, setAiTutThumbShowHeadline] = useState(true);
  const [aiTutThumbFormat, setAiTutThumbFormat] = useState<ThumbnailOutputFormat>('webp');
  const [aiTutThumbSeed, setAiTutThumbSeed] = useState(1);

  const handleGenerateTutorialThumbnail = async (
    targetTut: Omit<Tutorial, 'id'>,
    opts?: {
      regenerate?: boolean;
      headlineOverride?: string;
      showHeadlineOverlay?: boolean;
      format?: ThumbnailOutputFormat;
    }
  ): Promise<Omit<Tutorial, 'id'>> => {
    const nextSeed = opts?.regenerate ? aiTutThumbSeed + 1 : aiTutThumbSeed;
    if (opts?.regenerate) setAiTutThumbSeed(nextSeed);

    const fmt = opts?.format || aiTutThumbFormat;
    const showOverlay =
      opts?.showHeadlineOverlay !== undefined ? opts.showHeadlineOverlay : aiTutThumbShowHeadline;

    setAiTutThumbLoading(true);
    setAiTutThumbError(null);
    try {
      const thumbRes = await generateAutoThumbnail({
        contentType: 'tutorial',
        title: targetTut.title,
        topic: aiTutTopic || targetTut.title,
        summary: targetTut.summary,
        category: targetTut.category,
        focusKeyword: targetTut.focusKeyword,
        targetAudience: aiTutAudience,
        toolsOrObjects: targetTut.toolsNeeded?.join(', '),
        headlineOverride: opts?.headlineOverride,
        showHeadlineOverlay: showOverlay,
        format: fmt,
        variationSeed: nextSeed,
        brandName: profile.name || 'Risa Kurniawan'
      });
      setAiTutThumbResult(thumbRes);
      const updatedTut: Omit<Tutorial, 'id'> = {
        ...targetTut,
        thumbnail: thumbRes.imageDataUrl,
        imageAltText: thumbRes.analysis.altText || targetTut.imageAltText,
        thumbnailHeadline: thumbRes.headline,
        thumbnailVisualConcept: thumbRes.analysis.visualConcept
      };
      setAiTutResult(updatedTut);
      return updatedTut;
    } catch (err: any) {
      setAiTutThumbError(`Fallback thumbnail digunakan: ${err?.message || 'Koneksi terganggu'}`);
      return targetTut;
    } finally {
      setAiTutThumbLoading(false);
    }
  };

  const handleGenerateTutorialTopics = async (categoryOverride?: TutorialCategory) => {
    const targetCategory = categoryOverride || aiTutCategory;
    setAiTutTopicsLoading(true);
    try {
      const { topics } = await generateAiTopics({
        type: 'tutorial',
        category: targetCategory,
        difficulty: aiTutDifficulty,
        count: 5,
        excludeTopics: tutorials.map((t) => t.title)
      });
      setAiTutSuggestedTopics(topics);
      showToast(`5 ide topik tutorial untuk kategori "${targetCategory}" berhasil disusun AI!`);
    } finally {
      setAiTutTopicsLoading(false);
    }
  };

  const tutorialPresets = [
    'Cara Mengatasi Blue Screen (BSOD) SYSTEM_THREAD_EXCEPTION_NOT_HANDLED di Windows 11',
    'Panduan Lengkap Setting MikroTik Router untuk Hotspot Kantor & Manajemen Bandwidth',
    'Langkah Mengganti Thermal Paste Laptop yang Overheat & Membersihkan Fan Pendingin',
    'Cara Memperbaiki Flashdisk RAW yang Tidak Bisa Dibuka Tanpa Kehilangan Data',
    'Konfigurasi Port Forwarding & Firewall Windows Server untuk Remote Desktop (RDP)'
  ];

  const handleGenerateAiTutorial = async (topicToUse?: string, forceAutoPublish?: boolean) => {
    const shouldAutoPublish = forceAutoPublish !== undefined ? forceAutoPublish : aiTutAutoPublish;
    let targetTopic = (topicToUse || aiTutTopic).trim();

    if (!targetTopic && !shouldAutoPublish) {
      showToast('Silakan tuliskan topik tutorial IT terlebih dahulu, atau aktifkan Auto-Publish.', true);
      return;
    }

    setAiTutPublishedNotice(null);
    setAiTutLoading(true);
    setAiTutStatusText(
      !targetTopic
        ? `Memilih topik tutorial segar untuk kategori "${aiTutCategory}"...`
        : 'Menjalankan Master Prompt Technical Documentation Specialist...'
    );

    try {
      if (!targetTopic) {
        const { topics } = await generateAiTopics({
          type: 'tutorial',
          category: aiTutCategory,
          difficulty: aiTutDifficulty,
          count: 1,
          excludeTopics: tutorials.map((t) => t.title)
        });
        targetTopic = topics[0] || `Panduan Praktis ${aiTutCategory} (${aiTutDifficulty})`;
        setAiTutTopic(targetTopic);
      }

      setAiTutStatusText('Menyusun 18 komponen dokumentasi teknis (EYD V, Prasyarat, Langkah, Verifikasi & Troubleshooting)...');

      const { tutorial: generatedTut } = await generateAiTutorialContent({
        topic: targetTopic,
        category: aiTutCategory,
        difficulty: aiTutDifficulty,
        authorName: profile.name || 'Risa Kurniawan',
        customTitle: aiTutCustomTitle.trim() || undefined,
        targetAudience: aiTutAudience,
        tutorialGoal: aiTutGoal,
        deviceType: aiTutDevice,
        operatingSystem: aiTutOs,
        softwareTools: aiTutSoftware.trim() || undefined,
        softwareVersion: aiTutSoftwareVersion.trim() || undefined,
        lengthPreference: aiTutLength
      });

      let finalTutorial = generatedTut;
      setAiTutResult(finalTutorial);

      if (aiTutThumbAuto && finalTutorial) {
        setAiTutStatusText('Menghasilkan thumbnail visual AI 1280×720 otomatis sesuai isi tutorial...');
        finalTutorial = await handleGenerateTutorialThumbnail(finalTutorial);
      }

      if (shouldAutoPublish && finalTutorial) {
        setAiTutStatusText('Menyimpan & menerbitkan langsung ke Supabase & website live...');
        const created = addTutorial({
          ...finalTutorial,
          publishStatus: 'published',
          scheduledAt: undefined,
          isAiGenerated: true
        });
        setAiTutTopic('');
        setAiTutPublishedNotice(created.title);
        await persistWithToast(
          `Otomatis selesai! Tutorial "${created.title}" + Thumbnail AI berhasil dibuat dan langsung tayang live!`
        );
      } else {
        showToast('Tutorial teknis lengkap & thumbnail otomatis AI berhasil disusun!');
      }
    } finally {
      setAiTutLoading(false);
      setAiTutStatusText('');
    }
  };

  const handleCopyFullTutorialPackage = () => {
    if (!aiTutResult) return;
    const lines: string[] = [
      `1. Judul Tutorial & SEO Title: ${aiTutResult.seoTitle || aiTutResult.title}`,
      `2. Meta Description: ${aiTutResult.metaDescription || aiTutResult.summary}`,
      `3. Focus Keyword: ${aiTutResult.focusKeyword || aiTutResult.title}`,
      `4. Supporting Keywords: ${(aiTutResult.supportingKeywords || []).join(', ')}`,
      `5. URL Slug: /tutorial/${aiTutResult.slug}`,
      '',
      '6. Pendahuluan:',
      aiTutResult.introduction || aiTutResult.summary,
      '',
      '7. Tujuan Tutorial:',
      ...(aiTutResult.objectives || []).map((o, i) => `${i + 1}. ${o}`),
      '',
      '8. Persyaratan & Persiapan:',
      'Wajib:',
      ...aiTutResult.prerequisites.map((p) => `- ${p}`),
      ...(aiTutResult.optionalPrerequisites && aiTutResult.optionalPrerequisites.length > 0
        ? ['Opsional:', ...aiTutResult.optionalPrerequisites.map((p) => `- ${p}`)]
        : []),
      ...(aiTutResult.systemRequirements
        ? [
            `Hardware: ${aiTutResult.systemRequirements.hardware || '-'}`,
            `OS: ${aiTutResult.systemRequirements.os || '-'}`,
            `Software: ${aiTutResult.systemRequirements.software || '-'}`,
            `Akses: ${aiTutResult.systemRequirements.access || '-'}`
          ]
        : []),
      '',
      '9. Gambaran Proses:',
      aiTutResult.processOverview || '-',
      '',
      '10. Langkah-Langkah Tutorial:',
      ...aiTutResult.steps.flatMap((st) => [
        `Langkah ${st.stepNumber}: ${st.title}`,
        st.objective ? `Tujuan: ${st.objective}` : '',
        st.description,
        ...(st.actions || []).map((a, idx) => `  ${idx + 1}) ${a}`),
        st.codeSnippet?.code ? `Command:\n${st.codeSnippet.code}` : '',
        st.expectedResult ? `Hasil diharapkan: ${st.expectedResult}` : '',
        st.note ? `Catatan: ${st.note}` : '',
        ''
      ]),
      '11. Panduan Screenshot (Opsional):',
      ...(aiTutResult.screenshotRecommendations || []).map(
        (s) => `Gambar ${s.figureNumber}: ${s.title} — ${s.screenArea} | Anotasi: ${s.annotation} | Alt: ${s.altText}`
      ),
      '',
      '12. Hasil Akhir & Cara Verifikasi:',
      aiTutResult.verification?.summary || '-',
      ...(aiTutResult.verification?.indicators || []).map((ind) => `- ${ind}`),
      '',
      '13. Troubleshooting:',
      ...aiTutResult.troubleshootingTips.map(
        (t, i) => `${i + 1}. Masalah: ${t.issue} | Penyebab: ${t.cause || '-'} | Solusi: ${t.resolution}`
      ),
      '',
      '14. Tips & Rekomendasi:',
      ...(aiTutResult.tipsAndRecommendations?.bestPractices || []).map((b) => `- Praktik Terbaik: ${b}`),
      ...(aiTutResult.tipsAndRecommendations?.avoidMistakes || []).map((b) => `- Hindari: ${b}`),
      ...(aiTutResult.tipsAndRecommendations?.securityTips || []).map((b) => `- Keamanan: ${b}`),
      '',
      '15. FAQ:',
      ...aiTutResult.faqs.flatMap((f, i) => [`${i + 1}. ${f.question}`, `   Jawaban: ${f.answer}`]),
      '',
      '16. Kesimpulan:',
      aiTutResult.conclusion,
      '',
      '17. Referensi:',
      ...(aiTutResult.references || []).map(
        (r, i) => `${i + 1}. ${r.title}${r.publisher ? ` — ${r.publisher}` : ''}${r.url ? ` (${r.url})` : ''}`
      ),
      '',
      '18. Saran Internal Linking:',
      ...(aiTutResult.internalLinkingSuggestions || []).map(
        (l, i) => `${i + 1}. [${l.anchorText}](${l.targetPath})${l.reason ? ` — ${l.reason}` : ''}`
      )
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    showToast('Seluruh 18 format dokumentasi tutorial Master Prompt berhasil disalin!');
  };

  const handleSaveAiTutorial = async (mode: 'now' | 'schedule' = 'now') => {
    if (!aiTutResult) return;

    if (mode === 'schedule') {
      const targetDate = new Date(aiTutScheduleAt);
      if (!aiTutScheduleAt || Number.isNaN(targetDate.getTime())) {
        showToast('Silakan pilih tanggal dan jam jadwal posting yang valid.', true);
        return;
      }
      if (targetDate.getTime() <= Date.now()) {
        showToast('Waktu jadwal harus di masa depan. Klik "Simpan & Terbitkan" jika ingin langsung tayang.', true);
        return;
      }
      const scheduledIso = targetDate.toISOString();
      const created = addTutorial({
        ...aiTutResult,
        publishStatus: 'scheduled',
        scheduledAt: scheduledIso,
        publishedDate: formatPublishedDateFromIso(scheduledIso),
        isAiGenerated: true
      });
      setAiTutResult(null);
      setAiTutTopic('');
      setActiveTab('ai-schedule');
      await persistWithToast(
        `Tutorial "${created.title}" dijadwalkan tayang otomatis pada ${formatScheduleDateTime(scheduledIso)}!`
      );
      return;
    }

    const created = addTutorial({
      ...aiTutResult,
      publishStatus: 'published',
      scheduledAt: undefined,
      isAiGenerated: true
    });
    setAiTutResult(null);
    setAiTutTopic('');
    setActiveTab('tutorials');
    await persistWithToast(`Tutorial "${created.title}" berhasil disimpan ke Supabase dan tampil di website live!`);
  };

  // =========================================================================
  // AI GENERATOR: ARTIKEL IT
  // =========================================================================
  const [aiArtTopic, setAiArtTopic] = useState('');
  const [aiArtCategory, setAiArtCategory] = useState<ArticleCategory>('Tren Teknologi');
  const [aiArtLoading, setAiArtLoading] = useState(false);
  const [aiArtStatusText, setAiArtStatusText] = useState('');
  const [aiArtResult, setAiArtResult] = useState<Omit<Article, 'id'> | null>(null);
  const [aiArtScheduleAt, setAiArtScheduleAt] = useState<string>(() => getDefaultScheduleInputValue(24));
  const [aiArtSuggestedTopics, setAiArtSuggestedTopics] = useState<string[]>([]);
  const [aiArtTopicsLoading, setAiArtTopicsLoading] = useState(false);
  const [aiArtAutoPublish, setAiArtAutoPublish] = useState(true);
  const [aiArtPublishedNotice, setAiArtPublishedNotice] = useState<string | null>(null);
  const [aiArtShowAdvanced, setAiArtShowAdvanced] = useState(false);
  const [aiArtCustomTitle, setAiArtCustomTitle] = useState('');
  const [aiArtAudience, setAiArtAudience] = useState('Umum, Pemula & Praktisi IT');
  const [aiArtGoal, setAiArtGoal] = useState('Edukasi & Informasi Praktis');
  const [aiArtType, setAiArtType] = useState('Artikel Website / Blog Profesional');
  const [aiArtWordCount, setAiArtWordCount] = useState('1.000 - 1.500 Kata');
  const [aiArtFocusKeyword, setAiArtFocusKeyword] = useState('');
  const [aiArtSupportingKeywords, setAiArtSupportingKeywords] = useState('');
  const [aiArtReferences, setAiArtReferences] = useState('');
  const [aiArtThumbAuto, setAiArtThumbAuto] = useState(true);
  const [aiArtThumbResult, setAiArtThumbResult] = useState<GeneratedThumbnailResult | null>(null);
  const [aiArtThumbLoading, setAiArtThumbLoading] = useState(false);
  const [aiArtThumbError, setAiArtThumbError] = useState<string | null>(null);
  const [aiArtThumbShowHeadline, setAiArtThumbShowHeadline] = useState(true);
  const [aiArtThumbFormat, setAiArtThumbFormat] = useState<ThumbnailOutputFormat>('webp');
  const [aiArtThumbSeed, setAiArtThumbSeed] = useState(1);

  const handleGenerateArticleThumbnail = async (
    targetArt: Omit<Article, 'id'>,
    opts?: {
      regenerate?: boolean;
      headlineOverride?: string;
      showHeadlineOverlay?: boolean;
      format?: ThumbnailOutputFormat;
    }
  ): Promise<Omit<Article, 'id'>> => {
    const nextSeed = opts?.regenerate ? aiArtThumbSeed + 1 : aiArtThumbSeed;
    if (opts?.regenerate) setAiArtThumbSeed(nextSeed);

    const fmt = opts?.format || aiArtThumbFormat;
    const showOverlay =
      opts?.showHeadlineOverlay !== undefined ? opts.showHeadlineOverlay : aiArtThumbShowHeadline;

    setAiArtThumbLoading(true);
    setAiArtThumbError(null);
    try {
      const thumbRes = await generateAutoThumbnail({
        contentType: 'article',
        title: targetArt.title,
        topic: aiArtTopic || targetArt.title,
        summary: targetArt.summary,
        category: targetArt.category,
        focusKeyword: targetArt.focusKeyword,
        targetAudience: aiArtAudience,
        toolsOrObjects: targetArt.tags?.join(', '),
        headlineOverride: opts?.headlineOverride,
        showHeadlineOverlay: showOverlay,
        format: fmt,
        variationSeed: nextSeed,
        brandName: profile.name || 'Risa Kurniawan'
      });
      setAiArtThumbResult(thumbRes);
      const updatedArt: Omit<Article, 'id'> = {
        ...targetArt,
        thumbnail: thumbRes.imageDataUrl,
        imageAltText: thumbRes.analysis.altText || targetArt.imageAltText,
        thumbnailHeadline: thumbRes.headline,
        thumbnailVisualConcept: thumbRes.analysis.visualConcept
      };
      setAiArtResult(updatedArt);
      return updatedArt;
    } catch (err: any) {
      setAiArtThumbError(`Fallback thumbnail digunakan: ${err?.message || 'Koneksi terganggu'}`);
      return targetArt;
    } finally {
      setAiArtThumbLoading(false);
    }
  };

  const handleGenerateArticleTopics = async (categoryOverride?: ArticleCategory) => {
    const targetCategory = categoryOverride || aiArtCategory;
    setAiArtTopicsLoading(true);
    try {
      const { topics } = await generateAiTopics({
        type: 'article',
        category: targetCategory,
        count: 5,
        excludeTopics: articles.map((a) => a.title)
      });
      setAiArtSuggestedTopics(topics);
      showToast(`5 ide topik artikel untuk kategori "${targetCategory}" berhasil disusun AI!`);
    } finally {
      setAiArtTopicsLoading(false);
    }
  };

  const articlePresets = [
    'Masa Depan AI Agent dalam Mengotomasi Tugas IT Support Perusahaan',
    'SSD NVMe vs SATA: Mana Pilihan Terbaik untuk Upgrade Laptop & PC Anda?',
    'Anatomi Serangan Ransomware Modern dan Strategi Proteksi Data UKM',
    'Windows Defender Bawaan vs Antivirus Pihak Ketiga: Apakah Masih Perlu Beli Lisensi?',
    'Pentingnya Re-pasting Thermal Paste dan Pemeliharaan Berkala Perangkat Komputer'
  ];

  const handleGenerateAiArticle = async (topicToUse?: string, forceAutoPublish?: boolean) => {
    const shouldAutoPublish = forceAutoPublish !== undefined ? forceAutoPublish : aiArtAutoPublish;
    let targetTopic = (topicToUse || aiArtTopic).trim();

    if (!targetTopic && !shouldAutoPublish) {
      showToast('Silakan tuliskan topik artikel IT terlebih dahulu, atau aktifkan Auto-Publish.', true);
      return;
    }

    setAiArtPublishedNotice(null);
    setAiArtLoading(true);
    setAiArtStatusText(
      !targetTopic
        ? `Memilih topik artikel segar untuk kategori "${aiArtCategory}"...`
        : 'Menjalankan Master Prompt SEO Content Specialist...'
    );

    try {
      if (!targetTopic) {
        const { topics } = await generateAiTopics({
          type: 'article',
          category: aiArtCategory,
          count: 1,
          excludeTopics: articles.map((a) => a.title)
        });
        targetTopic = topics[0] || `Analisis Praktis ${aiArtCategory} untuk Infrastruktur Modern`;
        setAiArtTopic(targetTopic);
      }

      setAiArtStatusText('Menyusun riset struktur EYD V, SEO Meta, H2/H3, FAQ & Referensi...');

      const supportingList = aiArtSupportingKeywords
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const { article: generatedArt } = await generateAiArticleContent({
        topic: targetTopic,
        category: aiArtCategory,
        authorName: profile.name || 'Risa Kurniawan',
        customTitle: aiArtCustomTitle.trim() || undefined,
        targetAudience: aiArtAudience,
        articleGoal: aiArtGoal,
        articleType: aiArtType,
        wordCountTarget: aiArtWordCount,
        focusKeyword: aiArtFocusKeyword.trim() || undefined,
        supportingKeywords: supportingList.length > 0 ? supportingList : undefined,
        referencesInput: aiArtReferences.trim() || undefined
      });

      let finalArticle = generatedArt;
      setAiArtResult(finalArticle);

      if (aiArtThumbAuto && finalArticle) {
        setAiArtStatusText('Menghasilkan thumbnail visual AI 1280×720 otomatis sesuai topik artikel...');
        finalArticle = await handleGenerateArticleThumbnail(finalArticle);
      }

      if (shouldAutoPublish && finalArticle) {
        setAiArtStatusText('Menyimpan & menerbitkan langsung ke Supabase & website live...');
        const created = addArticle({
          ...finalArticle,
          publishStatus: 'published',
          scheduledAt: undefined,
          isAiGenerated: true
        });
        setAiArtTopic('');
        setAiArtPublishedNotice(created.title);
        await persistWithToast(
          `Otomatis selesai! Artikel SEO "${created.title}" + Thumbnail AI berhasil dibuat dan langsung tayang live!`
        );
      } else {
        showToast('Artikel SEO lengkap & thumbnail otomatis AI berhasil disusun! Pratinjau tersedia di bawah.');
      }
    } finally {
      setAiArtLoading(false);
      setAiArtStatusText('');
    }
  };

  const handleCopyFullArticlePackage = () => {
    if (!aiArtResult) return;
    const lines: string[] = [
      `1. SEO Title: ${aiArtResult.seoTitle || aiArtResult.title}`,
      `2. Meta Description: ${aiArtResult.metaDescription || aiArtResult.summary}`,
      `3. Focus Keyword: ${aiArtResult.focusKeyword || aiArtResult.title}`,
      `4. Supporting Keywords: ${(aiArtResult.supportingKeywords || aiArtResult.tags || []).join(', ')}`,
      `5. URL Slug: /article/${aiArtResult.slug}`,
      '',
      '6. Artikel Lengkap:',
      `# ${aiArtResult.title}`,
      '',
      aiArtResult.introduction || aiArtResult.summary,
      '',
      ...aiArtResult.sections.flatMap((sec) => [
        `## ${sec.heading}`,
        sec.body,
        ...(sec.subSections || []).flatMap((sub) => [`### ${sub.subHeading}`, sub.body]),
        ...(sec.bulletPoints || []).map((b) => `- ${b}`),
        sec.highlight ? `> ${sec.highlight}` : '',
        ''
      ]),
      ...(aiArtResult.practicalInsights
        ? [
            `## ${aiArtResult.practicalInsights.title}`,
            ...aiArtResult.practicalInsights.items.map((item) => `- ${item}`),
            ''
          ]
        : []),
      '7. FAQ:',
      ...((aiArtResult.faqs || []).flatMap((f, i) => [`${i + 1}. ${f.question}`, `Jawaban: ${f.answer}`])),
      '',
      '8. Kesimpulan:',
      aiArtResult.conclusion,
      '',
      '9. Referensi dan Sumber:',
      ...((aiArtResult.references || []).map(
        (r, i) => `${i + 1}. ${r.title}${r.publisher ? ` — ${r.publisher}` : ''}${r.url ? ` (${r.url})` : ''}`
      )),
      '',
      '10. Rekomendasi Internal Linking:',
      ...((aiArtResult.internalLinkingSuggestions || []).map(
        (l, i) => `${i + 1}. [${l.anchorText}](${l.targetPath})${l.reason ? ` — ${l.reason}` : ''}`
      )),
      '',
      `11. Rekomendasi Featured Image: ${aiArtResult.featuredImageRecommendation || '-'}`,
      `12. Alt Text Gambar: ${aiArtResult.imageAltText || aiArtResult.title}`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    showToast('Paket artikel & 12 format SEO Master Prompt berhasil disalin!');
  };

  const handleSaveAiArticle = async (mode: 'now' | 'schedule' = 'now') => {
    if (!aiArtResult) return;

    if (mode === 'schedule') {
      const targetDate = new Date(aiArtScheduleAt);
      if (!aiArtScheduleAt || Number.isNaN(targetDate.getTime())) {
        showToast('Silakan pilih tanggal dan jam jadwal posting yang valid.', true);
        return;
      }
      if (targetDate.getTime() <= Date.now()) {
        showToast('Waktu jadwal harus di masa depan. Klik "Simpan & Terbitkan" jika ingin langsung tayang.', true);
        return;
      }
      const scheduledIso = targetDate.toISOString();
      const created = addArticle({
        ...aiArtResult,
        publishStatus: 'scheduled',
        scheduledAt: scheduledIso,
        publishedDate: formatPublishedDateFromIso(scheduledIso),
        isAiGenerated: true
      });
      setAiArtResult(null);
      setAiArtTopic('');
      setActiveTab('ai-schedule');
      await persistWithToast(
        `Artikel "${created.title}" dijadwalkan tayang otomatis pada ${formatScheduleDateTime(scheduledIso)}!`
      );
      return;
    }

    const created = addArticle({
      ...aiArtResult,
      publishStatus: 'published',
      scheduledAt: undefined,
      isAiGenerated: true
    });
    setAiArtResult(null);
    setAiArtTopic('');
    setActiveTab('articles');
    await persistWithToast(`Artikel "${created.title}" berhasil disimpan ke Supabase dan tampil di website live!`);
  };

  // =========================================================================
  // PROFILE & FULL SITE TEXT SETTINGS STATE
  // =========================================================================
  const [profileSubTab, setProfileSubTab] = useState<
    'identitas' | 'beranda' | 'cta' | 'tentang' | 'nilai' | 'timeline' | 'kontak'
  >('identitas');

  const [profileForm, setProfileForm] = useState<UserProfile>(profile);

  React.useEffect(() => {
    setProfileForm(profile);
  }, [profile]);

  // Form states for adding items to profile.values and profile.learningJourney
  const [newValueTitle, setNewValueTitle] = useState('');
  const [newValueDesc, setNewValueDesc] = useState('');

  const [newJourneyYear, setNewJourneyYear] = useState('');
  const [newJourneyTitle, setNewJourneyTitle] = useState('');
  const [newJourneyDesc, setNewJourneyDesc] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    await persistWithToast('Seluruh konfigurasi profil berhasil disimpan permanen ke Supabase!');
  };

  const handleAddValue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValueTitle.trim() || !newValueDesc.trim()) return;
    const updatedValues = [
      ...(profileForm.values || []),
      { title: newValueTitle.trim(), description: newValueDesc.trim() }
    ];
    setProfileForm({ ...profileForm, values: updatedValues });
    updateProfile({ values: updatedValues });
    setNewValueTitle('');
    setNewValueDesc('');
    void persistWithToast('Prinsip nilai kerja baru berhasil ditambahkan & disimpan ke Supabase!');
  };

  const handleDeleteValue = (index: number) => {
    const updatedValues = (profileForm.values || []).filter((_: ValueItem, i: number) => i !== index);
    setProfileForm({ ...profileForm, values: updatedValues });
    updateProfile({ values: updatedValues });
    void persistWithToast('Prinsip nilai kerja berhasil dihapus & disimpan.');
  };

  const handleAddJourney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJourneyYear.trim() || !newJourneyTitle.trim()) return;
    const updatedJourney = [
      ...(profileForm.learningJourney || []),
      {
        year: newJourneyYear.trim(),
        title: newJourneyTitle.trim(),
        description: newJourneyDesc.trim()
      }
    ];
    setProfileForm({ ...profileForm, learningJourney: updatedJourney });
    updateProfile({ learningJourney: updatedJourney });
    setNewJourneyYear('');
    setNewJourneyTitle('');
    setNewJourneyDesc('');
    void persistWithToast('Riwayat perjalanan berhasil ditambahkan & disimpan ke Supabase!');
  };

  const handleDeleteJourney = (index: number) => {
    const updatedJourney = (profileForm.learningJourney || []).filter((_: TimelineItem, i: number) => i !== index);
    setProfileForm({ ...profileForm, learningJourney: updatedJourney });
    updateProfile({ learningJourney: updatedJourney });
    void persistWithToast('Riwayat perjalanan berhasil dihapus & disimpan.');
  };

  // Custom Social Media State & Handlers
  const [newSocialPlatform, setNewSocialPlatform] = useState('YouTube');
  const [customPlatformName, setCustomPlatformName] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [newSocialHandle, setNewSocialHandle] = useState('');

  const handleAddSocialMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocialUrl.trim()) return;
    const finalPlatform = newSocialPlatform === 'Lainnya' ? (customPlatformName.trim() || 'Lainnya') : newSocialPlatform;
    const newId = `soc-${Date.now()}`;
    const updatedSocial = [
      ...(profileForm.socialMedia || []),
      {
        id: newId,
        platform: finalPlatform,
        url: newSocialUrl.trim(),
        usernameOrHandle: newSocialHandle.trim() || undefined
      }
    ];
    setProfileForm({ ...profileForm, socialMedia: updatedSocial });
    updateProfile({ socialMedia: updatedSocial });
    setNewSocialUrl('');
    setNewSocialHandle('');
    setCustomPlatformName('');
    void persistWithToast(`Media sosial "${finalPlatform}" berhasil ditambahkan & disimpan!`);
  };

  const handleDeleteSocialMedia = (id: string) => {
    const updatedSocial = (profileForm.socialMedia || []).filter((s: SocialMediaItem) => s.id !== id);
    setProfileForm({ ...profileForm, socialMedia: updatedSocial });
    updateProfile({ socialMedia: updatedSocial });
    void persistWithToast('Tautan media sosial berhasil dihapus & disimpan.');
  };

  // Skill Group Form State
  const [newSkillCat, setNewSkillCat] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [newSkillItems, setNewSkillItems] = useState('');

  const handleAddSkillGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillCat.trim() || !newSkillItems.trim()) return;
    addSkillGroup({
      category: newSkillCat.trim(),
      description: newSkillDesc.trim(),
      skills: newSkillItems
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    });
    setNewSkillCat('');
    setNewSkillDesc('');
    setNewSkillItems('');
    void persistWithToast('Kelompok keahlian baru berhasil ditambahkan & disimpan ke Supabase!');
  };

  // Tool Form State
  const [newToolName, setNewToolName] = useState('');
  const [newToolCategory, setNewToolCategory] = useState('IT Support');
  const [newToolPurpose, setNewToolPurpose] = useState('');

  const handleAddTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolName.trim()) return;
    addTool({
      name: newToolName.trim(),
      category: newToolCategory.trim(),
      purpose: newToolPurpose.trim()
    });
    setNewToolName('');
    setNewToolPurpose('');
    void persistWithToast('Peralatan kerja baru berhasil ditambahkan & disimpan ke Supabase!');
  };

  // Backup handlers
  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-portofolio-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Berkas cadangan berhasil diekspor.');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = importDataJSON(content);
      if (res.success) {
        showToast('Data berhasil dimuat dari berkas JSON! Menyimpan ke Supabase...');
        await persistWithToast('Seluruh data berhasil dipulihkan & disimpan permanen ke database Supabase!');
      } else {
        showToast('Gagal memulihkan data: ' + res.error, true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetData = () => {
    setDeleteConfirmTarget({ kind: 'reset' });
  };

  const handleConfirmTargetDelete = async () => {
    if (!deleteConfirmTarget) return;
    setIsExecutingDelete(true);
    try {
      if (deleteConfirmTarget.kind === 'tutorial') {
        deleteTutorial(deleteConfirmTarget.item.id);
        await persistWithToast(
          'Tutorial dihapus dari website live & diarsipkan aman di database Supabase.'
        );
      } else if (deleteConfirmTarget.kind === 'article') {
        deleteArticle(deleteConfirmTarget.item.id);
        await persistWithToast(
          'Artikel dihapus dari website live & diarsipkan aman di database Supabase.'
        );
      } else if (deleteConfirmTarget.kind === 'project') {
        deleteProject(deleteConfirmTarget.item.id);
        await persistWithToast('Proyek berhasil dihapus & disinkronkan ke Supabase.');
      } else if (deleteConfirmTarget.kind === 'service') {
        deleteService(deleteConfirmTarget.item.id);
        await persistWithToast('Layanan jasa berhasil dihapus & disimpan ke Supabase.');
      } else if (deleteConfirmTarget.kind === 'skill') {
        deleteSkillGroup(deleteConfirmTarget.index);
        await persistWithToast('Kelompok keahlian dihapus & disimpan ke Supabase.');
      } else if (deleteConfirmTarget.kind === 'reset') {
        resetAllData();
        await persistWithToast('Seluruh data berhasil dikembalikan ke pengaturan awal & disimpan.');
      }
      setDeleteConfirmTarget(null);
    } finally {
      setIsExecutingDelete(false);
    }
  };

  // Filtered lists for admin tables
  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.status.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredServices = services.filter(
    (s) =>
      s.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.category.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.shortDescription.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.targetAudience.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const activeTutorials = tutorials.filter((t) => !isContentArchived(t));
  const archivedTutorials = tutorials.filter((t) => isContentArchived(t));
  const activeArticles = articles.filter((a) => !isContentArchived(a));
  const archivedArticles = articles.filter((a) => isContentArchived(a));

  const filteredTutorials = (tutorialViewMode === 'archived' ? archivedTutorials : activeTutorials).filter(
    (t) =>
      t.title.toLowerCase().includes(tutorialSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(tutorialSearch.toLowerCase()) ||
      t.difficulty.toLowerCase().includes(tutorialSearch.toLowerCase())
  );

  const filteredArticles = (articleViewMode === 'archived' ? archivedArticles : activeArticles).filter(
    (a) =>
      a.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
      a.category.toLowerCase().includes(articleSearch.toLowerCase()) ||
      a.tags.some((tag) => tag.toLowerCase().includes(articleSearch.toLowerCase()))
  );

  // Admin User Handlers & Filter
  const filteredAdminUsers = adminUsers.filter(
    (a) =>
      a.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      a.username.toLowerCase().includes(adminSearch.toLowerCase()) ||
      a.role.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const handleOpenAddAdmin = () => {
    setSelectedAdminToEdit(null);
    setAdminModalOpen(true);
  };

  const handleOpenEditAdmin = (admin: AdminUser) => {
    setSelectedAdminToEdit(admin);
    setAdminModalOpen(true);
  };

  const handleSaveAdminUser = (data: {
    name: string;
    username: string;
    role: AdminRole;
    password?: string;
  }) => {
    if (selectedAdminToEdit) {
      const res = updateAdminUser(selectedAdminToEdit.id, data);
      if (res.success) {
        void persistWithToast(`Akun admin "${data.name}" (@${data.username}) berhasil diperbarui & disimpan!`);
      }
      return res;
    } else {
      if (!data.password) {
        return { success: false, message: 'Kata sandi wajib diisi untuk akun baru.' };
      }
      const res = addAdminUser({
        name: data.name,
        username: data.username,
        role: data.role,
        password: data.password
      });
      if (res.success) {
        void persistWithToast(`Administrator baru "${data.name}" (@${data.username}) berhasil ditambahkan & disimpan!`);
      }
      return res;
    }
  };

  const handleDeleteAdminUser = (admin: AdminUser) => {
    const res = deleteAdminUser(admin.id);
    if (res.success) {
      void persistWithToast(`Akun admin "${admin.name}" (@${admin.username}) berhasil dihapus & disimpan.`);
      setDeleteConfirmAdmin(null);
    } else {
      showToast(res.message || 'Gagal menghapus akun admin.', true);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs flex items-center gap-2 max-w-md ${
            toastIsError
              ? 'bg-rose-950 text-rose-100 border-rose-700'
              : 'bg-stone-900 text-white border-stone-700'
          }`}
        >
          {toastIsError ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#84cc16] shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-200 flex flex-col justify-between shrink-0 border-r border-stone-800 overflow-hidden">
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-[#84cc16] rounded-xs" />
              <div>
                <span className="font-extrabold text-sm text-white tracking-tight block">
                  {profile.brandTitle}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Panel Kelola Konten</span>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex md:flex-col gap-1 overflow-x-auto overscroll-x-contain whitespace-nowrap p-3 text-xs [&>button]:w-auto [&>button]:min-w-max [&>button]:shrink-0 [&>div]:min-w-max [&>div]:shrink-0 md:[&>button]:w-full">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 font-medium transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-stone-800 text-white font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#84cc16]" />
              <span>Ringkasan & Metrik</span>
            </button>

            {/* AI Generator Section Highlight */}
            <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-[#84cc16] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>FITUR AI OTOMATIS (GRATIS)</span>
            </div>

            <button
              onClick={() => setActiveTab('ai-tutorial')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between font-medium transition-colors cursor-pointer border ${
                activeTab === 'ai-tutorial'
                  ? 'bg-stone-800 text-white font-bold border-[#84cc16]/50'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60 border-stone-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#84cc16]" />
                <span className="font-bold">Generator Tutorial AI</span>
              </span>
              <span className="text-[9px] font-bold uppercase bg-[#84cc16] text-stone-950 px-1.5 py-0.5 rounded">
                Gratis
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ai-article')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between font-medium transition-colors cursor-pointer border ${
                activeTab === 'ai-article'
                  ? 'bg-stone-800 text-white font-bold border-[#84cc16]/50'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60 border-stone-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#84cc16]" />
                <span className="font-bold">Generator Artikel AI</span>
              </span>
              <span className="text-[9px] font-bold uppercase bg-[#84cc16] text-stone-950 px-1.5 py-0.5 rounded">
                Gratis
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ai-schedule')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between font-medium transition-colors cursor-pointer border ${
                activeTab === 'ai-schedule'
                  ? 'bg-stone-800 text-white font-bold border-[#84cc16]/50'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60 border-stone-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-[#84cc16]" />
                <span className="font-bold">Auto-Pilot &amp; Jadwal AI</span>
              </span>
              {aiAutopilot.enabled ? (
                <span className="text-[9px] font-bold uppercase bg-[#84cc16] text-stone-950 px-1.5 py-0.5 rounded">
                  ON{pendingScheduleCount > 0 ? ` · ${pendingScheduleCount}` : ''}
                </span>
              ) : pendingScheduleCount > 0 ? (
                <span className="font-mono text-[10px] font-bold bg-amber-400 text-stone-950 px-1.5 py-0.5 rounded">
                  {pendingScheduleCount}
                </span>
              ) : (
                <span className="text-[9px] font-bold uppercase bg-stone-700 text-[#84cc16] px-1.5 py-0.5 rounded">
                  Auto
                </span>
              )}
            </button>

            <div className="pt-3 pb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Kelola Konten Publik
            </div>

            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between font-medium transition-colors cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-stone-800 text-white font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Layout className="w-4 h-4" />
                <span>Proyek Situs Web</span>
              </span>
              <span className="font-mono text-[11px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between font-medium transition-colors cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-stone-800 text-white font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-[#84cc16]" />
                <span>Jasa Layanan IT</span>
              </span>
              <span className="font-mono text-[11px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">
                {services.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tutorials')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between font-medium transition-colors cursor-pointer ${
                activeTab === 'tutorials'
                  ? 'bg-stone-800 text-white font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" />
                <span>Tutorial IT Support</span>
              </span>
              <span className="font-mono text-[11px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">
                {activeTutorials.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between font-medium transition-colors cursor-pointer ${
                activeTab === 'articles'
                  ? 'bg-stone-800 text-white font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Kelola Artikel IT</span>
              </span>
              <span className="font-mono text-[11px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">
                {activeArticles.length}
              </span>
            </button>

            <div className="pt-3 pb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Konfigurasi Sistem
            </div>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 font-medium transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-stone-800 text-white font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profil & Personal Branding</span>
            </button>

            <button
              onClick={() => setActiveTab('skills')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 font-medium transition-colors cursor-pointer ${
                activeTab === 'skills'
                  ? 'bg-stone-800 text-white font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Keahlian & Peralatan</span>
            </button>

            <button
              onClick={() => setActiveTab('admins')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between font-medium transition-colors cursor-pointer ${
                activeTab === 'admins'
                  ? 'bg-stone-800 text-white font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#84cc16]" />
                <span>Kelola Akun Admin</span>
              </span>
              <span className="font-mono text-[11px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">
                {adminUsers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 font-medium transition-colors cursor-pointer ${
                activeTab === 'backup'
                  ? 'bg-stone-800 text-white font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Cadangan Data (Backup)</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <button
            onClick={onBackToSite}
            className="w-full py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#84cc16]" />
            <span>Lihat Website Publik</span>
          </button>

          <button
            onClick={logout}
            className="w-full py-1.5 px-3 text-stone-400 hover:text-red-400 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
            <span>Admin</span>
            <span>/</span>
            <span className="font-bold text-stone-900 capitalize font-sans">
              {activeTab === 'admins'
                ? 'Kelola Akun Admin'
                : activeTab === 'ai-schedule'
                ? 'Auto-Pilot & Jadwal Posting AI'
                : activeTab}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Supabase Persistence Indicator */}
            <button
              onClick={() => {
                setIsDbGuideOpen(true);
                void handleTestDatabaseConnection();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                syncStatus === 'synced'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : syncStatus === 'saving'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : syncStatus === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                  : syncStatus === 'unconfigured'
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-stone-100 text-stone-700 border-stone-200'
              }`}
              title="Klik untuk diagnosa Supabase & panduan setup"
            >
              {syncStatus === 'synced' && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Cloud Aktif</span>
                  {lastSavedAt && (
                    <span className="hidden sm:inline text-[10px] text-emerald-600 font-mono">
                      ({lastSavedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  )}
                </>
              )}
              {syncStatus === 'saving' && (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
                  <span>Menyimpan...</span>
                </>
              )}
              {syncStatus === 'error' && (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Gagal Sync (Cek DB)</span>
                </>
              )}
              {syncStatus === 'unconfigured' && (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Setup Supabase</span>
                </>
              )}
              {syncStatus === 'offline' && (
                <>
                  <Database className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span>Lokal (Offline)</span>
                </>
              )}
            </button>

            {/* Quick Force Save Button */}
            <button
              onClick={handleManualSaveToCloud}
              disabled={isManualSaving || syncStatus === 'saving'}
              className="px-3 py-1.5 rounded-lg bg-[#84cc16] hover:bg-[#65a30d] text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              title="Simpan seluruh data ke database sekarang"
            >
              {isManualSaving || syncStatus === 'saving' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Simpan ke Database</span>
            </button>

            {currentAdmin && (
              <button
                onClick={() => setActiveTab('admins')}
                className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs transition-colors cursor-pointer"
                title="Kelola Akun Administrator"
              >
                <div className="w-6 h-6 rounded-full bg-[#84cc16]/20 text-[#4d7c0f] font-extrabold flex items-center justify-center text-xs">
                  {currentAdmin.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <span className="font-bold text-stone-800 block text-xs leading-none">
                    {currentAdmin.name}
                  </span>
                  <span className="text-[10px] text-stone-500 block leading-tight pt-0.5">
                    @{currentAdmin.username} · <span className="text-[#65a30d] font-semibold">{currentAdmin.role}</span>
                  </span>
                </div>
              </button>
            )}

            <button
              onClick={onBackToSite}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer ml-1"
            >
              <span>Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Visible Sync Warning Banner if Supabase is not connected or failed */}
        {(syncStatus === 'unconfigured' || syncStatus === 'error' || syncStatus === 'offline') && (
          <div className="mx-4 sm:mx-6 mt-4 p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold">
                  Perhatian: Perubahan belum tersimpan ke Database Supabase Live
                </div>
                <div className="text-rose-800">
                  {syncErrorMessage ||
                    'Periksa SUPABASE_URL & SUPABASE_SECRET_KEY di Vercel Environment Variables atau pastikan tabel site_content sudah dibuat.'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setIsDbGuideOpen(true);
                void handleTestDatabaseConnection();
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold shrink-0 cursor-pointer"
            >
              Cek Status & Solusi DB
            </button>
          </div>
        )}

        {/* Tab View Content */}
        <div className="p-4 sm:p-6 space-y-5 max-w-7xl">
          {/* ==================================================== */}
          {/* 1. OVERVIEW TAB */}
          {/* ==================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                  Ringkasan Ruang Kerja Konten
                </h1>
                <p className="text-xs text-stone-500">
                  Pantau jumlah konten publik, status pengerjaan, dan pintasan cerdas AI.
                </p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-5 bg-white rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-medium">Total Proyek Web</span>
                    <Layout className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-stone-900 tabular-nums">
                    {projects.length}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {projects.filter((p) => p.status === 'Selesai').length} Selesai ·{' '}
                    {projects.filter((p) => p.status === 'Pengembangan Aktif').length} Aktif
                  </div>
                </div>

                <div className="p-5 bg-white rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-medium">Jasa Layanan IT</span>
                    <Briefcase className="w-4 h-4 text-[#84cc16]" />
                  </div>
                  <div className="text-3xl font-extrabold text-stone-900 tabular-nums">
                    {services.length}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {services.filter((s) => s.isActive).length} Aktif ·{' '}
                    {services.filter((s) => s.isPopular).length} Populer
                  </div>
                </div>

                <div className="p-5 bg-white rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-medium">Tutorial IT Support</span>
                    <BookOpen className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-stone-900 tabular-nums">
                    {activeTutorials.length}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {activeTutorials.filter((t) => t.isAiGenerated).length} AI ·{' '}
                    {archivedTutorials.length} Arsip DB
                  </div>
                </div>

                <div className="p-5 bg-white rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-medium">Artikel IT</span>
                    <FileText className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-stone-900 tabular-nums">
                    {activeArticles.length}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {activeArticles.filter((a) => a.isFeatured).length} Unggulan ·{' '}
                    {archivedArticles.length} Arsip DB
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('admins')}
                  className="p-5 bg-white rounded-xl border border-stone-200 space-y-2 text-left hover:border-[#84cc16] hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-medium group-hover:text-stone-900 transition-colors">Admin Login</span>
                    <ShieldCheck className="w-4 h-4 text-[#84cc16]" />
                  </div>
                  <div className="text-3xl font-extrabold text-stone-900 tabular-nums">
                    {adminUsers.length}
                  </div>
                  <div className="text-[11px] text-[#65a30d] font-semibold flex items-center justify-between">
                    <span>{adminUsers.filter((u) => u.role === 'Super Admin').length} Super Admin</span>
                    <span className="flex items-center gap-0.5">Kelola &rarr;</span>
                  </div>
                </button>
              </div>

              {/* AI Shortcuts Callout Banner */}
              <div className="p-6 bg-stone-900 text-white rounded-2xl border border-stone-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#84cc16]/20 text-[#84cc16] text-[11px] font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    FITUR BARU BERBASIS AI
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Buat Tutorial IT & Artikel Teknologi Seketika Tanpa Biaya
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Gunakan mesin AI terintegrasi untuk menyusun tutorial teknis lengkap dengan command line,
                    analisis risiko, dan panduan troubleshooting, atau tulis artikel mendalam seputar tren IT
                    hanya dengan memasukkan topik yang Anda inginkan.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 shrink-0">
                  <button
                    onClick={() => setActiveTab('ai-tutorial')}
                    className="px-4 py-2.5 bg-[#84cc16] text-stone-950 font-bold rounded-lg text-xs hover:bg-[#a3e635] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Generate Tutorial AI</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('ai-article')}
                    className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 cursor-pointer border border-stone-700"
                  >
                    <FileText className="w-4 h-4 text-[#84cc16]" />
                    <span>Generate Artikel AI</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('ai-schedule')}
                    className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 cursor-pointer border border-stone-700"
                  >
                    <Zap className="w-4 h-4 text-[#84cc16]" />
                    <span>
                      Auto-Pilot AI {aiAutopilot.enabled ? '(AKTIF)' : `(${pendingScheduleCount} Antrean)`}
                    </span>
                  </button>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-4">
                <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
                  Aksi Cepat Manajemen Seluruh Konten Situs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                      setProjectModalOpen(true);
                    }}
                    className="p-4 rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-stone-900">+ Tambah Proyek Web</div>
                      <div className="text-[11px] text-stone-500">Web AI, Portfolio, Sistem</div>
                    </div>
                    <Layout className="w-4 h-4 text-stone-400" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedService(null);
                      setServiceModalOpen(true);
                    }}
                    className="p-4 rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-stone-900">+ Tambah Jasa Layanan</div>
                      <div className="text-[11px] text-stone-500">Hardware, Web, Jaringan</div>
                    </div>
                    <Briefcase className="w-4 h-4 text-[#84cc16]" />
                  </button>

                  <button
                    onClick={() => setActiveTab('profile')}
                    className="p-4 rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-stone-900">Kelola Teks & Profil Web</div>
                      <div className="text-[11px] text-stone-500">Hero, CTA, Bio, Kontak, WhatsApp</div>
                    </div>
                    <User className="w-4 h-4 text-stone-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('skills')}
                    className="p-4 rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-stone-900">Kelola Keahlian & Tools</div>
                      <div className="text-[11px] text-stone-500">Matriks skill & perangkat kerja</div>
                    </div>
                    <Wrench className="w-4 h-4 text-stone-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('backup')}
                    className="p-4 rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-stone-900">Cadangan Data (Backup)</div>
                      <div className="text-[11px] text-stone-500">Unduh & pulihkan berkas JSON</div>
                    </div>
                    <Database className="w-4 h-4 text-stone-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 2. AI GENERATOR: TUTORIAL IT SUPPORT */}
          {/* ==================================================== */}
          {activeTab === 'ai-tutorial' && (
            <div className="space-y-6">
              <div className="space-y-1 border-b border-stone-200 pb-5">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#65a30d] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Otomatisasi Konten IT Support Berbasis AI
                </div>
                <h1 className="text-2xl font-extrabold text-stone-950 tracking-tight">
                  Generator Tutorial IT Support Otomatis (Gratis)
                </h1>
                <p className="text-xs text-stone-600 max-w-3xl">
                  Fitur ini menggunakan kecerdasan buatan untuk menyusun panduan teknis yang sebenarnya, lengkap dengan
                  daftar prasyarat, peringatan risiko, langkah sistematis beserta perintah terminal/CMD, tips troubleshooting,
                  dan tanya jawab teknis. Hasil yang dibuat akan langsung tersimpan dan muncul di menu{' '}
                  <span className="font-bold text-stone-900">Tutorial IT</span>.
                </p>
              </div>

              {/* Form Input Box */}
              <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-5 shadow-xs">
                {/* Configuration Options (Select Category First) */}
                <div className="space-y-4 pb-4 border-b border-stone-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700">Kategori Tutorial</label>
                      <select
                        value={aiTutCategory}
                        onChange={(e) => {
                          setAiTutCategory(e.target.value as TutorialCategory);
                          setAiTutSuggestedTopics([]);
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

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700">Tingkat Kesulitan</label>
                      <select
                        value={aiTutDifficulty}
                        onChange={(e) => setAiTutDifficulty(e.target.value as TutorialDifficulty)}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#84cc16]"
                      >
                        <option value="Pemula">Pemula</option>
                        <option value="Menengah">Menengah</option>
                        <option value="Lanjutan">Lanjutan</option>
                      </select>
                    </div>
                  </div>

                  {/* Collapsible Master Prompt Technical Documentation Settings */}
                  <div className="rounded-xl border border-stone-200 bg-stone-50/70 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setAiTutShowAdvanced((v) => !v)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-[#65a30d]" />
                        <span>Parameter Master Prompt Dokumentasi Teknis &amp; SEO (EYD V — Opsional)</span>
                      </span>
                      <span className="text-[11px] font-semibold text-[#65a30d]">
                        {aiTutShowAdvanced ? 'Tutup Pengaturan' : 'Atur Detail Teknis'}
                      </span>
                    </button>

                    {aiTutShowAdvanced && (
                      <div className="p-4 pt-2 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-stone-600">Target Pembaca</label>
                          <select
                            value={aiTutAudience}
                            onChange={(e) => setAiTutAudience(e.target.value)}
                            className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                          >
                            <option value="Pemula (Mudah diikuti tanpa keahlian sebelumnya)">Pemula</option>
                            <option value="Menengah (Memahami dasar komputer/jaringan)">Menengah</option>
                            <option value="Profesional & Administrator IT">Profesional IT</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-stone-600">Tujuan Tutorial</label>
                          <select
                            value={aiTutGoal}
                            onChange={(e) => setAiTutGoal(e.target.value)}
                            className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                          >
                            <option value="Panduan Teknis, Konfigurasi & Troubleshooting">Panduan &amp; Troubleshooting</option>
                            <option value="Instalasi & Persiapan Sistem">Instalasi</option>
                            <option value="Konfigurasi & Optimasi Performa">Konfigurasi</option>
                            <option value="Penggunaan Fitur & Produktivitas">Penggunaan</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-stone-600">Perangkat Target</label>
                          <select
                            value={aiTutDevice}
                            onChange={(e) => setAiTutDevice(e.target.value)}
                            className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                          >
                            <option value="Komputer / Laptop">Komputer / Laptop</option>
                            <option value="Server / VPS">Server / VPS</option>
                            <option value="Router / Perangkat Jaringan">Router / Jaringan</option>
                            <option value="Smartphone (Android / iOS)">Smartphone</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-stone-600">Sistem Operasi</label>
                          <select
                            value={aiTutOs}
                            onChange={(e) => setAiTutOs(e.target.value)}
                            className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                          >
                            <option value="Windows 10 / Windows 11">Windows 10 / 11</option>
                            <option value="Linux (Ubuntu / Debian)">Linux</option>
                            <option value="macOS">macOS</option>
                            <option value="Android / iOS">Android / iOS</option>
                            <option value="Lintas Platform / Web">Lintas Platform</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-stone-600">Judul Tutorial Kustom (Opsional)</label>
                          <input
                            type="text"
                            value={aiTutCustomTitle}
                            onChange={(e) => setAiTutCustomTitle(e.target.value)}
                            placeholder="Kosongkan agar AI menentukan judul jelas & SEO-friendly..."
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-stone-600">Software / Tools</label>
                          <input
                            type="text"
                            value={aiTutSoftware}
                            onChange={(e) => setAiTutSoftware(e.target.value)}
                            placeholder="Command Prompt, Rufus, Winbox..."
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-stone-600">Versi Software &amp; Panjang</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              value={aiTutSoftwareVersion}
                              onChange={(e) => setAiTutSoftwareVersion(e.target.value)}
                              placeholder="v24H2 / terbaru"
                              className="w-full px-2 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                            />
                            <select
                              value={aiTutLength}
                              onChange={(e) => setAiTutLength(e.target.value)}
                              className="w-full px-2 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                            >
                              <option value="Lengkap & Mendalam sesuai kebutuhan">Mendalam</option>
                              <option value="Ringkas & Langsung Praktik">Ringkas</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category-Aware Topic Generator */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#65a30d]" />
                        <span>Generator Topik Tutorial Sesuai Kategori ({aiTutCategory})</span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Klik tombol di kanan untuk meminta AI membuatkan 5 ide topik spesifik sesuai kategori yang dipilih.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={aiTutTopicsLoading}
                      onClick={() => void handleGenerateTutorialTopics()}
                      className="px-3.5 py-2 bg-[#84cc16] hover:bg-[#a3e635] disabled:opacity-60 text-stone-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                    >
                      {aiTutTopicsLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Menyusun Ide Topik...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>
                            {aiTutSuggestedTopics.length > 0 ? 'Generate Topik Lainnya' : 'Generate Topik Sesuai Kategori'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiTutSuggestedTopics.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-stone-200">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Pilih topik untuk dimasukkan ke input, atau klik &quot;Buat Langsung&quot;:
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {aiTutSuggestedTopics.map((topicItem, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white border border-stone-200 rounded-lg hover:border-[#84cc16] transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setAiTutTopic(topicItem);
                                showToast('Topik dimasukkan ke kolom input.');
                              }}
                              className="text-left text-xs font-medium text-stone-800 hover:text-stone-950 flex-1 cursor-pointer"
                            >
                              {idx + 1}. {topicItem}
                            </button>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setAiTutTopic(topicItem)}
                                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] font-semibold cursor-pointer"
                              >
                                Pakai Topik
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAiTutTopic(topicItem);
                                  handleGenerateAiTutorial(topicItem);
                                }}
                                className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                              >
                                Buat Langsung
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Auto-Publish Mode Toggle */}
                <div className="p-4 rounded-xl bg-stone-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#84cc16] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Mode Otomatis Penuh: Generate &rarr; Langsung Posting ke Website Live</span>
                    </div>
                    <p className="text-[11px] text-stone-300">
                      Jika aktif, AI akan langsung menyusun tutorial dan menerbitkannya otomatis ke Supabase &amp; menu Tutorial IT (topik boleh dikosongkan agar dipilih AI secara otomatis).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiTutAutoPublish((v) => !v)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-colors ${
                      aiTutAutoPublish
                        ? 'bg-[#84cc16] text-stone-950 hover:bg-[#a3e635]'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700'
                    }`}
                  >
                    {aiTutAutoPublish ? 'Auto-Publish: AKTIF' : 'Auto-Publish: Nonaktif (Pratinjau Saja)'}
                  </button>
                </div>

                {/* Automatic Thumbnail Toggle */}
                <div className="px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-stone-800">
                    <ImageIcon className="w-4 h-4 text-[#65a30d] shrink-0" />
                    <span>
                      <strong className="text-stone-950">AI Automatic Thumbnail Generator (1280×720 Gratis):</strong>{' '}
                      otomatis menganalisis isi tutorial &amp; membuat thumbnail relevan tanpa menulis prompt.
                    </span>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-stone-900 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={aiTutThumbAuto}
                      onChange={(e) => setAiTutThumbAuto(e.target.checked)}
                      className="rounded border-stone-300 text-stone-900 focus:ring-[#84cc16]"
                    />
                    <span>{aiTutThumbAuto ? 'Aktif Otomatis' : 'Nonaktif'}</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                    <span>
                      Topik / Masalah IT {aiTutAutoPublish ? '(Opsional — Kosongkan untuk Pilih Otomatis AI)' : '*'}
                    </span>
                    <span className="text-[11px] text-stone-400 font-normal">
                      Contoh: Perbaikan BSOD, konfigurasi router, perakitan PC, partisi hard disk
                    </span>
                  </label>
                  <input
                    type="text"
                    value={aiTutTopic}
                    onChange={(e) => setAiTutTopic(e.target.value)}
                    placeholder="Ketik topik, atau biarkan kosong lalu klik tombol di bawah untuk Auto-Pick + Posting..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#84cc16] focus:border-transparent transition-all"
                  />
                </div>

                {/* Preset Suggestions */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Atau Pilih Contoh Topik Populer:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tutorialPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAiTutTopic(preset);
                          void handleGenerateAiTutorial(preset);
                        }}
                        className="text-xs text-left px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md border border-stone-200 transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    disabled={aiTutLoading || (!aiTutAutoPublish && !aiTutTopic.trim())}
                    onClick={() => void handleGenerateAiTutorial()}
                    className="flex-1 py-3 px-4 bg-[#84cc16] hover:bg-[#a3e635] disabled:bg-stone-300 text-stone-950 font-extrabold rounded-lg text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    {aiTutLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                        <span>{aiTutStatusText || 'Memproses Otomatisasi Tutorial AI...'}</span>
                      </>
                    ) : aiTutAutoPublish ? (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>
                          {aiTutTopic.trim()
                            ? 'Generate & Posting Otomatis ke Website (Gratis)'
                            : 'Pilih Topik Otomatis + Generate + Posting Live (Gratis)'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Buat Pratinjau Tutorial AI (Gratis)</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ai-schedule')}
                    className="px-4 py-3 bg-stone-950 hover:bg-stone-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
                  >
                    <CalendarClock className="w-4 h-4 text-[#84cc16]" />
                    <span>Atur Auto-Pilot Berkala</span>
                  </button>
                </div>

                {aiTutPublishedNotice && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <div className="font-bold">Berhasil Diposting Otomatis ke Supabase &amp; Website Live!</div>
                        <div className="text-emerald-800 mt-0.5">
                          Tutorial <span className="font-semibold">&ldquo;{aiTutPublishedNotice}&rdquo;</span> sudah tayang di halaman publik Tutorial IT.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('tutorials')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Lihat di Daftar Tutorial &rarr;
                    </button>
                  </div>
                )}
              </div>

              {/* Generated Tutorial Preview */}
              {aiTutResult && (
                <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6 shadow-md animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#65a30d] uppercase tracking-wide">
                        <Check className="w-3.5 h-3.5" />
                        Pratinjau Output Master Prompt Dokumentasi Teknis (18 Format)
                      </span>
                      <h2 className="text-xl font-extrabold text-stone-950">{aiTutResult.title}</h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-mono">
                        <span>{aiTutResult.category}</span>
                        <span>·</span>
                        <span>Tingkat: {aiTutResult.difficulty}</span>
                        <span>·</span>
                        <span>Estimasi: {aiTutResult.readTimeMinutes} menit</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyFullTutorialPackage}
                        className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer border border-stone-200"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin 18 Format Dokumentasi</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSaveAiTutorial('now')}
                        className="px-5 py-2.5 bg-[#84cc16] hover:bg-[#a3e635] text-stone-950 font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-transform hover:scale-105"
                      >
                        <Check className="w-4 h-4" />
                        <span>Terbitkan Sekarang</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Automatic Thumbnail Generator Panel inside Tutorial Preview */}
                  <AiThumbnailGeneratorPanel
                    contentType="tutorial"
                    title={aiTutResult.title}
                    slug={aiTutResult.slug}
                    currentThumbnail={aiTutResult.thumbnail}
                    autoEnabled={aiTutThumbAuto}
                    onToggleAuto={setAiTutThumbAuto}
                    result={aiTutThumbResult}
                    isGenerating={aiTutThumbLoading}
                    errorMessage={aiTutThumbError}
                    showHeadlineOverlay={aiTutThumbShowHeadline}
                    onChangeShowHeadlineOverlay={setAiTutThumbShowHeadline}
                    format={aiTutThumbFormat}
                    onChangeFormat={setAiTutThumbFormat}
                    onGenerateRequested={(opts) => void handleGenerateTutorialThumbnail(aiTutResult, opts)}
                    onApplyThumbnail={(dataUrl, altText, meta) => {
                      setAiTutResult((prev) =>
                        prev
                          ? {
                              ...prev,
                              thumbnail: dataUrl,
                              imageAltText: altText || prev.imageAltText,
                              thumbnailHeadline: meta?.headline || prev.thumbnailHeadline,
                              thumbnailVisualConcept: meta?.visualConcept || prev.thumbnailVisualConcept
                            }
                          : prev
                      );
                      showToast('Thumbnail AI 1280×720 dipasang ke tutorial ini!');
                    }}
                    isApplied={
                      Boolean(aiTutThumbResult?.imageDataUrl) &&
                      aiTutResult.thumbnail === aiTutThumbResult?.imageDataUrl
                    }
                  />

                  {/* 1-5 SEO Metadata Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">1. SEO Title</div>
                      <div className="font-bold text-stone-950">{aiTutResult.seoTitle || aiTutResult.title}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">5. URL Slug</div>
                      <div className="font-mono text-[#4d7c0f] break-all">/tutorial/{aiTutResult.slug}</div>
                    </div>
                    <div className="md:col-span-2 space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        2. Meta Description ({(aiTutResult.metaDescription || aiTutResult.summary).length} karakter)
                      </div>
                      <div className="text-stone-700">{aiTutResult.metaDescription || aiTutResult.summary}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">3. Focus Keyword</div>
                      <div className="font-semibold text-stone-900">{aiTutResult.focusKeyword || aiTutResult.title}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">4. Supporting Keywords</div>
                      <div className="text-stone-700">{(aiTutResult.supportingKeywords || []).join(', ') || '-'}</div>
                    </div>
                  </div>

                  {/* 6. Pendahuluan & 7. Tujuan */}
                  {aiTutResult.introduction && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">6. Pendahuluan (EYD V)</div>
                      <p className="text-xs sm:text-sm text-stone-800 leading-relaxed bg-stone-50 p-4 rounded-lg border-l-4 border-[#84cc16]">
                        {aiTutResult.introduction}
                      </p>
                    </div>
                  )}

                  {aiTutResult.objectives && aiTutResult.objectives.length > 0 && (
                    <div className="p-4 bg-[#84cc16]/10 border border-[#84cc16]/35 rounded-lg space-y-1.5">
                      <div className="text-xs font-bold text-stone-950">7. Tujuan Tutorial:</div>
                      <ul className="text-xs text-stone-800 list-disc list-inside space-y-0.5">
                        {aiTutResult.objectives.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 8. Prerequisites, Optional, System Req and Tools */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                      <span className="text-xs font-bold text-stone-800 uppercase">8. Persyaratan Wajib &amp; Opsional:</span>
                      <ul className="text-xs text-stone-700 space-y-1 list-disc list-inside">
                        {aiTutResult.prerequisites.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                      {aiTutResult.optionalPrerequisites && aiTutResult.optionalPrerequisites.length > 0 && (
                        <div className="pt-2 border-t border-stone-200 space-y-1">
                          <span className="text-[11px] font-semibold text-stone-600">Opsional:</span>
                          <ul className="text-[11px] text-stone-600 list-disc list-inside space-y-0.5">
                            {aiTutResult.optionalPrerequisites.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                      <span className="text-xs font-bold text-stone-800 uppercase">Kebutuhan Sistem &amp; Tools:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {aiTutResult.toolsNeeded.map((t, i) => (
                          <span key={i} className="text-[11px] bg-white border border-stone-200 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                      {aiTutResult.systemRequirements && (
                        <div className="text-[11px] text-stone-600 space-y-0.5 pt-2 border-t border-stone-200">
                          <div>OS: {aiTutResult.systemRequirements.os}</div>
                          <div>Perangkat: {aiTutResult.systemRequirements.hardware}</div>
                          <div>Akses: {aiTutResult.systemRequirements.access}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Risk warning */}
                  {aiTutResult.riskWarning && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-0.5">
                        <div className="font-bold text-amber-900">{aiTutResult.riskWarning.title}</div>
                        <div className="text-amber-800">{aiTutResult.riskWarning.message}</div>
                      </div>
                    </div>
                  )}

                  {/* 9. Gambaran Proses */}
                  {aiTutResult.processOverview && (
                    <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-stone-900 uppercase">9. Gambaran Proses:</div>
                      <p className="text-stone-700 leading-relaxed">{aiTutResult.processOverview}</p>
                    </div>
                  )}

                  {/* 10. Steps preview */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                      10. Langkah-Langkah Pengerjaan ({aiTutResult.steps.length} Langkah):
                    </h3>
                    <div className="space-y-3">
                      {aiTutResult.steps.map((st) => (
                        <div key={st.stepNumber} className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center">
                              {st.stepNumber}
                            </span>
                            <span className="font-bold text-xs text-stone-900">{st.title}</span>
                          </div>
                          {st.objective && (
                            <div className="text-[11px] text-stone-600 pl-8">
                              <span className="font-semibold text-stone-800">Tujuan:</span> {st.objective}
                            </div>
                          )}
                          <p className="text-xs text-stone-700 pl-8 leading-relaxed">{st.description}</p>
                          {st.actions && st.actions.length > 0 && (
                            <ol className="pl-12 text-xs text-stone-700 list-decimal space-y-0.5">
                              {st.actions.map((act, aIdx) => (
                                <li key={aIdx}>{act}</li>
                              ))}
                            </ol>
                          )}
                          {st.codeSnippet && st.codeSnippet.code && (
                            <div className="ml-8 p-3 bg-stone-900 text-[#84cc16] rounded-md font-mono text-xs overflow-x-auto flex items-center justify-between gap-2">
                              <pre className="whitespace-pre-wrap">{st.codeSnippet.code}</pre>
                              <span className="text-[10px] text-stone-400 font-sans shrink-0">{st.codeSnippet.language}</span>
                            </div>
                          )}
                          {st.expectedResult && (
                            <div className="ml-8 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2.5 py-1.5">
                              <span className="font-semibold">Hasil diharapkan:</span> {st.expectedResult}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 11. Panduan Screenshot & 12. Verifikasi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
                      <div className="font-bold text-stone-900 uppercase">11. Panduan Screenshot Opsional:</div>
                      {aiTutResult.screenshotRecommendations && aiTutResult.screenshotRecommendations.length > 0 ? (
                        <ul className="space-y-1.5 text-stone-700">
                          {aiTutResult.screenshotRecommendations.map((s) => (
                            <li key={s.figureNumber}>
                              <span className="font-semibold text-stone-900">Gambar {s.figureNumber}:</span> {s.title} — {s.screenArea}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-stone-500">Opsional sesuai kebutuhan gambar pendukung.</div>
                      )}
                    </div>

                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-2">
                      <div className="font-bold text-emerald-950 uppercase">12. Hasil Akhir &amp; Cara Verifikasi:</div>
                      <p className="text-emerald-900">{aiTutResult.verification?.summary || '-'}</p>
                      {aiTutResult.verification?.indicators && aiTutResult.verification.indicators.length > 0 && (
                        <ul className="list-disc list-inside text-emerald-900 space-y-0.5">
                          {aiTutResult.verification.indicators.map((ind, i) => (
                            <li key={i}>{ind}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* 13. Troubleshooting Table & 14. Tips/Security */}
                  {aiTutResult.troubleshootingTips.length > 0 && (
                    <div className="space-y-2 text-xs">
                      <div className="font-bold text-stone-900 uppercase">13. Tabel Troubleshooting:</div>
                      <div className="overflow-x-auto border border-stone-200 rounded-lg">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-stone-100 text-stone-800">
                            <tr>
                              <th className="p-2.5 font-bold">Permasalahan</th>
                              <th className="p-2.5 font-bold">Kemungkinan Penyebab</th>
                              <th className="p-2.5 font-bold">Solusi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-200 bg-white">
                            {aiTutResult.troubleshootingTips.map((t, i) => (
                              <tr key={i} className="align-top">
                                <td className="p-2.5 font-semibold text-stone-900">{t.issue}</td>
                                <td className="p-2.5 text-stone-600">{t.cause || '-'}</td>
                                <td className="p-2.5 text-stone-700">{t.resolution}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {aiTutResult.tipsAndRecommendations && (
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-2">
                      <div className="font-bold text-stone-900 uppercase">14. Tips, Kesalahan Umum &amp; Keamanan:</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <div className="font-semibold text-stone-800 mb-1">Praktik Terbaik</div>
                          <ul className="list-disc list-inside text-stone-600 space-y-0.5">
                            {aiTutResult.tipsAndRecommendations.bestPractices.map((x, i) => (
                              <li key={i}>{x}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="font-semibold text-stone-800 mb-1">Hindari Kesalahan</div>
                          <ul className="list-disc list-inside text-stone-600 space-y-0.5">
                            {aiTutResult.tipsAndRecommendations.avoidMistakes.map((x, i) => (
                              <li key={i}>{x}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="font-semibold text-stone-800 mb-1">Tips Keamanan</div>
                          <ul className="list-disc list-inside text-stone-600 space-y-0.5">
                            {aiTutResult.tipsAndRecommendations.securityTips.map((x, i) => (
                              <li key={i}>{x}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 15. FAQ & 16. Conclusion */}
                  {aiTutResult.faqs.length > 0 && (
                    <div className="space-y-2 text-xs">
                      <div className="font-bold text-stone-900 uppercase">15. FAQ ({aiTutResult.faqs.length} Pertanyaan):</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {aiTutResult.faqs.map((faq, i) => (
                          <div key={i} className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1">
                            <div className="font-bold text-stone-900">{faq.question}</div>
                            <p className="text-[11px] text-stone-600">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-stone-900 text-white rounded-lg space-y-1">
                    <div className="text-[10px] font-bold text-[#84cc16] uppercase">16. Kesimpulan:</div>
                    <p className="text-xs text-stone-200 leading-relaxed">{aiTutResult.conclusion}</p>
                  </div>

                  {/* 17. References & 18. Internal Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">17. Referensi Resmi</div>
                      {aiTutResult.references && aiTutResult.references.length > 0 ? (
                        <ul className="space-y-1 text-stone-700 list-disc list-inside">
                          {aiTutResult.references.map((r, i) => (
                            <li key={i}>
                              <span className="font-semibold">{r.title}</span>
                              {r.publisher ? ` — ${r.publisher}` : ''}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-stone-500">Dokumentasi resmi sistem operasi / vendor terkait.</div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">18. Rekomendasi Internal Linking</div>
                      {aiTutResult.internalLinkingSuggestions && aiTutResult.internalLinkingSuggestions.length > 0 ? (
                        <ul className="space-y-1 text-stone-700 list-disc list-inside">
                          {aiTutResult.internalLinkingSuggestions.map((l, i) => (
                            <li key={i}>
                              <span className="font-semibold">{l.anchorText}</span> ({l.targetPath})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-stone-500">/services, /articles, /contact</div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Save / Schedule Action */}
                  <div className="pt-4 border-t border-stone-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg p-2.5">
                      <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5 shrink-0">
                        <CalendarClock className="w-3.5 h-3.5 text-[#65a30d]" />
                        Jadwal Tayang:
                      </span>
                      <input
                        type="datetime-local"
                        value={aiTutScheduleAt}
                        onChange={(e) => setAiTutScheduleAt(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs font-mono text-stone-900"
                      />
                      <button
                        type="button"
                        onClick={() => void handleSaveAiTutorial('schedule')}
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>Jadwalkan Posting</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleSaveAiTutorial('now')}
                      className="px-6 py-2.5 bg-stone-950 hover:bg-stone-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
                    >
                      <Check className="w-4 h-4 text-[#84cc16]" />
                      <span>Simpan &amp; Terbitkan Sekarang</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 3. AI GENERATOR: ARTIKEL IT */}
          {/* ==================================================== */}
          {activeTab === 'ai-article' && (
            <div className="space-y-6">
              <div className="space-y-1 border-b border-stone-200 pb-5">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#65a30d] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Penyusunan Konten Opini & Wawasan Teknologi
                </div>
                <h1 className="text-2xl font-extrabold text-stone-950 tracking-tight">
                  Generator Artikel IT Otomatis (Gratis)
                </h1>
                <p className="text-xs text-stone-600 max-w-3xl">
                  Fitur ini menyusun artikel edukatif, komparasi hardware, analisis tren keamanan siber, dan
                  pembahasan arsitektur IT secara otomatis dan berbobot. Artikel yang telah dibuat akan langsung tersimpan
                  dan dapat dibaca di menu <span className="font-bold text-stone-900">Artikel</span>.
                </p>
              </div>

              {/* Form Input Box */}
              <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-5 shadow-xs">
                {/* Configuration Options (Select Category First) */}
                <div className="space-y-4 pb-4 border-b border-stone-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700">Kategori Artikel</label>
                      <select
                        value={aiArtCategory}
                        onChange={(e) => {
                          setAiArtCategory(e.target.value as ArticleCategory);
                          setAiArtSuggestedTopics([]);
                        }}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#84cc16]"
                      >
                        <option value="Tren Teknologi">Tren Teknologi</option>
                        <option value="Perangkat Keras & Gadget">Perangkat Keras &amp; Gadget</option>
                        <option value="Keamanan Siber">Keamanan Siber</option>
                        <option value="Sistem Operasi & Software">Sistem Operasi &amp; Software</option>
                        <option value="Produktivitas IT">Produktivitas IT</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700">Penulis Artikel</label>
                      <input
                        type="text"
                        disabled
                        value={profile.name}
                        className="w-full px-3 py-2.5 bg-stone-100 border border-stone-200 rounded-lg text-xs text-stone-600"
                      />
                    </div>
                  </div>

                  {/* Collapsible Master Prompt SEO Input Settings */}
                  <div className="rounded-xl border border-stone-200 bg-stone-50/70 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setAiArtShowAdvanced((v) => !v)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-[#65a30d]" />
                        <span>Parameter Master Prompt SEO &amp; Editorial (EYD V · E-E-A-T — Opsional)</span>
                      </span>
                      <span className="text-[11px] font-semibold text-[#65a30d]">
                        {aiArtShowAdvanced ? 'Tutup Pengaturan' : 'Atur Detail SEO'}
                      </span>
                    </button>

                    {aiArtShowAdvanced && (
                      <div className="p-4 pt-2 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-stone-600">Target Pembaca</label>
                          <select
                            value={aiArtAudience}
                            onChange={(e) => setAiArtAudience(e.target.value)}
                            className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                          >
                            <option value="Umum, Pemula & Praktisi IT">Umum &amp; Pemula</option>
                            <option value="Profesional & Administrator IT">Profesional IT</option>
                            <option value="Pemilik Bisnis & UMKM">UMKM / Bisnis</option>
                            <option value="Mahasiswa & Developer Pemula">Khusus / Teknis</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-stone-600">Tujuan Artikel</label>
                          <select
                            value={aiArtGoal}
                            onChange={(e) => setAiArtGoal(e.target.value)}
                            className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                          >
                            <option value="Edukasi & Informasi Praktis">Edukasi</option>
                            <option value="Informasi Objektif & Referensi">Informasi</option>
                            <option value="Analisis Mendalam & Solusi">Analisis</option>
                            <option value="Tutorial Langkah Terstruktur">Tutorial</option>
                            <option value="Review & Perbandingan Produk">Review</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-stone-600">Jenis Artikel</label>
                          <select
                            value={aiArtType}
                            onChange={(e) => setAiArtType(e.target.value)}
                            className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                          >
                            <option value="Artikel Website / Blog Profesional">Blog / Website</option>
                            <option value="Artikel Analisis & Opini Terukur">Opini / Analisis</option>
                            <option value="Review Perbandingan Teknologi">Review</option>
                            <option value="Panduan Tutorial Informatif">Tutorial</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-stone-600">Panjang Artikel</label>
                          <select
                            value={aiArtWordCount}
                            onChange={(e) => setAiArtWordCount(e.target.value)}
                            className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                          >
                            <option value="800 Kata">800 Kata</option>
                            <option value="1.000 - 1.500 Kata">1.000 - 1.500 Kata</option>
                            <option value="1.500 - 2.000+ Kata">1.500 - 2.000+ Kata</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-stone-600">Judul Artikel (Opsional)</label>
                          <input
                            type="text"
                            value={aiArtCustomTitle}
                            onChange={(e) => setAiArtCustomTitle(e.target.value)}
                            placeholder="Kosongkan agar AI menyusun SEO Title terbaik..."
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-stone-600">Keyword Utama (Opsional)</label>
                          <input
                            type="text"
                            value={aiArtFocusKeyword}
                            onChange={(e) => setAiArtFocusKeyword(e.target.value)}
                            placeholder="Misal: keamanan data UMKM, upgrade SSD NVMe..."
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-stone-600">Keyword Pendukung (pisahkan koma, opsional)</label>
                          <input
                            type="text"
                            value={aiArtSupportingKeywords}
                            onChange={(e) => setAiArtSupportingKeywords(e.target.value)}
                            placeholder="Misal: backup 3-2-1, proteksi ransomware, efisiensi kerja..."
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-stone-600">Referensi / URL Sumber (Opsional)</label>
                          <input
                            type="text"
                            value={aiArtReferences}
                            onChange={(e) => setAiArtReferences(e.target.value)}
                            placeholder="Misal: https://learn.microsoft.com/... atau sumber resmi..."
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category-Aware Topic Generator */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#65a30d]" />
                        <span>Generator Topik Artikel Sesuai Kategori ({aiArtCategory})</span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Klik tombol di kanan untuk menghasilkan 5 ide topik artikel segar sesuai kategori yang dipilih.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={aiArtTopicsLoading}
                      onClick={() => void handleGenerateArticleTopics()}
                      className="px-3.5 py-2 bg-[#84cc16] hover:bg-[#a3e635] disabled:opacity-60 text-stone-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                    >
                      {aiArtTopicsLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Menyusun Ide Topik...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>
                            {aiArtSuggestedTopics.length > 0 ? 'Generate Topik Lainnya' : 'Generate Topik Sesuai Kategori'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiArtSuggestedTopics.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-stone-200">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Pilih topik untuk dimasukkan ke input, atau klik &quot;Buat Langsung&quot;:
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {aiArtSuggestedTopics.map((topicItem, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white border border-stone-200 rounded-lg hover:border-[#84cc16] transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setAiArtTopic(topicItem);
                                showToast('Topik artikel dimasukkan ke kolom input.');
                              }}
                              className="text-left text-xs font-medium text-stone-800 hover:text-stone-950 flex-1 cursor-pointer"
                            >
                              {idx + 1}. {topicItem}
                            </button>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setAiArtTopic(topicItem)}
                                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] font-semibold cursor-pointer"
                              >
                                Pakai Topik
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAiArtTopic(topicItem);
                                  handleGenerateAiArticle(topicItem);
                                }}
                                className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                              >
                                Buat Langsung
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Auto-Publish Mode Toggle */}
                <div className="p-4 rounded-xl bg-stone-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#84cc16] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Mode Otomatis Penuh: Generate &rarr; Langsung Posting ke Website Live</span>
                    </div>
                    <p className="text-[11px] text-stone-300">
                      Jika aktif, AI akan langsung menyusun artikel dan menerbitkannya otomatis ke Supabase &amp; menu Artikel (topik boleh dikosongkan agar dipilih AI secara otomatis).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiArtAutoPublish((v) => !v)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-colors ${
                      aiArtAutoPublish
                        ? 'bg-[#84cc16] text-stone-950 hover:bg-[#a3e635]'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700'
                    }`}
                  >
                    {aiArtAutoPublish ? 'Auto-Publish: AKTIF' : 'Auto-Publish: Nonaktif (Pratinjau Saja)'}
                  </button>
                </div>

                {/* Automatic Thumbnail Toggle */}
                <div className="px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-stone-800">
                    <ImageIcon className="w-4 h-4 text-[#65a30d] shrink-0" />
                    <span>
                      <strong className="text-stone-950">AI Automatic Thumbnail Generator (1280×720 Gratis):</strong>{' '}
                      otomatis menganalisis isi artikel &amp; membuat thumbnail relevan tanpa menulis prompt.
                    </span>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-stone-900 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={aiArtThumbAuto}
                      onChange={(e) => setAiArtThumbAuto(e.target.checked)}
                      className="rounded border-stone-300 text-stone-900 focus:ring-[#84cc16]"
                    />
                    <span>{aiArtThumbAuto ? 'Aktif Otomatis' : 'Nonaktif'}</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                    <span>
                      Topik / Tema Artikel IT {aiArtAutoPublish ? '(Opsional — Kosongkan untuk Pilih Otomatis AI)' : '*'}
                    </span>
                    <span className="text-[11px] text-stone-400 font-normal">
                      Contoh: AI dalam IT Support, SSD vs NVMe, Proteksi Ransomware, Windows 11 LTSC
                    </span>
                  </label>
                  <input
                    type="text"
                    value={aiArtTopic}
                    onChange={(e) => setAiArtTopic(e.target.value)}
                    placeholder="Ketik topik, atau biarkan kosong lalu klik tombol di bawah untuk Auto-Pick + Posting..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#84cc16] focus:border-transparent transition-all"
                  />
                </div>

                {/* Preset Suggestions */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Atau Pilih Contoh Topik Populer:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {articlePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAiArtTopic(preset);
                          void handleGenerateAiArticle(preset);
                        }}
                        className="text-xs text-left px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md border border-stone-200 transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    disabled={aiArtLoading || (!aiArtAutoPublish && !aiArtTopic.trim())}
                    onClick={() => void handleGenerateAiArticle()}
                    className="flex-1 py-3 px-4 bg-[#84cc16] hover:bg-[#a3e635] disabled:bg-stone-300 text-stone-950 font-extrabold rounded-lg text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    {aiArtLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                        <span>{aiArtStatusText || 'Memproses Otomatisasi Artikel AI...'}</span>
                      </>
                    ) : aiArtAutoPublish ? (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>
                          {aiArtTopic.trim()
                            ? 'Generate & Posting Otomatis ke Website (Gratis)'
                            : 'Pilih Topik Otomatis + Generate + Posting Live (Gratis)'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Buat Pratinjau Artikel AI (Gratis)</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ai-schedule')}
                    className="px-4 py-3 bg-stone-950 hover:bg-stone-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
                  >
                    <CalendarClock className="w-4 h-4 text-[#84cc16]" />
                    <span>Atur Auto-Pilot Berkala</span>
                  </button>
                </div>

                {aiArtPublishedNotice && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <div className="font-bold">Berhasil Diposting Otomatis ke Supabase &amp; Website Live!</div>
                        <div className="text-emerald-800 mt-0.5">
                          Artikel <span className="font-semibold">&ldquo;{aiArtPublishedNotice}&rdquo;</span> sudah tayang di halaman publik Artikel IT.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('articles')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Lihat di Daftar Artikel &rarr;
                    </button>
                  </div>
                )}
              </div>

              {/* Generated Article Preview */}
              {aiArtResult && (
                <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6 shadow-md animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#65a30d] uppercase tracking-wide">
                        <Check className="w-3.5 h-3.5" />
                        Pratinjau Output Master Prompt SEO Content Specialist
                      </span>
                      <h2 className="text-xl font-extrabold text-stone-950">{aiArtResult.title}</h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-mono">
                        <span>{aiArtResult.category}</span>
                        <span>·</span>
                        <span>{aiArtResult.readTimeMinutes} menit baca</span>
                        <span>·</span>
                        <span>Penulis: {aiArtResult.author}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyFullArticlePackage}
                        className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer border border-stone-200"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin 12 Format SEO</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSaveAiArticle('now')}
                        className="px-5 py-2.5 bg-[#84cc16] hover:bg-[#a3e635] text-stone-950 font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-transform hover:scale-105"
                      >
                        <Check className="w-4 h-4" />
                        <span>Terbitkan Sekarang</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Automatic Thumbnail Generator Panel inside Article Preview */}
                  <AiThumbnailGeneratorPanel
                    contentType="article"
                    title={aiArtResult.title}
                    slug={aiArtResult.slug}
                    currentThumbnail={aiArtResult.thumbnail}
                    autoEnabled={aiArtThumbAuto}
                    onToggleAuto={setAiArtThumbAuto}
                    result={aiArtThumbResult}
                    isGenerating={aiArtThumbLoading}
                    errorMessage={aiArtThumbError}
                    showHeadlineOverlay={aiArtThumbShowHeadline}
                    onChangeShowHeadlineOverlay={setAiArtThumbShowHeadline}
                    format={aiArtThumbFormat}
                    onChangeFormat={setAiArtThumbFormat}
                    onGenerateRequested={(opts) => void handleGenerateArticleThumbnail(aiArtResult, opts)}
                    onApplyThumbnail={(dataUrl, altText, meta) => {
                      setAiArtResult((prev) =>
                        prev
                          ? {
                              ...prev,
                              thumbnail: dataUrl,
                              imageAltText: altText || prev.imageAltText,
                              thumbnailHeadline: meta?.headline || prev.thumbnailHeadline,
                              thumbnailVisualConcept: meta?.visualConcept || prev.thumbnailVisualConcept
                            }
                          : prev
                      );
                      showToast('Thumbnail AI 1280×720 dipasang ke artikel ini!');
                    }}
                    isApplied={
                      Boolean(aiArtThumbResult?.imageDataUrl) &&
                      aiArtResult.thumbnail === aiArtThumbResult?.imageDataUrl
                    }
                  />

                  {/* 1-5 SEO Metadata Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">1. SEO Title</div>
                      <div className="font-bold text-stone-950">{aiArtResult.seoTitle || aiArtResult.title}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">5. URL Slug</div>
                      <div className="font-mono text-[#4d7c0f] break-all">/article/{aiArtResult.slug}</div>
                    </div>
                    <div className="md:col-span-2 space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        2. Meta Description ({(aiArtResult.metaDescription || aiArtResult.summary).length} karakter)
                      </div>
                      <div className="text-stone-700">{aiArtResult.metaDescription || aiArtResult.summary}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">3. Focus Keyword</div>
                      <div className="font-semibold text-stone-900">{aiArtResult.focusKeyword || aiArtResult.title}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">4. Supporting Keywords</div>
                      <div className="text-stone-700">
                        {(aiArtResult.supportingKeywords || aiArtResult.tags || []).join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Introduction */}
                  {aiArtResult.introduction && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        6. Pendahuluan Artikel (EYD V)
                      </div>
                      <p className="text-xs sm:text-sm text-stone-800 leading-relaxed bg-stone-50 p-4 rounded-lg border-l-4 border-[#84cc16]">
                        {aiArtResult.introduction}
                      </p>
                    </div>
                  )}

                  {/* Sections (H2 + H3 + Bullets) */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                      Pembahasan Utama ({aiArtResult.sections.length} Bagian H2):
                    </h3>
                    <div className="space-y-4">
                      {aiArtResult.sections.map((sec, idx) => (
                        <div key={idx} className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-2.5">
                          <h4 className="font-bold text-xs sm:text-sm text-stone-950">H2: {sec.heading}</h4>
                          <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">{sec.body}</p>
                          {sec.subSections && sec.subSections.length > 0 && (
                            <div className="pl-3 border-l-2 border-stone-300 space-y-2">
                              {sec.subSections.map((sub, subIdx) => (
                                <div key={subIdx} className="space-y-0.5">
                                  <div className="text-xs font-bold text-stone-800">H3: {sub.subHeading}</div>
                                  <p className="text-xs text-stone-600 leading-relaxed">{sub.body}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                            <ul className="list-disc list-inside text-xs text-stone-700 space-y-0.5">
                              {sec.bulletPoints.map((bp, bIdx) => (
                                <li key={bIdx}>{bp}</li>
                              ))}
                            </ul>
                          )}
                          {sec.highlight && (
                            <div className="p-2.5 bg-white border-l-2 border-l-[#84cc16] text-[11px] italic text-stone-800 rounded">
                              &ldquo;{sec.highlight}&rdquo;
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practical Insights */}
                  {aiArtResult.practicalInsights && aiArtResult.practicalInsights.items?.length > 0 && (
                    <div className="p-4 bg-[#84cc16]/10 border border-[#84cc16]/40 rounded-lg space-y-2">
                      <div className="text-xs font-bold text-stone-950">{aiArtResult.practicalInsights.title}</div>
                      <ul className="space-y-1 text-xs text-stone-800 list-disc list-inside">
                        {aiArtResult.practicalInsights.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 7. FAQ */}
                  {aiArtResult.faqs && aiArtResult.faqs.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-stone-800">
                        7. FAQ ({aiArtResult.faqs.length} Pertanyaan Umum):
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {aiArtResult.faqs.map((faq, i) => (
                          <div key={i} className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1">
                            <div className="text-xs font-bold text-stone-900">{faq.question}</div>
                            <p className="text-[11px] text-stone-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 8. Conclusion */}
                  {aiArtResult.conclusion && (
                    <div className="p-4 bg-stone-900 text-white rounded-lg space-y-1">
                      <div className="text-[10px] font-bold text-[#84cc16] uppercase">8. Kesimpulan:</div>
                      <p className="text-xs text-stone-200 leading-relaxed">{aiArtResult.conclusion}</p>
                    </div>
                  )}

                  {/* 9-12 References, Internal Links, Image Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        9. Referensi &amp; Sumber
                      </div>
                      {aiArtResult.references && aiArtResult.references.length > 0 ? (
                        <ul className="space-y-1 text-stone-700 list-disc list-inside">
                          {aiArtResult.references.map((r, i) => (
                            <li key={i}>
                              <span className="font-semibold">{r.title}</span>
                              {r.publisher ? ` — ${r.publisher}` : ''}
                              {r.url ? ` (${r.url})` : ''}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-stone-500">Mengacu pada dokumentasi standar resmi terkait topik.</div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        10. Rekomendasi Internal Linking
                      </div>
                      {aiArtResult.internalLinkingSuggestions && aiArtResult.internalLinkingSuggestions.length > 0 ? (
                        <ul className="space-y-1 text-stone-700 list-disc list-inside">
                          {aiArtResult.internalLinkingSuggestions.map((link, i) => (
                            <li key={i}>
                              <span className="font-semibold">{link.anchorText}</span> ({link.targetPath})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-stone-500">/services, /tutorials, /contact</div>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        11. Rekomendasi Featured Image
                      </div>
                      <div className="text-stone-700">{aiArtResult.featuredImageRecommendation || '-'}</div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        12. Alt Text Gambar
                      </div>
                      <div className="text-stone-700">{aiArtResult.imageAltText || aiArtResult.title}</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {aiArtResult.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Bottom Save / Schedule Action */}
                  <div className="pt-4 border-t border-stone-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg p-2.5">
                      <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5 shrink-0">
                        <CalendarClock className="w-3.5 h-3.5 text-[#65a30d]" />
                        Jadwal Tayang:
                      </span>
                      <input
                        type="datetime-local"
                        value={aiArtScheduleAt}
                        onChange={(e) => setAiArtScheduleAt(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs font-mono text-stone-900"
                      />
                      <button
                        type="button"
                        onClick={() => void handleSaveAiArticle('schedule')}
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>Jadwalkan Posting</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleSaveAiArticle('now')}
                      className="px-6 py-2.5 bg-stone-950 hover:bg-stone-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
                    >
                      <Check className="w-4 h-4 text-[#84cc16]" />
                      <span>Simpan &amp; Terbitkan Sekarang</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 3.5. AI AUTO SCHEDULE POSTING TAB */}
          {/* ==================================================== */}
          {activeTab === 'ai-schedule' && (
            <AiSchedulePanel
              tutorials={tutorials}
              articles={articles}
              profileName={profile.name || 'Risa Kurniawan'}
              nowTick={nowTick}
              aiAutopilot={aiAutopilot}
              isRunningAutopilot={isRunningAutopilot}
              onUpdateAiAutopilot={updateAiAutopilot}
              onRunAutopilotNow={runAutopilotNow}
              onNotify={showToast}
              onAddTutorial={addTutorial}
              onUpdateTutorial={updateTutorial}
              onDeleteTutorial={deleteTutorial}
              onAddArticle={addArticle}
              onUpdateArticle={updateArticle}
              onDeleteArticle={deleteArticle}
              onEditTutorial={(t) => {
                setSelectedTutorial(t);
                setTutorialModalOpen(true);
              }}
              onEditArticle={(a) => {
                setSelectedArticle(a);
                setArticleModalOpen(true);
              }}
              onPersist={persistWithToast}
            />
          )}

          {/* ==================================================== */}
          {/* 4. PROJECTS MANAGEMENT TAB */}
          {/* ==================================================== */}
          {activeTab === 'projects' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                    Kelola Portofolio Website ({projects.length})
                  </h1>
                  <p className="text-xs text-stone-500">
                    Kelola daftar website dan aplikasi web yang pernah Anda buat untuk dipamerkan kepada klien dan pengunjung.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setProjectModalOpen(true);
                  }}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#84cc16]" />
                  <span>Tambah Portofolio Website</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Cari website berdasarkan judul, kategori, atau status..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto shadow-2xs">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Nama Website</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Tahun</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Featured</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredProjects.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900">{p.title}</div>
                          <div className="text-[11px] text-stone-400 font-mono">{p.slug}</div>
                        </td>
                        <td className="py-3 px-4 text-stone-600">{p.category}</td>
                        <td className="py-3 px-4 font-mono text-stone-600">{p.year}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              p.status === 'Selesai'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {p.isFeatured ? (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500 mx-auto" />
                          ) : (
                            <span className="text-stone-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedProject(p);
                              setProjectModalOpen(true);
                            }}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
                            title="Edit Proyek"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmTarget({ kind: 'project', item: p })}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded cursor-pointer"
                            title="Hapus Proyek"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 4.5. SERVICES MANAGEMENT TAB */}
          {/* ==================================================== */}
          {activeTab === 'services' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                    Kelola Jasa Layanan IT & Solusi Digital ({services.length})
                  </h1>
                  <p className="text-xs text-stone-500">
                    Tambah penawaran jasa baru, sesuaikan estimasi harga, durasi pengerjaan, dan kelola ketersediaan layanan.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedService(null);
                    setServiceModalOpen(true);
                  }}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#84cc16]" />
                  <span>Tambah Jasa Baru</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder="Cari jasa berdasarkan nama, kategori, audiens..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto shadow-2xs">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Nama Layanan</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Biaya Mulai</th>
                      <th className="py-3 px-4">Pengerjaan</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Populer</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredServices.map((s) => (
                      <tr key={s.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded bg-stone-100 text-stone-800">
                              <Briefcase className="w-3.5 h-3.5 text-stone-700" />
                            </span>
                            <div>
                              <div className="font-bold text-stone-900">{s.title}</div>
                              <div className="text-[11px] text-stone-400 font-mono">{s.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-stone-600">
                          <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                            {s.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-stone-900">
                          {s.priceStartingFrom}
                        </td>
                        <td className="py-3 px-4 text-stone-600">
                          <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {s.turnaroundTime}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              updateService(s.id, { isActive: !s.isActive });
                              void persistWithToast(`Status layanan "${s.title}" berhasil diubah & disimpan ke Supabase.`);
                            }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              s.isActive !== false
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-stone-100 text-stone-400 border border-stone-200'
                            }`}
                            title="Klik untuk mengaktifkan/nonaktifkan"
                          >
                            {s.isActive !== false ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              updateService(s.id, { isPopular: !s.isPopular });
                              void persistWithToast(`Status populer layanan "${s.title}" berhasil diubah & disimpan ke Supabase.`);
                            }}
                            className="cursor-pointer"
                            title="Klik untuk toggle tanda Populer"
                          >
                            {s.isPopular ? (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500 mx-auto" />
                            ) : (
                              <span className="text-stone-300 hover:text-amber-400">☆</span>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedService(s);
                              setServiceModalOpen(true);
                            }}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
                            title="Edit Jasa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmTarget({ kind: 'service', item: s })}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded cursor-pointer"
                            title="Hapus Jasa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredServices.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-stone-400">
                          Tidak ditemukan layanan jasa yang cocok dengan pencarian Anda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 5. TUTORIALS MANAGEMENT TAB */}
          {/* ==================================================== */}
          {activeTab === 'tutorials' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                    Kelola Tutorial IT Support ({activeTutorials.length})
                  </h1>
                  <p className="text-xs text-stone-500">
                    Tambah panduan baru, perbarui langkah pengerjaan, atau hapus dari website live (tetap tersimpan aman di Supabase).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('ai-tutorial')}
                    className="px-3.5 py-2 bg-[#84cc16] hover:bg-[#a3e635] text-stone-950 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Buat via AI Otomatis</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTutorial(null);
                      setTutorialModalOpen(true);
                    }}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus className="w-4 h-4 text-[#84cc16]" />
                    <span>Tambah Manual</span>
                  </button>
                </div>
              </div>

              {/* Filter Mode & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="inline-flex items-center p-1 bg-stone-200/70 rounded-xl text-xs font-semibold self-start">
                  <button
                    type="button"
                    onClick={() => setTutorialViewMode('live')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      tutorialViewMode === 'live'
                        ? 'bg-white text-stone-950 shadow-2xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Tampil &amp; Terjadwal ({activeTutorials.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTutorialViewMode('archived')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      tutorialViewMode === 'archived'
                        ? 'bg-white text-stone-950 shadow-2xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Arsip Database ({archivedTutorials.length})</span>
                  </button>
                </div>

                <div className="relative max-w-md w-full sm:w-80">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tutorialSearch}
                    onChange={(e) => setTutorialSearch(e.target.value)}
                    placeholder="Cari tutorial berdasarkan judul, kategori, atau tingkat kesulitan..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              {tutorialViewMode === 'archived' && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Tutorial pada daftar arsip ini <strong>sudah dihapus dari website live</strong>, namun datanya tetap tersimpan aman di Supabase dan dapat dipulihkan ke live kapan saja.
                  </span>
                </div>
              )}

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto shadow-2xs">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Judul Tutorial</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Tingkat</th>
                      <th className="py-3 px-4">Durasi</th>
                      <th className="py-3 px-4">Status & Sumber</th>
                      <th className="py-3 px-4 text-center">Featured</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredTutorials.map((t) => (
                      <tr key={t.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900 max-w-sm truncate">{t.title}</div>
                          <div className="text-[11px] text-stone-400 font-mono">{t.slug}</div>
                        </td>
                        <td className="py-3 px-4 text-stone-600">{t.category}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[10px] bg-stone-100 text-stone-800 px-2 py-0.5 rounded">
                            {t.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-600">{t.readTimeMinutes} mnt</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {isContentArchived(t) ? (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-300"
                                title={
                                  t.removedFromLiveAt
                                    ? `Dihapus dari live: ${formatScheduleDateTime(t.removedFromLiveAt)}`
                                    : 'Tersimpan di arsip database Supabase'
                                }
                              >
                                <Archive className="w-2.5 h-2.5" />
                                Arsip DB (Non-Live)
                              </span>
                            ) : isContentPendingSchedule(t, nowTick) ? (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                                title={`Dijadwalkan tayang: ${formatScheduleDateTime(t.scheduledAt)}`}
                              >
                                <CalendarClock className="w-2.5 h-2.5" />
                                Terjadwal ({formatScheduleDateTime(t.scheduledAt)})
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Tayang
                              </span>
                            )}
                            {t.isAiGenerated ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#65a30d] bg-lime-50 px-2 py-0.5 rounded border border-lime-200">
                                <Sparkles className="w-2.5 h-2.5" />
                                AI
                              </span>
                            ) : (
                              <span className="text-[10px] text-stone-500 font-mono">Manual</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {t.isFeatured ? (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500 mx-auto" />
                          ) : (
                            <span className="text-stone-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTutorial(t);
                                setTutorialModalOpen(true);
                              }}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
                              title="Edit Tutorial"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {isContentArchived(t) ? (
                              <button
                                type="button"
                                onClick={() => {
                                  restoreTutorial(t.id);
                                  void persistWithToast(
                                    'Tutorial berhasil dipulihkan ke website live & Supabase!'
                                  );
                                }}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                                title="Pulihkan ke Website Live"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Pulihkan</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmTarget({ kind: 'tutorial', item: t })}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                title="Hapus dari Website Live (Tetap Tersimpan di Database)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredTutorials.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-stone-400">
                          {tutorialViewMode === 'archived'
                            ? 'Belum ada tutorial di arsip database.'
                            : 'Tidak ditemukan tutorial aktif yang cocok dengan pencarian Anda.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 6. ARTICLES MANAGEMENT TAB */}
          {/* ==================================================== */}
          {activeTab === 'articles' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                    Kelola Artikel IT &amp; Wawasan ({activeArticles.length})
                  </h1>
                  <p className="text-xs text-stone-500">
                    Tambah artikel baru, perbarui isi tulisan, atau hapus dari website live (tetap tersimpan aman di Supabase).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('ai-article')}
                    className="px-3.5 py-2 bg-[#84cc16] hover:bg-[#a3e635] text-stone-950 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Buat via AI Otomatis</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedArticle(null);
                      setArticleModalOpen(true);
                    }}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus className="w-4 h-4 text-[#84cc16]" />
                    <span>Tambah Manual</span>
                  </button>
                </div>
              </div>

              {/* Filter Mode & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="inline-flex items-center p-1 bg-stone-200/70 rounded-xl text-xs font-semibold self-start">
                  <button
                    type="button"
                    onClick={() => setArticleViewMode('live')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      articleViewMode === 'live'
                        ? 'bg-white text-stone-950 shadow-2xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Tampil &amp; Terjadwal ({activeArticles.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setArticleViewMode('archived')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      articleViewMode === 'archived'
                        ? 'bg-white text-stone-950 shadow-2xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Arsip Database ({archivedArticles.length})</span>
                  </button>
                </div>

                <div className="relative max-w-md w-full sm:w-80">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    placeholder="Cari artikel berdasarkan judul, topik, atau tag..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              {articleViewMode === 'archived' && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Artikel pada daftar arsip ini <strong>sudah dihapus dari website live</strong>, namun datanya tetap tersimpan aman di Supabase dan dapat dipulihkan ke live kapan saja.
                  </span>
                </div>
              )}

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto shadow-2xs">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Judul Artikel</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Waktu Baca</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Status & Sumber</th>
                      <th className="py-3 px-4 text-center">Featured</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredArticles.map((a) => (
                      <tr key={a.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900 max-w-sm truncate">{a.title}</div>
                          <div className="text-[11px] text-stone-400 font-mono">{a.slug}</div>
                        </td>
                        <td className="py-3 px-4 text-stone-600">{a.category}</td>
                        <td className="py-3 px-4 font-mono text-stone-600">{a.readTimeMinutes} menit</td>
                        <td className="py-3 px-4 font-mono text-stone-600">{a.publishedDate}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {isContentArchived(a) ? (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-300"
                                title={
                                  a.removedFromLiveAt
                                    ? `Dihapus dari live: ${formatScheduleDateTime(a.removedFromLiveAt)}`
                                    : 'Tersimpan di arsip database Supabase'
                                }
                              >
                                <Archive className="w-2.5 h-2.5" />
                                Arsip DB (Non-Live)
                              </span>
                            ) : isContentPendingSchedule(a, nowTick) ? (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                                title={`Dijadwalkan tayang: ${formatScheduleDateTime(a.scheduledAt)}`}
                              >
                                <CalendarClock className="w-2.5 h-2.5" />
                                Terjadwal ({formatScheduleDateTime(a.scheduledAt)})
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Tayang
                              </span>
                            )}
                            {a.isAiGenerated ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#65a30d] bg-lime-50 px-2 py-0.5 rounded border border-lime-200">
                                <Sparkles className="w-2.5 h-2.5" />
                                AI
                              </span>
                            ) : (
                              <span className="text-[10px] text-stone-500 font-mono">Manual</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {a.isFeatured ? (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500 mx-auto" />
                          ) : (
                            <span className="text-stone-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedArticle(a);
                                setArticleModalOpen(true);
                              }}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
                              title="Edit Artikel"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {isContentArchived(a) ? (
                              <button
                                type="button"
                                onClick={() => {
                                  restoreArticle(a.id);
                                  void persistWithToast(
                                    'Artikel berhasil dipulihkan ke website live & Supabase!'
                                  );
                                }}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                                title="Pulihkan ke Website Live"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Pulihkan</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmTarget({ kind: 'article', item: a })}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                title="Hapus dari Website Live (Tetap Tersimpan di Database)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredArticles.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-stone-400">
                          {articleViewMode === 'archived'
                            ? 'Belum ada artikel di arsip database.'
                            : 'Tidak ditemukan artikel aktif yang cocok dengan pencarian Anda.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 7. PROFILE & ALL SITE CONTENT SETTINGS TAB */}
          {/* ==================================================== */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                    Kelola Seluruh Isi & Teks Website
                  </h1>
                  <p className="text-xs text-stone-500">
                    Semua teks dan visual di website (Beranda, Hero, CTA, Tentang Saya, Nilai Kerja, Timeline, Kontak, WhatsApp, Footer) dapat diedit di sini.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-5 py-2.5 bg-[#84cc16] hover:bg-[#a3e635] text-stone-950 font-bold rounded-lg text-xs shadow-xs cursor-pointer flex items-center gap-2 shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Semua Perubahan</span>
                </button>
              </div>

              {/* Sub-Tabs Navigation */}
              <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
                <button
                  type="button"
                  onClick={() => setProfileSubTab('identitas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    profileSubTab === 'identitas'
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  1. Identitas & Foto
                </button>
                <button
                  type="button"
                  onClick={() => setProfileSubTab('beranda')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    profileSubTab === 'beranda'
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  2. Hero & Beranda
                </button>
                <button
                  type="button"
                  onClick={() => setProfileSubTab('cta')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    profileSubTab === 'cta'
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  3. Banner Kolaborasi CTA
                </button>
                <button
                  type="button"
                  onClick={() => setProfileSubTab('tentang')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    profileSubTab === 'tentang'
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  4. Narasi Tentang Saya
                </button>
                <button
                  type="button"
                  onClick={() => setProfileSubTab('nilai')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    profileSubTab === 'nilai'
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  5. Nilai & Prinsip Kerja ({profileForm.values?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setProfileSubTab('timeline')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    profileSubTab === 'timeline'
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  6. Timeline Belajar ({profileForm.learningJourney?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setProfileSubTab('kontak')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    profileSubTab === 'kontak'
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  7. Kontak, WhatsApp & Footer
                </button>
              </div>

              {/* ========================================================= */}
              {/* SUB-TAB 1: IDENTITAS & FOTO PROFIL */}
              {/* ========================================================= */}
              {profileSubTab === 'identitas' && (
                <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-5 text-xs shadow-2xs">
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900">Identitas Personal & Foto Profil</h2>
                    <p className="text-stone-500 text-[11px]">Nama dan gelar profesional yang muncul di navbar, header, dan bio.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Nama Lengkap *</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Wordmark Brand di Navbar *</label>
                      <input
                        type="text"
                        value={profileForm.brandTitle}
                        onChange={(e) => setProfileForm({ ...profileForm, brandTitle: e.target.value })}
                        required
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-bold tracking-tight focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Gelar / Role Title *</label>
                      <input
                        type="text"
                        value={profileForm.roleTitle}
                        onChange={(e) => setProfileForm({ ...profileForm, roleTitle: e.target.value })}
                        required
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Tagline Singkat</label>
                      <input
                        type="text"
                        value={profileForm.tagline}
                        onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                        placeholder="Creative Technologist & IT Specialist"
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <ImageUploader
                      label="Tautan Foto Profil / Avatar"
                      value={profileForm.avatarUrl || ''}
                      onChange={(val) => setProfileForm({ ...profileForm, avatarUrl: val })}
                      placeholder="/images/... atau URL gambar eksternal"
                      helpText="Unggah foto profil langsung dari komputer/HP atau gunakan URL foto online."
                    />

                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Lokasi & Ketersediaan Remote *</label>
                      <input
                        type="text"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        required
                        placeholder="Indonesia (Siap untuk kerja remote & kolaborasi)"
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-TAB 2: HERO & BERANDA */}
              {/* ========================================================= */}
              {profileSubTab === 'beranda' && (
                <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-5 text-xs shadow-2xs">
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900">Teks Headline & Kartu Visual Hero Beranda</h2>
                    <p className="text-stone-500 text-[11px]">Kustomisasi teks headline besar, deskripsi pembuka, dan kartu studio di beranda.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Kicker Kecil di Atas Headline</label>
                    <input
                      type="text"
                      value={profileForm.heroKicker || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, heroKicker: e.target.value })}
                      placeholder="PORTOFOLIO TEKNOLOGI KREATIF · RUANG KERJA DIGITAL"
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 uppercase font-mono focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Headline Utama Beranda *</label>
                    <textarea
                      rows={2}
                      value={profileForm.heroHeadline}
                      onChange={(e) => setProfileForm({ ...profileForm, heroHeadline: e.target.value })}
                      required
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-bold text-sm focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Deskripsi Lead Hero *</label>
                    <textarea
                      rows={3}
                      value={profileForm.heroDescription}
                      onChange={(e) => setProfileForm({ ...profileForm, heroDescription: e.target.value })}
                      required
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 leading-relaxed focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Fokus Bidang (Pills di bawah Hero)</label>
                    <input
                      type="text"
                      value={(profileForm.heroFocusAreas || []).join(', ')}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          heroFocusAreas: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                        })
                      }
                      placeholder="Web Berbantuan AI, Troubleshooting Hardware & Jaringan, Artikel & Wawasan Teknologi"
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                    />
                    <span className="text-[10px] text-stone-400">Pisahkan setiap bidang dengan tanda koma ( , )</span>
                  </div>

                  {/* Right Card Hero Visual Settings */}
                  <div className="pt-3 border-t border-stone-100 space-y-4">
                    <h3 className="font-bold text-stone-800">Kartu Visual Meja Kerja (Sisi Kanan Hero)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <ImageUploader
                          label="Tautan Gambar Hero"
                          value={profileForm.heroImageUrl || ''}
                          onChange={(val) => setProfileForm({ ...profileForm, heroImageUrl: val })}
                          placeholder="/images/... atau URL gambar"
                          helpText="Unggah gambar meja kerja/hero atau masukkan URL."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700">Judul Kartu Meja Kerja</label>
                        <input
                          type="text"
                          value={profileForm.heroImageCaption || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, heroImageCaption: e.target.value })}
                          placeholder="Studio & Laboratorium Digital"
                          className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700">Tahun / Periode Kartu</label>
                        <input
                          type="text"
                          value={profileForm.heroImageYear || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, heroImageYear: e.target.value })}
                          placeholder="2024–2026"
                          className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700">Tag / Keterangan Kartu</label>
                        <input
                          type="text"
                          value={(profileForm.heroImageTags || []).join(', ')}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              heroImageTags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                            })
                          }
                          placeholder="Hardware Lab, AI Prototyping, Swiss Typography"
                          className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-TAB 3: BANNER KOLABORASI / CTA PENUTUP */}
              {/* ========================================================= */}
              {profileSubTab === 'cta' && (
                <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-5 text-xs shadow-2xs">
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900">Banner Kolaborasi & Penutup Beranda</h2>
                    <p className="text-stone-500 text-[11px]">Kustomisasi teks ajakan kolaborasi hitam gelap di bagian paling bawah beranda.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Kicker Banner</label>
                    <input
                      type="text"
                      value={profileForm.ctaKicker || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, ctaKicker: e.target.value })}
                      placeholder="TERBUKA UNTUK KOLABORASI"
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 uppercase font-mono focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Judul Headline Banner</label>
                    <input
                      type="text"
                      value={profileForm.ctaHeadline || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, ctaHeadline: e.target.value })}
                      placeholder="Punya Ide atau Masalah Digital yang Ingin Diselesaikan?"
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-bold focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Deskripsi Ajakan Kolaborasi</label>
                    <textarea
                      rows={3}
                      value={profileForm.ctaDescription || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, ctaDescription: e.target.value })}
                      placeholder="Saya terbuka untuk berdiskusi, berkolaborasi, dan berbagi pengetahuan seputar teknologi serta desain."
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 leading-relaxed focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Teks Tombol Utama</label>
                      <input
                        type="text"
                        value={profileForm.ctaPrimaryBtnText || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, ctaPrimaryBtnText: e.target.value })}
                        placeholder="Hubungi Saya"
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Teks Tombol Sekunder</label>
                      <input
                        type="text"
                        value={profileForm.ctaSecondaryBtnText || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, ctaSecondaryBtnText: e.target.value })}
                        placeholder="Lihat Karya Saya"
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-TAB 4: TENTANG SAYA & NARASI LENGKAP */}
              {/* ========================================================= */}
              {profileSubTab === 'tentang' && (
                <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-5 text-xs shadow-2xs">
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900">Ringkasan Bio & Paragraf Narasi Lengkap</h2>
                    <p className="text-stone-500 text-[11px]">Teks penjelasan filosofi kerja dan latar belakang yang tampil di halaman Tentang Saya.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Ringkasan Pendek (Short Bio) *</label>
                    <textarea
                      rows={3}
                      value={profileForm.aboutShort}
                      onChange={(e) => setProfileForm({ ...profileForm, aboutShort: e.target.value })}
                      required
                      placeholder="Ringkasan 2–3 kalimat tentang diri Anda..."
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 leading-relaxed focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">
                      Paragraf Narasi Filosofi & Pendekatan Kerja (Pisahkan paragraf dengan baris kosong ganda Enter 2x)
                    </label>
                    <textarea
                      rows={8}
                      value={(profileForm.aboutFull || []).join('\n\n')}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          aboutFull: e.target.value.split('\n\n').map((p) => p.trim()).filter(Boolean)
                        })
                      }
                      placeholder="Paragraf 1: Pengenalan diri...\n\nParagraf 2: Alur kerja web berbantuan AI...\n\nParagraf 3: Pengalaman IT Support...\n\nParagraf 4: Desain grafis..."
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 leading-relaxed font-sans focus:bg-white focus:outline-none"
                    />
                    <span className="text-[10px] text-stone-400 block">
                      Jumlah paragraf aktif saat ini: {profileForm.aboutFull?.length || 0} paragraf.
                    </span>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-TAB 5: NILAI & PRINSIP KERJA */}
              {/* ========================================================= */}
              {profileSubTab === 'nilai' && (
                <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-6 text-xs shadow-2xs">
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900">Nilai-Nilai & Prinsip Kerja Utama</h2>
                    <p className="text-stone-500 text-[11px]">Daftar prinsip moral dan teknis yang tampil di halaman Tentang Saya.</p>
                  </div>

                  {/* List of current values */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(profileForm.values || []).map((val: ValueItem, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2 relative group">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-xs">0{idx + 1}. {val.title}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteValue(idx)}
                            className="p-1 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                            title="Hapus Nilai"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-stone-600 text-[11px] leading-relaxed">{val.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Value Form */}
                  <form onSubmit={handleAddValue} className="p-4 rounded-xl border border-dashed border-stone-300 bg-stone-50/50 space-y-3">
                    <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-[#65a30d]" />
                      <span>Tambah Prinsip Nilai Kerja Baru</span>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newValueTitle}
                        onChange={(e) => setNewValueTitle(e.target.value)}
                        placeholder="Judul Prinsip (misal: Keamanan Data Sebagai Prioritas)"
                        className="w-full p-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        value={newValueDesc}
                        onChange={(e) => setNewValueDesc(e.target.value)}
                        placeholder="Deskripsi singkat prinsip..."
                        className="w-full p-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold cursor-pointer"
                    >
                      Tambahkan Nilai
                    </button>
                  </form>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-TAB 6: TIMELINE PERJALANAN BELAJAR */}
              {/* ========================================================= */}
              {profileSubTab === 'timeline' && (
                <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-6 text-xs shadow-2xs">
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900">Timeline Perjalanan Belajar & Berkarya</h2>
                    <p className="text-stone-500 text-[11px]">Riwayat jejak karir dan pembelajaran yang tampil di halaman Tentang Saya.</p>
                  </div>

                  {/* List of current learning journey */}
                  <div className="space-y-3">
                    {(profileForm.learningJourney || []).map((item: TimelineItem, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-stone-900 bg-stone-200 px-2 py-0.5 rounded text-[11px]">
                              {item.year}
                            </span>
                            <span className="font-bold text-stone-900 text-xs">{item.title}</span>
                          </div>
                          <p className="text-stone-600 text-[11px] leading-relaxed pt-1">{item.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteJourney(idx)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded cursor-pointer shrink-0"
                          title="Hapus Milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Milestone Form */}
                  <form onSubmit={handleAddJourney} className="p-4 rounded-xl border border-dashed border-stone-300 bg-stone-50/50 space-y-3">
                    <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-[#65a30d]" />
                      <span>Tambah Titik Perjalanan Baru (Milestone)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={newJourneyYear}
                        onChange={(e) => setNewJourneyYear(e.target.value)}
                        placeholder="Tahun (mis: 2026)"
                        className="p-2 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono focus:outline-none"
                      />
                      <input
                        type="text"
                        value={newJourneyTitle}
                        onChange={(e) => setNewJourneyTitle(e.target.value)}
                        placeholder="Judul Tahapan (mis: Arsitektur Cloud)"
                        className="sm:col-span-2 p-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={newJourneyDesc}
                      onChange={(e) => setNewJourneyDesc(e.target.value)}
                      placeholder="Ulasan singkat pencapaian atau keterampilan yang dipelajari..."
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold cursor-pointer"
                    >
                      Tambahkan ke Timeline
                    </button>
                  </form>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-TAB 7: KONTAK, WHATSAPP & FOOTER */}
              {/* ========================================================= */}
              {profileSubTab === 'kontak' && (
                <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-5 text-xs shadow-2xs">
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900">Saluran Komunikasi Langsung, Media Sosial & Footer</h2>
                    <p className="text-stone-500 text-[11px]">Pengaturan kontak cepat WhatsApp, email, tautan profil sosial, dan deskripsi footer.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Nomor WhatsApp (Angka saja, misal 6281234567890)</label>
                      <input
                        type="text"
                        value={profileForm.whatsapp || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                        placeholder="6281234567890"
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono focus:bg-white focus:outline-none"
                      />
                      <span className="text-[10px] text-stone-400">Digunakan untuk tombol chat WhatsApp di menu Jasa dan Kontak.</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Alamat Email Utama *</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        required
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Nomor Telepon / Hotline</label>
                      <input
                        type="text"
                        value={profileForm.phone || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+62 812-3456-7890"
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Tautan Telegram</label>
                      <input
                        type="url"
                        value={profileForm.telegramUrl || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, telegramUrl: e.target.value })}
                        placeholder="https://t.me/karyadigital"
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Tautan (URL)</label>
                      <input
                        type="url"
                        value={profileForm.githubUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 font-mono focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        value={profileForm.linkedinUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 font-mono focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700">Instagram Profile URL</label>
                      <input
                        type="url"
                        value={profileForm.instagramUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, instagramUrl: e.target.value })}
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 font-mono focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Dynamic Social Media Section */}
                  <div className="pt-4 border-t border-stone-100 space-y-4">
                    <div>
                      <h3 className="font-bold text-stone-900 text-xs flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#65a30d]" />
                        <span>Media Sosial & Tautan Tambahan (Bebas Ditambah)</span>
                      </h3>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Tambahkan akun media sosial apa saja (YouTube, TikTok, Facebook, Twitter/X, Discord, Threads, dll.) yang akan otomatis ditampilkan di Footer dan Halaman Kontak.
                      </p>
                    </div>

                    {/* List of current social media */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(profileForm.socialMedia || []).map((soc: SocialMediaItem) => (
                        <div
                          key={soc.id}
                          className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 font-bold text-stone-900">
                              <span className="w-2 h-2 rounded-full bg-[#84cc16]" />
                              <span>{soc.platform}</span>
                              {soc.usernameOrHandle && (
                                <span className="font-mono text-[10px] text-stone-500">
                                  ({soc.usernameOrHandle})
                                </span>
                              )}
                            </div>
                            <a
                              href={soc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-stone-500 hover:text-stone-900 truncate block font-mono underline mt-0.5"
                            >
                              {soc.url}
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteSocialMedia(soc.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer shrink-0"
                            title="Hapus Media Sosial"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Social Media Form */}
                    <div className="p-4 rounded-xl border border-dashed border-stone-300 bg-stone-50/60 space-y-3">
                      <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-[#65a30d]" />
                        <span>Tambah Akun Media Sosial Baru</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-stone-700">Platform</label>
                          <select
                            value={newSocialPlatform}
                            onChange={(e) => setNewSocialPlatform(e.target.value)}
                            className="w-full p-2 bg-white border border-stone-200 rounded-lg text-stone-900 text-xs focus:outline-none"
                          >
                            <option value="YouTube">YouTube</option>
                            <option value="TikTok">TikTok</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Twitter / X">Twitter / X</option>
                            <option value="Discord">Discord</option>
                            <option value="Threads">Threads</option>
                            <option value="Instagram">Instagram</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="GitHub">GitHub</option>
                            <option value="Telegram">Telegram</option>
                            <option value="Medium">Medium</option>
                            <option value="Behance">Behance</option>
                            <option value="Dribbble">Dribbble</option>
                            <option value="Website Portofolio">Website Lain</option>
                            <option value="Lainnya">Lainnya (Ketik Sendiri)</option>
                          </select>
                        </div>

                        {newSocialPlatform === 'Lainnya' && (
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[11px] font-semibold text-stone-700">Nama Platform Kustom</label>
                            <input
                              type="text"
                              value={customPlatformName}
                              onChange={(e) => setCustomPlatformName(e.target.value)}
                              placeholder="Misal: Pinterest / Reddit"
                              className="w-full p-2 bg-white border border-stone-200 rounded-lg text-stone-900 text-xs focus:outline-none"
                            />
                          </div>
                        )}

                        <div className={`space-y-1 ${newSocialPlatform === 'Lainnya' ? 'sm:col-span-3' : 'sm:col-span-2'}`}>
                          <label className="text-[11px] font-semibold text-stone-700">URL / Tautan Akun *</label>
                          <input
                            type="url"
                            value={newSocialUrl}
                            onChange={(e) => setNewSocialUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full p-2 bg-white border border-stone-200 rounded-lg text-stone-900 text-xs font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                        <div className="space-y-1 flex-1">
                          <input
                            type="text"
                            value={newSocialHandle}
                            onChange={(e) => setNewSocialHandle(e.target.value)}
                            placeholder="Username / Label tampilan (opsional, misal: @risakurniawan)"
                            className="w-full p-2 bg-white border border-stone-200 rounded-lg text-stone-900 text-xs focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleAddSocialMedia}
                          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#84cc16]" />
                          <span>Tambahkan Media Sosial</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Jadwal Layanan / Jam Kerja Konsultasi</label>
                    <input
                      type="text"
                      value={profileForm.workingHours || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, workingHours: e.target.value })}
                      placeholder="Senin – Sabtu, 08.00 – 20.00 WIB"
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Teks Pengantar Halaman Kontak</label>
                    <textarea
                      rows={2}
                      value={profileForm.contactDescription || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, contactDescription: e.target.value })}
                      placeholder="Punya pertanyaan seputar proyek web, kebutuhan bantuan teknis IT Support, atau ingin bekerja sama..."
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Teks Deskripsi Misi di Footer Website</label>
                    <textarea
                      rows={2}
                      value={profileForm.footerDescription || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, footerDescription: e.target.value })}
                      placeholder="Ruang kerja digital yang mendokumentasikan eksplorasi pembuatan website berbantuan AI..."
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Bottom Save All Bar */}
              <div className="p-4 bg-stone-900 text-white rounded-xl flex items-center justify-between shadow-md">
                <span className="text-xs text-stone-300">
                  Pastikan menyimpan perubahan setelah menyunting bagian di atas.
                </span>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-6 py-2.5 bg-[#84cc16] hover:bg-[#a3e635] text-stone-950 font-bold rounded-lg text-xs shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Konfigurasi Profil</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 8. SKILLS & TOOLS MANAGEMENT TAB */}
          {/* ==================================================== */}
          {activeTab === 'skills' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                  Kelola Kelompok Keahlian & Peralatan Kerja
                </h1>
                <p className="text-xs text-stone-500">
                  Kelola daftar keahlian teknis dan software pendukung yang tampil pada beranda dan halaman tentang saya.
                </p>
              </div>

              {/* Skill Groups */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-stone-900">Kelompok Keahlian</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {profile.skillGroups.map((group, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-stone-200 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-900">{group.category}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirmTarget({ kind: 'skill', index: idx, label: group.category })
                          }
                          className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-normal">{group.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {group.skills.map((s, i) => (
                          <span key={i} className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form tambah skill group */}
                <form onSubmit={handleAddSkillGroup} className="p-4 bg-white rounded-xl border border-stone-200 space-y-3 text-xs">
                  <div className="font-bold text-stone-900">Tambah Kelompok Keahlian Baru</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newSkillCat}
                      onChange={(e) => setNewSkillCat(e.target.value)}
                      placeholder="Nama Kategori (mis: Keamanan Siber & Cloud)"
                      required
                      className="p-2 bg-stone-50 border border-stone-200 rounded"
                    />
                    <input
                      type="text"
                      value={newSkillDesc}
                      onChange={(e) => setNewSkillDesc(e.target.value)}
                      placeholder="Deskripsi singkat..."
                      className="p-2 bg-stone-50 border border-stone-200 rounded"
                    />
                  </div>
                  <input
                    type="text"
                    value={newSkillItems}
                    onChange={(e) => setNewSkillItems(e.target.value)}
                    placeholder="Daftar keahlian dipisahkan dengan koma (mis: Firewall, VPN, Backup Otomatis)"
                    required
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-stone-900 text-white rounded font-semibold cursor-pointer"
                  >
                    Tambah Kelompok
                  </button>
                </form>
              </div>

              {/* Tools list */}
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <h3 className="font-bold text-sm text-stone-900">Peralatan & Software Kerja</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.tools.map((tool, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-mono"
                    >
                      <span className="font-semibold text-stone-900">{tool.name}</span>
                      <span className="text-[10px] text-stone-400">({tool.category})</span>
                      <button
                        type="button"
                        onClick={() => {
                          deleteTool(idx);
                          void persistWithToast('Peralatan kerja dihapus & disimpan ke Supabase.');
                        }}
                        className="text-stone-400 hover:text-red-600 cursor-pointer ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddTool} className="p-4 bg-white rounded-xl border border-stone-200 flex flex-wrap gap-3 items-center text-xs">
                  <input
                    type="text"
                    value={newToolName}
                    onChange={(e) => setNewToolName(e.target.value)}
                    placeholder="Nama software / alat (mis: Wireshark)"
                    required
                    className="p-2 bg-stone-50 border border-stone-200 rounded"
                  />
                  <select
                    value={newToolCategory}
                    onChange={(e) => setNewToolCategory(e.target.value)}
                    className="p-2 bg-stone-50 border border-stone-200 rounded"
                  >
                    <option value="IT Support">IT Support</option>
                    <option value="Pengembangan">Pengembangan</option>
                    <option value="AI & Otomasi">AI & Otomasi</option>
                    <option value="Keamanan">Keamanan</option>
                  </select>
                  <input
                    type="text"
                    value={newToolPurpose}
                    onChange={(e) => setNewToolPurpose(e.target.value)}
                    placeholder="Fungsi / kegunaan..."
                    className="flex-1 min-w-[160px] p-2 bg-stone-50 border border-stone-200 rounded"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 text-white rounded font-semibold cursor-pointer shrink-0"
                  >
                    Tambah Alat
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 9. BACKUP & RESTORE TAB */}
          {/* ==================================================== */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                  Cadangan & Pemulihan Data (Backup & Restore)
                </h1>
                <p className="text-xs text-stone-500">
                  Ekspor seluruh data website ke dalam berkas JSON untuk diamankan atau pulihkan dari cadangan sebelumnya.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Card */}
                <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-stone-700" />
                    <h3 className="font-bold text-sm text-stone-900">Ekspor Data Lengkap (JSON)</h3>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Unduh salinan cadangan lengkap yang mencakup seluruh daftar proyek web, panduan tutorial IT,
                    artikel teknologi, dan konfigurasi profil ke komputer Anda.
                  </p>
                  <button
                    onClick={handleExport}
                    className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4 text-[#84cc16]" />
                    <span>Unduh File Cadangan JSON</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-stone-700" />
                    <h3 className="font-bold text-sm text-stone-900">Impor & Pulihkan Data</h3>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Unggah berkas JSON cadangan yang pernah Anda unduh sebelumnya untuk memulihkan seluruh konten situs seketika.
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold border border-stone-300 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Pilih Berkas JSON untuk Impor</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Danger Zone: Reset */}
              <div className="p-6 bg-red-50/60 rounded-xl border border-red-200 space-y-3">
                <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Zona Berbahaya: Kembalikan ke Data Awal</span>
                </div>
                <p className="text-xs text-red-800 leading-relaxed">
                  Tindakan ini akan menghapus semua penambahan dan editan lokal yang Anda buat di dashboard ini, dan mengembalikan konten situs ke data awal sistem.
                </p>
                <button
                  onClick={handleResetData}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset ke Data Awal Sistem</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 10. ADMIN USERS MANAGEMENT TAB */}
          {/* ==================================================== */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#84cc16]" />
                    <span>Kelola Akun Administrator</span>
                  </h1>
                  <p className="text-xs text-stone-500">
                    Tambah, edit nama dan kata sandi, serta kelola pengguna yang berhak masuk ke panel admin website.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddAdmin}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0 self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4 text-[#84cc16]" />
                  <span>Tambah Admin Baru</span>
                </button>
              </div>

              {/* Current Active Session Callout */}
              {currentAdmin && (
                <div className="p-4 bg-lime-50/70 border border-lime-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#84cc16] text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                      {currentAdmin.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-stone-900">{currentAdmin.name}</span>
                        <span className="font-mono text-stone-500">@{currentAdmin.username}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#84cc16] text-stone-950">
                          {currentAdmin.role}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white text-stone-700 border border-stone-200">
                          Sesi Anda Saat Ini
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Anda sedang login menggunakan akun ini. Akun aktif tidak dapat dihapus untuk menjaga keamanan akses Anda.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenEditAdmin(currentAdmin)}
                    className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-stone-600" />
                    <span>Ubah Profil Saya</span>
                  </button>
                </div>
              )}

              {/* Search & Statistics Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Cari nama admin, username, atau peran..."
                    className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:border-[#84cc16] focus:outline-none"
                  />
                </div>
                <div className="text-xs text-stone-500 font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-stone-400" />
                  <span>
                    Menampilkan <strong className="text-stone-800">{filteredAdminUsers.length}</strong> dari{' '}
                    <strong className="text-stone-800">{adminUsers.length}</strong> Admin
                  </span>
                </div>
              </div>

              {/* Admin Users Table */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">Administrator</th>
                        <th className="py-3 px-4">Username Login</th>
                        <th className="py-3 px-4">Peran & Akses</th>
                        <th className="py-3 px-4">Tanggal Dibuat</th>
                        <th className="py-3 px-4">Login Terakhir</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {filteredAdminUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-stone-400 text-xs">
                            Tidak ditemukan akun administrator yang sesuai dengan pencarian Anda.
                          </td>
                        </tr>
                      ) : (
                        filteredAdminUsers.map((admin) => {
                          const isCurrentUser = currentAdmin?.id === admin.id;
                          const isOnlyAdmin = adminUsers.length <= 1;

                          let roleBadgeClass = 'bg-stone-100 text-stone-800 border-stone-200';
                          if (admin.role === 'Super Admin') {
                            roleBadgeClass = 'bg-purple-100 text-purple-800 border-purple-200';
                          } else if (admin.role === 'Admin') {
                            roleBadgeClass = 'bg-lime-100 text-lime-800 border-lime-300';
                          } else if (admin.role === 'Admin Editor') {
                            roleBadgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
                          }

                          return (
                            <tr
                              key={admin.id}
                              className={`hover:bg-stone-50/80 transition-colors ${
                                isCurrentUser ? 'bg-lime-50/30' : ''
                              }`}
                            >
                              {/* Nama & Avatar */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-stone-900 text-[#BEF264] font-bold flex items-center justify-center text-xs shrink-0">
                                    {admin.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                      <span>{admin.name}</span>
                                      {isCurrentUser && (
                                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#84cc16] text-stone-950">
                                          Aktif
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-stone-500 font-mono">
                                      ID: {admin.id}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Username */}
                              <td className="py-3.5 px-4 font-mono font-medium text-stone-700">
                                @{admin.username}
                              </td>

                              {/* Role */}
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${roleBadgeClass}`}
                                >
                                  {admin.role}
                                </span>
                              </td>

                              {/* Tanggal Dibuat */}
                              <td className="py-3.5 px-4 text-stone-600">
                                {admin.createdAt}
                              </td>

                              {/* Login Terakhir */}
                              <td className="py-3.5 px-4 text-stone-500">
                                {admin.lastLogin ? (
                                  <span className="flex items-center gap-1 text-stone-700">
                                    <Clock className="w-3 h-3 text-stone-400" />
                                    <span>{admin.lastLogin}</span>
                                  </span>
                                ) : (
                                  <span className="italic text-stone-400">Belum ada catatan</span>
                                )}
                              </td>

                              {/* Aksi */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditAdmin(admin)}
                                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 rounded-md transition-colors cursor-pointer flex items-center gap-1 font-medium text-xs px-2"
                                    title="Edit Akun Admin"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Edit</span>
                                  </button>

                                  <button
                                    disabled={isCurrentUser || isOnlyAdmin}
                                    onClick={() => setDeleteConfirmAdmin(admin)}
                                    className={`p-1.5 rounded-md transition-colors flex items-center gap-1 font-medium text-xs px-2 ${
                                      isCurrentUser || isOnlyAdmin
                                        ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                                        : 'bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 cursor-pointer'
                                    }`}
                                    title={
                                      isCurrentUser
                                        ? 'Tidak dapat menghapus akun Anda sendiri saat sedang aktif login'
                                        : isOnlyAdmin
                                        ? 'Tidak dapat menghapus admin terakhir (minimal 1 akun)'
                                        : 'Hapus Akun Admin'
                                    }
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Hapus</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer notes */}
                <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2">
                  <span>
                    💡 <strong>Tips:</strong> Setiap akun admin yang Anda buat dapat langsung digunakan untuk masuk melalui halaman login.
                  </span>
                  <span>Kata sandi tersimpan aman di peramban dan otomatis tercadangkan saat ekspor JSON.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal for Content, Skill, or Reset */}
      {deleteConfirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs"
          onClick={() => !isExecutingDelete && setDeleteConfirmTarget(null)}
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
                <h3 className="font-bold text-sm text-stone-900">
                  {deleteConfirmTarget.kind === 'tutorial'
                    ? 'Hapus Tutorial dari Website Live?'
                    : deleteConfirmTarget.kind === 'article'
                    ? 'Hapus Artikel dari Website Live?'
                    : deleteConfirmTarget.kind === 'project'
                    ? 'Hapus Portofolio Website?'
                    : deleteConfirmTarget.kind === 'service'
                    ? 'Hapus Layanan Jasa?'
                    : deleteConfirmTarget.kind === 'skill'
                    ? 'Hapus Kelompok Keahlian?'
                    : 'Reset Seluruh Data ke Pengaturan Awal?'}
                </h3>
                <p className="text-xs text-stone-500">
                  {deleteConfirmTarget.kind === 'tutorial' || deleteConfirmTarget.kind === 'article'
                    ? 'Data di database Supabase tetap aman dan tidak ikut terhapus.'
                    : 'Konfirmasi sebelum menerapkan perubahan.'}
                </p>
              </div>
            </div>

            {deleteConfirmTarget.kind !== 'reset' ? (
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                <div className="font-bold text-stone-900">
                  {deleteConfirmTarget.kind === 'skill'
                    ? deleteConfirmTarget.label
                    : deleteConfirmTarget.item.title}
                </div>
                {deleteConfirmTarget.kind !== 'skill' && (
                  <div className="text-stone-500">{deleteConfirmTarget.item.category}</div>
                )}
              </div>
            ) : (
              <p className="text-xs text-stone-600 leading-relaxed">
                Seluruh artikel, tutorial, proyek, dan editan akan dikembalikan ke data bawaan awal.
              </p>
            )}

            {(deleteConfirmTarget.kind === 'tutorial' || deleteConfirmTarget.kind === 'article') && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed flex items-start gap-2">
                <Database className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Database Supabase Tetap Aman:</strong> Item ini akan dihapus dari halaman website live dan daftar aktif, tetapi tetap tersimpan di tab <strong>Arsip Database</strong> dan bisa dipulihkan kapan saja.
                </span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isExecutingDelete}
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isExecutingDelete}
                onClick={() => void handleConfirmTargetDelete()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-60"
              >
                {isExecutingDelete ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {deleteConfirmTarget.kind === 'tutorial' || deleteConfirmTarget.kind === 'article'
                    ? 'Ya, Hapus dari Website Live'
                    : 'Ya, Lanjutkan Hapus'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Admin */}
      {deleteConfirmAdmin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs"
          onClick={() => setDeleteConfirmAdmin(null)}
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
                <h3 className="font-bold text-sm text-stone-900">Hapus Akun Administrator?</h3>
                <p className="text-xs text-stone-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
              <div>
                Nama: <strong className="text-stone-900">{deleteConfirmAdmin.name}</strong>
              </div>
              <div>
                Username: <span className="font-mono text-stone-700">@{deleteConfirmAdmin.username}</span>
              </div>
              <div>
                Peran: <span className="text-stone-700 font-semibold">{deleteConfirmAdmin.role}</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Setelah dihapus, pengguna ini tidak akan dapat login lagi ke dashboard admin. Seluruh konten yang pernah dipublikasikan tetap tersimpan aman.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmAdmin(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAdminUser(deleteConfirmAdmin)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Akun Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin User Create & Edit Modal */}
      <AdminUserModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        adminToEdit={selectedAdminToEdit}
        onSave={handleSaveAdminUser}
      />

      {/* Modals */}
      <ProjectModal
        isOpen={projectModalOpen}
        project={selectedProject}
        onClose={() => setProjectModalOpen(false)}
        onSave={(data) => {
          if (selectedProject) {
            updateProject(selectedProject.id, data);
            void persistWithToast('Proyek berhasil diperbarui & disimpan ke Supabase!');
          } else {
            addProject(data);
            void persistWithToast('Proyek baru berhasil ditambahkan & disimpan ke Supabase!');
          }
        }}
      />

      <ServiceModal
        isOpen={serviceModalOpen}
        service={selectedService}
        onClose={() => setServiceModalOpen(false)}
        onSave={(data) => {
          if (selectedService) {
            updateService(selectedService.id, data);
            void persistWithToast('Layanan jasa berhasil diperbarui & disimpan ke Supabase!');
          } else {
            addService(data);
            void persistWithToast('Layanan jasa baru berhasil ditambahkan & disimpan ke Supabase!');
          }
        }}
      />

      <TutorialModal
        isOpen={tutorialModalOpen}
        tutorial={selectedTutorial}
        onClose={() => setTutorialModalOpen(false)}
        onSave={(data) => {
          if (selectedTutorial) {
            updateTutorial(selectedTutorial.id, data);
            void persistWithToast('Tutorial berhasil diperbarui & disimpan ke Supabase!');
          } else {
            addTutorial(data);
            void persistWithToast('Tutorial baru berhasil ditambahkan & disimpan ke Supabase!');
          }
        }}
      />

      <ArticleModal
        isOpen={articleModalOpen}
        article={selectedArticle}
        onClose={() => setArticleModalOpen(false)}
        onSave={(data) => {
          if (selectedArticle) {
            updateArticle(selectedArticle.id, data);
            void persistWithToast('Artikel berhasil diperbarui & disimpan ke Supabase!');
          } else {
            addArticle(data);
            void persistWithToast('Artikel baru berhasil ditambahkan & disimpan ke Supabase!');
          }
        }}
      />
      {/* ==================================================== */}
      {/* MODAL: PANDUAN INTEGRASI SUPABASE & DIAGNOSA DATABASE */}
      {/* ==================================================== */}
      {isDbGuideOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-5 my-8">
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#65a30d]" />
                  Status Database Supabase & Panduan Live Persistence
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Pastikan database Supabase terhubung agar perubahan di Dashboard tampil permanen di website live.
                </p>
              </div>
              <button
                onClick={() => setIsDbGuideOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Test Connection Box */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">Hasil Uji Diagnosa Server API</span>
                <button
                  onClick={handleTestDatabaseConnection}
                  disabled={isTestingDiag}
                  className="px-2.5 py-1 rounded bg-stone-900 text-white text-[11px] font-semibold hover:bg-stone-800 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isTestingDiag ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  <span>Uji Ulang Koneksi</span>
                </button>
              </div>

              {dbDiagStatus ? (
                <div className="space-y-2.5">
                  <div className="text-xs space-y-1.5 font-mono p-3 bg-stone-900 text-stone-200 rounded-lg">
                    <div className="flex justify-between">
                      <span>SUPABASE_URL:</span>
                      <span className={dbDiagStatus?.supabase?.hasUrl ? 'text-[#84cc16]' : 'text-rose-400'}>
                        {dbDiagStatus?.supabase?.hasUrl ? 'TERDETEKSI' : 'TIDAK TERDETEKSI'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>SUPABASE_SECRET_KEY / SERVICE_ROLE:</span>
                      <span className={dbDiagStatus?.supabase?.hasKey ? 'text-[#84cc16]' : 'text-rose-400'}>
                        {dbDiagStatus?.supabase?.hasKey ? 'TERDETEKSI' : 'TIDAK TERDETEKSI'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Koneksi Tabel site_content:</span>
                      <span className={dbDiagStatus?.supabase?.databaseConnected ? 'text-[#84cc16]' : 'text-amber-400'}>
                        {dbDiagStatus?.supabase?.databaseConnected ? 'TERHUBUNG (OK)' : 'BELUM DIBUAT / ERROR'}
                      </span>
                    </div>
                    {dbDiagStatus?.supabase?.databaseConnected && (
                      <div className="flex justify-between">
                        <span>Snapshot Konten (site_content_v2):</span>
                        <span className={dbDiagStatus?.supabase?.hasContentRow ? 'text-[#84cc16]' : 'text-amber-400'}>
                          {dbDiagStatus?.supabase?.hasContentRow ? 'TERSIMPAN DI DB' : 'BELUM ADA (KLIK UPLOAD)'}
                        </span>
                      </div>
                    )}
                    {dbDiagStatus?.supabase?.error && (
                      <div className="text-rose-400 text-[11px] pt-1 border-t border-stone-800">
                        Error: {dbDiagStatus.supabase.error}
                      </div>
                    )}
                  </div>

                  {dbDiagStatus?.supabase?.databaseConnected && !dbDiagStatus?.supabase?.hasContentRow && (
                    <button
                      onClick={async () => {
                        await handleManualSaveToCloud();
                        await handleTestDatabaseConnection();
                      }}
                      disabled={isManualSaving}
                      className="w-full py-2 rounded-lg bg-[#84cc16] hover:bg-[#65a30d] text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isManualSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                      <span>Upload Data Awal ke Supabase Sekarang</span>
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-stone-500 italic">
                  Klik "Uji Ulang Koneksi" untuk memeriksa apakah Vercel sudah dapat berkomunikasi dengan Supabase.
                </p>
              )}
            </div>

            {/* Step-by-step setup */}
            <div className="space-y-3 text-xs text-stone-700">
              <h4 className="font-bold text-stone-900">3 Langkah Mudah Aktivasi di Vercel:</h4>
              <ol className="list-decimal pl-4 space-y-2 text-stone-600">
                <li>
                  <strong>Jalankan Script SQL di Supabase:</strong> Buka SQL Editor di{' '}
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    Supabase Dashboard
                  </a>
                  , lalu jalankan script berikut untuk membuat tabel <code className="bg-stone-100 px-1 py-0.5 rounded">site_content</code>:
                </li>
              </ol>

              {/* Copy SQL Box */}
              <div className="relative">
                <pre className="p-3 bg-stone-900 text-stone-200 rounded-lg text-[11px] font-mono overflow-x-auto max-h-36">
{`CREATE TABLE IF NOT EXISTS public.site_content (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Content" ON public.site_content FOR SELECT TO public USING (true);
CREATE POLICY "Service Role Full Access" ON public.site_content FOR ALL TO service_role USING (true) WITH CHECK (true);`}
                </pre>
                <button
                  onClick={() => {
                    void navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS public.site_content (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Content" ON public.site_content FOR SELECT TO public USING (true);
CREATE POLICY "Service Role Full Access" ON public.site_content FOR ALL TO service_role USING (true) WITH CHECK (true);`);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2500);
                  }}
                  className="absolute top-2 right-2 px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer border border-stone-700"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-[#84cc16]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                </button>
              </div>

              <ol start={2} className="list-decimal pl-4 space-y-2 text-stone-600">
                <li>
                  <strong>Tambahkan Environment Variables di Vercel:</strong> Buka Vercel &gt; Settings &gt; Environment Variables (atau aktifkan Integrasi Supabase-Vercel). Pastikan variabel berikut tersedia:
                  <ul className="list-disc pl-4 mt-1 font-mono text-[11px] text-stone-800 space-y-1">
                    <li><span className="font-bold">SUPABASE_URL</span>: URL project Supabase Anda</li>
                    <li><span className="font-bold">SUPABASE_SECRET_KEY</span> atau <span className="font-bold">SUPABASE_SERVICE_ROLE_KEY</span>: service_role key dari Project Settings &gt; API</li>
                  </ul>
                </li>
                <li>
                  <strong>Redeploy Vercel:</strong> Buka tab Deployments di Vercel, klik titik tiga pada deployment terbaru, lalu klik <strong>Redeploy</strong> agar variabel terbaca.
                </li>
              </ol>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
              <button
                onClick={() => setIsDbGuideOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
