-- =========================================================================
-- SUPABASE DATABASE SCHEMA FOR R. KURNIAWAN (RUANG DIGITAL) CMS
-- =========================================================================
-- Jalankan seluruh script SQL ini di Supabase SQL Editor:
-- 1. Buka https://supabase.com/dashboard -> Pilih project Anda
-- 2. Klik menu "SQL Editor" di bilah kiri
-- 3. Paste seluruh isi file ini, lalu klik "Run" (tombol hijau)
-- =========================================================================

-- 1. Buat Tabel Utama Penyimpanan Konten CMS
CREATE TABLE IF NOT EXISTS public.site_content (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Buat Index untuk Performa Query Cepat
CREATE INDEX IF NOT EXISTS idx_site_content_key ON public.site_content (key);
CREATE INDEX IF NOT EXISTS idx_site_content_updated_at ON public.site_content (updated_at DESC);

-- 3. Konfigurasi Row Level Security (RLS)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada untuk menghindari duplikasi
DROP POLICY IF EXISTS "Public Read Content" ON public.site_content;
DROP POLICY IF EXISTS "Service Role Full Access" ON public.site_content;
DROP POLICY IF EXISTS "Anon Read Access" ON public.site_content;
DROP POLICY IF EXISTS "Authenticated Manage Content" ON public.site_content;

-- Policy 1: Izinkan pembacaan publik (GET) untuk semua pengunjung website live
CREATE POLICY "Public Read Content" 
ON public.site_content 
FOR SELECT 
TO public 
USING (true);

-- Policy 2: Izinkan service_role (Backend API Vercel / Express) melakukan INSERT/UPDATE/DELETE penuh
CREATE POLICY "Service Role Full Access" 
ON public.site_content 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Policy 3: Izinkan authenticated users jika login via Supabase Auth
CREATE POLICY "Authenticated Manage Content" 
ON public.site_content 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 4. Trigger Otomatis Pembaruan updated_at
CREATE OR REPLACE FUNCTION public.handle_site_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_site_content_updated_at ON public.site_content;
CREATE TRIGGER set_site_content_updated_at
    BEFORE UPDATE ON public.site_content
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_site_content_updated_at();

-- 5. Seed Data Awal Akun Admin (site_admins_v1)
INSERT INTO public.site_content (key, value, updated_at)
VALUES (
    'site_admins_v1',
    '[
        {
            "id": "super-admin-risa7lavan",
            "username": "risa7lavan",
            "email": "risa7lavan@gmail.com",
            "password": "Almahyra7$",
            "name": "Risa Kurniawan",
            "role": "Super Admin",
            "createdAt": "2026-01-01T00:00:00.000Z"
        },
        {
            "id": "admin-alternatif",
            "username": "admin",
            "email": "admin@rkurniawan.my.id",
            "password": "admin123",
            "name": "Admin Alternatif",
            "role": "Admin",
            "createdAt": "2026-01-01T00:00:00.000Z"
        }
    ]'::jsonb,
    NOW()
)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = NOW();

-- 6. Verifikasi Hasil
SELECT key, pg_size_pretty(pg_column_size(value)) as size, updated_at 
FROM public.site_content;
