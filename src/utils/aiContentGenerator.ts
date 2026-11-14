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
