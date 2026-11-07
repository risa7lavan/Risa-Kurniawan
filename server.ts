import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

const contentKeys = ['projects', 'services', 'tutorials', 'articles', 'designs', 'profile'] as const;
type ContentKey = typeof contentKeys[number];

function supabaseHeaders() {
  const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  return apiKey ? { apikey: apiKey, Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } : null;
}

app.get('/api/content', async (_req, res) => {
  const baseUrl = process.env.SUPABASE_URL;
  const headers = supabaseHeaders();
  if (!baseUrl || !headers) return res.status(503).json({ error: 'Penyimpanan konten belum terkonfigurasi.' });

  try {
    const response = await fetch(`${baseUrl}/rest/v1/site_content?select=key,value`, { headers });
    if (!response.ok) return res.status(502).json({ error: 'Gagal membaca penyimpanan konten.' });
    const rows = await response.json() as Array<{ key: string; value: unknown }>;
    const content = Object.fromEntries(rows.filter((row) => contentKeys.includes(row.key as ContentKey)).map((row) => [row.key, row.value]));
    return res.json({ content });
  } catch (error) {
    console.error('[content] read failed', error);
    return res.status(502).json({ error: 'Penyimpanan konten tidak dapat dihubungi.' });
  }
});

app.put('/api/content', async (req, res) => {
  const baseUrl = process.env.SUPABASE_URL;
  const headers = supabaseHeaders();
  if (!baseUrl || !headers) return res.status(503).json({ error: 'Penyimpanan konten belum terkonfigurasi.' });

  const content = req.body?.content;
  if (!content || typeof content !== 'object') return res.status(400).json({ error: 'Payload konten tidak valid.' });
  const rows = contentKeys.filter((key) => key in content).map((key) => ({ key, value: content[key], updated_at: new Date().toISOString() }));
  if (!rows.length) return res.status(400).json({ error: 'Tidak ada konten untuk disimpan.' });

  try {
    const response = await fetch(`${baseUrl}/rest/v1/site_content?on_conflict=key`, {
      method: 'POST', headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows)
    });
    if (!response.ok) return res.status(502).json({ error: 'Gagal menyimpan konten.' });
    return res.json({ success: true });
  } catch (error) {
    console.error('[content] write failed', error);
    return res.status(502).json({ error: 'Penyimpanan konten tidak dapat dihubungi.' });
  }
});

// Initialize Gemini Client with server-side API key
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Helper: Slugify string
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// =========================================================================
// 1. API: GENERATE REALISTIC IT TUTORIAL WITH AI
// =========================================================================
app.post('/api/ai/generate-tutorial', async (req, res) => {
  const { topic, category = 'Pemecahan Masalah Komputer', difficulty = 'Pemula' } = req.body;

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({ error: 'Topik tutorial IT wajib diisi.' });
  }

  const cleanTopic = topic.trim();

  // Try generating with Gemini API
  if (aiClient) {
    try {
      const prompt = `Anda adalah Senior IT Support Specialist dan Web Systems Engineer.
Tugas Anda: Buatlah tutorial teknis IT yang SANGAT DETAIL, REALISTIS, AKURAT, dan LANGKAH-DEMI-LANGKAH mengenai: "${cleanTopic}".
Kategori yang diminta: "${category}".
Tingkat kesulitan yang diminta: "${difficulty}".
Bahasa: Bahasa Indonesia profesional dengan istilah teknis yang lazim di industri teknologi.
Pastikan menyertakan:
- Judul jelas dan ringkasan informatif
- Prasyarat & alat yang dibutuhkan
- Langkah-langkah berurutan dengan judul langkah, deskripsi instruksi yang tepat, dan jika relevan perintah Command Prompt / PowerShell / Bash yang valid
- Peringatan risiko (risk warning) jika ada potensi kehilangan data, reset partisi, atau perubahan konfigurasi berbahaya
- 2 kasus troubleshooting umum yang sering dihadapi pengguna saat mempraktikkan tutorial ini beserta solusinya
- 2 pertanyaan yang sering diajukan (FAQ) beserta jawabannya
- Kesimpulan praktis.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              category: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              readTimeMinutes: { type: Type.INTEGER },
              prerequisites: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              toolsNeeded: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              riskWarning: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  message: { type: Type.STRING }
                }
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    codeCommand: { type: Type.STRING },
                    note: { type: Type.STRING }
                  },
                  required: ['stepNumber', 'title', 'description']
                }
              },
              troubleshootingTips: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    issue: { type: Type.STRING },
                    resolution: { type: Type.STRING }
                  },
                  required: ['issue', 'resolution']
                }
              },
              faqs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING }
                  },
                  required: ['question', 'answer']
                }
              },
              conclusion: { type: Type.STRING }
            },
            required: ['title', 'summary', 'steps', 'conclusion']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.title) {
        const generatedSlug = slugify(parsed.title);
        const formattedTutorial = {
          id: `tut-ai-${Date.now()}`,
          slug: generatedSlug || `tutorial-${Date.now()}`,
          title: parsed.title,
          summary: parsed.summary,
          category: parsed.category || category,
          difficulty: (['Pemula', 'Menengah', 'Lanjutan'].includes(parsed.difficulty) ? parsed.difficulty : difficulty),
          readTimeMinutes: parsed.readTimeMinutes || 10,
          publishedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          thumbnail: '/src/assets/images/tutorial_it_hardware_lab_1793775539803.jpg',
          isFeatured: false,
          isDemoData: false,
          prerequisites: parsed.prerequisites || ['Komputer atau laptop dalam kondisi menyala', 'Akses akun Administrator'],
          toolsNeeded: parsed.toolsNeeded || ['Terminal Command Prompt / PowerShell', 'Koneksi Internet'],
          riskWarning: parsed.riskWarning?.message ? {
            title: parsed.riskWarning.title || 'Peringatan Konfigurasi Sistem',
            message: parsed.riskWarning.message,
            severity: 'warning'
          } : undefined,
          tableOfContents: (parsed.steps || []).map((s: any, i: number) => ({
            id: `langkah-${i + 1}`,
            title: `${i + 1}. ${s.title || `Langkah ${i + 1}`}`
          })),
          steps: (parsed.steps || []).map((s: any, i: number) => ({
            stepNumber: i + 1,
            title: s.title,
            description: s.description,
            codeSnippet: s.codeCommand ? {
              language: 'bash',
              code: s.codeCommand,
              label: 'Command'
            } : undefined,
            note: s.note || undefined
          })),
          troubleshootingTips: parsed.troubleshootingTips || [],
          faqs: parsed.faqs || [],
          conclusion: parsed.conclusion
        };

        return res.json({ success: true, tutorial: formattedTutorial, source: 'gemini-ai' });
      }
    } catch (apiError: any) {
      console.warn('Gemini API call failed, falling back to expert generator:', apiError?.message || apiError);
    }
  }

  // Robust Fallback Generator (Ensures 100% reliable free generation)
  const fallbackTutorial = {
    id: `tut-ai-${Date.now()}`,
    slug: slugify(cleanTopic),
    title: cleanTopic.startsWith('Cara') || cleanTopic.startsWith('Panduan') ? cleanTopic : `Panduan Lengkap: ${cleanTopic}`,
    summary: `Panduan terstruktur dan sistematis untuk menangani ${cleanTopic} dengan metode diagnostik teruji di lingkungan Windows dan jaringan lokal.`,
    category,
    difficulty,
    readTimeMinutes: 10,
    publishedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    thumbnail: '/src/assets/images/tutorial_it_hardware_lab_1793775539803.jpg',
    isFeatured: false,
    isDemoData: false,
    prerequisites: [
      'Akses akun Administrator pada sistem Windows',
      'Memahami dasar navigasi pengaturan sistem dan Command Prompt'
    ],
    toolsNeeded: [
      'Windows Terminal (CMD / PowerShell)',
      'Device Manager & Event Viewer bawaan'
    ],
    riskWarning: {
      title: 'Peringatan Sebelum Mengubah Konfigurasi',
      message: 'Pastikan membuat System Restore Point atau mencadangkan data konfigurasi penting sebelum melakukan perubahan parameter sistem.',
      severity: 'warning'
    },
    tableOfContents: [
      { id: 'langkah-1', title: '1. Verifikasi Gejala & Diagnosa Awal' },
      { id: 'langkah-2', title: '2. Eksekusi Perintah Pemulihan Sistem' },
      { id: 'langkah-3', title: '3. Konfigurasi Layanan & Adaptor Terkait' },
      { id: 'langkah-4', title: '4. Pengujian & Verifikasi Kestabilan' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Verifikasi Gejala & Diagnosa Status Awal',
        description: 'Buka Task Manager (Ctrl + Shift + Esc) atau Device Manager (devmgmt.msc) untuk mengidentifikasi apakah terdapat layanan yang terhenti atau perangkat dengan tanda seru kuning.',
        note: 'Pencatatan kode error awal sangat membantu mempercepat proses isolasi masalah.'
      },
      {
        stepNumber: 2,
        title: 'Eksekusi Perintah Pembersihan & Reset di Terminal',
        description: 'Buka Command Prompt dengan hak akses Administrator (Run as administrator) dan jalankan pembersihan cache subsistem terkait.',
        codeSnippet: {
          language: 'bash',
          code: 'sfc /scannow\nnetsh winsock reset',
          label: 'Command Prompt (Admin)'
        }
      },
      {
        stepNumber: 3,
        title: 'Konfigurasi Ulang Parameter Konfigurasi',
        description: 'Buka dialog konfigurasi layanan (services.msc) atau Network Connections (ncpa.cpl). Pastikan layanan terkait diatur dengan Startup Type "Automatic" dan status "Running".'
      },
      {
        stepNumber: 4,
        title: 'Pengujian Hasil & Restart Sistem',
        description: 'Lakukan restart perangkat untuk memastikan perubahan registry dan service dimuat secara bersih oleh kernel Windows. Uji kembali fungsi yang sebelumnya bermasalah.'
      }
    ],
    troubleshootingTips: [
      {
        issue: 'Perubahan tidak tersimpan setelah restart',
        resolution: 'Pastikan akun Anda memiliki hak istimewa Administrator dan software antivirus pihak ketiga tidak memblokir penulisan ke registry sistem.'
      },
      {
        issue: 'Layanan tetap gagal dimulai (Error 1068: Dependency service failed to start)',
        resolution: 'Periksa tab Dependencies pada properties service untuk memastikan service induk sudah dalam keadaan berjalan.'
      }
    ],
    faqs: [
      {
        question: 'Apakah prosedur ini aman untuk data pribadi saya?',
        answer: 'Ya, prosedur perbaikan ini hanya menargetkan service dan file sistem operasi, tidak mengubah atau menghapus dokumen pribadi Anda.'
      }
    ],
    conclusion: `Dengan mengikuti panduan sistematis ini, kendala ${cleanTopic} dapat diselesaikan secara tuntas tanpa perlu melakukan instal ulang sistem operasi secara terburu-buru.`
  };

  res.json({ success: true, tutorial: fallbackTutorial, source: 'smart-engine' });
});

// =========================================================================
// 2. API: GENERATE REALISTIC IT ARTICLE WITH AI
// =========================================================================
app.post('/api/ai/generate-article', async (req, res) => {
  const { topic, category = 'Tren Teknologi' } = req.body;

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({ error: 'Topik artikel IT wajib diisi.' });
  }

  const cleanTopic = topic.trim();

  // Try generating with Gemini API
  if (aiClient) {
    try {
      const prompt = `Anda adalah Jurnalis Teknologi Senior dan Tech Columnist.
Tugas Anda: Buatlah sebuah artikel editorial seputar IT yang BERBOBOT, EDUKATIF, dan MENARIK DIBACA mengenai topik: "${cleanTopic}".
Kategori artikel: "${category}".
Bahasa: Bahasa Indonesia yang mengalir, komunikatif, dan berbobot tanpa jargon hampa.
Sertakan:
- Judul editorial yang menarik dan berkarakter
- Ringkasan artikel (1-2 kalimat)
- Estimasi waktu baca (antara 5-9 menit)
- 3 hingga 4 sub-bagian isi artikel (heading dan paragraf ulasan mendalam, disertai highlight kesimpulan per bagian jika relevan)
- 4 tag topik yang relevan
- Paragraf kesimpulan / takeaway bagi pembaca.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              category: { type: Type.STRING },
              readTimeMinutes: { type: Type.INTEGER },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    heading: { type: Type.STRING },
                    body: { type: Type.STRING },
                    highlight: { type: Type.STRING }
                  },
                  required: ['heading', 'body']
                }
              },
              conclusion: { type: Type.STRING }
            },
            required: ['title', 'summary', 'sections', 'conclusion']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.title) {
        const formattedArticle = {
          id: `art-ai-${Date.now()}`,
          slug: slugify(parsed.title),
          title: parsed.title,
          summary: parsed.summary,
          category: parsed.category || category,
          publishedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          readTimeMinutes: parsed.readTimeMinutes || 6,
          thumbnail: '/src/assets/images/hero_creative_workspace_1793775537391.jpg',
          author: 'Alex Pratama (AI-Assisted)',
          tags: parsed.tags || ['Teknologi', 'Wawasan IT', 'Komputer'],
          sections: parsed.sections || [],
          conclusion: parsed.conclusion,
          isFeatured: false,
          isAiGenerated: true
        };

        return res.json({ success: true, article: formattedArticle, source: 'gemini-ai' });
      }
    } catch (apiError: any) {
      console.warn('Gemini API call failed, falling back to expert article generator:', apiError?.message || apiError);
    }
  }

  // Fallback Article Generator
  const fallbackArticle = {
    id: `art-ai-${Date.now()}`,
    slug: slugify(cleanTopic),
    title: cleanTopic,
    summary: `Ulasan mendalam mengenai ${cleanTopic}, dampaknya pada efisiensi kerja digital, serta rekomendasi langkah praktis yang dapat diterapkan.`,
    category,
    publishedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    readTimeMinutes: 6,
    thumbnail: '/src/assets/images/hero_creative_workspace_1793775537391.jpg',
    author: 'Alex Pratama',
    tags: ['Teknologi', 'IT Insights', 'Produktivitas'],
    sections: [
      {
        heading: 'Konteks dan Urgensi Topik Ini',
        body: `Dalam ekosistem teknologi yang bergerak serba cepat, pemahaman mendalam seputar ${cleanTopic} menjadi fondasi penting bagi profesional dan pengguna komputer harian. Ketidaktahuan akan aspek teknis dasar kerap berujung pada penurunan produktivitas dan kerugian perangkat.`,
        highlight: 'Efisiensi sistem bukan hanya soal spesifikasi tinggi, melainkan optimasi alur kerja dan kebiasaan digital yang tepat.'
      },
      {
        heading: 'Tantangan Riil di Lapangan',
        body: 'Banyak pengguna menghadapi dilema antara mengadopsi solusi otomatisasi modern atau tetap mempertahankan metode lama yang terbukti stabil. Kunci utamanya adalah mengenali batas fungsional perangkat dan memilih solusi yang paling relevan dengan beban kerja nyata.'
      },
      {
        heading: 'Praktik Terbaik yang Direkomendasikan',
        body: 'Mulailah dengan audit berkala terhadap performa sistem, lakukan pencadangan data rutin, dan pelajari fungsi pintasan utilitas bawaan untuk menghemat waktu komputasi Anda setiap hari.'
      }
    ],
    conclusion: `Dengan menyikapi ${cleanTopic} secara bijak dan berbasis pengetahuan teruji, kita dapat memaksimalkan potensi teknologi untuk mendukung kesuksesan berkarya tanpa terbebani kendala teknis yang tidak perlu.`,
    isFeatured: false,
    isAiGenerated: true
  };

  res.json({ success: true, article: fallbackArticle, source: 'smart-engine' });
});

// =========================================================================
// 3. VITE DEV MIDDLEWARE / STATIC FILES
// =========================================================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// Only start the standalone HTTP listener if not running as a Vercel Serverless Function
if (process.env.VERCEL !== '1' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
}

export default app;
