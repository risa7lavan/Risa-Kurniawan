import { ServiceItem } from '../types';

export const servicesData: ServiceItem[] = [
  {
    id: 'srv-1',
    slug: 'pembuatan-website-modern-ai',
    title: 'Pembuatan Website Modern & Integrasi AI',
    category: 'Pengembangan Web & AI',
    shortDescription: 'Pengembangan website responsif berkecepatan tinggi dengan teknologi modern, desain eksklusif, dan integrasi fitur AI pintar.',
    fullDescription: 'Layanan pembuatan website profesional dari tahap perancangan konsep hingga online di internet. Memanfaatkan kecerdasan buatan (Gemini AI / LLM) untuk automasi konten, smart search, chatbot interaktif, serta optimasi SEO dan performa tinggi.',
    priceStartingFrom: 'Mulai Rp 1.500.000',
    turnaroundTime: '5 - 10 Hari Kerja',
    features: [
      'Desain eksklusif (Bukan template murahan, disesuaikan dengan identitas brand)',
      'Teknologi modern: React, TypeScript, Next.js / Vite, Tailwind CSS',
      'Integrasi AI (Chatbot asisten cerdas, generator konten otomatis, atau rekomendasi pintar)',
      '100% Responsif & mobile-friendly di semua gadget & resolusi layar',
      'Skor Google PageSpeed & SEO teknis optimal',
      'Garansi bug fix & dukungan teknis 30 hari penuh pasca peluncuran'
    ],
    deliverables: [
      'Website live siap pakai dengan domain & hosting aktif',
      'Dashboard admin mandiri untuk update konten tanpa perlu coding',
      'Dokumentasi petunjuk pengelolaan sistem (User Manual PDF / Video)',
      'Akses repositori kode sumber (Source Code) lengkap di GitHub / GitLab'
    ],
    targetAudience: 'UMKM, Profesional, Lembaga, Startup, Portofolio Kreator, Bisnis Jasa',
    icon: 'code',
    isPopular: true,
    isActive: true,
    isDemoData: false,
    whatsappMessageTemplate: 'Halo, saya tertarik dengan jasa Pembuatan Website Modern & Integrasi AI. Bisakah berdiskusi mengenai kebutuhan proyek saya?'
  },
  {
    id: 'srv-2',
    slug: 'servis-optimasi-komputer-laptop',
    title: 'Perbaikan, Pembersihan & Optimasi PC / Laptop',
    category: 'IT Support & Hardware',
    shortDescription: 'Solusi komputer lambat, hang, overheat, terkena virus, hingga upgrade hardware SSD & RAM agar performa maksimal kembali.',
    fullDescription: 'Layanan pemeliharaan dan perbaikan perangkat komputer desktop maupun laptop kerja. Dilakukan dengan prosedur teknis standar industri: diagnosa mendalam komponen, pembersihan menyeluruh sirkulasi pendingin, penggantian thermal paste berkualitas, serta pembersihan virus dan tuning sistem operasi.',
    priceStartingFrom: 'Mulai Rp 150.000',
    turnaroundTime: '1 - 2 Hari Kerja',
    features: [
      'Pembersihan debu motherboard & kipas pendingin dari risiko overheat',
      'Penggantian thermal paste standar performa tinggi (Arctic MX-4 / sekelas)',
      'Pembersihan tuntas virus, adware, bloatware & penataan startup Windows',
      'Pemeriksaan kondisi kesehatan SSD, HDD, baterai, dan kestabilan RAM',
      'Instalasi ulang sistem operasi Windows bersih dengan driver resmi terupdate',
      'Konsultasi rekomendasi upgrade komponen hemat biaya'
    ],
    deliverables: [
      'Laporan hasil pengujian performa & suhu sebelum vs sesudah servis',
      'Perangkat kembali bersih, dingin, dan responsif optimal',
      'Backup data penting ke storage aman sebelum proses maintenance',
      'Garansi servis 14 hari pengerjaan'
    ],
    targetAudience: 'Pengguna Laptop Kerja, Mahasiswa, Kantor, Konten Kreator, Gamers',
    icon: 'cpu',
    isPopular: true,
    isActive: true,
    isDemoData: false,
    whatsappMessageTemplate: 'Halo, saya ingin konsultasi servis dan optimasi untuk perangkat PC/Laptop saya yang mengalami kendala performa.'
  },
  {
    id: 'srv-3',
    slug: 'instalasi-manajemen-jaringan-mikrotik',
    title: 'Instalasi Jaringan & Konfigurasi Router MikroTik',
    category: 'Jaringan & Server',
    shortDescription: 'Perancangan topologi jaringan kantor/rumah, manajemen bandwidth adil, sistem hotspot voucher, dan proteksi firewall.',
    fullDescription: 'Atasi masalah internet lelet akibat pembagian bandwidth yang tidak merata atau sinyal WiFi yang sering putus. Kami melayani perancangan jaringan kabel LAN dan wireless, konfigurasi router MikroTik, pemisahan jaringan kantor vs tamu (VLAN), hingga sistem keamanan port forwarding remote yang aman.',
    priceStartingFrom: 'Mulai Rp 350.000',
    turnaroundTime: '1 - 3 Hari Kerja',
    features: [
      'Pengaturan pembagian kuota & bandwidth adil (Simple Queue / Queue Tree)',
      'Konfigurasi Hotspot login page dengan sistem voucher waktu / kuota',
      'Pemisahan VLAN untuk jaringan staf kantor dan koneksi publik/tamu',
      'Penguatan Firewall Router dari ancaman brute-force dan port scanning',
      'Setup Failover / Load Balancing multi-ISP (cadangan otomatis jika 1 internet mati)',
      'Crimp kabel LAN Cat6 berkualitas dan uji koneksi tester flaring'
    ],
    deliverables: [
      'File backup konfigurasi MikroTik (.backup & .rsc)',
      'Diagram topologi skema jaringan fisik dan logika (PDF)',
      'Tabel alokasi IP Address statis dan subnet DHCP',
      'Dukungan konfigurasi remote selama 14 hari'
    ],
    targetAudience: 'Kantor Swasta/Pemerintahan, Sekolah, Kafe, Kos-Kosan, Rumah Tinggal',
    icon: 'network',
    isPopular: false,
    isActive: true,
    isDemoData: false,
    whatsappMessageTemplate: 'Halo, saya ingin menanyakan jasa konfigurasi Router MikroTik dan penataan jaringan internet untuk lokasi saya.'
  },
  {
    id: 'srv-4',
    slug: 'backup-otomatis-keamanan-data',
    title: 'Setup Backup Otomatis & Proteksi Ransomware',
    category: 'Keamanan & Backup',
    shortDescription: 'Perlindungan menyeluruh arsip bisnis dari ancaman kerusakan disk, human error, dan malware dengan strategi backup 3-2-1.',
    fullDescription: 'Jangan biarkan dokumen kerja bertahun-tahun lenyap seketika karena harddisk rusak atau terserang ransomware. Kami membangun alur pencadangan data otomatis yang berjalan di latar belakang tanpa mengganggu jam kerja, disinkronkan ke local storage (NAS) dan private cloud terenkripsi.',
    priceStartingFrom: 'Mulai Rp 500.000',
    turnaroundTime: '2 - 4 Hari Kerja',
    features: [
      'Penerapan standar backup 3-2-1 (3 salinan data, 2 media berbeda, 1 lokasi offsite)',
      'Jadwal otomatis harian / mingguan dengan enkripsi end-to-end',
      'Pengaturan versioning (kemampuan memulihkan file ke tanggal sebelum terinfeksi)',
      'Notifikasi otomatis via email / Telegram bila backup berhasil atau gagal',
      'Konfigurasi Synology / QNAP / TrueNAS / Google Workspace Drive',
      'Pelatihan simulasi disaster recovery untuk memastikan data bisa dipulihkan'
    ],
    deliverables: [
      'Sistem backup otomatis aktif dan teruji',
      'SOP dokumen darurat pemulihan data langkah demi langkah',
      'Kunci enkripsi aman yang disimpan oleh klien',
      'Uji coba pemulihan data (Restore Drill Test) langsung di hadapan klien'
    ],
    targetAudience: 'Kantor Akuntan, Notaris, Klinik, Studio Kreatif, UMKM yang memiliki arsip berharga',
    icon: 'shield',
    isPopular: false,
    isActive: true,
    isDemoData: false,
    whatsappMessageTemplate: 'Halo, saya ingin mengamankan data dan arsip penting perusahaan dengan solusi setup backup otomatis.'
  },
  {
    id: 'srv-5',
    slug: 'recovery-penyelamatan-data',
    title: 'Pemulihan Data (Data Recovery) & Servis Storage',
    category: 'IT Support & Hardware',
    shortDescription: 'Layanan penyelamatan file penting yang terhapus, partisi RAW, harddisk eksternal tidak terbaca, atau flashdisk korup.',
    fullDescription: 'Penyelamatan data digital dari berbagai media penyimpanan: Flashdisk, Kartu Memori SD, HDD Eksternal/Internal, dan SSD. Menggunakan software forensik dan teknik bypass non-destruktif berprinsip kerahasiaan data tingkat tinggi dengan kebijakan perlindungan privasi yang ketat.',
    priceStartingFrom: 'Mulai Rp 300.000',
    turnaroundTime: '2 - 5 Hari Kerja',
    features: [
      'Penanganan partisi RAW, file system corrupt, dan format tidak sengaja',
      'Penyelamatan dokumen Word/Excel, database, dan foto/video berharga',
      'Metode Read-Only Cloning untuk mencegah kerusakan lebih parah pada drive',
      'Jaminan kerahasiaan data 100% dengan perjanjian kerahasiaan (NDA jika diperlukan)',
      'Prinsip No-Data No-Fee: Biaya recovery utama hanya dibayar bila target data berhasil terselamatkan',
      'Pengecekan awal gratis untuk mengetahui tingkat kemungkinan pemulihan'
    ],
    deliverables: [
      'File-file target yang berhasil diekstraksi ke media penyimpanan baru',
      'Laporan struktur folder hasil pemulihan',
      'Sertifikat penghapusan jejak salinan sementara setelah data diterima klien'
    ],
    targetAudience: 'Individu, Mahasiswa (Skripsi/Tesis), Kantor Hukum, Perusahaan',
    icon: 'database',
    isPopular: false,
    isActive: true,
    isDemoData: false,
    whatsappMessageTemplate: 'Halo, harddisk/flashdisk saya tidak terbaca dan memiliki data penting. Saya ingin konsultasi pemulihan data.'
  },
  {
    id: 'srv-6',
    slug: 'audit-konsultasi-it-infrastruktur',
    title: 'Audit & Konsultasi Infrastruktur IT Perusahaan',
    category: 'Konsultasi IT',
    shortDescription: 'Evaluasi menyeluruh perangkat, jaringan, dan software kantor untuk memangkas pengeluaran serta meningkatkan produktivitas tim.',
    fullDescription: 'Dapatkan pandangan objektif dan solusi praktis untuk kebutuhan teknologi kantor Anda. Kami menganalisis kelemahan sistem yang ada, merekomendasikan efisiensi lisensi software dan pengadaan hardware yang tepat guna, serta menyusun panduan operasional IT yang siap dijalankan.',
    priceStartingFrom: 'Mulai Rp 750.000',
    turnaroundTime: '3 - 7 Hari Kerja',
    features: [
      'Inventarisasi aset perangkat keras & lisensi sistem operasi/software kantor',
      'Analisis celah keamanan akses data dan kebijakan password karyawan',
      'Rekomendasi spesifikasi pengadaan komputer tepat guna tanpa pemborosan',
      'Penyusunan SOP penanganan insiden teknologi dan etika keamanan digital',
      'Sesi workshop atau briefing singkat bagi karyawan mengenai cyber hygiene',
      'Konsultasi lanjutan via WhatsApp / Google Meet selama 30 hari'
    ],
    deliverables: [
      'Dokumen komprehensif Laporan Audit Infrastruktur IT (PDF)',
      'Checklist rekomendasi perbaikan dengan skala prioritas dampak vs biaya',
      'Rancangan anggaran biaya (RAB) estimasi pengadaan alat bila diperlukan'
    ],
    targetAudience: 'Manajemen Perusahaan, Pemilik Usaha, Startup, Sekolah Swasta',
    icon: 'headphones',
    isPopular: false,
    isActive: true,
    isDemoData: false,
    whatsappMessageTemplate: 'Halo, saya ingin menjadwalkan konsultasi audit infrastruktur IT dan rekomendasi sistem untuk kantor kami.'
  }
];
