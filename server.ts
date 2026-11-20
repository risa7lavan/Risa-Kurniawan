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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.STORAGE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY;
const contentKey = 'site_content_v2';
const adminKey = 'site_admins_v1';
const defaultSuperAdmin = {
  id: 'super-admin-risa7lavan',
  username: 'risa7lavan',
  email: 'risa7lavan@gmail.com',
  password: 'Almahyra7$',
  name: 'Super Admin',
  role: 'Super Admin',
  createdAt: '2026-01-01T00:00:00.000Z'
};

async function supabaseRequest(path: string, init: RequestInit = {}) {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Supabase request failed [${response.status}]: ${errorText || response.statusText}`);
  }

  const text = await response.text();
  if (!text || !text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function readContentRow() {
  const rows = await supabaseRequest(`site_content?key=eq.${encodeURIComponent(contentKey)}&select=value,updated_at`);
  return rows?.[0] || null;
}

async function readContent() {
  const row = await readContentRow();
  return row?.value || null;
}

function sanitizeContentForPublic(content: any) {
  if (!content || typeof content !== 'object') return content;
  if (!Array.isArray(content.adminUsers)) return content;
  return {
    ...content,
    adminUsers: content.adminUsers.map((u: any) => {
      if (!u || typeof u !== 'object') return u;
      const { password: _pw, ...safeAdmin } = u;
      return safeAdmin;
    })
  };
}

async function readAdmins(): Promise<any[]> {
  const rows = await supabaseRequest(`site_content?key=eq.${encodeURIComponent(adminKey)}&select=value`);
  const existing = rows?.[0]?.value;
  if (!Array.isArray(existing) || existing.length === 0) {
    await writeAdmins([defaultSuperAdmin]);
    return [defaultSuperAdmin];
  }
  const hasSuperAdmin = existing.some(
    (item: any) =>
      item?.username?.toLowerCase() === defaultSuperAdmin.username &&
      item?.email?.toLowerCase() === defaultSuperAdmin.email
  );
  if (!hasSuperAdmin) {
    const merged = [defaultSuperAdmin, ...existing];
    await writeAdmins(merged);
    return merged;
  }
  return existing;
}

async function writeAdmins(value: unknown) {
  return supabaseRequest('site_content', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ key: adminKey, value, updated_at: new Date().toISOString() })
  });
}

async function writeContent(value: any) {
  let payloadToStore = value;

  if (payloadToStore && typeof payloadToStore === 'object' && Array.isArray(payloadToStore.adminUsers)) {
    const existingContent = await readContent().catch(() => null);
    const existingAdminsFromContent = Array.isArray(existingContent?.adminUsers) ? existingContent.adminUsers : [];
    const existingAdminsFromKey = await readAdmins().catch(() => []);
    const storedAdmins = [...existingAdminsFromContent, ...existingAdminsFromKey];

    const mergedAdmins = payloadToStore.adminUsers.map((incoming: any) => {
      if (!incoming || typeof incoming !== 'object') return incoming;
      if (incoming.password && String(incoming.password).trim() !== '') {
        return incoming;
      }
      const match = storedAdmins.find(
        (prev: any) =>
          (prev?.id && incoming.id && prev.id === incoming.id) ||
          (prev?.username && incoming.username && prev.username.toLowerCase() === incoming.username.toLowerCase())
      );
      if (match?.password) {
        return { ...incoming, password: match.password };
      }
      if (incoming.username?.toLowerCase() === defaultSuperAdmin.username) {
        return { ...incoming, password: defaultSuperAdmin.password };
      }
      return incoming;
    });

    payloadToStore = { ...payloadToStore, adminUsers: mergedAdmins };

    // Keep site_admins_v1 in sync non-blockingly
    const hasSuper = mergedAdmins.some(
      (u: any) => u?.username?.toLowerCase() === defaultSuperAdmin.username
    );
    const syncedAdmins = hasSuper ? mergedAdmins : [defaultSuperAdmin, ...mergedAdmins];
    void writeAdmins(syncedAdmins).catch((err) =>
      console.warn('[Server API] Failed to sync site_admins_v1:', err)
    );
  }

  return supabaseRequest('site_content', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ key: contentKey, value: payloadToStore, updated_at: new Date().toISOString() })
  });
}

function setNoCacheHeaders(res: express.Response) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

app.get('/api/status', async (_req, res) => {
  setNoCacheHeaders(res);
  const isConfigured = Boolean(supabaseUrl && supabaseServiceKey);
  let databaseConnected = false;
  let hasContentRow = false;
  let contentUpdatedAt: string | null = null;
  let databaseError = null;

  if (isConfigured) {
    try {
      const rows = await supabaseRequest(`site_content?key=eq.${encodeURIComponent(contentKey)}&select=key,updated_at`);
      databaseConnected = true;
      hasContentRow = Array.isArray(rows) && rows.length > 0;
      contentUpdatedAt = rows?.[0]?.updated_at || null;
    } catch (err: any) {
      databaseError = err?.message || String(err);
    }
  }

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: 'node',
    supabase: {
      configured: isConfigured,
      hasUrl: Boolean(supabaseUrl),
      hasKey: Boolean(supabaseServiceKey),
      databaseConnected,
      hasContentRow,
      contentUpdatedAt,
      error: databaseError,
    },
  });
});

app.get('/api/content', async (_req, res) => {
  setNoCacheHeaders(res);
  const isConfigured = Boolean(supabaseUrl && supabaseServiceKey);
  if (!isConfigured) {
    return res.json({
      content: null,
      status: 'unconfigured',
      message: 'Supabase belum dikonfigurasi di file .env lokal (SUPABASE_URL & SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY).'
    });
  }

  try {
    const row = await readContentRow();
    const content = sanitizeContentForPublic(row?.value || null);
    res.json({
      content,
      status: content ? 'connected' : 'empty',
      updatedAt: row?.updated_at || null,
    });
  } catch (err: any) {
    console.error('[Server API] Content read failed:', err);
    res.status(200).json({
      content: null,
      status: 'error',
      error: err?.message || 'Konten tidak dapat dimuat dari Supabase.'
    });
  }
});

app.put('/api/content', async (req, res) => {
  setNoCacheHeaders(res);
  const isConfigured = Boolean(supabaseUrl && supabaseServiceKey);
  if (!isConfigured) {
    return res.status(503).json({
      success: false,
      error: 'Database Supabase belum dikonfigurasi. Harap tentukan SUPABASE_URL dan SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY di file .env.'
    });
  }

  try {
    await writeContent(req.body);
    res.json({
      success: true,
      message: 'Konten berhasil disimpan secara permanen ke Supabase.',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[Server API] Content write failed:', err);
    res.status(500).json({
      success: false,
      error: `Konten gagal disimpan ke Supabase: ${err?.message || 'Unknown database error'}`
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const identifier = String(req.body?.identifier || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  const isSuperAdminLogin =
    (identifier === defaultSuperAdmin.username || identifier === defaultSuperAdmin.email) &&
    password === defaultSuperAdmin.password;

  try {
    if (isSuperAdminLogin) {
      const { password: _password, ...safeAccount } = defaultSuperAdmin;
      return res.json({ success: true, admin: safeAccount });
    }

    // Check dynamic admins from site_content_v2 and site_admins_v1
    const contentSnapshot = await readContent().catch(() => null);
    const contentAdmins = Array.isArray(contentSnapshot?.adminUsers) ? contentSnapshot.adminUsers : [];
    const storedAdmins = await readAdmins().catch(() => []);
    const allAdmins = [...contentAdmins, ...storedAdmins];

    const account = allAdmins.find(
      (item: any) =>
        item &&
        item.password &&
        (item.username?.toLowerCase() === identifier || item.email?.toLowerCase() === identifier) &&
        item.password === password
    );

    if (account) {
      const { password: _password, ...safeAccount } = account;
      return res.json({ success: true, admin: safeAccount });
    }

    // Fallback alternate admin if not overridden
    if (identifier === 'admin' && password === 'admin123') {
      return res.json({
        success: true,
        admin: {
          id: 'admin-alternatif',
          username: 'admin',
          email: 'admin@rkurniawan.my.id',
          name: 'Admin Alternatif',
          role: 'Admin',
          createdAt: '2026-01-01T00:00:00.000Z'
        }
      });
    }

    return res.status(401).json({ error: 'Username atau password yang Anda masukkan salah.' });
  } catch (error) {
    console.error('[v0] Admin login failed:', error);
    return res.status(500).json({ error: 'Layanan login sedang tidak tersedia.' });
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
        model: 'gemini-4-hydrogen',
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
          thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
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
    thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
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
        model: 'gemini-4-hydrogen',
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
          thumbnail: '/images/hero_creative_workspace_1793775537391.jpg',
          author: 'Risa Kurniawan',
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
    thumbnail: '/images/hero_creative_workspace_1793775537391.jpg',
    author: 'Risa Kurniawan',
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
// 2.5. API: GENERATE CATEGORY-SPECIFIC TOPICS FOR ARTICLES & TUTORIALS
// =========================================================================
const TOPIC_BANK: Record<'article' | 'tutorial', Record<string, string[]>> = {
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
      'Mengenal Teknologi Baterai Laptop Modern agar Tidak Cepat Mengalami Penurunan Kesehatan',
      'Monitor IPS vs OLED untuk Kerja IT dan Coding Seharian: Mana Lebih Nyaman di Mata?',
      'USB4 dan Thunderbolt 4: Solusi Satu Kabel untuk Docking Station Kerja Profesional'
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

app.post('/api/ai/generate-topics', async (req, res) => {
  const {
    type = 'article',
    category = 'Tren Teknologi',
    difficulty = 'Pemula',
    count = 5,
    excludeTopics = []
  } = req.body || {};

  const safeType: 'article' | 'tutorial' = type === 'tutorial' ? 'tutorial' : 'article';
  const safeCount = Math.min(Math.max(Number(count) || 5, 3), 8);
  const excludedSet = new Set(
    (Array.isArray(excludeTopics) ? excludeTopics : []).map((t: unknown) => String(t).trim().toLowerCase())
  );

  if (aiClient) {
    try {
      const roleDesc =
        safeType === 'article'
          ? 'Jurnalis Teknologi Senior dan Editor Konten IT'
          : 'Senior IT Support Specialist dan Instruktur Teknis';
      const contentLabel = safeType === 'article' ? 'artikel teknologi' : `tutorial teknis IT (tingkat ${difficulty})`;
      const excludeText =
        excludedSet.size > 0
          ? `\nHindari mengulang atau terlalu mirip dengan topik berikut:\n- ${Array.from(excludedSet).slice(0, 15).join('\n- ')}`
          : '';

      const prompt = `Anda adalah ${roleDesc}.
Tugas Anda: Hasilkan tepat ${safeCount} ide judul/topik ${contentLabel} yang SANGAT SPESIFIK, RELEVAN, MENARIK, dan PRAKTIS dalam Bahasa Indonesia untuk kategori: "${category}".
Setiap topik harus terasa nyata, dicari pembaca/praktisi IT, siap langsung dijadikan judul artikel/tutorial, dan memiliki sudut pandang berbeda satu sama lain.${excludeText}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Daftar ide topik spesifik sesuai kategori'
              }
            },
            required: ['topics']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      if (Array.isArray(parsed.topics) && parsed.topics.length > 0) {
        const cleaned = parsed.topics
          .map((t: unknown) => String(t).trim())
          .filter((t: string) => t.length > 8 && !excludedSet.has(t.toLowerCase()))
          .slice(0, safeCount);
        if (cleaned.length > 0) {
          return res.json({ success: true, topics: cleaned, category, type: safeType, source: 'gemini-ai' });
        }
      }
    } catch (apiError: any) {
      console.warn('Gemini topic generation failed, falling back to topic bank:', apiError?.message || apiError);
    }
  }

  const categoryMap = TOPIC_BANK[safeType];
  const pool = categoryMap[category] || Object.values(categoryMap).flat();
  const available = pool.filter((t) => !excludedSet.has(t.toLowerCase()));
  const sourcePool = available.length >= safeCount ? available : pool;
  const shuffled = [...sourcePool].sort(() => Math.random() - 0.5).slice(0, safeCount);

  return res.json({
    success: true,
    topics: shuffled,
    category,
    type: safeType,
    source: 'smart-engine'
  });
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
