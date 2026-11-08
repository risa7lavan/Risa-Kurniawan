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
  Users
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
  SocialMediaItem
} from '../../types';
import { ProjectModal } from './ProjectModal';
import { TutorialModal } from './TutorialModal';
import { ArticleModal } from './ArticleModal';
import { ServiceModal } from './ServiceModal';
import { AdminUserModal } from './AdminUserModal';
import { ImageUploader } from '../../components/ImageUploader';

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
    addArticle,
    updateArticle,
    deleteArticle,
    updateProfile,
    addSkillGroup,
    deleteSkillGroup,
    addTool,
    deleteTool,
    resetAllData,
    exportDataJSON,
    importDataJSON
  } = useAppData();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'ai-tutorial'
    | 'ai-article'
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

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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

  const tutorialPresets = [
    'Cara Mengatasi Blue Screen (BSOD) SYSTEM_THREAD_EXCEPTION_NOT_HANDLED di Windows 11',
    'Panduan Lengkap Setting MikroTik Router untuk Hotspot Kantor & Manajemen Bandwidth',
    'Langkah Mengganti Thermal Paste Laptop yang Overheat & Membersihkan Fan Pendingin',
    'Cara Memperbaiki Flashdisk RAW yang Tidak Bisa Dibuka Tanpa Kehilangan Data',
    'Konfigurasi Port Forwarding & Firewall Windows Server untuk Remote Desktop (RDP)'
  ];

  const handleGenerateAiTutorial = async (topicToUse?: string) => {
    const targetTopic = (topicToUse || aiTutTopic).trim();
    if (!targetTopic) {
      alert('Silakan tuliskan topik tutorial IT terlebih dahulu.');
      return;
    }

    setAiTutLoading(true);
    setAiTutStatusText('Menghubungi AI Engine...');

    try {
      setTimeout(() => setAiTutStatusText('Menyusun alur langkah & kode perintah command prompt...'), 1200);
      setTimeout(() => setAiTutStatusText('Memformulasikan tips troubleshooting & FAQ teknis...'), 2600);

      const response = await fetch('/api/ai/generate-tutorial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          category: aiTutCategory,
          difficulty: aiTutDifficulty
        })
      });

      if (!response.ok) {
        throw new Error(`Server merespons status ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.tutorial) {
        setAiTutResult(data.tutorial);
        showToast('Tutorial IT berhasil disusun oleh AI! Pratinjau tersedia di bawah.');
      } else {
        throw new Error(data.error || 'Gagal menghasilkan tutorial.');
      }
    } catch (err: any) {
      console.warn('API server call fallback to local engine:', err);
      const cleanSlug = targetTopic.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
      const fallbackTut = {
        title: targetTopic,
        slug: cleanSlug || `tut-${Date.now()}`,
        summary: `Panduan teknis langkah-demi-langkah mengenai ${targetTopic} untuk mengatasi kendala perangkat secara terstruktur dan aman.`,
        category: aiTutCategory,
        difficulty: aiTutDifficulty,
        readTimeMinutes: 7,
        publishedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
        author: profile.name || 'Risa Kurniawan',
        prerequisites: [
          'Hak akses administrator pada sistem operasi (Run as Administrator)',
          'Koneksi internet stabil atau media penyimpanan eksternal untuk pencadangan data'
        ],
        toolsNeeded: ['Command Prompt / PowerShell', 'Device Manager', 'Alat Diagnostik Bawaan Windows'],
        riskWarning: {
          title: 'Peringatan Pencadangan Data',
          message: 'Pastikan file penting Anda telah dicadangkan sebelum melakukan perubahan konfigurasi sistem atau partisi.',
          severity: 'warning' as const
        },
        steps: [
          {
            stepNumber: 1,
            title: 'Verifikasi Status Awal & Diagnosa Gejala',
            description: `Buka task manager atau terminal diagnostik untuk mengidentifikasi kondisi awal sistem sebelum menerapkan solusi untuk ${targetTopic}.`,
            codeSnippet: {
              language: 'powershell',
              code: 'Get-ComputerInfo | Select-Object WindowsProductName, OsHardwareAbstractionLayer',
              label: 'PowerShell (Run as Admin)'
            },
            note: 'Catat kode error atau gejala tidak wajar yang muncul pada log sistem.'
          },
          {
            stepNumber: 2,
            title: 'Eksekusi Perbaikan & Pembersihan Komponen',
            description: 'Jalankan utilitas perbaikan otomatis bawaan sistem operasi untuk memperbaiki dependensi atau file sistem yang korup.',
            codeSnippet: {
              language: 'batch',
              code: 'DISM.exe /Online /Cleanup-image /Restorehealth && sfc /scannow',
              label: 'Command Prompt'
            },
            note: 'Tunggu hingga proses verifikasi mencapai 100% dan perhatikan laporan hasil scan.'
          },
          {
            stepNumber: 3,
            title: 'Penerapan Konfigurasi Akhir & Restart',
            description: 'Terapkan pengaturan baru, tutup semua aplikasi yang sedang berjalan, dan mulai ulang (restart) perangkat Anda agar perubahan diterapkan permanen.',
            note: 'Uji kembali perangkat setelah restart untuk memastikan kendala telah terselesaikan secara tuntas.'
          }
        ],
        troubleshootingTips: [
          {
            issue: 'Perintah command prompt menampilkan pesan "Access Denied"',
            resolution: 'Pastikan Anda membuka Command Prompt atau PowerShell dengan klik kanan lalu pilih "Run as Administrator".'
          },
          {
            issue: 'Sistem mengalami pembekuan (freeze) saat proses berjalan',
            resolution: 'Tunggu beberapa menit hingga proses I/O selesai, atau periksa indikator lampu aktivitas hard disk/SSD di komputer Anda.'
          }
        ],
        faqs: [
          {
            question: `Apakah panduan ${targetTopic} ini aman untuk pemula?`,
            answer: 'Ya, seluruh tahapan disusun dengan mempertimbangkan keselamatan data dan telah diverifikasi menggunakan perkakas standar.'
          },
          {
            question: 'Berapa lama rata-rata waktu pengerjaan prosedur ini?',
            answer: 'Biasanya membutuhkan waktu antara 5 hingga 15 menit tergantung spesifikasi hardware komputer Anda.'
          }
        ],
        tableOfContents: [
          { id: 'diagnosa-awal', title: '1. Verifikasi Status Awal & Diagnosa Gejala' },
          { id: 'eksekusi-perbaikan', title: '2. Eksekusi Perbaikan & Pembersihan' },
          { id: 'penerapan-restart', title: '3. Penerapan Konfigurasi Akhir & Restart' }
        ],
        conclusion: `Dengan menyelesaikan seluruh tahapan di atas, kendala terkait ${targetTopic} kini telah tertangani secara optimal dan performa sistem kembali stabil.`,
        isDemoData: false,
        isAiGenerated: true
      };
      setAiTutResult(fallbackTut);
      showToast('Tutorial IT berhasil disusun (Smart Engine)!');
    } finally {
      setAiTutLoading(false);
      setAiTutStatusText('');
    }
  };

  const handleSaveAiTutorial = () => {
    if (!aiTutResult) return;
    const created = addTutorial(aiTutResult);
    showToast(`Tutorial "${created.title}" berhasil disimpan dan langsung muncul di menu Tutorial IT!`);
    setAiTutResult(null);
    setAiTutTopic('');
    setActiveTab('tutorials');
  };

  // =========================================================================
  // AI GENERATOR: ARTIKEL IT
  // =========================================================================
  const [aiArtTopic, setAiArtTopic] = useState('');
  const [aiArtCategory, setAiArtCategory] = useState<ArticleCategory>('Tren Teknologi');
  const [aiArtLoading, setAiArtLoading] = useState(false);
  const [aiArtStatusText, setAiArtStatusText] = useState('');
  const [aiArtResult, setAiArtResult] = useState<Omit<Article, 'id'> | null>(null);

  const articlePresets = [
    'Masa Depan AI Agent dalam Mengotomasi Tugas IT Support Perusahaan',
    'SSD NVMe vs SATA: Mana Pilihan Terbaik untuk Upgrade Laptop & PC Anda?',
    'Anatomi Serangan Ransomware Modern dan Strategi Proteksi Data UKM',
    'Windows Defender Bawaan vs Antivirus Pihak Ketiga: Apakah Masih Perlu Beli Lisensi?',
    'Pentingnya Re-pasting Thermal Paste dan Pemeliharaan Berkala Perangkat Komputer'
  ];

  const handleGenerateAiArticle = async (topicToUse?: string) => {
    const targetTopic = (topicToUse || aiArtTopic).trim();
    if (!targetTopic) {
      alert('Silakan tuliskan topik artikel IT terlebih dahulu.');
      return;
    }

    setAiArtLoading(true);
    setAiArtStatusText('Menghubungi AI Engine...');

    try {
      setTimeout(() => setAiArtStatusText('Menganalisis tren teknologi & menyusun sudut pandang...'), 1200);
      setTimeout(() => setAiArtStatusText('Menuliskan bab pembahasan & kutipan sorotan...'), 2600);

      const response = await fetch('/api/ai/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          category: aiArtCategory
        })
      });

      if (!response.ok) {
        throw new Error(`Server merespons status ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.article) {
        setAiArtResult(data.article);
        showToast('Artikel IT berhasil disusun oleh AI! Pratinjau tersedia di bawah.');
      } else {
        throw new Error(data.error || 'Gagal menghasilkan artikel.');
      }
    } catch (err: any) {
      console.warn('API server call fallback to local engine:', err);
      const cleanSlug = targetTopic.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
      const fallbackArt = {
        title: targetTopic,
        slug: cleanSlug || `art-${Date.now()}`,
        summary: `Ulasan komprehensif mengenai ${targetTopic}, dampaknya pada efisiensi kerja teknologi harian, serta panduan praktis implementasinya.`,
        category: aiArtCategory,
        publishedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        readTimeMinutes: 6,
        thumbnail: '/images/hero_creative_workspace_1793775537391.jpg',
        author: profile.name || 'Risa Kurniawan',
        tags: ['Teknologi', 'Wawasan IT', 'Komputer'],
        sections: [
          {
            heading: 'Latar Belakang & Urgensi Topik',
            body: `Dalam ekosistem teknologi modern, pemahaman yang solid seputar ${targetTopic} menjadi faktor penentu dalam menjaga stabilitas sistem dan efisiensi alur kerja digital.`,
            highlight: 'Efisiensi sistem bukan hanya soal spesifikasi hardware tinggi, melainkan optimasi alur kerja dan mitigasi risiko yang tepat.'
          },
          {
            heading: 'Analisis Tantangan & Kasus Nyata',
            body: 'Banyak pengguna dan praktisi IT menghadapi dilema antara mengadopsi solusi otomatisasi modern atau tetap mempertahankan metode lama yang terbukti stabil. Kunci utamanya adalah mengenali batas fungsional perangkat dan memilih solusi yang paling relevan dengan beban kerja nyata.'
          },
          {
            heading: 'Rekomendasi Langkah Praktis',
            body: 'Mulailah dengan audit berkala terhadap performa sistem, lakukan pencadangan data rutin, dan pelajari fungsi utilitas bawaan untuk menghemat waktu komputasi Anda setiap hari.'
          }
        ],
        conclusion: `Dengan menyikapi ${targetTopic} secara terukur dan berbasis pengetahuan teruji, kita dapat memaksimalkan potensi teknologi untuk mendukung kesuksesan berkarya tanpa terbebani kendala teknis yang tidak perlu.`,
        isFeatured: false,
        isAiGenerated: true
      };
      setAiArtResult(fallbackArt);
      showToast('Artikel IT berhasil disusun (Smart Engine)!');
    } finally {
      setAiArtLoading(false);
      setAiArtStatusText('');
    }
  };

  const handleSaveAiArticle = () => {
    if (!aiArtResult) return;
    const created = addArticle(aiArtResult);
    showToast(`Artikel "${created.title}" berhasil disimpan dan langsung muncul di menu Artikel!`);
    setAiArtResult(null);
    setAiArtTopic('');
    setActiveTab('articles');
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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    showToast('Seluruh konfigurasi profil dan teks situs berhasil disimpan!');
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
    showToast('Prinsip nilai kerja baru berhasil ditambahkan!');
  };

  const handleDeleteValue = (index: number) => {
    const updatedValues = (profileForm.values || []).filter((_: ValueItem, i: number) => i !== index);
    setProfileForm({ ...profileForm, values: updatedValues });
    updateProfile({ values: updatedValues });
    showToast('Prinsip nilai kerja berhasil dihapus.');
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
    showToast('Riwayat perjalanan berhasil ditambahkan ke timeline!');
  };

  const handleDeleteJourney = (index: number) => {
    const updatedJourney = (profileForm.learningJourney || []).filter((_: TimelineItem, i: number) => i !== index);
    setProfileForm({ ...profileForm, learningJourney: updatedJourney });
    updateProfile({ learningJourney: updatedJourney });
    showToast('Riwayat perjalanan berhasil dihapus.');
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
    showToast(`Media sosial "${finalPlatform}" berhasil ditambahkan!`);
  };

  const handleDeleteSocialMedia = (id: string) => {
    const updatedSocial = (profileForm.socialMedia || []).filter((s: SocialMediaItem) => s.id !== id);
    setProfileForm({ ...profileForm, socialMedia: updatedSocial });
    updateProfile({ socialMedia: updatedSocial });
    showToast('Tautan media sosial berhasil dihapus.');
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
    showToast('Kelompok keahlian baru berhasil ditambahkan!');
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
    showToast('Peralatan kerja baru berhasil ditambahkan!');
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
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataJSON(content);
      if (res.success) {
        showToast('Data berhasil dipulihkan dari berkas JSON!');
      } else {
        alert('Gagal memulihkan data: ' + res.error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetData = () => {
    if (
      confirm(
        'PERINGATAN: Apakah Anda yakin ingin mereset seluruh data ke versi awal? Semua artikel, tutorial, dan editan akan dikembalikan ke data bawaan.'
      )
    ) {
      resetAllData();
      showToast('Seluruh data berhasil dikembalikan ke pengaturan awal.');
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

  const filteredTutorials = tutorials.filter(
    (t) =>
      t.title.toLowerCase().includes(tutorialSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(tutorialSearch.toLowerCase()) ||
      t.difficulty.toLowerCase().includes(tutorialSearch.toLowerCase())
  );

  const filteredArticles = articles.filter(
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
        showToast(`Akun admin "${data.name}" (@${data.username}) berhasil diperbarui!`);
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
        showToast(`Administrator baru "${data.name}" (@${data.username}) berhasil ditambahkan!`);
      }
      return res;
    }
  };

  const handleDeleteAdminUser = (admin: AdminUser) => {
    const res = deleteAdminUser(admin.id);
    if (res.success) {
      showToast(`Akun admin "${admin.name}" (@${admin.username}) berhasil dihapus.`);
      setDeleteConfirmAdmin(null);
    } else {
      alert(res.message || 'Gagal menghapus akun admin.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl border border-stone-700 text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#84cc16]" />
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
                {tutorials.length}
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
                {articles.length}
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
        <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
            <span>Admin</span>
            <span>/</span>
            <span className="font-bold text-stone-900 capitalize font-sans">
              {activeTab === 'admins' ? 'Kelola Akun Admin' : activeTab}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {currentAdmin && (
              <button
                onClick={() => setActiveTab('admins')}
                className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs transition-colors cursor-pointer"
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
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Pratinjau Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

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
                    {tutorials.length}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {tutorials.filter((t) => t.isAiGenerated).length} Dibuat AI ·{' '}
                    {tutorials.filter((t) => !t.isAiGenerated).length} Manual
                  </div>
                </div>

                <div className="p-5 bg-white rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-medium">Artikel IT</span>
                    <FileText className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-stone-900 tabular-nums">
                    {articles.length}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {articles.filter((a) => a.isFeatured).length} Unggulan
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

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
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
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                    <span>Topik / Masalah IT yang Ingin Dibuatkan Tutorial *</span>
                    <span className="text-[11px] text-stone-400 font-normal">
                      Contoh: Perbaikan BSOD, konfigurasi router, perakitan PC, partisi hard disk
                    </span>
                  </label>
                  <input
                    type="text"
                    value={aiTutTopic}
                    onChange={(e) => setAiTutTopic(e.target.value)}
                    placeholder="Ketik topik tutorial (misal: Langkah Setting MikroTik Router untuk Hotspot Kantor)..."
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
                          handleGenerateAiTutorial(preset);
                        }}
                        className="text-xs text-left px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md border border-stone-200 transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Configuration Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Kategori Tutorial</label>
                    <select
                      value={aiTutCategory}
                      onChange={(e) => setAiTutCategory(e.target.value as TutorialCategory)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#84cc16]"
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
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#84cc16]"
                    >
                      <option value="Pemula">Pemula</option>
                      <option value="Menengah">Menengah</option>
                      <option value="Lanjutan">Lanjutan</option>
                    </select>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={aiTutLoading || !aiTutTopic.trim()}
                    onClick={() => handleGenerateAiTutorial()}
                    className="w-full py-3 bg-stone-950 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    {aiTutLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#84cc16]" />
                        <span>{aiTutStatusText || 'Sedang Menyusun Tutorial Lengkap...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#84cc16]" />
                        <span>Buat Tutorial IT Otomatis (Gratis)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated Tutorial Preview */}
              {aiTutResult && (
                <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6 shadow-md animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#65a30d] uppercase tracking-wide">
                        <Check className="w-3.5 h-3.5" />
                        Pratinjau Hasil Generator AI
                      </span>
                      <h2 className="text-xl font-extrabold text-stone-950">{aiTutResult.title}</h2>
                      <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
                        <span>{aiTutResult.category}</span>
                        <span>·</span>
                        <span>Tingkat: {aiTutResult.difficulty}</span>
                        <span>·</span>
                        <span>Estimasi: {aiTutResult.readTimeMinutes} menit</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleSaveAiTutorial}
                        className="px-5 py-2.5 bg-[#84cc16] hover:bg-[#a3e635] text-stone-950 font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-transform hover:scale-105"
                      >
                        <Check className="w-4 h-4" />
                        <span>Simpan ke Tutorial IT</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-stone-700 italic bg-stone-50 p-3 rounded-lg border-l-4 border-stone-800">
                    {aiTutResult.summary}
                  </p>

                  {/* Prerequisites and Tools */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                      <span className="text-xs font-bold text-stone-800 uppercase">Prasyarat:</span>
                      <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside">
                        {aiTutResult.prerequisites.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                      <span className="text-xs font-bold text-stone-800 uppercase">Alat / Software:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {aiTutResult.toolsNeeded.map((t, i) => (
                          <span key={i} className="text-[11px] bg-white border border-stone-200 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
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

                  {/* Steps preview */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                      Langkah-Langkah Pengerjaan ({aiTutResult.steps.length} Langkah):
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
                          <p className="text-xs text-stone-700 pl-8 leading-relaxed">{st.description}</p>
                          {st.codeSnippet && st.codeSnippet.code && (
                            <div className="ml-8 p-3 bg-stone-900 text-[#84cc16] rounded-md font-mono text-xs overflow-x-auto flex items-center justify-between">
                              <code>{st.codeSnippet.code}</code>
                              <span className="text-[10px] text-stone-400 font-sans">{st.codeSnippet.language}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Save Action */}
                  <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                    <span className="text-xs text-stone-500">
                      Klik simpan untuk memasukkan tutorial ini ke menu publik.
                    </span>
                    <button
                      onClick={handleSaveAiTutorial}
                      className="px-6 py-2.5 bg-stone-950 hover:bg-stone-800 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4 text-[#84cc16]" />
                      <span>Simpan ke Tutorial IT</span>
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
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                    <span>Topik / Tema Artikel IT yang Ingin Dibuat *</span>
                    <span className="text-[11px] text-stone-400 font-normal">
                      Contoh: AI dalam IT Support, SSD vs NVMe, Proteksi Ransomware, Windows 11 LTSC
                    </span>
                  </label>
                  <input
                    type="text"
                    value={aiArtTopic}
                    onChange={(e) => setAiArtTopic(e.target.value)}
                    placeholder="Ketik topik artikel (misal: Analisis Efisiensi AI Agent dalam Manajemen Server UKM)..."
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
                          handleGenerateAiArticle(preset);
                        }}
                        className="text-xs text-left px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md border border-stone-200 transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Configuration Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Kategori Artikel</label>
                    <select
                      value={aiArtCategory}
                      onChange={(e) => setAiArtCategory(e.target.value as ArticleCategory)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:ring-2 focus:ring-[#84cc16]"
                    >
                      <option value="Tren Teknologi">Tren Teknologi</option>
                      <option value="Perangkat Keras & Gadget">Perangkat Keras & Gadget</option>
                      <option value="Keamanan Siber">Keamanan Siber</option>
                      <option value="Sistem Operasi & Software">Sistem Operasi & Software</option>
                      <option value="Produktivitas IT">Produktivitas IT</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Penulis Artikel</label>
                    <input
                      type="text"
                      disabled
                      value={profile.name}
                      className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-lg text-xs text-stone-600"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={aiArtLoading || !aiArtTopic.trim()}
                    onClick={() => handleGenerateAiArticle()}
                    className="w-full py-3 bg-stone-950 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    {aiArtLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#84cc16]" />
                        <span>{aiArtStatusText || 'Sedang Menulis Artikel Lengkap...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#84cc16]" />
                        <span>Buat Artikel IT Otomatis (Gratis)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated Article Preview */}
              {aiArtResult && (
                <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6 shadow-md animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#65a30d] uppercase tracking-wide">
                        <Check className="w-3.5 h-3.5" />
                        Pratinjau Hasil Generator AI
                      </span>
                      <h2 className="text-xl font-extrabold text-stone-950">{aiArtResult.title}</h2>
                      <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
                        <span>{aiArtResult.category}</span>
                        <span>·</span>
                        <span>{aiArtResult.readTimeMinutes} menit baca</span>
                        <span>·</span>
                        <span>Penulis: {aiArtResult.author}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleSaveAiArticle}
                        className="px-5 py-2.5 bg-[#84cc16] hover:bg-[#a3e635] text-stone-950 font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-transform hover:scale-105"
                      >
                        <Check className="w-4 h-4" />
                        <span>Simpan ke Artikel</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-stone-700 italic bg-stone-50 p-4 rounded-lg border-l-4 border-[#84cc16]">
                    {aiArtResult.summary}
                  </p>

                  {/* Sections */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                      Struktur Pembahasan ({aiArtResult.sections.length} Bagian):
                    </h3>
                    <div className="space-y-4">
                      {aiArtResult.sections.map((sec, idx) => (
                        <div key={idx} className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
                          <h4 className="font-bold text-xs text-stone-900">{sec.heading}</h4>
                          <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">{sec.body}</p>
                          {sec.highlight && (
                            <div className="p-2.5 bg-white border-l-2 border-l-[#84cc16] text-[11px] italic text-stone-800 rounded">
                              "{sec.highlight}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conclusion */}
                  {aiArtResult.conclusion && (
                    <div className="p-4 bg-stone-900 text-white rounded-lg space-y-1">
                      <div className="text-[10px] font-bold text-[#84cc16] uppercase">Kesimpulan:</div>
                      <p className="text-xs text-stone-200 leading-relaxed">{aiArtResult.conclusion}</p>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {aiArtResult.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Bottom Save Action */}
                  <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                    <span className="text-xs text-stone-500">
                      Klik simpan untuk memasukkan artikel ini ke menu publik.
                    </span>
                    <button
                      onClick={handleSaveAiArticle}
                      className="px-6 py-2.5 bg-stone-950 hover:bg-stone-800 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4 text-[#84cc16]" />
                      <span>Simpan ke Artikel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                            onClick={() => {
                              if (confirm(`Hapus proyek "${p.title}"?`)) {
                                deleteProject(p.id);
                                showToast('Proyek berhasil dihapus.');
                              }
                            }}
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
                              showToast(`Status layanan "${s.title}" berhasil diubah.`);
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
                              showToast(`Status populer layanan "${s.title}" berhasil diubah.`);
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
                            onClick={() => {
                              if (confirm(`Hapus layanan jasa "${s.title}"?`)) {
                                deleteService(s.id);
                                showToast('Layanan jasa berhasil dihapus.');
                              }
                            }}
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
                    Kelola Tutorial IT Support ({tutorials.length})
                  </h1>
                  <p className="text-xs text-stone-500">
                    Tambah panduan baru, gunakan Generator AI, perbarui langkah pengerjaan, atau hapus tutorial.
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

              {/* Search */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tutorialSearch}
                  onChange={(e) => setTutorialSearch(e.target.value)}
                  placeholder="Cari tutorial berdasarkan judul, kategori, atau tingkat kesulitan..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto shadow-2xs">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Judul Tutorial</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Tingkat</th>
                      <th className="py-3 px-4">Durasi</th>
                      <th className="py-3 px-4">Sumber</th>
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
                          {t.isAiGenerated ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#65a30d] bg-lime-50 px-2 py-0.5 rounded border border-lime-200">
                              <Sparkles className="w-2.5 h-2.5" />
                              AI Generated
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-500 font-mono">Manual</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {t.isFeatured ? (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500 mx-auto" />
                          ) : (
                            <span className="text-stone-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTutorial(t);
                              setTutorialModalOpen(true);
                            }}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
                            title="Edit Tutorial"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus tutorial "${t.title}"?`)) {
                                deleteTutorial(t.id);
                                showToast('Tutorial berhasil dihapus.');
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded cursor-pointer"
                            title="Hapus Tutorial"
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
          {/* 6. ARTICLES MANAGEMENT TAB */}
          {/* ==================================================== */}
          {activeTab === 'articles' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                    Kelola Artikel IT & Wawasan ({articles.length})
                  </h1>
                  <p className="text-xs text-stone-500">
                    Tambah artikel baru, gunakan Generator AI, perbarui isi tulisan, atau hapus artikel.
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

              {/* Search */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                  placeholder="Cari artikel berdasarkan judul, topik, atau tag..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto shadow-2xs">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Judul Artikel</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Waktu Baca</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Sumber</th>
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
                          {a.isAiGenerated ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#65a30d] bg-lime-50 px-2 py-0.5 rounded border border-lime-200">
                              <Sparkles className="w-2.5 h-2.5" />
                              AI Generated
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-500 font-mono">Manual</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {a.isFeatured ? (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500 mx-auto" />
                          ) : (
                            <span className="text-stone-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedArticle(a);
                              setArticleModalOpen(true);
                            }}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer"
                            title="Edit Artikel"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus artikel "${a.title}"?`)) {
                                deleteArticle(a.id);
                                showToast('Artikel berhasil dihapus.');
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded cursor-pointer"
                            title="Hapus Artikel"
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
                          onClick={() => {
                            if (confirm(`Hapus kelompok keahlian "${group.category}"?`)) {
                              deleteSkillGroup(idx);
                              showToast('Kelompok keahlian dihapus.');
                            }
                          }}
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
                        onClick={() => deleteTool(idx)}
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
            showToast('Proyek berhasil diperbarui!');
          } else {
            addProject(data);
            showToast('Proyek baru berhasil ditambahkan!');
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
            showToast('Layanan jasa berhasil diperbarui!');
          } else {
            addService(data);
            showToast('Layanan jasa baru berhasil ditambahkan!');
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
            showToast('Tutorial berhasil diperbarui!');
          } else {
            addTutorial(data);
            showToast('Tutorial baru berhasil ditambahkan!');
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
            showToast('Artikel berhasil diperbarui!');
          } else {
            addArticle(data);
            showToast('Artikel baru berhasil ditambahkan!');
          }
        }}
      />
    </div>
  );
};
