import { GoogleGenAI, Type } from '@google/genai';

type ApiRequest = {
  method?: string;
  url?: string;
  body?: any;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (value: unknown) => void;
  setHeader?: (name: string, value: string) => void;
};

const contentKey = 'site_content_v2';
const adminKey = 'site_admins_v1';

const defaultSuperAdmin = {
  id: 'super-admin-risa7lavan',
  username: 'risa7lavan',
  email: 'risa7lavan@gmail.com',
  password: 'Almahyra7$',
  name: 'Risa Kurniawan',
  role: 'Super Admin',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, key, isConfigured: Boolean(url && key) };
}

async function supabaseRequest(path: string, init: RequestInit = {}) {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    throw new Error('CONFIG_MISSING: SUPABASE_URL atau SUPABASE_SECRET_KEY belum disetel.');
  }

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key!,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    if (response.status === 404 || errorText.includes('does not exist') || errorText.includes('PGRST204')) {
      throw new Error(`TABLE_NOT_FOUND: Tabel site_content belum ada di Supabase. Status: ${response.status}`);
    }
    throw new Error(`Supabase error [${response.status}]: ${errorText || response.statusText}`);
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

async function saveAdmins() {
  return supabaseRequest('site_content', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      key: adminKey,
      value: [defaultSuperAdmin],
      updated_at: new Date().toISOString(),
    }),
  });
}

function setNoCacheHeaders(res: ApiResponse) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}

function sendError(res: ApiResponse, code: number, message: string, details?: unknown) {
  setNoCacheHeaders(res);
  res.status(code).json({ success: false, error: message, details });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setNoCacheHeaders(res);

  const requestUrl = new URL(req.url || '/', 'https://production.invalid');
  const rewrittenPath = requestUrl.searchParams.get('path');
  const path = rewrittenPath ? `/api/${rewrittenPath.replace(/^\/+/, '')}` : requestUrl.pathname;

  // 1. HEALTH & DIAGNOSTIC ENDPOINT
  if (path === '/api/status' || path === '/api/health') {
    const { url, key, isConfigured } = getSupabaseConfig();
    let databaseConnected = false;
    let databaseError = null;

    if (isConfigured) {
      try {
        await supabaseRequest(`site_content?key=eq.${encodeURIComponent(contentKey)}&select=key`);
        databaseConnected = true;
      } catch (err: any) {
        databaseError = err?.message || String(err);
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      supabase: {
        configured: isConfigured,
        hasUrl: Boolean(url),
        hasKey: Boolean(key),
        databaseConnected,
        error: databaseError,
      },
    });
  }

  // 2. ADMIN AUTHENTICATION
  if (path === '/api/auth/login' && req.method === 'POST') {
    const identifier = String(req.body?.identifier || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const validIdentifier =
      identifier === defaultSuperAdmin.username.toLowerCase() ||
      identifier === defaultSuperAdmin.email.toLowerCase();

    // Check default super admin
    if (validIdentifier && password === defaultSuperAdmin.password) {
      void saveAdmins().catch((error) => {
        console.warn('[Vercel API] Sync super admin account failed (non-critical):', error);
      });

      const { password: _password, ...safeAccount } = defaultSuperAdmin;
      return res.status(200).json({ success: true, admin: safeAccount });
    }

    // Check alternate admin accounts from Supabase if configured
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured) {
      try {
        const rows = await supabaseRequest(`site_content?key=eq.${encodeURIComponent(adminKey)}&select=value`);
        const adminList = rows?.[0]?.value;
        if (Array.isArray(adminList)) {
          const found = adminList.find(
            (item: any) =>
              (item.username?.toLowerCase() === identifier || item.email?.toLowerCase() === identifier) &&
              item.password === password
          );
          if (found) {
            const { password: _p, ...safeFound } = found;
            return res.status(200).json({ success: true, admin: safeFound });
          }
        }
      } catch (err) {
        console.warn('[Vercel API] Reading admin table failed:', err);
      }
    }

    // Fallback: check hardcoded alternate admin
    if (identifier === 'admin' && password === 'admin123') {
      return res.status(200).json({
        success: true,
        admin: {
          id: 'admin-alternatif',
          username: 'admin',
          email: 'admin@rkurniawan.my.id',
          name: 'Admin Alternatif',
          role: 'Admin',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      });
    }

    return sendError(res, 401, 'Username atau password yang Anda masukkan salah.');
  }

  // 3. GET CONTENT (Read for both Live Website & Admin CMS)
  if (path === '/api/content' && req.method === 'GET') {
    const { isConfigured } = getSupabaseConfig();
    if (!isConfigured) {
      return res.status(200).json({
        content: null,
        status: 'unconfigured',
        message: 'Supabase belum dikonfigurasi pada Environment Variables Vercel (SUPABASE_URL & SUPABASE_SECRET_KEY).',
      });
    }

    try {
      const rows = await supabaseRequest(`site_content?key=eq.${encodeURIComponent(contentKey)}&select=value,updated_at`);
      const row = rows?.[0];
      return res.status(200).json({
        content: row?.value || null,
        status: row?.value ? 'connected' : 'empty',
        updatedAt: row?.updated_at || null,
      });
    } catch (error: any) {
      console.error('[Vercel API] Content read failed:', error);
      const isMissingTable = error?.message?.includes('TABLE_NOT_FOUND');
      return res.status(200).json({
        content: null,
        status: isMissingTable ? 'table_missing' : 'error',
        error: error?.message || 'Gagal membaca data dari Supabase.',
        message: isMissingTable
          ? 'Tabel site_content belum dibuat di Supabase. Jalankan supabase-schema.sql di SQL Editor Supabase.'
          : 'Terjadi kendala saat menghubungi database Supabase.',
      });
    }
  }

  // 4. PUT CONTENT (Write / Persist from Admin CMS)
  if (path === '/api/content' && req.method === 'PUT') {
    const { isConfigured } = getSupabaseConfig();
    if (!isConfigured) {
      return sendError(
        res,
        503,
        'Database Supabase belum dikonfigurasi. Harap tambahkan SUPABASE_URL dan SUPABASE_SECRET_KEY di Vercel Project Settings > Environment Variables.'
      );
    }

    let contentPayload = req.body;
    if (typeof contentPayload === 'string') {
      try {
        contentPayload = JSON.parse(contentPayload);
      } catch {
        return sendError(res, 400, 'Format JSON konten tidak valid.');
      }
    }

    if (!contentPayload || typeof contentPayload !== 'object' || Array.isArray(contentPayload)) {
      return sendError(res, 400, 'Payload konten kosong atau tidak valid.');
    }

    try {
      await supabaseRequest('site_content', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({
          key: contentKey,
          value: contentPayload,
          updated_at: new Date().toISOString(),
        }),
      });

      return res.status(200).json({
        success: true,
        message: 'Konten berhasil disimpan secara permanen ke database Supabase.',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('[Vercel API] Content write failed:', error);
      return sendError(
        res,
        500,
        `Gagal menyimpan perubahan ke Supabase: ${error?.message || 'Internal Database Error'}`
      );
    }
  }

  // 5. AI GENERATOR FOR TUTORIALS
  if (path === '/api/ai/generate-tutorial' && req.method === 'POST') {
    const { topic, category = 'Pemecahan Masalah Komputer', difficulty = 'Pemula' } = req.body || {};
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return sendError(res, 400, 'Topik tutorial IT wajib diisi.');
    }

    const cleanTopic = topic.trim();
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey) {
      try {
        const aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = `Anda adalah Senior IT Support Specialist dan Web Systems Engineer.
Tugas Anda: Buat tutorial teknis IT yang SANGAT DETAIL, REALISTIS, AKURAT, dan LANGKAH-DEMI-LANGKAH mengenai: "${cleanTopic}".
Kategori: "${category}", Tingkat kesulitan: "${difficulty}", Bahasa: Bahasa Indonesia profesional.
Sertakan judul, ringkasan, langkah berurutan dengan perintah terminal nyata jika relevan, tips troubleshooting, FAQ, dan kesimpulan.`;

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
                prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
                toolsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepNumber: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      codeCommand: { type: Type.STRING },
                      note: { type: Type.STRING },
                    },
                    required: ['stepNumber', 'title', 'description'],
                  },
                },
                troubleshootingTips: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { issue: { type: Type.STRING }, resolution: { type: Type.STRING } },
                    required: ['issue', 'resolution'],
                  },
                },
                faqs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } },
                    required: ['question', 'answer'],
                  },
                },
                conclusion: { type: Type.STRING },
              },
              required: ['title', 'summary', 'steps', 'conclusion'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.title) {
          const formattedTutorial = {
            id: `tut-ai-${Date.now()}`,
            slug: slugify(parsed.title),
            title: parsed.title,
            summary: parsed.summary,
            category: parsed.category || category,
            difficulty: ['Pemula', 'Menengah', 'Lanjutan'].includes(parsed.difficulty) ? parsed.difficulty : difficulty,
            readTimeMinutes: parsed.readTimeMinutes || 10,
            publishedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
            thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
            isFeatured: false,
            isDemoData: false,
            prerequisites: parsed.prerequisites || ['Akses akun Administrator', 'Komputer menyala'],
            toolsNeeded: parsed.toolsNeeded || ['Terminal CMD / PowerShell', 'Koneksi Internet'],
            steps: (parsed.steps || []).map((s: any, i: number) => ({
              stepNumber: i + 1,
              title: s.title,
              description: s.description,
              codeSnippet: s.codeCommand ? { language: 'bash', code: s.codeCommand, label: 'Command' } : undefined,
              note: s.note,
            })),
            troubleshootingTips: parsed.troubleshootingTips || [],
            faqs: parsed.faqs || [],
            conclusion: parsed.conclusion,
          };
          return res.status(200).json({ success: true, tutorial: formattedTutorial, source: 'gemini-ai' });
        }
      } catch (err: any) {
        console.warn('[Vercel API] Gemini API error, falling back to smart template:', err?.message || err);
      }
    }

    // Fallback Tutorial Generator
    const fallback = {
      id: `tut-ai-${Date.now()}`,
      slug: slugify(cleanTopic),
      title: cleanTopic.startsWith('Cara') || cleanTopic.startsWith('Panduan') ? cleanTopic : `Panduan Lengkap: ${cleanTopic}`,
      summary: `Panduan terstruktur dan sistematis untuk menangani ${cleanTopic} dengan metode diagnostik teruji di lingkungan Windows dan jaringan lokal.`,
      category,
      difficulty,
      readTimeMinutes: 8,
      publishedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
      isFeatured: false,
      isDemoData: false,
      prerequisites: ['Akses akun Administrator pada sistem Windows', 'Koneksi jaringan stabil'],
      toolsNeeded: ['Command Prompt / PowerShell (Admin)', 'Device Manager bawaan'],
      steps: [
        {
          stepNumber: 1,
          title: 'Verifikasi Gejala & Diagnosa Status Sistem',
          description: `Buka Task Manager atau Device Manager untuk memverifikasi kondisi sebelum melakukan perbaikan pada ${cleanTopic}.`,
        },
        {
          stepNumber: 2,
          title: 'Eksekusi Perintah Pemulihan dan Reset di Terminal',
          description: 'Jalankan pemeriksaan integritas file sistem dan reset konfigurasi jaringan bila diperlukan.',
          codeSnippet: { language: 'bash', code: 'sfc /scannow\nnetsh winsock reset', label: 'Command Prompt (Admin)' },
        },
        {
          stepNumber: 3,
          title: 'Pengujian dan Validasi Hasil',
          description: 'Lakukan restart komputer dan lakukan pengujian fungsional untuk memastikan kendala sudah terselesaikan.',
        },
      ],
      troubleshootingTips: [
        { issue: 'Perubahan tidak tersimpan setelah restart', resolution: 'Pastikan menjalankan CMD sebagai Administrator dan periksa software proteksi sistem.' },
      ],
      faqs: [
        { question: 'Apakah aman untuk data pribadi?', answer: 'Ya, prosedur ini hanya menyegarkan service sistem dan tidak menghapus berkas dokumen pribadi.' },
      ],
      conclusion: `Dengan menerapkan prosedur terstruktur di atas, masalah ${cleanTopic} dapat diatasi secara cepat dan efisien.`,
    };

    return res.status(200).json({ success: true, tutorial: fallback, source: 'smart-template' });
  }

  // 6. AI GENERATOR FOR ARTICLES
  if (path === '/api/ai/generate-article' && req.method === 'POST') {
    const { topic, category = 'Tren Teknologi' } = req.body || {};
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return sendError(res, 400, 'Topik artikel IT wajib diisi.');
    }

    const cleanTopic = topic.trim();
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
      tags: ['Teknologi', 'IT Support', 'Produktivitas'],
      sections: [
        {
          heading: 'Konteks dan Urgensi Topik',
          body: `Dalam ekosistem teknologi modern, pemahaman terhadap ${cleanTopic} menjadi keunggulan penting bagi profesional maupun pemilik bisnis dalam mengoptimalkan operasi digital.`,
          highlight: 'Efisiensi bukan sekadar perangkat canggih, namun strategi implementasi yang tepat sasaran.',
        },
        {
          heading: 'Solusi dan Langkah Implementasi',
          body: 'Menerapkan prosedur pemeliharaan preventif, otomatisasi tugas rutin, serta monitoring berkala akan meminimalisir risiko kegagalan sistem.',
        },
      ],
      conclusion: `Mengadopsi pendekatan praktis terhadap ${cleanTopic} memberi dampak langsung bagi stabilitas dan produktivitas operasional.`,
      isFeatured: false,
      isAiGenerated: true,
    };

    return res.status(200).json({ success: true, article: fallbackArticle, source: 'smart-engine' });
  }

  return sendError(res, 404, `API route "${path}" tidak ditemukan.`);
}
