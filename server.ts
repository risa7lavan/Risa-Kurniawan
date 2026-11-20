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

async function generateContentWithTimeout(client: GoogleGenAI, request: any, timeoutMs = 6500) {
  return await Promise.race([
    client.models.generateContent(request),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

const ARTICLE_CATEGORIES = [
  'Tren Teknologi',
  'Perangkat Keras & Gadget',
  'Keamanan Siber',
  'Sistem Operasi & Software',
  'Produktivitas IT'
];

const TUTORIAL_CATEGORIES = [
  'Pemecahan Masalah Komputer',
  'Instalasi Windows',
  'Perangkat Keras & Peningkatan',
  'Jaringan',
  'Perangkat Lunak & Produktivitas',
  'Tips & Trik IT'
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
Setiap topik harus terasa nyata, dicari pembaca/praktisi IT, siap langsung dijadikan judul artikel/tutorial, dan memiliki sudut pandang berbeda satu sama lain.${excludeText}`;

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
                description: 'Daftar ide topik spesifik sesuai kategori'
              }
            },
            required: ['topics']
          }
        }
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
    } catch (apiError: any) {
      console.warn('Gemini topic generation failed, falling back to topic bank:', apiError?.message || apiError);
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
  customTitle?: string;
  targetAudience?: string;
  tutorialGoal?: string;
  deviceType?: string;
  operatingSystem?: string;
  softwareTools?: string;
  softwareVersion?: string;
  lengthPreference?: string;
}): Promise<{ tutorial: Record<string, any>; source: 'gemini-ai' | 'smart-template' }> {
  const cleanTopic = params.topic.trim();
  const category = params.category && params.category !== 'Semua' ? params.category : 'Pemecahan Masalah Komputer';
  const difficulty = params.difficulty || 'Pemula';
  const customTitle = params.customTitle?.trim() || '';
  const targetAudience = params.targetAudience?.trim() || difficulty;
  const tutorialGoal = params.tutorialGoal?.trim() || 'Panduan Teknis, Konfigurasi & Troubleshooting';
  const deviceType = params.deviceType?.trim() || 'Komputer / Laptop';
  const operatingSystem = params.operatingSystem?.trim() || 'Windows 10 / Windows 11';
  const softwareTools = params.softwareTools?.trim() || 'Command Prompt / PowerShell, Device Manager';
  const softwareVersion = params.softwareVersion?.trim() || 'Versi terbaru yang didukung resmi';
  const lengthPreference = params.lengthPreference?.trim() || 'Lengkap & Mendalam sesuai kebutuhan';

  if (aiClient) {
    try {
      const masterPrompt = `# MASTER PROMPT — PROFESSIONAL TUTORIAL WRITER & TECHNICAL DOCUMENTATION SPECIALIST

## 1. ROLE & EXPERTISE
Bertindaklah sebagai Professional Tutorial Writer, Technical Documentation Specialist, Technical Instructor, Subject Matter Expert, Research Analyst, Professional Editor, SEO Content Specialist, dan Educational Content Developer.

## 2. INPUT TUTORIAL
- Topik: "${cleanTopic}"
- Judul tutorial (opsional): "${customTitle || 'Buat judul jelas, spesifik, menjelaskan hasil yang dicapai, dan mengandung kata kunci utama secara natural'}"
- Kategori: "${category}"
- Target pembaca / level: "${targetAudience}" (Kesulitan: "${difficulty}")
- Tujuan tutorial: "${tutorialGoal}"
- Perangkat: "${deviceType}"
- Sistem operasi: "${operatingSystem}"
- Software / tools: "${softwareTools}"
- Versi software: "${softwareVersion}"
- Panjang tutorial: "${lengthPreference}"
- Bahasa: Bahasa Indonesia baku yang baik dan benar sesuai EYD V, edukatif, komunikatif, logis, tanpa emoji, tanpa klaim fiktif.

## 3. ATURAN KEAMANAN, AKURASI TEKNIS, DAN ANTI-HALUSINASI
1. DILARANG mengarang menu, tombol, perintah terminal, parameter konfigurasi, screenshot, atau URL referensi yang tidak pasti keberadaannya. Jika URL pasti tidak diketahui, kosongkan field url.
2. DILARANG meminta data sensitif (password, PIN, token, secret key, API key). Gunakan placeholder yang jelas (contoh: <NAMA_DOMAIN>, <ALAMAT_IP>).
3. Tandai setiap langkah berisiko tinggi (seperti perubahan sistem, registri, partisi, atau jaringan) dengan peringatan backup/System Restore dan hindari instruksi destruktif.
4. Meta Description wajib 140-160 karakter dan mengandung focus keyword.
5. Setiap langkah (steps) wajib berurutan dan memuat: stepNumber, title, objective (tujuan langkah), description, actions (sub-langkah konkret), codeCommand (perintah nyata jika relevan), expectedResult (hasil yang diharapkan), dan note/peringatan penting.
6. Sertakan screenshotRecommendations (panduan visual/area layar/anotasi/caption/altText — sebagai rekomendasi dokumentasi visual, bukan mengklaim gambar sudah ada), verification (kriteria berhasil & cara uji), troubleshootingTips (issue, cause, resolution minimal 3 kasus), tipsAndRecommendations (bestPractices, avoidMistakes, securityTips, nextSteps), 3-5 FAQs, conclusion, verified references, dan internalLinkingSuggestions (gunakan rute valid: /services, /articles, /tutorials, /projects, /contact).`;

      const response = await generateContentWithTimeout(aiClient, {
        model: 'gemini-4-hydrogen',
        contents: masterPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              seoTitle: { type: Type.STRING },
              metaDescription: { type: Type.STRING },
              summary: { type: Type.STRING },
              focusKeyword: { type: Type.STRING },
              supportingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              urlSlug: { type: Type.STRING },
              category: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              readTimeMinutes: { type: Type.INTEGER },
              introduction: { type: Type.STRING },
              objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
              prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
              optionalPrerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
              systemRequirements: {
                type: Type.OBJECT,
                properties: {
                  hardware: { type: Type.STRING },
                  os: { type: Type.STRING },
                  software: { type: Type.STRING },
                  access: { type: Type.STRING }
                }
              },
              toolsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
              riskWarning: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  message: { type: Type.STRING },
                  severity: { type: Type.STRING }
                }
              },
              processOverview: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    objective: { type: Type.STRING },
                    description: { type: Type.STRING },
                    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    codeCommand: { type: Type.STRING },
                    codeLanguage: { type: Type.STRING },
                    codeLabel: { type: Type.STRING },
                    expectedResult: { type: Type.STRING },
                    note: { type: Type.STRING }
                  },
                  required: ['stepNumber', 'title', 'description']
                }
              },
              screenshotRecommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    figureNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    screenArea: { type: Type.STRING },
                    annotation: { type: Type.STRING },
                    caption: { type: Type.STRING },
                    altText: { type: Type.STRING }
                  },
                  required: ['figureNumber', 'title', 'screenArea', 'caption', 'altText']
                }
              },
              verification: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
                  expectedOutput: { type: Type.STRING },
                  testMethod: { type: Type.STRING }
                },
                required: ['summary', 'indicators']
              },
              troubleshootingTips: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    issue: { type: Type.STRING },
                    cause: { type: Type.STRING },
                    resolution: { type: Type.STRING }
                  },
                  required: ['issue', 'cause', 'resolution']
                }
              },
              tipsAndRecommendations: {
                type: Type.OBJECT,
                properties: {
                  bestPractices: { type: Type.ARRAY, items: { type: Type.STRING } },
                  avoidMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  securityTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                  nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['bestPractices', 'avoidMistakes', 'securityTips']
              },
              faqs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } },
                  required: ['question', 'answer']
                }
              },
              conclusion: { type: Type.STRING },
              references: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    publisher: { type: Type.STRING },
                    url: { type: Type.STRING }
                  },
                  required: ['title', 'publisher']
                }
              },
              internalLinkingSuggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    anchorText: { type: Type.STRING },
                    targetPath: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ['anchorText', 'targetPath']
                }
              },
              imageAltText: { type: Type.STRING }
            },
            required: [
              'title',
              'seoTitle',
              'metaDescription',
              'focusKeyword',
              'urlSlug',
              'introduction',
              'objectives',
              'prerequisites',
              'processOverview',
              'steps',
              'verification',
              'troubleshootingTips',
              'tipsAndRecommendations',
              'faqs',
              'conclusion'
            ]
          }
        }
      }, 7000);

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.title || parsed.seoTitle) {
        const finalTitle = parsed.title || customTitle || parsed.seoTitle || cleanTopic;
        const finalSeoTitle = parsed.seoTitle || finalTitle;
        const rawMeta = String(parsed.metaDescription || parsed.summary || '').trim();
        const finalMeta =
          rawMeta.length > 165
            ? rawMeta.slice(0, 158).replace(/\s+\S*$/, '').trim()
            : rawMeta;
        const cleanSlug = slugify(parsed.urlSlug || finalTitle) || `tutorial-${Date.now()}`;
        const finalFocus = parsed.focusKeyword || finalTitle;

        const steps = (Array.isArray(parsed.steps) ? parsed.steps : []).map((s: any, i: number) => ({
          stepNumber: i + 1,
          title: s.title,
          objective: s.objective || undefined,
          description: s.description,
          actions: Array.isArray(s.actions) ? s.actions : undefined,
          codeSnippet: s.codeCommand
            ? {
                language: s.codeLanguage || 'bash',
                code: s.codeCommand,
                label: s.codeLabel || 'Command'
              }
            : undefined,
          expectedResult: s.expectedResult || undefined,
          note: s.note || undefined
        }));

        const formattedTutorial = {
          id: `tut-ai-${Date.now()}`,
          slug: cleanSlug,
          title: finalTitle,
          seoTitle: finalSeoTitle,
          metaDescription: finalMeta,
          summary: parsed.summary || finalMeta || parsed.introduction || '',
          focusKeyword: finalFocus,
          supportingKeywords: Array.isArray(parsed.supportingKeywords) ? parsed.supportingKeywords : [],
          category: parsed.category || category,
          difficulty: ['Pemula', 'Menengah', 'Lanjutan'].includes(parsed.difficulty) ? parsed.difficulty : difficulty,
          readTimeMinutes: parsed.readTimeMinutes || 10,
          publishedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
          imageAltText: parsed.imageAltText || `${finalTitle} — dokumentasi teknis ${category.toLowerCase()}`,
          isFeatured: false,
          isDemoData: false,
          isAiGenerated: true,
          publishStatus: 'published',
          introduction: parsed.introduction || '',
          objectives: Array.isArray(parsed.objectives) ? parsed.objectives : [],
          prerequisites: Array.isArray(parsed.prerequisites) && parsed.prerequisites.length > 0
            ? parsed.prerequisites
            : ['Komputer atau laptop dalam kondisi menyala', 'Akses akun Administrator'],
          optionalPrerequisites: Array.isArray(parsed.optionalPrerequisites) ? parsed.optionalPrerequisites : [],
          systemRequirements: parsed.systemRequirements || {
            hardware: deviceType,
            os: operatingSystem,
            software: softwareTools,
            access: 'Administrator / User dengan izin terkait'
          },
          toolsNeeded: Array.isArray(parsed.toolsNeeded) && parsed.toolsNeeded.length > 0
            ? parsed.toolsNeeded
            : softwareTools.split(',').map((t) => t.trim()).filter(Boolean),
          riskWarning: parsed.riskWarning?.message
            ? {
                title: parsed.riskWarning.title || 'Peringatan Keamanan & Pencadangan',
                message: parsed.riskWarning.message,
                severity: parsed.riskWarning.severity === 'danger' ? 'danger' : 'warning'
              }
            : undefined,
          processOverview: parsed.processOverview || '',
          tableOfContents: steps.map((s: any) => ({
            id: `langkah-${s.stepNumber}`,
            title: `${s.stepNumber}. ${s.title}`
          })),
          steps,
          screenshotRecommendations: Array.isArray(parsed.screenshotRecommendations)
            ? parsed.screenshotRecommendations
            : [],
          verification: parsed.verification || undefined,
          troubleshootingTips: Array.isArray(parsed.troubleshootingTips) ? parsed.troubleshootingTips : [],
          tipsAndRecommendations: parsed.tipsAndRecommendations || undefined,
          faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
          conclusion: parsed.conclusion || '',
          references: Array.isArray(parsed.references) ? parsed.references : [],
          internalLinkingSuggestions: Array.isArray(parsed.internalLinkingSuggestions)
            ? parsed.internalLinkingSuggestions
            : [
                {
                  anchorText: 'Layanan IT Support & Optimasi Sistem',
                  targetPath: '/services',
                  reason: 'Membantu pembaca yang membutuhkan pendampingan teknisi langsung.'
                },
                {
                  anchorText: 'Artikel Wawasan Teknologi & Keamanan',
                  targetPath: '/articles',
                  reason: 'Memperdalam pemahaman konseptual terkait topik.'
                }
              ]
        };
        return { tutorial: formattedTutorial, source: 'gemini-ai' };
      }
    } catch (apiError: any) {
      console.warn('Gemini API call failed, falling back to expert generator:', apiError?.message || apiError);
    }
  }

  const baseTitle =
    customTitle ||
    (cleanTopic.startsWith('Cara') || cleanTopic.startsWith('Panduan') || cleanTopic.startsWith('Langkah')
      ? cleanTopic
      : `Panduan Lengkap: ${cleanTopic}`);
  const seoTitle =
    baseTitle.length <= 68
      ? baseTitle
      : baseTitle.slice(0, 65).replace(/\s+\S*$/, '').trim() || baseTitle.slice(0, 65).trim();
  const focusKw = cleanTopic;
  const metaCandidate = `Panduan teknis ${focusKw}: prasyarat, langkah berurutan, verifikasi hasil, dan solusi troubleshooting bagi ${difficulty.toLowerCase()}.`;
  const metaDescription =
    metaCandidate.length <= 160
      ? metaCandidate
      : metaCandidate.slice(0, 158).replace(/\s+\S*$/, '').trim();
  const cleanSlug = slugify(baseTitle).split('-').slice(0, 7).join('-') || `tut-ai-${Date.now()}`;

  const steps = [
    {
      stepNumber: 1,
      title: 'Persiapan, Backup & Verifikasi Status Awal Sistem',
      objective: 'Memastikan data penting aman dan mencatat kondisi awal sistem sebelum perubahan dilakukan.',
      description: `Buka terminal dengan hak akses administrator pada ${operatingSystem} untuk memeriksa versi sistem serta memastikan layanan utama berjalan stabil sebelum menangani ${cleanTopic}.`,
      actions: [
        'Cadangkan berkas kerja penting ke media penyimpanan eksternal atau cloud.',
        'Buka menu Start, ketik "PowerShell" atau "Command Prompt", klik kanan lalu pilih "Run as administrator".',
        'Jalankan perintah verifikasi info sistem berikut dan catat keluaran yang muncul.'
      ],
      codeSnippet: {
        language: 'powershell',
        code: 'Get-ComputerInfo | Select-Object WindowsProductName, OsVersion, OsHardwareAbstractionLayer',
        label: 'PowerShell (Run as Admin)'
      },
      expectedResult: 'Informasi versi sistem operasi tampil jelas tanpa pesan "Access Denied".',
      note: 'Jangan mengubah konfigurasi sistem tanpa hak akses administrator karena hasil tidak akan tersimpan permanen.'
    },
    {
      stepNumber: 2,
      title: 'Diagnosa Integritas Komponen & Layanan Terkait',
      objective: `Mengidentifikasi berkas sistem korup, konflik driver, atau error konfigurasi pemicu ${cleanTopic}.`,
      description:
        'Jalankan utilitas diagnostik resmi bawaan sistem untuk memindai integritas berkas inti tanpa mengganggu data pribadi.',
      actions: [
        'Jalankan pemulihan image sistem menggunakan DISM diikuti System File Checker (SFC).',
        'Tunggu hingga indikator progres mencapai 100% dan periksa ringkasan hasil scan.'
      ],
      codeSnippet: {
        language: 'bash',
        code: 'DISM.exe /Online /Cleanup-image /Restorehealth\nsfc /scannow',
        label: 'Command Prompt (Admin)'
      },
      expectedResult: 'Pesan sukses bahwa integritas berkas sistem telah diperiksa atau dipulihkan.',
      note: 'Pastikan koneksi internet aktif agar DISM dapat mengunduh komponen perbaikan resmi bila diperlukan.'
    },
    {
      stepNumber: 3,
      title: 'Eksekusi Penyesuaian & Penyegaran Parameter Sistem',
      objective: `Menerapkan konfigurasi terukur agar kendala ${cleanTopic} terselesaikan permanen.`,
      description:
        'Lakukan penyegaran cache layanan terkait serta pastikan modul atau adaptor yang bermasalah aktif kembali secara bersih.',
      actions: [
        'Tutup sementara aplikasi yang menggunakan sumber daya sistem secara intensif.',
        'Jalankan penyegaran cache jaringan jika kendala berhubungan dengan konektivitas atau resolusi DNS.',
        'Periksa Device Manager atau Services (services.msc) untuk memastikan tidak ada tanda seru kuning.'
      ],
      codeSnippet: {
        language: 'bash',
        code: 'ipconfig /flushdns\nnetsh winsock reset',
        label: 'Command Prompt (Admin — Bila Terkait Jaringan)'
      },
      expectedResult: 'Konfirmasi berhasil mereset Winsock Catalog dan DNS Resolver Cache tanpa error.',
      note: 'Lewati perintah netsh apabila masalah murni berada pada perangkat keras offline.'
    },
    {
      stepNumber: 4,
      title: 'Restart Terkontrol & Validasi Fungsional',
      objective: 'Memuat ulang layanan secara bersih dan memverifikasi hasil akhir tutorial.',
      description:
        'Lakukan mulai ulang (restart) perangkat agar seluruh konfigurasi dimuat ulang, lalu uji kembali fungsionalitas target.',
      actions: [
        'Simpan semua pekerjaan yang terbuka lalu klik Start -> Power -> Restart.',
        'Setelah masuk desktop, jalankan aktivitas yang sebelumnya bermasalah selama 3–5 menit.'
      ],
      expectedResult: `Sistem berjalan lancar dan gejala ${cleanTopic} tidak muncul kembali.`
    }
  ];

  const fallbackTutorial = {
    id: `tut-ai-${Date.now()}`,
    slug: cleanSlug,
    title: baseTitle,
    seoTitle,
    metaDescription,
    summary: metaDescription,
    focusKeyword: focusKw,
    supportingKeywords: [
      category.toLowerCase(),
      `panduan ${difficulty.toLowerCase()}`,
      operatingSystem.toLowerCase(),
      'dokumentasi teknis it',
      'troubleshooting sistem'
    ],
    category,
    difficulty,
    readTimeMinutes: 10,
    publishedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
    imageAltText: `${baseTitle} — panduan teknis ${category.toLowerCase()}`,
    isFeatured: false,
    isDemoData: false,
    isAiGenerated: true,
    publishStatus: 'published',
    introduction: `Dokumentasi teknis ini disusun untuk pembaca tingkat ${targetAudience} dengan tujuan ${tutorialGoal.toLowerCase()} pada perangkat ${deviceType} (${operatingSystem}). Gangguan terkait ${cleanTopic} kerap menghambat produktivitas harian jika ditangani tanpa urutan kerja yang teruji. Melalui panduan terstruktur ini, setiap tahapan dilengkapi fungsi, perkiraan hasil, serta langkah verifikasi keamanan data.`,
    objectives: [
      `Memahami penyebab utama dan parameter teknis terkait ${cleanTopic}.`,
      `Menjalankan perbaikan dan konfigurasi ${baseTitle} secara aman dan berurutan.`,
      'Memvalidasi hasil akhir serta menerapkan pencegahan agar kendala tidak terulang.'
    ],
    prerequisites: [
      `Akses akun Administrator pada ${operatingSystem}.`,
      'Cadangan (backup) dokumen dan konfigurasi penting sebelum memulai perubahan.'
    ],
    optionalPrerequisites: [
      'System Restore Point terbaru sebagai pengaman tambahan.',
      'Koneksi internet stabil untuk mengunduh pembaruan driver atau komponen sistem resmi.'
    ],
    systemRequirements: {
      hardware: `${deviceType} dengan ruang disk kosong minimal 2 GB.`,
      os: operatingSystem,
      software: `${softwareTools} (${softwareVersion})`,
      access: 'Hak akses Administrator lokal atau elevated shell.'
    },
    toolsNeeded: softwareTools.split(',').map((t) => t.trim()).filter(Boolean),
    riskWarning: {
      title: 'Peringatan Keamanan & Pencadangan Data',
      message: 'Pastikan membuat backup berkas penting sebelum mengubah konfigurasi sistem. Jangan pernah memasukkan kata sandi atau token akses ke skrip yang belum diverifikasi.',
      severity: 'warning'
    },
    processOverview: `Tutorial ini berjalan dalam 4 tahap terstruktur: (1) pencadangan & diagnosa awal sistem, (2) pemeriksaan integritas komponen resmi, (3) eksekusi pemulihan & penyegaran layanan, dan (4) restart terkontrol serta pengujian hasil.`,
    tableOfContents: steps.map((s) => ({
      id: `langkah-${s.stepNumber}`,
      title: `${s.stepNumber}. ${s.title}`
    })),
    steps,
    screenshotRecommendations: [
      {
        figureNumber: 1,
        title: 'Membuka Terminal sebagai Administrator',
        screenArea: 'Menu Start dengan menu klik kanan "Run as administrator" pada PowerShell/CMD.',
        annotation: 'Kotak penanda merah/hijau pada opsi Run as administrator.',
        caption: 'Gambar 1. Cara membuka terminal dengan hak akses penuh.',
        altText: `Ilustrasi membuka terminal Administrator untuk ${baseTitle}`
      },
      {
        figureNumber: 2,
        title: 'Hasil Verifikasi Sistem di Terminal',
        screenArea: 'Baris output akhir perintah DISM dan sfc /scannow yang menunjukkan progres 100%.',
        annotation: 'Garis bawah pada kalimat status integritas berkas.',
        caption: 'Gambar 2. Contoh keluaran terminal setelah pemulihan selesai.',
        altText: `Hasil terminal verifikasi sistem pada panduan ${baseTitle}`
      }
    ],
    verification: {
      summary: `Prosedur ${baseTitle} dinyatakan berhasil apabila seluruh perintah selesai tanpa error dan fungsi sistem kembali stabil setelah restart.`,
      indicators: [
        'Pemeriksaan integritas sistem selesai 100% tanpa error kritis.',
        'Layanan dan perangkat terkait bekerja responsif saat diuji.',
        'Tidak ada lonjakan penggunaan CPU atau disk yang tidak wajar di Task Manager.'
      ],
      expectedOutput: 'Windows Resource Protection did not find any integrity violations.',
      testMethod: 'Uji skenario kerja nyata selama 5 menit dan periksa Event Viewer (Windows Logs -> System) untuk memastikan tidak ada log error baru.'
    },
    troubleshootingTips: [
      {
        issue: 'Perubahan tidak tersimpan atau muncul pesan Access Denied',
        cause: 'Terminal atau utilitas dijalankan menggunakan izin user standar.',
        resolution: 'Tutup jendela, klik kanan Command Prompt/PowerShell, lalu pilih "Run as administrator".'
      },
      {
        issue: 'Proses pemindaian terasa berhenti di sekitar 62% atau 80%',
        cause: 'Sistem sedang memverifikasi paket komponen dan mengunduh berkas pembanding resmi.',
        resolution: 'Tunggu 5–15 menit hingga selesai dengan koneksi internet aktif; jangan paksa tutup jendela.'
      },
      {
        issue: 'Kendala tetap muncul meskipun seluruh langkah sudah dijalankan',
        cause: 'Driver perangkat usang atau terdapat gangguan fisik pada komponen hardware.',
        resolution: 'Perbarui driver resmi dari situs vendor perangkat atau lanjutkan pemeriksaan perangkat keras.'
      }
    ],
    tipsAndRecommendations: {
      bestPractices: [
        'Jadwalkan pemeliharaan ringan dan pemeriksaan pembaruan sistem setiap bulan.',
        'Dokumentasikan pengaturan awal sebelum melakukan modifikasi lanjutan.'
      ],
      avoidMistakes: [
        'Jangan memakai software pembersih registri pihak ketiga yang tidak jelas sumbernya.',
        'Hindari mematikan paksa komputer ketika proses DISM/update berlangsung.'
      ],
      securityTips: [
        'Gunakan akun standar untuk penggunaan harian dan akun Administrator hanya saat konfigurasi.',
        'Jangan membagikan kata sandi, kunci pemulihan BitLocker, atau kredensial jaringan di luar pihak tepercaya.'
      ],
      nextSteps: [
        'Terapkan backup rutin 3-2-1 untuk melindungi data kerja penting.',
        'Baca panduan perawatan lanjutan pada direktori Tutorial IT.'
      ]
    },
    faqs: [
      {
        question: 'Apakah prosedur ini aman untuk dokumen dan data pribadi?',
        answer: 'Ya. Langkah perbaikan hanya menyegarkan layanan dan memeriksa integritas berkas sistem tanpa memformat partisi data pribadi.'
      },
      {
        question: 'Berapa estimasi waktu pengerjaan dari awal sampai selesai?',
        answer: 'Rata-rata membutuhkan 10 hingga 20 menit tergantung spesifikasi perangkat dan kecepatan koneksi internet.'
      },
      {
        question: 'Apakah perlu menginstal perangkat lunak tambahan?',
        answer: 'Tidak perlu. Seluruh tahapan memaksimalkan utilitas resmi bawaan sistem operasi yang aman.'
      }
    ],
    conclusion: `Dengan menerapkan prosedur ${baseTitle} secara berurutan dan memverifikasi indikator keberhasilannya, kendala terkait ${cleanTopic} dapat ditangani secara tuntas tanpa mengorbankan keamanan data.`,
    references: [
      {
        title: 'Windows Client Documentation & Troubleshooting',
        publisher: 'Microsoft Learn',
        url: 'https://learn.microsoft.com/en-us/windows/'
      },
      {
        title: 'Use the System File Checker tool to repair system files',
        publisher: 'Microsoft Support',
        url: 'https://support.microsoft.com/'
      }
    ],
    internalLinkingSuggestions: [
      {
        anchorText: 'Layanan IT Support & Perbaikan Perangkat Komputer',
        targetPath: '/services',
        reason: 'Mengarahkan pembaca yang memerlukan bantuan teknisi langsung.'
      },
      {
        anchorText: 'Artikel Wawasan Teknologi & Keamanan Siber',
        targetPath: '/articles',
        reason: 'Memberikan edukasi konseptual pendamping tutorial ini.'
      },
      {
        anchorText: 'Konsultasi Langsung Masalah Perangkat IT',
        targetPath: '/contact',
        reason: 'Jalur konsultasi apabila dibutuhkan analisa lanjutan.'
      }
    ]
  };

  return { tutorial: fallbackTutorial, source: 'smart-template' };
}

async function generateArticleInternal(params: {
  topic: string;
  category?: string;
  authorName?: string;
  customTitle?: string;
  targetAudience?: string;
  articleGoal?: string;
  articleType?: string;
  wordCountTarget?: string;
  focusKeyword?: string;
  supportingKeywords?: string[];
  referencesInput?: string;
}): Promise<{ article: Record<string, any>; source: 'gemini-ai' | 'smart-engine' }> {
  const cleanTopic = params.topic.trim();
  const category = params.category && params.category !== 'Semua' ? params.category : 'Tren Teknologi';
  const author = params.authorName || 'Risa Kurniawan';
  const targetAudience = params.targetAudience?.trim() || 'Umum, Pemula, & Praktisi IT';
  const articleGoal = params.articleGoal?.trim() || 'Edukasi & Informasi Praktis';
  const articleType = params.articleType?.trim() || 'Artikel Blog / Website Profesional';
  const wordCountTarget = params.wordCountTarget?.trim() || '1.000 - 1.500 kata';
  const requestedFocusKeyword = params.focusKeyword?.trim() || '';
  const requestedSupportingKeywords = Array.isArray(params.supportingKeywords)
    ? params.supportingKeywords.map((k) => String(k).trim()).filter(Boolean)
    : [];
  const referencesInput = params.referencesInput?.trim() || '';
  const customTitle = params.customTitle?.trim() || '';

  if (aiClient) {
    try {
      const masterPrompt = `# MASTER PROMPT — PROFESSIONAL ARTICLE WRITER & SEO CONTENT SPECIALIST

## 1. ROLE & EXPERTISE
Bertindaklah sebagai Professional Article Writer, Senior Content Writer, SEO Content Specialist, Professional Editor, Research Analyst, Indonesian Language Expert (EYD V), dan Digital Publishing Specialist.

## 2. INPUT ARTIKEL
- Topik artikel: "${cleanTopic}"
- Judul artikel (opsional): "${customTitle || 'Tentukan judul SEO paling efektif dan menarik tanpa clickbait menyesatkan'}"
- Kategori: "${category}"
- Target pembaca: "${targetAudience}"
- Tujuan artikel: "${articleGoal}"
- Jenis artikel: "${articleType}"
- Bahasa: Indonesia (EYD V yang baik, benar, natural, efektif, tanpa emoji, tanpa kalimat hiperbolis/robotik).
- Target panjang artikel: "${wordCountTarget}"
- Keyword utama: "${requestedFocusKeyword || 'Tentukan focus keyword yang paling natural dan relevan dengan topik'}"
- Keyword pendukung: "${requestedSupportingKeywords.length > 0 ? requestedSupportingKeywords.join(', ') : 'Tentukan 4-6 supporting keywords kontekstual'}"
- Referensi dari pengguna: "${referencesInput || 'Gunakan hanya dokumentasi resmi vendor, lembaga tepercaya, atau nyatakan keterbatasan sumber secara transparan bila perlu. DILARANG mengarang statistik, kutipan, atau URL fiktif.'}"

## 3. ATURAN KETAT KUALITAS, FAKTA, DAN SEO (E-E-A-T & HELPFUL CONTENT)
1. Jangan membuat klaim berlebihan, janji peringkat 1 Google, angka statistik palsu, atau URL referensi fiktif.
2. Meta Description wajib sekitar 140-160 karakter, mengandung keyword utama, menjelaskan manfaat, dan mengundang pembaca.
3. Tempatkan keyword utama secara natural di SEO Title, Introduction, dan pembahasan tanpa keyword stuffing.
4. Gunakan struktur: Introduction, Main Content (3-4 bagian H2, masing-masing dilengkapi subSections H3 jika relevan dan bulletPoints praktis), Practical Insights (tips penerapan/kesalahan yang harus dihindari), Conclusion, FAQ (3-5 pertanyaan dan jawaban ringkas), References (hanya sumber asli yang terverifikasi seperti dokumentasi resmi Microsoft/NIST/Cloudflare/BSSN/vendor terkait atau URL dari pengguna — jika URL pasti tidak diketahui, kosongkan field url tanpa mengarang), Internal Linking Recommendations (gunakan rute valid situs: /services, /tutorials, /articles, /projects, /about, /contact), Featured Image Recommendation, dan Image Alt Text.`;

      const response = await generateContentWithTimeout(
        aiClient,
        {
          model: 'gemini-4-hydrogen',
          contents: masterPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                seoTitle: { type: Type.STRING },
                title: { type: Type.STRING },
                metaDescription: { type: Type.STRING },
                summary: { type: Type.STRING },
                focusKeyword: { type: Type.STRING },
                supportingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                urlSlug: { type: Type.STRING },
                category: { type: Type.STRING },
                readTimeMinutes: { type: Type.INTEGER },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                introduction: { type: Type.STRING },
                sections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      heading: { type: Type.STRING },
                      body: { type: Type.STRING },
                      highlight: { type: Type.STRING },
                      bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                      subSections: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            subHeading: { type: Type.STRING },
                            body: { type: Type.STRING }
                          },
                          required: ['subHeading', 'body']
                        }
                      }
                    },
                    required: ['heading', 'body']
                  }
                },
                practicalInsights: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    items: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['title', 'items']
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
                conclusion: { type: Type.STRING },
                references: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      publisher: { type: Type.STRING },
                      url: { type: Type.STRING }
                    },
                    required: ['title', 'publisher']
                  }
                },
                internalLinkingSuggestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      anchorText: { type: Type.STRING },
                      targetPath: { type: Type.STRING },
                      reason: { type: Type.STRING }
                    },
                    required: ['anchorText', 'targetPath']
                  }
                },
                featuredImageRecommendation: { type: Type.STRING },
                imageAltText: { type: Type.STRING }
              },
              required: [
                'seoTitle',
                'title',
                'metaDescription',
                'focusKeyword',
                'supportingKeywords',
                'urlSlug',
                'introduction',
                'sections',
                'practicalInsights',
                'faqs',
                'conclusion'
              ]
            }
          }
        },
        7500
      );

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.title || parsed.seoTitle) {
        const finalTitle = parsed.title || customTitle || parsed.seoTitle || cleanTopic;
        const finalSeoTitle = parsed.seoTitle || finalTitle;
        const rawMeta = String(parsed.metaDescription || parsed.summary || '').trim();
        const finalMeta = rawMeta.length > 165 ? `${rawMeta.slice(0, 157).trim()}...` : rawMeta;
        const cleanSlug = slugify(parsed.urlSlug || finalTitle) || `art-ai-${Date.now()}`;
        const finalFocus = parsed.focusKeyword || requestedFocusKeyword || cleanTopic;
        const finalSupporting =
          Array.isArray(parsed.supportingKeywords) && parsed.supportingKeywords.length > 0
            ? parsed.supportingKeywords
            : requestedSupportingKeywords;

        const formattedArticle = {
          id: `art-ai-${Date.now()}`,
          slug: cleanSlug,
          title: finalTitle,
          seoTitle: finalSeoTitle,
          metaDescription: finalMeta,
          summary: parsed.summary || finalMeta || parsed.introduction || '',
          focusKeyword: finalFocus,
          supportingKeywords: finalSupporting,
          introduction: parsed.introduction || '',
          category: parsed.category || category,
          publishedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          readTimeMinutes: parsed.readTimeMinutes || 7,
          thumbnail: '/images/hero_creative_workspace_1793775537391.jpg',
          author,
          tags:
            Array.isArray(parsed.tags) && parsed.tags.length > 0
              ? parsed.tags
              : [finalFocus, ...finalSupporting].slice(0, 5),
          sections: Array.isArray(parsed.sections) ? parsed.sections : [],
          practicalInsights: parsed.practicalInsights,
          faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
          conclusion: parsed.conclusion || '',
          references: Array.isArray(parsed.references) ? parsed.references : [],
          internalLinkingSuggestions: Array.isArray(parsed.internalLinkingSuggestions)
            ? parsed.internalLinkingSuggestions
            : [
                {
                  anchorText: 'Layanan IT Support & Optimasi Sistem',
                  targetPath: '/services',
                  reason: 'Menghubungkan pembaca yang membutuhkan bantuan implementasi teknis profesional.'
                },
                {
                  anchorText: 'Panduan & Tutorial IT Support Praktis',
                  targetPath: '/tutorials',
                  reason: 'Memberikan langkah teknis lanjutan bagi pembaca.'
                }
              ],
          featuredImageRecommendation:
            parsed.featuredImageRecommendation ||
            `Foto ruang kerja IT modern yang menampilkan perangkat komputer dan proses analisis sistem terkait ${finalFocus}.`,
          imageAltText: parsed.imageAltText || `${finalTitle} — ilustrasi teknis ${category.toLowerCase()}`,
          isFeatured: false,
          isAiGenerated: true,
          publishStatus: 'published'
        };
        return { article: formattedArticle, source: 'gemini-ai' };
      }
    } catch (apiError: any) {
      console.warn('Gemini API call failed, falling back to expert article generator:', apiError?.message || apiError);
    }
  }

  const focusKw = requestedFocusKeyword || cleanTopic;
  const baseTitle = customTitle || cleanTopic;
  const seoTitle =
    baseTitle.length <= 68
      ? baseTitle
      : baseTitle.slice(0, 65).replace(/\s+\S*$/, '').trim() || baseTitle.slice(0, 65).trim();
  const supportingKws =
    requestedSupportingKeywords.length > 0
      ? requestedSupportingKeywords
      : [
          category.toLowerCase(),
          'panduan praktis IT',
          'optimasi sistem komputer',
          'keamanan dan stabilitas kerja'
        ];
  const metaCandidate = `Pelajari ${focusKw}: konsep inti, langkah penerapan praktis, kesalahan umum, dan solusi efisien bagi pengguna.`;
  const metaDescRaw =
    metaCandidate.length <= 160
      ? metaCandidate
      : `Pelajari panduan lengkap ${focusKw}: konsep inti, langkah penerapan praktis, dan solusi efisien untuk sistem kerja Anda.`;
  const metaDescription =
    metaDescRaw.length <= 160
      ? metaDescRaw
      : metaDescRaw.slice(0, 158).replace(/\s+\S*$/, '').trim();
  const urlSlug = slugify(baseTitle).split('-').slice(0, 7).join('-') || `art-ai-${Date.now()}`;

  const categoryReferences: Record<string, Array<{ title: string; publisher: string; url?: string }>> = {
    'Keamanan Siber': [
      {
        title: 'Panduan Keamanan Informasi dan Kebersihan Siber (Cyber Hygiene)',
        publisher: 'Badan Siber dan Sandi Negara (BSSN)',
        url: 'https://www.bssn.go.id'
      },
      {
        title: 'Cybersecurity Framework and Best Practices',
        publisher: 'National Institute of Standards and Technology (NIST)',
        url: 'https://www.nist.gov/cyberframework'
      }
    ],
    'Sistem Operasi & Software': [
      {
        title: 'Windows Documentation & System Administration',
        publisher: 'Microsoft Learn',
        url: 'https://learn.microsoft.com/en-us/windows/'
      }
    ],
    'Perangkat Keras & Gadget': [
      {
        title: 'PC Hardware & Storage Architecture Guidelines',
        publisher: 'Dokumentasi Resmi Produsen Perangkat Keras & Standar NVM Express'
      }
    ]
  };

  const refs = [
    ...(referencesInput
      ? [{ title: 'Referensi Tambahan Pengguna', publisher: 'Sumber Pilihan Penulis', url: referencesInput }]
      : []),
    ...(categoryReferences[category] || [
      {
        title: 'Dokumentasi Praktik Terbaik Manajemen Sistem & Infrastruktur IT',
        publisher: 'Microsoft Learn — IT Support & Operations',
        url: 'https://learn.microsoft.com/'
      },
      {
        title: 'Catatan Teknis: Prinsip Keandalan Sistem & Otomasi Kerja',
        publisher: 'Dokumentasi Resmi Pengembang & Standar Industri'
      }
    ])
  ];

  const fallbackArticle = {
    id: `art-ai-${Date.now()}`,
    slug: urlSlug,
    title: baseTitle,
    seoTitle,
    metaDescription,
    summary: metaDescription,
    focusKeyword: focusKw,
    supportingKeywords: supportingKws,
    introduction: `Pembahasan mengenai ${focusKw} semakin relevan seiring meningkatnya kebutuhan efisiensi kerja digital di berbagai skala organisasi. Banyak pengguna maupun tim operasional masih menghadapi kendala performa, ketidakefisienan alur kerja, hingga risiko gangguan teknis akibat kurangnya pemahaman terhadap prinsip dasar penerapan teknologi. Artikel ini mengulas konsep inti, analisis penerapan di lapangan, langkah praktis yang dapat langsung dijalankan, serta jawaban atas pertanyaan yang paling sering muncul dalam kategori ${category}.`,
    category,
    publishedDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    readTimeMinutes: 7,
    thumbnail: '/images/hero_creative_workspace_1793775537391.jpg',
    author,
    tags: [focusKw, ...supportingKws.slice(0, 3)],
    sections: [
      {
        heading: `Memahami Konsep Inti dan Urgensi ${focusKw}`,
        body: `Dalam lingkungan komputasi modern, ${focusKw} berperan penting untuk memastikan perangkat, aplikasi, dan alur kerja berjalan stabil tanpa hambatan berulang. Pendekatan yang terstruktur membantu pengguna tidak sekadar mengatasi gejala sementara, tetapi memahami akar penyebab kendala dan merancang pencegahan jangka panjang.`,
        highlight:
          'Keandalan sistem digital lahir dari kombinasi konfigurasi yang tepat, pencadangan rutin, dan evaluasi performa secara berkala.',
        subSections: [
          {
            subHeading: 'Mengidentifikasi Kebutuhan Sebelum Implementasi',
            body: `Sebelum menerapkan perubahan terkait ${baseTitle}, penting untuk memetakan kebutuhan beban kerja harian, kapasitas perangkat keras, serta tingkat kesiapan pengguna agar solusi yang dipilih tetap proporsional dan mudah dipelihara.`
          },
          {
            subHeading: 'Dampak Terhadap Produktivitas dan Keamanan',
            body: 'Lingkungan kerja yang tertata mengurangi waktu henti (downtime) tak terduga sekaligus menekan risiko kehilangan data penting saat terjadi pembaruan sistem atau gangguan jaringan.'
          }
        ],
        bulletPoints: [
          'Meningkatkan konsistensi kinerja perangkat lunak dan perangkat keras harian.',
          'Mempercepat proses diagnosa saat muncul error atau penurunan performa.',
          'Menjaga kepatuhan terhadap praktik keamanan dan cadangan data dasar.'
        ]
      },
      {
        heading: 'Analisis Tantangan Umum dan Solusi Terukur',
        body: `Di lapangan, implementasi ${focusKw} sering terhambat oleh konfigurasi bawaan yang kurang optimal, penumpukan berkas sementara, atau belum adanya prosedur operasional standar (SOP). Dengan memisahkan prioritas perbaikan mendesak dan peningkatan jangka menengah, tim maupun individu dapat mengelola perubahan tanpa mengganggu aktivitas utama.`,
        subSections: [
          {
            subHeading: 'Menghindari Pendekatan Tambal Sulam',
            body: 'Menginstal utilitas pihak ketiga secara sembarangan tanpa memahami dampaknya pada registri atau layanan latar belakang justru kerap menimbulkan konflik sistem baru.'
          }
        ],
        bulletPoints: [
          'Prioritaskan utilitas bawaan sistem yang terverifikasi sebelum memakai alat tambahan.',
          'Dokumentasikan setiap perubahan konfigurasi agar mudah dikembalikan bila diperlukan.',
          'Uji perubahan pada satu perangkat atau skenario kerja terlebih dahulu sebelum diterapkan luas.'
        ]
      },
      {
        heading: 'Panduan Penerapan Sistematis Langkah demi Langkah',
        body: `Agar penerapan ${baseTitle} memberikan hasil nyata, jalankan evaluasi berkala dengan urutan kerja yang konsisten. Mulailah dari pencadangan data penting, verifikasi kompatibilitas sistem, eksekusi konfigurasi inti, lalu pantau kestabilan perangkat selama beberapa hari kerja pertama.`,
        highlight:
          'Selalu siapkan cadangan data (backup) dan titik pemulihan sistem sebelum melakukan modifikasi konfigurasi inti.'
      }
    ],
    practicalInsights: {
      title: 'Wawasan Praktis & Kesalahan yang Harus Dihindari',
      items: [
        'Tips Praktis: Buat jadwal pemeriksaan rutin bulanan untuk memantau kesehatan penyimpanan, pembaruan keamanan, dan log sistem.',
        'Kesalahan Umum: Mengabaikan pencadangan data sebelum pembaruan sistem besar atau perubahan konfigurasi jaringan.',
        'Kesalahan Umum: Memasang terlalu banyak aplikasi berjalan otomatis di latar belakang sehingga membebani RAM dan prosesor.',
        'Rekomendasi: Gunakan dokumentasi resmi vendor sebagai acuan utama setiap kali menerapkan konfigurasi baru.'
      ]
    },
    faqs: [
      {
        question: `Mengapa pemahaman tentang ${focusKw} penting bagi pengguna modern?`,
        answer: `Karena penerapan yang tepat membantu menjaga kestabilan sistem, mencegah gangguan kerja berulang, dan melindungi integritas data harian.`
      },
      {
        question: 'Apakah langkah penerapan ini cocok untuk pemula maupun tim IT kecil?',
        answer:
          'Ya. Prinsip dasar seperti audit kebutuhan, pencadangan berkala, dan pemakaian fitur diagnostik bawaan dapat diterapkan secara bertahap tanpa alat berbiaya mahal.'
      },
      {
        question: 'Hal apa yang wajib dilakukan sebelum mengubah konfigurasi sistem?',
        answer:
          'Pastikan seluruh berkas kerja penting sudah dicadangkan ke media eksternal atau cloud, serta catat pengaturan awal sebagai cadangan pemulihan.'
      },
      {
        question: 'Seberapa sering evaluasi dan perawatan sistem perlu dilakukan?',
        answer:
          'Pemeriksaan ringan disarankan setiap bulan, sedangkan audit menyeluruh atas keamanan akun, kapasitas penyimpanan, dan pembaruan utama dilakukan setiap kuartal.'
      }
    ],
    conclusion: `Penerapan prinsip yang tepat seputar ${focusKw} bukan hanya soal mengikuti tren, melainkan investasi efisiensi untuk menjaga kinerja perangkat dan produktivitas jangka panjang. Mulailah dari langkah audit sederhana, prioritaskan keamanan data, dan konsultasikan kebutuhan teknis spesifik apabila diperlukan penanganan lanjutan.`,
    references: refs,
    internalLinkingSuggestions: [
      {
        anchorText: 'Layanan Pembuatan Website, IT Support & Data Entry',
        targetPath: '/services',
        reason: 'Mengarahkan pembaca yang membutuhkan pendampingan teknis atau jasa implementasi profesional.'
      },
      {
        anchorText: 'Direktori Tutorial Langkah-demi-Langkah IT Support',
        targetPath: '/tutorials',
        reason: 'Memberikan panduan teknis terperinci yang relevan dengan artikel ini.'
      },
      {
        anchorText: 'Konsultasi Langsung Kebutuhan IT Anda',
        targetPath: '/contact',
        reason: 'Menyediakan jalur komunikasi cepat untuk konsultasi masalah perangkat atau proyek web.'
      }
    ],
    featuredImageRecommendation: `Foto atau ilustrasi profesional beresolusi tinggi dengan pencahayaan bersih yang menampilkan meja kerja IT, layar diagnostik atau antarmuka sistem modern sesuai tema "${category}".`,
    imageAltText: `${baseTitle} — panduan teknis dan analisis ${category.toLowerCase()} oleh ${author}`,
    isFeatured: false,
    isAiGenerated: true,
    publishStatus: 'published'
  };

  return { article: fallbackArticle, source: 'smart-engine' };
}

// =========================================================================
// 1. API: GENERATE REALISTIC IT TUTORIAL WITH AI
// =========================================================================
app.post('/api/ai/generate-tutorial', async (req, res) => {
  const {
    topic,
    category = 'Pemecahan Masalah Komputer',
    difficulty = 'Pemula',
    customTitle,
    targetAudience,
    tutorialGoal,
    deviceType,
    operatingSystem,
    softwareTools,
    softwareVersion,
    lengthPreference
  } = req.body || {};

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({ error: 'Topik tutorial IT wajib diisi.' });
  }

  const { tutorial, source } = await generateTutorialInternal({
    topic,
    category,
    difficulty,
    customTitle,
    targetAudience,
    tutorialGoal,
    deviceType,
    operatingSystem,
    softwareTools,
    softwareVersion,
    lengthPreference
  });
  return res.json({ success: true, tutorial, source });
});

// =========================================================================
// 2. API: GENERATE REALISTIC IT ARTICLE WITH AI
// =========================================================================
app.post('/api/ai/generate-article', async (req, res) => {
  const {
    topic,
    category = 'Tren Teknologi',
    authorName,
    customTitle,
    targetAudience,
    articleGoal,
    articleType,
    wordCountTarget,
    focusKeyword,
    supportingKeywords,
    referencesInput
  } = req.body || {};

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({ error: 'Topik artikel IT wajib diisi.' });
  }

  const { article, source } = await generateArticleInternal({
    topic,
    category,
    authorName,
    customTitle,
    targetAudience,
    articleGoal,
    articleType,
    wordCountTarget,
    focusKeyword,
    supportingKeywords,
    referencesInput
  });
  return res.json({ success: true, article, source });
});

// =========================================================================
// 2.5. API: GENERATE CATEGORY-SPECIFIC TOPICS FOR ARTICLES & TUTORIALS
// =========================================================================
app.post('/api/ai/generate-topics', async (req, res) => {
  const {
    type = 'article',
    category = 'Tren Teknologi',
    difficulty = 'Pemula',
    count = 5,
    excludeTopics = []
  } = req.body || {};

  const safeType: 'article' | 'tutorial' = type === 'tutorial' ? 'tutorial' : 'article';
  const result = await generateTopicsInternal({
    type: safeType,
    category,
    difficulty,
    count,
    excludeTopics
  });

  return res.json({
    success: true,
    topics: result.topics,
    category,
    type: safeType,
    source: result.source
  });
});

// =========================================================================
// 2.8. API: FULL AI AUTOPILOT (Generate Topic -> Create Content -> Publish Live)
// =========================================================================
app.all('/api/ai/autopilot', async (req, res) => {
  setNoCacheHeaders(res);
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method tidak diizinkan.' });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(503).json({ success: false, error: 'Database Supabase belum dikonfigurasi.' });
  }

  const forceRun = req.body?.force === true || req.query?.force === 'true';

  try {
    const existingContent = await readContent();
    if (!existingContent || typeof existingContent !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Snapshot site_content_v2 belum tersedia di Supabase. Simpan data awal terlebih dahulu.'
      });
    }

    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const todayLabel = new Date(nowMs).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

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
              scheduledAt: undefined
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
      ...(req.body?.config || {})
    };

    const intervalHours = Math.max(Number(currentAutopilot.intervalHours) || 24, 1);
    const lastRunMs = currentAutopilot.lastRunAt ? new Date(currentAutopilot.lastRunAt).getTime() : 0;
    const nextRunMs = currentAutopilot.nextRunAt ? new Date(currentAutopilot.nextRunAt).getTime() : 0;

    const recentlyRan = !forceRun && lastRunMs > 0 && nowMs - lastRunMs < 30_000;
    const notDueYet = !forceRun && nextRunMs > 0 && nowMs < nextRunMs;

    if (!forceRun && (!currentAutopilot.enabled || recentlyRan || notDueYet)) {
      if (promotedCount > 0) {
        await writeContent({
          ...existingContent,
          tutorials: nextTutorialsBase,
          articles: nextArticlesBase,
          aiAutopilot: currentAutopilot
        });
      }
      return res.json({
        success: true,
        ran: false,
        promotedScheduledCount: promotedCount,
        reason: !currentAutopilot.enabled
          ? 'Auto-Pilot dalam status nonaktif.'
          : 'Belum mencapai jadwal eksekusi berikutnya.',
        nextRunAt: currentAutopilot.nextRunAt || null,
        aiAutopilot: currentAutopilot
      });
    }

    const targetType: 'article' | 'tutorial' =
      currentAutopilot.contentType === 'article'
        ? 'article'
        : currentAutopilot.contentType === 'tutorial'
        ? 'tutorial'
        : currentAutopilot.lastCreatedType === 'article'
        ? 'tutorial'
        : 'article';

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

    const { topics } = await generateTopicsInternal({
      type: targetType,
      category: chosenCategory,
      difficulty: currentAutopilot.tutorialDifficulty || 'Pemula',
      count: 3,
      excludeTopics: excludeTitles
    });

    const chosenTopic = topics[0] || `Panduan Praktis ${chosenCategory} Terbaru`;
    let generatedItem: Record<string, any>;
    let source: string;

    if (targetType === 'article') {
      const resArt = await generateArticleInternal({
        topic: chosenTopic,
        category: chosenCategory,
        authorName: existingContent.profile?.name || 'Risa Kurniawan'
      });
      generatedItem = resArt.article;
      source = resArt.source;
    } else {
      const resTut = await generateTutorialInternal({
        topic: chosenTopic,
        category: chosenCategory,
        difficulty: currentAutopilot.tutorialDifficulty || 'Pemula'
      });
      generatedItem = resTut.tutorial;
      source = resTut.source;
    }

    const baseSlug = String(generatedItem.slug || slugify(generatedItem.title) || `ai-${nowMs}`);
    if (existingItems.some((i: any) => i?.slug === baseSlug)) {
      generatedItem.slug = `${baseSlug}-${String(nowMs).slice(-4)}`;
    }

    const logEntry = {
      id: `log-${nowMs}`,
      ranAt: nowIso,
      type: targetType,
      title: generatedItem.title,
      category: chosenCategory,
      source,
      status: 'published'
    };

    const nextRunAt = new Date(nowMs + intervalHours * 3600_000).toISOString();
    const nextAutopilot = {
      ...currentAutopilot,
      lastRunAt: nowIso,
      nextRunAt,
      lastCreatedType: targetType,
      totalAutoPosted: (Number(currentAutopilot.totalAutoPosted) || 0) + 1,
      lastPostedTitle: generatedItem.title,
      history: [logEntry, ...(Array.isArray(currentAutopilot.history) ? currentAutopilot.history : [])].slice(0, 15)
    };

    const updatedContent = {
      ...existingContent,
      tutorials: targetType === 'tutorial' ? [generatedItem, ...nextTutorialsBase] : nextTutorialsBase,
      articles: targetType === 'article' ? [generatedItem, ...nextArticlesBase] : nextArticlesBase,
      aiAutopilot: nextAutopilot
    };

    await writeContent(updatedContent);

    return res.json({
      success: true,
      ran: true,
      type: targetType,
      item: generatedItem,
      source,
      promotedScheduledCount: promotedCount,
      aiAutopilot: nextAutopilot,
      content: sanitizeContentForPublic(updatedContent),
      message: `${targetType === 'article' ? 'Artikel' : 'Tutorial'} "${generatedItem.title}" berhasil dibuat & diterbitkan otomatis ke Supabase!`
    });
  } catch (err: any) {
    console.error('[Server API] Autopilot execution failed:', err);
    return res.status(500).json({
      success: false,
      error: `Auto-Pilot AI gagal dieksekusi: ${err?.message || 'Internal Server Error'}`
    });
  }
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
