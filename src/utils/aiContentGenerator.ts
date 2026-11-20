import {
  Article,
  ArticleCategory,
  Tutorial,
  TutorialCategory,
  TutorialDifficulty
} from '../types';

function slugifyTopic(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') || `ai-${Date.now()}`
  );
}

export async function generateAiTutorialContent(params: {
  topic: string;
  category: TutorialCategory;
  difficulty: TutorialDifficulty;
  authorName?: string;
}): Promise<{ tutorial: Omit<Tutorial, 'id'>; source: 'api' | 'fallback' }> {
  const targetTopic = params.topic.trim();
  const author = params.authorName || 'Risa Kurniawan';

  try {
    const response = await fetch('/api/ai/generate-tutorial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: targetTopic,
        category: params.category,
        difficulty: params.difficulty
      })
    });

    if (!response.ok) {
      throw new Error(`Server merespons status ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.tutorial) {
      return {
        tutorial: {
          ...data.tutorial,
          isAiGenerated: true
        },
        source: 'api'
      };
    }
    throw new Error(data.error || 'Gagal menghasilkan tutorial.');
  } catch (err) {
    console.warn('AI Tutorial API fallback to smart engine:', err);
    const cleanSlug = slugifyTopic(targetTopic);
    const fallbackTut: Omit<Tutorial, 'id'> = {
      title: targetTopic,
      slug: `${cleanSlug}-${Date.now().toString().slice(-4)}`,
      summary: `Panduan teknis langkah-demi-langkah mengenai ${targetTopic} untuk mengatasi kendala perangkat secara terstruktur dan aman.`,
      category: params.category,
      difficulty: params.difficulty,
      readTimeMinutes: 7,
      publishedDate: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
      prerequisites: [
        'Hak akses administrator pada sistem operasi (Run as Administrator)',
        'Koneksi internet stabil atau media penyimpanan eksternal untuk pencadangan data'
      ],
      toolsNeeded: ['Command Prompt / PowerShell', 'Device Manager', 'Alat Diagnostik Bawaan Windows'],
      riskWarning: {
        title: 'Peringatan Pencadangan Data',
        message: `Pastikan file penting telah dicadangkan sebelum menjalankan langkah konfigurasi untuk ${targetTopic}.`,
        severity: 'warning'
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Verifikasi Status Awal & Diagnosa Gejala',
          description: `Buka Task Manager atau terminal diagnostik untuk mengidentifikasi kondisi awal sistem sebelum menerapkan solusi untuk ${targetTopic}.`,
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
          description:
            'Jalankan utilitas perbaikan otomatis bawaan sistem operasi untuk memperbaiki dependensi atau file sistem yang bermasalah.',
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
          description:
            'Terapkan pengaturan baru, tutup semua aplikasi yang sedang berjalan, dan mulai ulang (restart) perangkat agar perubahan diterapkan permanen.',
          note: 'Uji kembali perangkat setelah restart untuk memastikan kendala telah terselesaikan.'
        }
      ],
      troubleshootingTips: [
        {
          issue: 'Perintah command prompt menampilkan pesan "Access Denied"',
          resolution:
            'Pastikan Anda membuka Command Prompt atau PowerShell dengan klik kanan lalu pilih "Run as Administrator".'
        },
        {
          issue: 'Sistem melambat saat proses pemeriksaan berjalan',
          resolution: 'Tunggu hingga proses I/O selesai sebelum menjalankan ulang perangkat.'
        }
      ],
      faqs: [
        {
          question: `Apakah panduan ${targetTopic} ini aman untuk pemula?`,
          answer:
            'Ya, seluruh tahapan disusun dengan mempertimbangkan keselamatan data oleh ' + author + '.'
        }
      ],
      tableOfContents: [
        { id: 'diagnosa-awal', title: '1. Verifikasi Status Awal & Diagnosa Gejala' },
        { id: 'eksekusi-perbaikan', title: '2. Eksekusi Perbaikan & Pembersihan' },
        { id: 'penerapan-restart', title: '3. Penerapan Konfigurasi Akhir & Restart' }
      ],
      conclusion: `Dengan menyelesaikan seluruh tahapan di atas, kendala terkait ${targetTopic} dapat tertangani secara optimal.`,
      isDemoData: false,
      isAiGenerated: true
    };
    return { tutorial: fallbackTut, source: 'fallback' };
  }
}

export async function generateAiArticleContent(params: {
  topic: string;
  category: ArticleCategory;
  authorName?: string;
}): Promise<{ article: Omit<Article, 'id'>; source: 'api' | 'fallback' }> {
  const targetTopic = params.topic.trim();
  const author = params.authorName || 'Risa Kurniawan';

  try {
    const response = await fetch('/api/ai/generate-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: targetTopic,
        category: params.category
      })
    });

    if (!response.ok) {
      throw new Error(`Server merespons status ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.article) {
      return {
        article: {
          ...data.article,
          author: data.article.author || author,
          isAiGenerated: true
        },
        source: 'api'
      };
    }
    throw new Error(data.error || 'Gagal menghasilkan artikel.');
  } catch (err) {
    console.warn('AI Article API fallback to smart engine:', err);
    const cleanSlug = slugifyTopic(targetTopic);
    const fallbackArt: Omit<Article, 'id'> = {
      title: targetTopic,
      slug: `${cleanSlug}-${Date.now().toString().slice(-4)}`,
      summary: `Ulasan komprehensif mengenai ${targetTopic}, dampaknya pada efisiensi kerja teknologi harian, serta panduan praktis implementasinya.`,
      category: params.category,
      publishedDate: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      readTimeMinutes: 6,
      thumbnail: '/images/hero_creative_workspace_1793775537391.jpg',
      author,
      tags: ['Teknologi', 'Wawasan IT', 'Komputer'],
      sections: [
        {
          heading: 'Latar Belakang & Urgensi Topik',
          body: `Dalam ekosistem teknologi modern, pemahaman yang solid seputar ${targetTopic} menjadi faktor penentu dalam menjaga stabilitas sistem dan efisiensi alur kerja digital.`,
          highlight:
            'Efisiensi sistem bukan hanya soal spesifikasi hardware tinggi, melainkan optimasi alur kerja dan mitigasi risiko yang tepat.'
        },
        {
          heading: 'Analisis Tantangan & Kasus Nyata',
          body: 'Banyak pengguna dan praktisi IT menghadapi dilema antara mengadopsi solusi otomatisasi modern atau mempertahankan metode lama yang terbukti stabil. Kunci utamanya adalah mengenali batas fungsional perangkat dan memilih solusi paling relevan.'
        },
        {
          heading: 'Rekomendasi Langkah Praktis',
          body: 'Mulailah dengan audit berkala terhadap performa sistem, lakukan pencadangan data rutin, dan pelajari utilitas diagnostik bawaan untuk menjaga keandalan perangkat kerja.'
        }
      ],
      conclusion: `Dengan menyikapi ${targetTopic} secara terukur dan berbasis pengetahuan teruji, kita dapat memaksimalkan potensi teknologi secara aman dan produktif.`,
      isFeatured: false,
      isAiGenerated: true
    };
    return { article: fallbackArt, source: 'fallback' };
  }
}

const CLIENT_TOPIC_BANK: Record<'article' | 'tutorial', Record<string, string[]>> = {
  article: {
    'Tren Teknologi': [
      'Evolusi AI Agent Lokal untuk Otomatisasi Operasional UMKM Indonesia',
      'Mengapa Edge Computing Semakin Penting untuk Kecepatan Aplikasi Modern',
      'WebAssembly dan Masa Depan Aplikasi Berat di Dalam Browser Tanpa Instalasi',
      'Tren Arsitektur Serverless vs VPS Konvensional di Tahun 2026',
      'Dampak AI Coding Assistant terhadap Kualitas dan Kecepatan Pengembangan Web',
      'Standar Wi-Fi 7: Apa Keuntungan Nyatanya untuk Kantor Kecil dan Pekerja Remote',
      'Otomatisasi Workflow Tanpa Kode (No-Code) untuk Menghemat Jam Kerja Admin'
    ],
    'Perangkat Keras & Gadget': [
      'SSD NVMe PCIe Gen 4 vs Gen 5: Apakah Layak Upgrade untuk Laptop Harian?',
      'Memilih RAM DDR5 vs DDR4 di Tahun 2026: Analisis Rasio Harga dan Performa',
      'Pentingnya Thermal Paste Berkualitas Tinggi dan Pengaruhnya pada Umur Prosesor',
      'Panduan Memilih Mini PC Hemat Daya sebagai Home Server dan Workstation Kantor',
      'Monitor IPS vs OLED untuk Kerja IT dan Coding Seharian: Mana Lebih Nyaman di Mata?',
      'USB4 dan Thunderbolt 4: Solusi Satu Kabel untuk Docking Station Kerja Profesional',
      'Mengenal Teknologi Baterai Laptop Modern agar Tidak Cepat Mengalami Penurunan Kesehatan'
    ],
    'Keamanan Siber': [
      'Anatomi Serangan Phishing Berbasis AI dan Cara Melatih Tim agar Tidak Terkecoh',
      'Strategi Backup 3-2-1 untuk Melindungi Data Bisnis Kecil dari Ancaman Ransomware',
      'Passkey vs Password Tradisional: Mengapa Era Autentikasi Tanpa Kata Sandi Dimulai',
      'Bahaya Ekstensi Browser Berbahaya dan Cara Melakukan Audit Keamanan Chrome/Edge',
      'Mengamankan Jaringan Wi-Fi Kantor dari Penyusup Menggunakan Segmentasi VLAN & Guest Network',
      'Cara Kerja Credential Stuffing dan Pentingnya Password Manager + 2FA',
      'Checklist Keamanan Dasar Sebelum Menggunakan Laptop di Jaringan Wi-Fi Publik'
    ],
    'Sistem Operasi & Software': [
      'Windows 11 LTSC vs Windows 11 Pro: Mana yang Paling Stabil untuk Komputer Kerja?',
      'Mengoptimalkan WSL2 di Windows untuk Lingkungan Development Web yang Ringan',
      'Mengapa Banyak Bisnis Mulai Beralih ke Software Open Source untuk Efisiensi Biaya',
      'Manajemen Update Sistem Operasi agar Komputer Kantor Tidak Restart Mendadak saat Kerja',
      'Membandingkan Browser Ringan Berbasis Chromium vs Firefox untuk Laptop RAM 8GB',
      'Peran Virtualisasi Ringan dan Container bagi IT Support Saat Menguji Software Baru',
      'Cara Mengidentifikasi Bloatware Sistem Operasi yang Memperlambat Performa Laptop Baru'
    ],
    'Produktivitas IT': [
      'Membangun Sistem Dokumentasi SOP IT Support agar Penanganan Masalah 3x Lebih Cepat',
      'Integrasi Terminal Pintar dan Skrip Otomatisasi untuk Tugas Harian Administrator IT',
      'Teknik Manajemen Tab, Shortcut Keyboard, dan Clipboard History untuk Kerja Cepat',
      'Menyusun Checklist Maintenance Bulanan Perangkat Komputer Perusahaan',
      'Cara Mengelola Tiket Bantuan IT Sederhana bagi Tim Operasional Kecil',
      'Strategi Sinkronisasi File Lintas Perangkat Tanpa Membebani Storage Lokal',
      'Kebiasaan Kebersihan Digital (Digital Hygiene) agar Laptop Tetap Responsif Bertahun-tahun'
    ]
  },
  tutorial: {
    'Pemecahan Masalah Komputer': [
      'Cara Mengatasi Blue Screen (BSOD) CRITICAL_PROCESS_DIED di Windows 11 Tanpa Instal Ulang',
      'Panduan Memperbaiki Penggunaan Disk 100% di Task Manager Windows 10 dan Windows 11',
      'Cara Mengatasi Laptop Sering Freeze atau Hang Mendadak Saat Membuka Banyak Aplikasi',
      'Solusi Memperbaiki Audio Laptop Tidak Keluar Suara Setelah Update Driver Windows',
      'Cara Mengatasi Error Windows Update Stuck di 0% atau Gagal Install Permanen',
      'Langkah Diagnosa File Sistem Korup Menggunakan SFC dan DISM Melalui Command Prompt',
      'Cara Mengatasi Port USB Tidak Terdeteksi di Windows akibat Konflik Driver Power Management'
    ],
    'Instalasi Windows': [
      'Panduan Membuat Bootable USB Windows 11 UEFI GPT Menggunakan Rufus Tanpa Kendala TPM',
      'Cara Clean Install Windows 11 Langkah demi Langkah Tanpa Menghapus Partisi Data (D:)',
      'Checklist Wajib Setelah Instal Ulang Windows: Driver, Keamanan, dan Optimasi Awal',
      'Cara Konversi Disk MBR ke GPT Tanpa Kehilangan Data Menggunakan MBR2GPT Sebelum Upgrade Windows 11',
      'Panduan Mengaktifkan BitLocker dan Membuat Recovery Key Setelah Instalasi Windows',
      'Cara Mengatasi Error "Windows Cannot Be Installed to This Disk" Saat Setup Partisi',
      'Langkah Backup Lisensi Digital Windows dan Driver Bawaan Sebelum Format Sistem'
    ],
    'Perangkat Keras & Peningkatan': [
      'Cara Mengecek Tipe Slot RAM dan SSD NVMe yang Didukung Laptop Sebelum Membeli Upgrade',
      'Panduan Lengkap Clone Hard Disk ke SSD NVMe Baru Tanpa Instal Ulang Windows',
      'Langkah Membersihkan Fan Laptop dan Mengganti Thermal Paste untuk Menurunkan Suhu CPU',
      'Cara Memeriksa Kesehatan SSD (Wear Level & SMART Status) Menggunakan Utilitas Diagnostik',
      'Panduan Memasang SSD Tambahan di PC Desktop dan Menginisialisasi Partisi di Disk Management',
      'Cara Mendiagnosa Penyebab Komputer Tidak Mau Menyala (No Display) dari Bunyi Beep & RAM',
      'Tips Memilih Power Supply (PSU) dan UPS yang Tepat untuk Melindungi PC Kantor dari Mati Listrik'
    ],
    'Jaringan': [
      'Cara Mengatasi Wi-Fi Tersambung Tapi Tidak Ada Akses Internet (No Internet, Secured) di Windows',
      'Panduan Setting DNS Cloudflare 1.1.1.1 dan DNS-over-HTTPS untuk Koneksi Lebih Stabil',
      'Cara Reset Stack Jaringan Windows via CMD (Winsock, IPv4, Flush DNS) dengan Aman',
      'Langkah Konfigurasi Static IP & Port Forwarding Dasar pada Router Kantor',
      'Cara Membagi Folder dan Printer Lewat Jaringan Lokal LAN (File Sharing) Windows 11',
      'Panduan Menggunakan Ping, Tracert, dan NSLookup untuk Melacak Gangguan Koneksi Internet',
      'Cara Mengatur Bandwidth Limiter Sederhana di Router MikroTik agar Meeting Online Tidak Putus'
    ],
    'Perangkat Lunak & Produktivitas': [
      'Cara Mengatur Aplikasi Startup Windows agar Waktu Booting Laptop Menjadi 2x Lebih Cepat',
      'Panduan Menggunakan Winget di Windows Terminal untuk Update Semua Aplikasi Sekaligus',
      'Cara Mengatasi Microsoft Office Error Activation atau Crash Saat Membuka Dokumen Besar',
      'Panduan Membuat Jadwal Backup Otomatis Folder Kerja Penting ke Cloud & Drive Eksternal',
      'Cara Membersihkan Cache Browser dan Temporary Files secara Terjadwal Tanpa Aplikasi Berat',
      'Panduan Menggunakan PowerToys untuk Manajemen Layar Split dan Rename File Massal',
      'Cara Mengamankan Akun Email Kerja dan Mengatur Filter Spam Otomatis di Outlook / Gmail'
    ],
    'Tips & Trik IT': [
      '10 Shortcut Command Prompt & PowerShell Wajib untuk Mempercepat Diagnosa Laptop',
      'Cara Cek Riwayat Kesehatan Baterai Laptop Windows (Battery Report) Lewat PowerCFG',
      'Trik Membuat System Restore Point Otomatis Sebelum Menguji Software Baru',
      'Cara Mengetahui Aplikasi yang Menghabiskan Kuota Internet Diam-Diam di Latar Belakang',
      'Panduan Menggunakan God Mode dan Task Scheduler untuk Otomasi Perawatan Komputer',
      'Cara Mengamankan Flashdisk agar Bebas dari Virus Shortcut di Komputer Umum',
      'Trik Cepat Memeriksa Spesifikasi Asli Laptop Bekas Sebelum Membeli (CPU, RAM, Layar, SSD)'
    ]
  }
};

export async function generateAiTopics(params: {
  type: 'article' | 'tutorial';
  category: ArticleCategory | TutorialCategory;
  difficulty?: TutorialDifficulty;
  count?: number;
  excludeTopics?: string[];
}): Promise<{ topics: string[]; source: 'api' | 'fallback' }> {
  const safeCount = params.count ?? 5;
  const excludeSet = new Set((params.excludeTopics || []).map((t) => t.trim().toLowerCase()));

  try {
    const response = await fetch('/api/ai/generate-topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: params.type,
        category: params.category,
        difficulty: params.difficulty || 'Pemula',
        count: safeCount,
        excludeTopics: params.excludeTopics || []
      })
    });

    if (!response.ok) {
      throw new Error(`Server merespons status ${response.status}`);
    }

    const data = await response.json();
    if (data.success && Array.isArray(data.topics) && data.topics.length > 0) {
      return {
        topics: data.topics,
        source: data.source === 'gemini-ai' ? 'api' : 'fallback'
      };
    }
    throw new Error(data.error || 'Gagal menyusun topik.');
  } catch (err) {
    console.warn('AI Topic Generator fallback to smart bank:', err);
    const categoryMap = CLIENT_TOPIC_BANK[params.type];
    const pool = categoryMap[params.category] || Object.values(categoryMap).flat();
    const available = pool.filter((t) => !excludeSet.has(t.toLowerCase()));
    const sourcePool = available.length >= safeCount ? available : pool;
    const picked = [...sourcePool].sort(() => Math.random() - 0.5).slice(0, safeCount);
    return { topics: picked, source: 'fallback' };
  }
}
