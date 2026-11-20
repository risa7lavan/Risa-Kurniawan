import {
  Article,
  ArticleCategory,
  ArticleGenerationOptions,
  Tutorial,
  TutorialCategory,
  TutorialDifficulty,
  TutorialGenerationOptions
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

export async function generateAiTutorialContent(
  params: TutorialGenerationOptions & { authorName?: string }
): Promise<{ tutorial: Omit<Tutorial, 'id'>; source: 'api' | 'fallback' }> {
  const targetTopic = params.topic.trim();
  const baseTitle = params.customTitle?.trim() || targetTopic;
  const focusKw = baseTitle;

  try {
    const response = await fetch('/api/ai/generate-tutorial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: targetTopic,
        category: params.category,
        difficulty: params.difficulty,
        customTitle: params.customTitle,
        targetAudience: params.targetAudience,
        tutorialGoal: params.tutorialGoal,
        deviceType: params.deviceType,
        operatingSystem: params.operatingSystem,
        softwareTools: params.softwareTools,
        softwareVersion: params.softwareVersion,
        lengthPreference: params.lengthPreference
      }),
      signal: AbortSignal.timeout(12000)
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
    const cleanSlug = slugifyTopic(baseTitle).split('-').slice(0, 7).join('-');
    const seoTitle =
      baseTitle.length <= 68
        ? baseTitle
        : baseTitle.slice(0, 65).replace(/\s+\S*$/, '').trim() || baseTitle.slice(0, 65).trim();
    const metaCandidate = `Panduan teknis ${focusKw}: prasyarat, langkah berurutan, verifikasi hasil, dan solusi troubleshooting bagi ${params.difficulty.toLowerCase()}.`;
    const metaDescription =
      metaCandidate.length <= 160
        ? metaCandidate
        : metaCandidate.slice(0, 158).replace(/\s+\S*$/, '').trim();
    const osLabel = params.operatingSystem?.trim() || 'Windows 10 / Windows 11';
    const deviceLabel = params.deviceType?.trim() || 'Komputer / Laptop';
    const softwareLabel = params.softwareTools?.trim() || 'Command Prompt / PowerShell, Device Manager';
    const softwareVerLabel = params.softwareVersion?.trim() ? ` (${params.softwareVersion.trim()})` : '';
    const audienceLabel = params.targetAudience?.trim() || params.difficulty;
    const goalLabel = params.tutorialGoal?.trim() || 'Panduan Teknis & Troubleshooting';

    const fallbackTut: Omit<Tutorial, 'id'> = {
      title: baseTitle,
      seoTitle,
      metaDescription,
      focusKeyword: focusKw,
      supportingKeywords: [
        params.category.toLowerCase(),
        `tutorial ${params.difficulty.toLowerCase()}`,
        osLabel.toLowerCase(),
        'panduan langkah demi langkah',
        'troubleshooting it'
      ],
      slug: `${cleanSlug || 'tutorial'}-${Date.now().toString().slice(-4)}`,
      summary: metaDescription,
      category: params.category,
      difficulty: params.difficulty,
      readTimeMinutes: 10,
      publishedDate: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
      imageAltText: `${baseTitle} — panduan teknis ${params.category.toLowerCase()} untuk ${audienceLabel}`,
      introduction: `Panduan ini dirancang khusus untuk pembaca tingkat ${audienceLabel} dengan tujuan ${goalLabel.toLowerCase()} pada perangkat ${deviceLabel} (${osLabel}). Permasalahan terkait ${targetTopic} sering mengganggu alur kerja apabila ditangani tanpa urutan diagnostik yang tepat. Dengan mengikuti dokumentasi ini, Anda akan memahami fungsi tiap tahapan dan mencapai kondisi sistem yang terverifikasi aman serta stabil.`,
      objectives: [
        `Memahami sumber gejala dan parameter teknis yang memengaruhi ${targetTopic}.`,
        `Menjalankan prosedur konfigurasi dan pemulihan ${baseTitle} secara berurutan dan aman.`,
        'Memverifikasi hasil akhir serta mengetahui solusi cepat apabila kendala muncul kembali.'
      ],
      prerequisites: [
        `Hak akses Administrator pada ${osLabel} (Run as Administrator).`,
        'Cadangan (backup) berkas kerja penting pada drive terpisah atau penyimpanan cloud.',
        'Daya baterai mencukupi atau perangkat terhubung ke adaptor listrik/UPS.'
      ],
      optionalPrerequisites: [
        'System Restore Point terbaru sebagai pengaman tambahan sebelum mengubah konfigurasi.',
        'Catatan pengaturan jaringan atau aplikasi sebelumnya agar mudah dikembalikan bila perlu.'
      ],
      systemRequirements: {
        hardware: `${deviceLabel} dengan ruang penyimpanan kosong minimal 2 GB untuk berkas sementara.`,
        os: osLabel,
        software: `${softwareLabel}${softwareVerLabel}`,
        access: 'Akun Administrator lokal atau hak sudo/elevated shell.'
      },
      toolsNeeded: softwareLabel.split(',').map((s) => s.trim()).filter(Boolean),
      riskWarning: {
        title: 'Peringatan Keamanan & Pencadangan Data',
        message: `Selalu buat cadangan data penting sebelum menjalankan perintah diagnostik atau mengubah pengaturan sistem untuk ${targetTopic}. Jangan pernah membagikan kata sandi, PIN, atau kunci lisensi Anda ke pihak yang tidak berwenang.`,
        severity: 'warning'
      },
      processOverview: `Alur pengerjaan terdiri atas 4 tahapan berurutan: (1) pencadangan dan pemeriksaan status awal sistem, (2) diagnosa sumber kendala menggunakan utilitas resmi, (3) penerapan perbaikan atau konfigurasi terukur, dan (4) pengujian ulang serta verifikasi kestabilan.`,
      steps: [
        {
          stepNumber: 1,
          title: 'Persiapan & Pemeriksaan Status Awal Sistem',
          objective: 'Memastikan titik pemulihan tersedia dan membaca informasi dasar perangkat sebelum perubahan dilakukan.',
          description: `Buka terminal dengan hak akses administrator pada ${osLabel} untuk mencatat versi sistem dan memastikan tidak ada proses pembaruan yang sedang tertunda.`,
          actions: [
            'Klik menu Start, ketik "PowerShell" atau "Command Prompt".',
            'Klik kanan aplikasi terminal lalu pilih "Run as Administrator".',
            'Jalankan perintah pemeriksaan info sistem di bawah ini dan catat hasilnya.'
          ],
          codeSnippet: {
            language: 'powershell',
            code: 'Get-ComputerInfo | Select-Object WindowsProductName, OsVersion, OsHardwareAbstractionLayer',
            label: 'PowerShell (Run as Admin)'
          },
          expectedResult: 'Terminal menampilkan nama versi OS dan arsitektur perangkat tanpa pesan error akses.',
          note: 'Jika muncul dialog User Account Control (UAC), pilih Yes agar perintah berjalan penuh.'
        },
        {
          stepNumber: 2,
          title: 'Diagnosa Integritas Komponen & Konfigurasi Terkait',
          objective: `Mengidentifikasi komponen atau layanan yang memicu kendala pada ${targetTopic}.`,
          description:
            'Gunakan utilitas diagnostik bawaan sistem operasi untuk memindai integritas berkas sistem serta mendeteksi konflik driver atau layanan latar belakang.',
          actions: [
            'Jalankan pemindaian image sistem dan pemeriksaan berkas sistem secara berurutan.',
            'Tunggu proses verifikasi hingga mencapai 100% tanpa menutup jendela terminal.'
          ],
          codeSnippet: {
            language: 'batch',
            code: 'DISM.exe /Online /Cleanup-image /Restorehealth\nsfc /scannow',
            label: 'Command Prompt (Admin)'
          },
          expectedResult: 'Status akhir menunjukkan berkas sistem sehat atau berhasil dipulihkan otomatis.',
          note: 'Proses DISM membutuhkan koneksi internet aktif apabila perlu mengunduh komponen pemulihan resmi.'
        },
        {
          stepNumber: 3,
          title: 'Eksekusi Penyesuaian & Penyegaran Layanan',
          objective: `Menerapkan konfigurasi aman guna menuntaskan isu ${targetTopic}.`,
          description:
            'Terapkan pengaturan yang direkomendasikan sesuai dokumentasi resmi dan segarkan cache layanan sistem yang relevan.',
          actions: [
            'Tutup aplikasi aktif yang berkaitan dengan perangkat atau jaringan yang sedang diperbaiki.',
            'Jalankan perintah penyegaran konfigurasi bila kendala berkaitan dengan jaringan atau layanan OS.',
            'Simpan seluruh perubahan pengaturan sebelum melanjutkan ke tahap pengujian.'
          ],
          codeSnippet: {
            language: 'batch',
            code: 'ipconfig /flushdns',
            label: 'Command Prompt (Opsional untuk Jaringan)'
          },
          expectedResult: 'Konfirmasi "Successfully flushed the DNS Resolver Cache" atau konfigurasi baru tersimpan.',
          note: 'Lewati perintah DNS jika tutorial yang Anda kerjakan berfokus pada perangkat keras offline.'
        },
        {
          stepNumber: 4,
          title: 'Restart Perangkat & Verifikasi Hasil Akhir',
          objective: 'Memuat ulang layanan sistem secara bersih dan memastikan fungsi kembali normal.',
          description:
            'Lakukan mulai ulang (restart) perangkat melalui menu resmi agar seluruh perubahan diterapkan permanen, kemudian lakukan pengujian nyata.',
          actions: [
            'Simpan seluruh dokumen kerja yang masih terbuka.',
            'Pilih menu Start -> Power -> Restart (hindari menekan tombol power secara paksa).',
            'Setelah masuk kembali ke desktop, uji fungsi yang sebelumnya bermasalah selama 3–5 menit.'
          ],
          expectedResult: `Perangkat berjalan responsif dan gejala ${targetTopic} tidak lagi muncul.`
        }
      ],
      screenshotRecommendations: [
        {
          figureNumber: 1,
          title: 'Menjalankan Terminal sebagai Administrator',
          screenArea: 'Menu Start Windows dengan klik kanan pada Windows Terminal / PowerShell.',
          annotation: 'Beri kotak penanda pada opsi "Run as administrator".',
          caption: 'Gambar 1. Langkah membuka terminal dengan hak akses administrator sebelum diagnosa.',
          altText: `Tangkapan layar menu klik kanan Run as Administrator untuk ${baseTitle}`
        },
        {
          figureNumber: 2,
          title: 'Hasil Pemindaian Integritas Sistem',
          screenArea: 'Jendela Command Prompt menampilkan progres 100% dan ringkasan hasil sfc /scannow.',
          annotation: 'Sorot baris pesan status akhir verifikasi sistem.',
          caption: 'Gambar 2. Verifikasi hasil pemindaian berkas sistem tanpa error kritis.',
          altText: `Hasil verifikasi terminal setelah menerapkan ${baseTitle}`
        }
      ],
      verification: {
        summary: `Untuk memastikan prosedur ${baseTitle} berhasil, pastikan tidak ada peringatan error di terminal maupun Device Manager setelah restart.`,
        indicators: [
          'Proses pemindaian sistem selesai 100% tanpa pesan kegagalan berulang.',
          'Fitur atau perangkat target merespons normal saat diuji dalam aktivitas kerja harian.',
          'Penggunaan CPU, RAM, dan disk pada Task Manager berada dalam batas wajar saat idle.'
        ],
        expectedOutput: 'Windows Resource Protection did not find any integrity violations / layanan aktif berstatus Running.',
        testMethod: 'Uji skenario pemakaian normal selama beberapa menit dan periksa Event Viewer (Windows Logs -> System) untuk memastikan tidak ada error merah berulang.'
      },
      troubleshootingTips: [
        {
          issue: 'Perintah terminal menampilkan pesan "Access Denied" atau membutuhkan elevasi',
          cause: 'Terminal dibuka dengan izin pengguna standar, bukan Administrator.',
          resolution: 'Tutup terminal, klik kanan ikon Command Prompt atau PowerShell, lalu pilih "Run as administrator".'
        },
        {
          issue: 'Proses pemindaian berhenti lama di angka 62,3% atau melambat',
          cause: 'Sistem sedang memverifikasi paket komponen dan mengunduh pembaruan dari server resmi.',
          resolution: 'Tunggu 5–15 menit dengan koneksi internet stabil dan hindari menutup paksa jendela terminal.'
        },
        {
          issue: 'Gejala masalah masih muncul setelah komputer di-restart',
          cause: 'Terdapat konflik driver versi lama atau komponen perangkat keras perlu pemeriksaan fisik.',
          resolution: 'Periksa pembaruan driver resmi melalui situs produsen perangkat atau konsultasikan diagnosa lanjutan.'
        }
      ],
      tipsAndRecommendations: {
        bestPractices: [
          'Lakukan pemeriksaan pembaruan sistem dan driver resmi secara berkala minimal sebulan sekali.',
          'Catat perubahan konfigurasi yang Anda lakukan agar mudah dievaluasi bila terjadi perubahan perilaku sistem.'
        ],
        avoidMistakes: [
          'Hindari mengunduh utilitas perbaikan otomatis dari situs tidak resmi yang berisiko membawa adware.',
          'Jangan mematikan komputer secara paksa saat proses pemulihan sistem atau update sedang berlangsung.'
        ],
        securityTips: [
          'Selalu terapkan prinsip least privilege dan jangan pernah memasukkan kata sandi atau kunci keamanan di terminal yang tidak tepercaya.',
          'Pastikan Windows Security / Defender aktif dan definisi keamanan mutakhir.'
        ],
        nextSteps: [
          'Jadwalkan backup berkala (strategi 3-2-1) untuk dokumen penting pekerjaan Anda.',
          'Pelajari artikel dan panduan pemeliharaan sistem lainnya di direktori Tutorial IT.'
        ]
      },
      faqs: [
        {
          question: `Apakah prosedur ${targetTopic} ini aman untuk data pribadi di komputer?`,
          answer: 'Ya. Prosedur diagnostik dan konfigurasi ini tidak memformat drive data pribadi Anda, namun pencadangan tetap disarankan sebagai standar keamanan kerja.'
        },
        {
          question: 'Berapa lama waktu yang dibutuhkan untuk menyelesaikan seluruh langkah?',
          answer: 'Umumnya memakan waktu 10 hingga 20 menit tergantung kecepatan penyimpanan (SSD/HDD) dan kestabilan koneksi internet.'
        },
        {
          question: 'Apakah saya harus menginstal aplikasi pihak ketiga tambahan?',
          answer: 'Tidak wajib. Langkah utama memaksimalkan utilitas resmi bawaan sistem operasi yang aman dan terverifikasi.'
        }
      ],
      tableOfContents: [
        { id: 'langkah-1', title: '1. Persiapan & Pemeriksaan Status Awal Sistem' },
        { id: 'langkah-2', title: '2. Diagnosa Integritas Komponen & Konfigurasi Terkait' },
        { id: 'langkah-3', title: '3. Eksekusi Penyesuaian & Penyegaran Layanan' },
        { id: 'langkah-4', title: '4. Restart Perangkat & Verifikasi Hasil Akhir' }
      ],
      conclusion: `Dengan mengikuti tahapan dokumentasi ${baseTitle} secara berurutan dan memverifikasi hasilnya, Anda dapat menangani kendala teknis secara mandiri, aman, dan terstruktur tanpa mengganggu integritas data kerja.`,
      references: [
        {
          title: 'Windows Client Documentation & Troubleshooting Guides',
          publisher: 'Microsoft Learn',
          url: 'https://learn.microsoft.com/en-us/windows/'
        },
        {
          title: 'Use the System File Checker tool to repair missing or corrupted system files',
          publisher: 'Microsoft Support',
          url: 'https://support.microsoft.com/'
        }
      ],
      internalLinkingSuggestions: [
        {
          anchorText: 'Layanan IT Support & Perbaikan Sistem Komputer',
          targetPath: '/services',
          reason: 'Membantu pembaca yang membutuhkan pendampingan teknisi langsung atau remote.'
        },
        {
          anchorText: 'Kumpulan Artikel Keamanan & Optimasi Perangkat',
          targetPath: '/articles',
          reason: 'Menambah pemahaman konsep perawatan jangka panjang.'
        },
        {
          anchorText: 'Konsultasi Kendala Teknis Perangkat',
          targetPath: '/contact',
          reason: 'Jalur konsultasi langsung jika kendala mengarah ke kerusakan perangkat keras.'
        }
      ],
      isDemoData: false,
      isAiGenerated: true
    };
    return { tutorial: fallbackTut, source: 'fallback' };
  }
}

export async function generateAiArticleContent(
  params: ArticleGenerationOptions
): Promise<{ article: Omit<Article, 'id'>; source: 'api' | 'fallback' }> {
  const targetTopic = params.topic.trim();
  const author = params.authorName || 'Risa Kurniawan';
  const targetAudience = params.targetAudience?.trim() || 'Umum, Pemula, & Praktisi IT';
  const focusKw = params.focusKeyword?.trim() || targetTopic;
  const baseTitle = params.customTitle?.trim() || targetTopic;
  const supportingKws =
    params.supportingKeywords && params.supportingKeywords.length > 0
      ? params.supportingKeywords
      : [
          params.category.toLowerCase(),
          'panduan praktis IT',
          'optimasi sistem komputer',
          'keamanan dan stabilitas kerja'
        ];

  try {
    const response = await fetch('/api/ai/generate-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: targetTopic,
        category: params.category,
        authorName: author,
        customTitle: params.customTitle,
        targetAudience: params.targetAudience,
        articleGoal: params.articleGoal,
        articleType: params.articleType,
        wordCountTarget: params.wordCountTarget,
        focusKeyword: params.focusKeyword,
        supportingKeywords: params.supportingKeywords,
        referencesInput: params.referencesInput
      }),
      signal: AbortSignal.timeout(12000)
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
    const cleanSlug = slugifyTopic(baseTitle).split('-').slice(0, 7).join('-');
    const seoTitle =
      baseTitle.length <= 68
        ? baseTitle
        : baseTitle.slice(0, 65).replace(/\s+\S*$/, '').trim() || baseTitle.slice(0, 65).trim();
    const metaCandidate = `Pelajari ${focusKw}: konsep inti, langkah penerapan praktis, kesalahan umum, dan solusi efisien bagi pengguna.`;
    const metaDescRaw =
      metaCandidate.length <= 160
        ? metaCandidate
        : `Pelajari panduan lengkap ${focusKw}: konsep inti, langkah penerapan praktis, dan solusi efisien untuk sistem kerja Anda.`;
    const metaDescription =
      metaDescRaw.length <= 160
        ? metaDescRaw
        : metaDescRaw.slice(0, 158).replace(/\s+\S*$/, '').trim();

    const fallbackArt: Omit<Article, 'id'> = {
      title: baseTitle,
      seoTitle,
      metaDescription,
      slug: cleanSlug || `art-${Date.now().toString().slice(-6)}`,
      summary: metaDescription,
      focusKeyword: focusKw,
      supportingKeywords: supportingKws,
      introduction: `Pembahasan mengenai ${focusKw} semakin penting seiring meningkatnya kebutuhan stabilitas dan efisiensi sistem digital. Artikel ini menyajikan analisis terstruktur, langkah penerapan praktis, serta jawaban atas pertanyaan yang sering diajukan pembaca dalam kategori ${params.category}.`,
      category: params.category,
      publishedDate: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      readTimeMinutes: 7,
      thumbnail: '/images/hero_creative_workspace_1793775537391.jpg',
      author,
      tags: [focusKw, ...supportingKws.slice(0, 3)],
      sections: [
        {
          heading: `Memahami Konsep Inti dan Urgensi ${focusKw}`,
          body: `Dalam ekosistem kerja modern, pemahaman yang solid seputar ${focusKw} membantu pengguna menjaga stabilitas perangkat serta meminimalkan gangguan operasional sehari-hari.`,
          highlight:
            'Efisiensi sistem tidak hanya bergantung pada spesifikasi perangkat keras tinggi, tetapi juga konfigurasi tepat dan evaluasi berkala.',
          subSections: [
            {
              subHeading: 'Pemetaan Kebutuhan dan Konteks Kerja',
              body: `Sebelum menerapkan ${baseTitle}, kenali terlebih dahulu kebutuhan beban kerja, kompatibilitas perangkat, dan kesiapan pengguna.`
            }
          ],
          bulletPoints: [
            'Meningkatkan stabilitas dan kecepatan respons sistem kerja.',
            'Memudahkan identifikasi dini terhadap potensi error atau bottleneck.',
            'Mendukung kebiasaan pencadangan data yang konsisten.'
          ]
        },
        {
          heading: 'Analisis Tantangan & Praktik Penerapan di Lapangan',
          body: 'Kunci keberhasilan implementasi adalah mendahulukan utilitas resmi yang terverifikasi, mendokumentasikan perubahan konfigurasi, serta melakukan uji coba bertahap sebelum diterapkan secara menyeluruh.',
          bulletPoints: [
            'Hindari pemasangan aplikasi pihak ketiga yang tidak jelas sumbernya.',
            'Catat konfigurasi awal sebelum melakukan penyesuaian teknis.',
            'Lakukan pemeriksaan berkala minimal satu kali setiap bulan.'
          ]
        }
      ],
      practicalInsights: {
        title: 'Wawasan Praktis & Kesalahan yang Harus Dihindari',
        items: [
          'Tips Praktis: Jadwalkan pemeriksaan rutin untuk memantau penyimpanan, pembaruan keamanan, dan log sistem.',
          'Kesalahan Umum: Mengubah konfigurasi inti tanpa mencadangkan data kerja terlebih dahulu.',
          'Rekomendasi: Selalu rujuk dokumentasi resmi penyedia sistem operasi atau perangkat keras.'
        ]
      },
      faqs: [
        {
          question: `Mengapa topik ${focusKw} penting diterapkan secara rutin?`,
          answer: 'Karena penerapan yang konsisten mencegah penurunan performa perangkat dan mengurangi risiko kehilangan data.'
        },
        {
          question: 'Apakah panduan ini dapat diterapkan oleh pemula?',
          answer: 'Ya, seluruh langkah disusun secara bertahap dan mengutamakan fitur bawaan yang aman.'
        },
        {
          question: 'Apa hal pertama yang perlu disiapkan sebelum menerapkan langkah teknis?',
          answer: 'Pastikan berkas kerja penting telah dicadangkan ke media eksternal atau penyimpanan cloud.'
        }
      ],
      conclusion: `Dengan memahami dan menerapkan prinsip utama seputar ${focusKw} secara konsisten, Anda dapat menjaga keandalan sistem sekaligus meningkatkan produktivitas kerja harian.`,
      references: [
        ...(params.referencesInput
          ? [{ title: 'Referensi Pilihan Penulis', publisher: 'Sumber Pengguna', url: params.referencesInput }]
          : []),
        {
          title: 'Dokumentasi Praktik Terbaik Manajemen Sistem & Infrastruktur IT',
          publisher: 'Microsoft Learn',
          url: 'https://learn.microsoft.com/'
        }
      ],
      internalLinkingSuggestions: [
        {
          anchorText: 'Layanan Pembuatan Website & IT Support',
          targetPath: '/services',
          reason: 'Membantu pembaca yang memerlukan pendampingan teknis profesional.'
        },
        {
          anchorText: 'Panduan Tutorial IT Support Lengkap',
          targetPath: '/tutorials',
          reason: 'Memberikan panduan teknis langkah demi langkah terkait sistem.'
        }
      ],
      featuredImageRecommendation: `Foto ruang kerja IT modern dengan laptop/monitor yang bersih sesuai topik ${params.category}.`,
      imageAltText: `${baseTitle} — panduan teknis ${params.category.toLowerCase()} oleh ${author}`,
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
