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
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.STORAGE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY;
  return { url, key, isConfigured: Boolean(url && key) };
}

async function supabaseRequest(path: string, init: RequestInit = {}) {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    throw new Error('CONFIG_MISSING: SUPABASE_URL atau SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY belum disetel.');
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
    }),
  };
}

async function writeAdmins(value: unknown) {
  return supabaseRequest('site_content', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      key: adminKey,
      value,
      updated_at: new Date().toISOString(),
    }),
  });
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
      item?.username?.toLowerCase() === defaultSuperAdmin.username.toLowerCase() &&
      item?.email?.toLowerCase() === defaultSuperAdmin.email.toLowerCase()
  );
  if (!hasSuperAdmin) {
    const merged = [defaultSuperAdmin, ...existing];
    await writeAdmins(merged);
    return merged;
  }
  return existing;
}

function parseJsonBody(body: any): any {
  if (typeof body === 'string') {
    try {
      return body.trim() ? JSON.parse(body) : {};
    } catch {
      return null;
    }
  }
  return body || {};
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
  const normalizedRewritten = rewrittenPath ? rewrittenPath.replace(/^\/+|\/+$/g, '') : '';
  const path = rewrittenPath
    ? `/api/${normalizedRewritten}`
    : requestUrl.pathname.replace(/\/+$/, '') || '/';

  // 1. HEALTH & DIAGNOSTIC ENDPOINT
  if (path === '/api/status' || path === '/api/health') {
    const { url, key, isConfigured } = getSupabaseConfig();
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

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: 'vercel',
      supabase: {
        configured: isConfigured,
        hasUrl: Boolean(url),
        hasKey: Boolean(key),
        databaseConnected,
        hasContentRow,
        contentUpdatedAt,
        error: databaseError,
      },
    });
  }

  // 2. ADMIN AUTHENTICATION
  if (path === '/api/auth/login' && req.method === 'POST') {
    const parsedBody = parseJsonBody(req.body);
    if (!parsedBody) {
      return sendError(res, 400, 'Format body login tidak valid.');
    }

    const identifier = String(parsedBody?.identifier || '').trim().toLowerCase();
    const password = String(parsedBody?.password || '');
    const validIdentifier =
      identifier === defaultSuperAdmin.username.toLowerCase() ||
      identifier === defaultSuperAdmin.email.toLowerCase();

    // Check default super admin
    if (validIdentifier && password === defaultSuperAdmin.password) {
      const { password: _password, ...safeAccount } = defaultSuperAdmin;
      return res.status(200).json({ success: true, admin: safeAccount });
    }

    // Check dynamic admins from site_content_v2.adminUsers and site_admins_v1
    const { isConfigured } = getSupabaseConfig();
    if (isConfigured) {
      try {
        const contentSnapshot = await readContent().catch(() => null);
        const contentAdmins = Array.isArray(contentSnapshot?.adminUsers) ? contentSnapshot.adminUsers : [];
        const storedAdmins = await readAdmins().catch(() => []);
        const allAdmins = [...contentAdmins, ...storedAdmins];

        const found = allAdmins.find(
          (item: any) =>
            item &&
            item.password &&
            (item.username?.toLowerCase() === identifier || item.email?.toLowerCase() === identifier) &&
            item.password === password
        );
        if (found) {
          const { password: _p, ...safeFound } = found;
          return res.status(200).json({ success: true, admin: safeFound });
        }
      } catch (err) {
        console.warn('[Vercel API] Reading admin records failed:', err);
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
        message: 'Supabase belum dikonfigurasi pada Environment Variables Vercel (SUPABASE_URL & SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY).',
      });
    }

    try {
      const row = await readContentRow();
      const content = sanitizeContentForPublic(row?.value || null);
      return res.status(200).json({
        content,
        status: content ? 'connected' : 'empty',
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
        'Database Supabase belum dikonfigurasi. Harap tambahkan SUPABASE_URL dan SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY di Vercel Project Settings > Environment Variables.'
      );
    }

    const contentPayload = parseJsonBody(req.body);
    if (!contentPayload) {
      return sendError(res, 400, 'Format JSON konten tidak valid.');
    }

    if (typeof contentPayload !== 'object' || Array.isArray(contentPayload) || Object.keys(contentPayload).length === 0) {
      return sendError(res, 400, 'Payload konten kosong atau tidak valid.');
    }

    try {
      let payloadToStore = contentPayload;

      if (Array.isArray(payloadToStore.adminUsers)) {
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
          if (incoming.username?.toLowerCase() === defaultSuperAdmin.username.toLowerCase()) {
            return { ...incoming, password: defaultSuperAdmin.password };
          }
          return incoming;
        });

        payloadToStore = { ...payloadToStore, adminUsers: mergedAdmins };

        const hasSuper = mergedAdmins.some(
          (u: any) => u?.username?.toLowerCase() === defaultSuperAdmin.username.toLowerCase()
        );
        const syncedAdmins = hasSuper ? mergedAdmins : [defaultSuperAdmin, ...mergedAdmins];
        await writeAdmins(syncedAdmins).catch((err) =>
          console.warn('[Vercel API] Failed to sync site_admins_v1:', err)
        );
      }

      await supabaseRequest('site_content', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          key: contentKey,
          value: payloadToStore,
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

  const getAiClient = () => {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) return null;
    return new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  async function generateContentWithTimeout(client: GoogleGenAI, request: any, timeoutMs = 6500) {
    return await Promise.race([
      client.models.generateContent(request),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Gemini timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  const ARTICLE_CATEGORIES = [
    'Tren Teknologi',
    'Perangkat Keras & Gadget',
    'Keamanan Siber',
    'Sistem Operasi & Software',
    'Produktivitas IT',
  ];

  const TUTORIAL_CATEGORIES = [
    'Pemecahan Masalah Komputer',
    'Instalasi Windows',
    'Perangkat Keras & Peningkatan',
    'Jaringan',
    'Perangkat Lunak & Produktivitas',
    'Tips & Trik IT',
  ];

  const TOPIC_BANK: Record<'article' | 'tutorial', Record<string, string[]>> = {
    article: {
      'Tren Teknologi': [
        'Evolusi AI Agent Lokal untuk Otomatisasi Operasional UMKM Indonesia',
        'Mengapa Edge Computing Semakin Penting untuk Kecepatan Aplikasi Modern',
        'WebAssembly dan Masa Depan Aplikasi Berat di Dalam Browser Tanpa Instalasi',
        'Tren Arsitektur Serverless vs VPS Konvensional di Tahun 2026',
        'Dampak AI Coding Assistant terhadap Kualitas dan Kecepatan Pengembangan Web',
        'Standar Wi-Fi 7: Apa Keuntungan Nyatanya untuk Kantor Kecil dan Pekerja Remote',
        'Otomatisasi Workflow Tanpa Kode (No-Code) untuk Menghemat Jam Kerja Admin',
      ],
      'Perangkat Keras & Gadget': [
        'SSD NVMe PCIe Gen 4 vs Gen 5: Apakah Layak Upgrade untuk Laptop Harian?',
        'Memilih RAM DDR5 vs DDR4 di Tahun 2026: Analisis Rasio Harga dan Performa',
        'Pentingnya Thermal Paste Berkualitas Tinggi dan Pengaruhnya pada Umur Prosesor',
        'Panduan Memilih Mini PC Hemat Daya sebagai Home Server dan Workstation Kantor',
        'Monitor IPS vs OLED untuk Kerja IT dan Coding Seharian: Mana Lebih Nyaman di Mata?',
        'USB4 dan Thunderbolt 4: Solusi Satu Kabel untuk Docking Station Kerja Profesional',
        'Mengenal Teknologi Baterai Laptop Modern agar Tidak Cepat Mengalami Penurunan Kesehatan',
      ],
      'Keamanan Siber': [
        'Anatomi Serangan Phishing Berbasis AI dan Cara Melatih Tim agar Tidak Terkecoh',
        'Strategi Backup 3-2-1 untuk Melindungi Data Bisnis Kecil dari Ancaman Ransomware',
        'Passkey vs Password Tradisional: Mengapa Era Autentikasi Tanpa Kata Sandi Dimulai',
        'Bahaya Ekstensi Browser Berbahaya dan Cara Melakukan Audit Keamanan Chrome/Edge',
        'Mengamankan Jaringan Wi-Fi Kantor Menggunakan Segmentasi VLAN & Guest Network',
        'Cara Kerja Credential Stuffing dan Pentingnya Password Manager + 2FA',
        'Checklist Keamanan Dasar Sebelum Menggunakan Laptop di Jaringan Wi-Fi Publik',
      ],
      'Sistem Operasi & Software': [
        'Windows 11 LTSC vs Windows 11 Pro: Mana yang Paling Stabil untuk Komputer Kerja?',
        'Mengoptimalkan WSL2 di Windows untuk Lingkungan Development Web yang Ringan',
        'Mengapa Banyak Bisnis Mulai Beralih ke Software Open Source untuk Efisiensi Biaya',
        'Manajemen Update Sistem Operasi agar Komputer Kantor Tidak Restart Mendadak saat Kerja',
        'Membandingkan Browser Ringan Berbasis Chromium vs Firefox untuk Laptop RAM 8GB',
        'Peran Virtualisasi Ringan dan Container bagi IT Support Saat Menguji Software Baru',
        'Cara Mengidentifikasi Bloatware Sistem Operasi yang Memperlambat Performa Laptop Baru',
      ],
      'Produktivitas IT': [
        'Membangun Sistem Dokumentasi SOP IT Support agar Penanganan Masalah 3x Lebih Cepat',
        'Integrasi Terminal Pintar dan Skrip Otomatisasi untuk Tugas Harian Administrator IT',
        'Teknik Manajemen Tab, Shortcut Keyboard, dan Clipboard History untuk Kerja Cepat',
        'Menyusun Checklist Maintenance Bulanan Perangkat Komputer Perusahaan',
        'Strategi Sinkronisasi File Lintas Perangkat Tanpa Membebani Storage Lokal',
        'Cara Mengelola Tiket Bantuan IT Sederhana bagi Tim Operasional Kecil',
        'Kebiasaan Kebersihan Digital agar Laptop Tetap Responsif Bertahun-tahun',
      ],
    },
    tutorial: {
      'Pemecahan Masalah Komputer': [
        'Cara Mengatasi Blue Screen (BSOD) CRITICAL_PROCESS_DIED di Windows 11 Tanpa Instal Ulang',
        'Panduan Memperbaiki Penggunaan Disk 100% di Task Manager Windows 10 dan Windows 11',
        'Cara Mengatasi Laptop Sering Freeze atau Hang Mendadak Saat Membuka Banyak Aplikasi',
        'Solusi Memperbaiki Audio Laptop Tidak Keluar Suara Setelah Update Driver Windows',
        'Langkah Diagnosa File Sistem Korup Menggunakan SFC dan DISM Melalui Command Prompt',
        'Cara Mengatasi Port USB Tidak Terdeteksi di Windows akibat Konflik Power Management',
        'Cara Mengatasi Error Windows Update Stuck di 0% atau Gagal Install Permanen',
      ],
      'Instalasi Windows': [
        'Panduan Membuat Bootable USB Windows 11 UEFI GPT Menggunakan Rufus Tanpa Kendala TPM',
        'Cara Clean Install Windows 11 Langkah demi Langkah Tanpa Menghapus Partisi Data (D:)',
        'Checklist Wajib Setelah Instal Ulang Windows: Driver, Keamanan, dan Optimasi Awal',
        'Cara Konversi Disk MBR ke GPT Tanpa Kehilangan Data Menggunakan MBR2GPT',
        'Panduan Mengaktifkan BitLocker dan Membuat Recovery Key Setelah Instalasi Windows',
        'Cara Mengatasi Error "Windows Cannot Be Installed to This Disk" Saat Setup Partisi',
        'Langkah Backup Lisensi Digital Windows dan Driver Bawaan Sebelum Format Sistem',
      ],
      'Perangkat Keras & Peningkatan': [
        'Cara Mengecek Tipe Slot RAM dan SSD NVMe yang Didukung Laptop Sebelum Membeli Upgrade',
        'Panduan Lengkap Clone Hard Disk ke SSD NVMe Baru Tanpa Instal Ulang Windows',
        'Langkah Membersihkan Fan Laptop dan Mengganti Thermal Paste untuk Menurunkan Suhu CPU',
        'Cara Memeriksa Kesehatan SSD (Wear Level & SMART Status) Menggunakan Utilitas Diagnostik',
        'Cara Mendiagnosa Penyebab Komputer Tidak Mau Menyala (No Display) dari Bunyi Beep & RAM',
        'Tips Memilih Power Supply (PSU) dan UPS yang Tepat untuk Melindungi PC Kantor',
        'Panduan Memasang SSD Tambahan di PC Desktop dan Menginisialisasi Partisi di Disk Management',
      ],
      'Jaringan': [
        'Cara Mengatasi Wi-Fi Tersambung Tapi Tidak Ada Akses Internet di Windows 11',
        'Panduan Setting DNS Cloudflare 1.1.1.1 dan DNS-over-HTTPS untuk Koneksi Lebih Stabil',
        'Cara Reset Stack Jaringan Windows via CMD (Winsock, IPv4, Flush DNS) dengan Aman',
        'Langkah Konfigurasi Static IP & Port Forwarding Dasar pada Router Kantor',
        'Cara Membagi Folder dan Printer Lewat Jaringan Lokal LAN (File Sharing) Windows 11',
        'Cara Mengatur Bandwidth Limiter Sederhana di Router MikroTik agar Meeting Lancar',
        'Panduan Menggunakan Ping, Tracert, dan NSLookup untuk Melacak Gangguan Koneksi Internet',
      ],
      'Perangkat Lunak & Produktivitas': [
        'Cara Mengatur Aplikasi Startup Windows agar Waktu Booting Laptop 2x Lebih Cepat',
        'Panduan Menggunakan Winget di Windows Terminal untuk Update Semua Aplikasi Sekaligus',
        'Cara Mengatasi Microsoft Office Error Activation atau Crash Saat Membuka Dokumen Besar',
        'Panduan Membuat Jadwal Backup Otomatis Folder Kerja Penting ke Cloud & Drive Eksternal',
        'Panduan Menggunakan PowerToys untuk Manajemen Layar Split dan Rename File Massal',
        'Cara Membersihkan Cache Browser dan Temporary Files secara Terjadwal Tanpa Aplikasi Berat',
        'Cara Mengamankan Akun Email Kerja dan Mengatur Filter Spam Otomatis di Outlook / Gmail',
      ],
      'Tips & Trik IT': [
        '10 Shortcut Command Prompt & PowerShell Wajib untuk Mempercepat Diagnosa Laptop',
        'Cara Cek Riwayat Kesehatan Baterai Laptop Windows (Battery Report) Lewat PowerCFG',
        'Trik Membuat System Restore Point Otomatis Sebelum Menguji Software Baru',
        'Cara Mengetahui Aplikasi yang Menghabiskan Kuota Internet Diam-Diam di Latar Belakang',
        'Cara Mengamankan Flashdisk agar Bebas dari Virus Shortcut di Komputer Umum',
        'Trik Cepat Memeriksa Spesifikasi Asli Laptop Bekas Sebelum Membeli (CPU, RAM, SSD)',
        'Panduan Menggunakan Task Scheduler untuk Otomasi Perawatan Komputer Berkala',
      ],
    },
  };

  async function generateTopicsInternal(params: {
    type: 'article' | 'tutorial';
    category: string;
    difficulty?: string;
    count?: number;
    excludeTopics?: string[];
  }): Promise<{ topics: string[]; source: 'gemini-ai' | 'smart-engine' }> {
    const safeType: 'article' | 'tutorial' = params.type === 'tutorial' ? 'tutorial' : 'article';
    const safeCount = Math.min(Math.max(Number(params.count) || 5, 1), 8);
    const difficulty = params.difficulty || 'Pemula';
    const category =
      params.category && params.category !== 'Semua'
        ? params.category
        : safeType === 'article'
        ? ARTICLE_CATEGORIES[0]
        : TUTORIAL_CATEGORIES[0];

    const excludedSet = new Set(
      (Array.isArray(params.excludeTopics) ? params.excludeTopics : []).map((t) => String(t).trim().toLowerCase())
    );

    const aiClient = getAiClient();
    if (aiClient) {
      try {
        const roleDesc =
          safeType === 'article'
            ? 'Jurnalis Teknologi Senior dan Editor Konten IT'
            : 'Senior IT Support Specialist dan Instruktur Teknis';
        const contentLabel =
          safeType === 'article' ? 'artikel teknologi' : `tutorial teknis IT (tingkat ${difficulty})`;
        const excludeText =
          excludedSet.size > 0
            ? `\nHindari mengulang atau terlalu mirip dengan topik berikut:\n- ${Array.from(excludedSet).slice(0, 15).join('\n- ')}`
            : '';

        const prompt = `Anda adalah ${roleDesc}.
Tugas Anda: Hasilkan tepat ${safeCount} ide judul/topik ${contentLabel} yang SANGAT SPESIFIK, RELEVAN, MENARIK, dan PRAKTIS dalam Bahasa Indonesia untuk kategori: "${category}".
Setiap topik harus siap langsung dijadikan judul dan memiliki sudut pandang berbeda satu sama lain.${excludeText}`;

        const response = await generateContentWithTimeout(aiClient, {
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
                },
              },
              required: ['topics'],
            },
          },
        }, 4500);

        const parsed = JSON.parse(response.text || '{}');
        if (Array.isArray(parsed.topics) && parsed.topics.length > 0) {
          const cleaned = parsed.topics
            .map((t: unknown) => String(t).trim())
            .filter((t: string) => t.length > 8 && !excludedSet.has(t.toLowerCase()))
            .slice(0, safeCount);
          if (cleaned.length > 0) {
            return { topics: cleaned, source: 'gemini-ai' };
          }
        }
      } catch (err: any) {
        console.warn('[Vercel API] Gemini topic generation failed, falling back to topic bank:', err?.message || err);
      }
    }

    const categoryMap = TOPIC_BANK[safeType];
    const pool = categoryMap[category] || Object.values(categoryMap).flat();
    const available = pool.filter((t) => !excludedSet.has(t.toLowerCase()));
    const sourcePool = available.length >= safeCount ? available : available.length > 0 ? available : pool;
    const shuffled = [...sourcePool].sort(() => Math.random() - 0.5).slice(0, safeCount);

    return { topics: shuffled, source: 'smart-engine' };
  }

  async function generateTutorialInternal(params: {
    topic: string;
    category?: string;
    difficulty?: string;
  }): Promise<{ tutorial: Record<string, any>; source: 'gemini-ai' | 'smart-template' }> {
    const cleanTopic = params.topic.trim();
    const category = params.category && params.category !== 'Semua' ? params.category : 'Pemecahan Masalah Komputer';
    const difficulty = params.difficulty || 'Pemula';
    const aiClient = getAiClient();

    if (aiClient) {
      try {
        const prompt = `Anda adalah Senior IT Support Specialist dan Web Systems Engineer.
Tugas Anda: Buat tutorial teknis IT yang SANGAT DETAIL, REALISTIS, AKURAT, dan LANGKAH-DEMI-LANGKAH mengenai: "${cleanTopic}".
Kategori: "${category}", Tingkat kesulitan: "${difficulty}", Bahasa: Bahasa Indonesia profesional.
Sertakan judul, ringkasan, prasyarat, alat dibutuhkan, langkah berurutan dengan perintah terminal nyata jika relevan, tips troubleshooting, FAQ, dan kesimpulan.`;

        const response = await generateContentWithTimeout(aiClient, {
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
        }, 6500);

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.title) {
          const steps = (parsed.steps || []).map((s: any, i: number) => ({
            stepNumber: i + 1,
            title: s.title,
            description: s.description,
            codeSnippet: s.codeCommand ? { language: 'bash', code: s.codeCommand, label: 'Command' } : undefined,
            note: s.note,
          }));
          const formattedTutorial = {
            id: `tut-ai-${Date.now()}`,
            slug: slugify(parsed.title) || `tut-ai-${Date.now()}`,
            title: parsed.title,
            summary: parsed.summary,
            category: parsed.category || category,
            difficulty: ['Pemula', 'Menengah', 'Lanjutan'].includes(parsed.difficulty) ? parsed.difficulty : difficulty,
            readTimeMinutes: parsed.readTimeMinutes || 10,
            publishedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
            thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
            isFeatured: false,
            isDemoData: false,
            isAiGenerated: true,
            publishStatus: 'published',
            prerequisites: parsed.prerequisites || ['Akses akun Administrator', 'Komputer menyala'],
            toolsNeeded: parsed.toolsNeeded || ['Terminal CMD / PowerShell', 'Koneksi Internet'],
            tableOfContents: steps.map((s: any) => ({
              id: `langkah-${s.stepNumber}`,
              title: `${s.stepNumber}. ${s.title}`,
            })),
            steps,
            troubleshootingTips: parsed.troubleshootingTips || [],
            faqs: parsed.faqs || [],
            conclusion: parsed.conclusion,
          };
          return { tutorial: formattedTutorial, source: 'gemini-ai' };
        }
      } catch (err: any) {
        console.warn('[Vercel API] Gemini API error, falling back to smart template:', err?.message || err);
      }
    }

    const fallback = {
      id: `tut-ai-${Date.now()}`,
      slug: slugify(cleanTopic) || `tut-ai-${Date.now()}`,
      title: cleanTopic.startsWith('Cara') || cleanTopic.startsWith('Panduan') ? cleanTopic : `Panduan Lengkap: ${cleanTopic}`,
      summary: `Panduan terstruktur dan sistematis untuk menangani ${cleanTopic} dengan metode diagnostik teruji di lingkungan Windows dan jaringan lokal.`,
      category,
      difficulty,
      readTimeMinutes: 8,
      publishedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
      isFeatured: false,
      isDemoData: false,
      isAiGenerated: true,
      publishStatus: 'published',
      prerequisites: ['Akses akun Administrator pada sistem Windows', 'Koneksi jaringan stabil'],
      toolsNeeded: ['Command Prompt / PowerShell (Admin)', 'Device Manager bawaan'],
      tableOfContents: [
        { id: 'langkah-1', title: '1. Verifikasi Gejala & Diagnosa Status Sistem' },
        { id: 'langkah-2', title: '2. Eksekusi Perintah Pemulihan dan Reset di Terminal' },
        { id: 'langkah-3', title: '3. Pengujian dan Validasi Hasil' },
      ],
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

    return { tutorial: fallback, source: 'smart-template' };
  }

  async function generateArticleInternal(params: {
    topic: string;
    category?: string;
    authorName?: string;
  }): Promise<{ article: Record<string, any>; source: 'gemini-ai' | 'smart-engine' }> {
    const cleanTopic = params.topic.trim();
    const category = params.category && params.category !== 'Semua' ? params.category : 'Tren Teknologi';
    const author = params.authorName || 'Risa Kurniawan';
    const aiClient = getAiClient();

    if (aiClient) {
      try {
        const prompt = `Anda adalah Jurnalis Teknologi Senior dan Tech Columnist.
Tugas Anda: Buatlah sebuah artikel editorial seputar IT yang BERBOBOT, EDUKATIF, dan MENARIK DIBACA mengenai topik: "${cleanTopic}".
Kategori artikel: "${category}".
Bahasa: Bahasa Indonesia yang mengalir, komunikatif, dan berbobot.
Sertakan judul editorial, ringkasan (1-2 kalimat), estimasi waktu baca (5-9 menit), 3-4 sub-bagian (heading, body, highlight opsional), 4 tag relevan, dan kesimpulan.`;

        const response = await generateContentWithTimeout(aiClient, {
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
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                sections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      heading: { type: Type.STRING },
                      body: { type: Type.STRING },
                      highlight: { type: Type.STRING },
                    },
                    required: ['heading', 'body'],
                  },
                },
                conclusion: { type: Type.STRING },
              },
              required: ['title', 'summary', 'sections', 'conclusion'],
            },
          },
        }, 6500);

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.title) {
          const formattedArticle = {
            id: `art-ai-${Date.now()}`,
            slug: slugify(parsed.title) || `art-ai-${Date.now()}`,
            title: parsed.title,
            summary: parsed.summary,
            category: parsed.category || category,
            publishedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
            readTimeMinutes: parsed.readTimeMinutes || 6,
            thumbnail: '/images/hero_creative_workspace_1793775537391.jpg',
            author,
            tags: parsed.tags || ['Teknologi', 'Wawasan IT', 'Komputer'],
            sections: parsed.sections || [],
            conclusion: parsed.conclusion,
            isFeatured: false,
            isAiGenerated: true,
            publishStatus: 'published',
          };
          return { article: formattedArticle, source: 'gemini-ai' };
        }
      } catch (err: any) {
        console.warn('[Vercel API] Gemini article error, falling back to smart engine:', err?.message || err);
      }
    }

    const fallbackArticle = {
      id: `art-ai-${Date.now()}`,
      slug: slugify(cleanTopic) || `art-ai-${Date.now()}`,
      title: cleanTopic,
      summary: `Ulasan mendalam mengenai ${cleanTopic}, dampaknya pada efisiensi kerja digital, serta rekomendasi langkah praktis yang dapat diterapkan.`,
      category,
      publishedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      readTimeMinutes: 6,
      thumbnail: '/images/hero_creative_workspace_1793775537391.jpg',
      author,
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
      publishStatus: 'published',
    };

    return { article: fallbackArticle, source: 'smart-engine' };
  }

  // 5. AI GENERATOR FOR TUTORIALS
  if (path === '/api/ai/generate-tutorial' && req.method === 'POST') {
    const body = parseJsonBody(req.body) || {};
    const { topic, category = 'Pemecahan Masalah Komputer', difficulty = 'Pemula' } = body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return sendError(res, 400, 'Topik tutorial IT wajib diisi.');
    }
    const { tutorial, source } = await generateTutorialInternal({ topic, category, difficulty });
    return res.status(200).json({ success: true, tutorial, source });
  }

  // 6. AI GENERATOR FOR ARTICLES
  if (path === '/api/ai/generate-article' && req.method === 'POST') {
    const body = parseJsonBody(req.body) || {};
    const { topic, category = 'Tren Teknologi', authorName } = body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return sendError(res, 400, 'Topik artikel IT wajib diisi.');
    }
    const { article, source } = await generateArticleInternal({ topic, category, authorName });
    return res.status(200).json({ success: true, article, source });
  }

  // 7. AI GENERATOR FOR CATEGORY-SPECIFIC TOPICS
  if (path === '/api/ai/generate-topics' && req.method === 'POST') {
    const body = parseJsonBody(req.body) || {};
    const {
      type = 'article',
      category = 'Tren Teknologi',
      difficulty = 'Pemula',
      count = 5,
      excludeTopics = [],
    } = body;

    const safeType: 'article' | 'tutorial' = type === 'tutorial' ? 'tutorial' : 'article';
    const result = await generateTopicsInternal({
      type: safeType,
      category,
      difficulty,
      count,
      excludeTopics,
    });

    return res.status(200).json({
      success: true,
      topics: result.topics,
      category,
      type: safeType,
      source: result.source,
    });
  }

  // 8. FULL AI AUTOPILOT ENDPOINT (Promote Scheduled + Auto-Pick Topic + Generate + Publish Live to Supabase)
  if (path === '/api/ai/autopilot' && (req.method === 'GET' || req.method === 'POST')) {
    const { isConfigured } = getSupabaseConfig();
    if (!isConfigured) {
      return sendError(res, 503, 'Database Supabase belum dikonfigurasi.');
    }

    const body = req.method === 'POST' ? parseJsonBody(req.body) || {} : {};
    const forceRun =
      body?.force === true || requestUrl.searchParams.get('force') === 'true';

    try {
      const existingContent = await readContent();
      if (!existingContent || typeof existingContent !== 'object') {
        return sendError(
          res,
          400,
          'Snapshot site_content_v2 belum tersedia di Supabase. Simpan data awal terlebih dahulu.'
        );
      }

      const nowMs = Date.now();
      const nowIso = new Date(nowMs).toISOString();
      const todayLabel = new Date(nowMs).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      // Step A: Automatically promote any due scheduled posts in Supabase
      let promotedCount = 0;
      const promoteList = (items: any[]) =>
        (Array.isArray(items) ? items : []).map((item: any) => {
          if (item?.publishStatus === 'scheduled' && item?.scheduledAt) {
            const targetMs = new Date(item.scheduledAt).getTime();
            if (!Number.isNaN(targetMs) && targetMs <= nowMs) {
              promotedCount += 1;
              return {
                ...item,
                publishStatus: 'published',
                publishedDate: todayLabel,
                scheduledAt: undefined,
              };
            }
          }
          return item;
        });

      const nextTutorialsBase = promoteList(existingContent.tutorials);
      const nextArticlesBase = promoteList(existingContent.articles);

      const currentAutopilot = {
        enabled: false,
        contentType: 'alternate',
        intervalHours: 24,
        articleCategory: 'Semua',
        tutorialCategory: 'Semua',
        tutorialDifficulty: 'Pemula',
        autoPickTopic: true,
        totalAutoPosted: 0,
        history: [],
        ...(existingContent.aiAutopilot || {}),
        ...(body?.config || {}),
      };

      const intervalHours = Math.max(Number(currentAutopilot.intervalHours) || 24, 1);
      const lastRunMs = currentAutopilot.lastRunAt ? new Date(currentAutopilot.lastRunAt).getTime() : 0;
      const nextRunMs = currentAutopilot.nextRunAt ? new Date(currentAutopilot.nextRunAt).getTime() : 0;

      const recentlyRan = !forceRun && lastRunMs > 0 && nowMs - lastRunMs < 30_000;
      const notDueYet = !forceRun && nextRunMs > 0 && nowMs < nextRunMs;

      if (!forceRun && (!currentAutopilot.enabled || recentlyRan || notDueYet)) {
        if (promotedCount > 0) {
          const promotedPayload = {
            ...existingContent,
            tutorials: nextTutorialsBase,
            articles: nextArticlesBase,
            aiAutopilot: currentAutopilot,
          };
          await supabaseRequest('site_content', {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({
              key: contentKey,
              value: promotedPayload,
              updated_at: nowIso,
            }),
          });
        }
        return res.status(200).json({
          success: true,
          ran: false,
          promotedScheduledCount: promotedCount,
          reason: !currentAutopilot.enabled
            ? 'Auto-Pilot dalam status nonaktif.'
            : 'Belum mencapai jadwal eksekusi berikutnya.',
          nextRunAt: currentAutopilot.nextRunAt || null,
          aiAutopilot: currentAutopilot,
        });
      }

      // Step B: Decide target type ('article' or 'tutorial')
      const targetType: 'article' | 'tutorial' =
        currentAutopilot.contentType === 'article'
          ? 'article'
          : currentAutopilot.contentType === 'tutorial'
          ? 'tutorial'
          : currentAutopilot.lastCreatedType === 'article'
          ? 'tutorial'
          : 'article';

      // Step C: Choose balanced category
      const validPool = targetType === 'article' ? ARTICLE_CATEGORIES : TUTORIAL_CATEGORIES;
      const configuredCat =
        targetType === 'article' ? currentAutopilot.articleCategory : currentAutopilot.tutorialCategory;
      let chosenCategory = configuredCat;
      if (!configuredCat || configuredCat === 'Semua' || !validPool.includes(configuredCat)) {
        const recentHistory = Array.isArray(currentAutopilot.history) ? currentAutopilot.history : [];
        const recentCats = recentHistory
          .filter((h: any) => h?.type === targetType)
          .slice(0, validPool.length - 1)
          .map((h: any) => h.category);
        const candidates = validPool.filter((c) => !recentCats.includes(c));
        const pool = candidates.length > 0 ? candidates : validPool;
        chosenCategory = pool[Math.floor(Math.random() * pool.length)];
      }

      const existingItems = targetType === 'article' ? nextArticlesBase : nextTutorialsBase;
      const excludeTitles = existingItems.map((i: any) => String(i?.title || '').trim()).filter(Boolean);

      // Step D: Auto-pick topic & generate full content
      const { topics } = await generateTopicsInternal({
        type: targetType,
        category: chosenCategory,
        difficulty: currentAutopilot.tutorialDifficulty || 'Pemula',
        count: 3,
        excludeTopics: excludeTitles,
      });

      const chosenTopic = topics[0] || `Panduan Praktis ${chosenCategory} Terbaru`;
      let generatedItem: Record<string, any>;
      let source: string;

      if (targetType === 'article') {
        const resArt = await generateArticleInternal({
          topic: chosenTopic,
          category: chosenCategory,
          authorName: existingContent.profile?.name || 'Risa Kurniawan',
        });
        generatedItem = resArt.article;
        source = resArt.source;
      } else {
        const resTut = await generateTutorialInternal({
          topic: chosenTopic,
          category: chosenCategory,
          difficulty: currentAutopilot.tutorialDifficulty || 'Pemula',
        });
        generatedItem = resTut.tutorial;
        source = resTut.source;
      }

      // Ensure unique slug
      const baseSlug = String(generatedItem.slug || slugify(generatedItem.title) || `ai-${nowMs}`);
      const slugCollision = existingItems.some((i: any) => i?.slug === baseSlug);
      if (slugCollision) {
        generatedItem.slug = `${baseSlug}-${String(nowMs).slice(-4)}`;
      }

      const logEntry = {
        id: `log-${nowMs}`,
        ranAt: nowIso,
        type: targetType,
        title: generatedItem.title,
        category: chosenCategory,
        source,
        status: 'published',
      };

      const nextRunAt = new Date(nowMs + intervalHours * 3600_000).toISOString();
      const nextAutopilot = {
        ...currentAutopilot,
        lastRunAt: nowIso,
        nextRunAt,
        lastCreatedType: targetType,
        totalAutoPosted: (Number(currentAutopilot.totalAutoPosted) || 0) + 1,
        lastPostedTitle: generatedItem.title,
        history: [logEntry, ...(Array.isArray(currentAutopilot.history) ? currentAutopilot.history : [])].slice(0, 15),
      };

      const updatedContent = {
        ...existingContent,
        tutorials: targetType === 'tutorial' ? [generatedItem, ...nextTutorialsBase] : nextTutorialsBase,
        articles: targetType === 'article' ? [generatedItem, ...nextArticlesBase] : nextArticlesBase,
        aiAutopilot: nextAutopilot,
      };

      // Persist atomically to Supabase (passwords already preserved in existingContent)
      await supabaseRequest('site_content', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          key: contentKey,
          value: updatedContent,
          updated_at: nowIso,
        }),
      });

      return res.status(200).json({
        success: true,
        ran: true,
        type: targetType,
        item: generatedItem,
        source,
        promotedScheduledCount: promotedCount,
        aiAutopilot: nextAutopilot,
        content: sanitizeContentForPublic(updatedContent),
        message: `${targetType === 'article' ? 'Artikel' : 'Tutorial'} "${generatedItem.title}" berhasil dibuat & diterbitkan otomatis ke Supabase!`,
      });
    } catch (err: any) {
      console.error('[Vercel API] Autopilot execution failed:', err);
      return sendError(res, 500, `Auto-Pilot AI gagal dieksekusi: ${err?.message || 'Internal Server Error'}`);
    }
  }

  return sendError(res, 404, `API route "${path}" tidak ditemukan.`);
}
