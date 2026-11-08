import { Article } from '../types';

export const articlesData: Article[] = [
  {
    id: 'art-1',
    slug: 'masa-depan-it-support-era-ai',
    title: 'Masa Depan IT Support di Era AI: Apakah Peran Teknisi Akan Tergantikan?',
    summary:
      'Analisis mendalam mengenai pergeseran peran IT Support dari sekadar penangan tiket komplain menjadi kurator infrastruktur cerdas dan arsitek efisiensi alur kerja.',
    category: 'Tren Teknologi',
    publishedDate: '12 Jan 2025',
    readTimeMinutes: 7,
    thumbnail: '/images/hero_creative_workspace_1793775537391.jpg',
    author: 'Risa Kurniawan',
    tags: ['Kecerdasan Buatan', 'IT Support', 'Karir Teknologi', 'Otomatisasi'],
    isFeatured: true,
    isAiGenerated: false,
    sections: [
      {
        heading: 'Pergeseran Paradigma dari Reaktif ke Proaktif',
        body: 'Selama beberapa dekade, pekerjaan teknisi IT seringkali bersifat reaktif: menunggu ada laptop yang hang, printer macet, atau kabel jaringan putus baru kemudian bergerak melakukan pemecahan masalah. Dengan hadirnya model bahasa besar (LLM) dan sistem prediktif berbasis kecerdasan buatan, pemantauan log server dan anomali perangkat kini dapat dideteksi sebelum sistem benar-benar tumbang.',
        highlight: 'AI bukan menggantikan empati dan nalar manusia, melainkan melenyapkan tugas-tugas administratif repetitif yang membuang waktu.'
      },
      {
        heading: 'Sentuhan Fisik yang Tidak Bisa Digantikan AI',
        body: 'Meskipun chatbot dapat memandu pengguna cara mereset password atau memandu perintah CMD, AI tidak memiliki tangan fisik untuk memasang modul RAM DDR5, membersihkan korosi soket baterai laptop, atau mengkrimping kabel UTP Cat6 di atas plafon kantor. Keterampilan motorik dan keahlian diagnostik hardware tetap menjadi ranah eksklusif teknisi manusia.',
        highlight: 'Kemampuan fisik merakit, mengisolasi kerusakan sirkuit, dan diagnosa komponen fisik tetap menjadi nilai tawar tak tergantikan.'
      },
      {
        heading: 'Keahlian Baru yang Wajib Dimiliki Teknisi Modern',
        body: 'Teknisi IT masa kini harus mulai menguasai prompt engineering untuk diagnostik kode skrip PowerShell, pemahaman alur data cloud hybrid, serta kemampuan mendokumentasikan SOP dengan bahasa yang mudah dipahami non-teknis. Sinergi antara kepekaan logika manusia dan kecepatan kalkulasi AI akan melahirkan profesional IT kelas satu.'
      }
    ],
    conclusion:
      'Alih-alih takut tergantikan, teknisi IT yang adaptif justru harus menyambut AI sebagai asisten virtual paling loyal untuk menyelesaikan masalah pengguna lebih cepat dan presisi.'
  },
  {
    id: 'art-2',
    slug: 'ssd-nvme-vs-sata-panduan-memilih',
    title: 'SSD NVMe vs SATA: Mana Pilihan Terbaik untuk Upgrade Laptop & PC Anda?',
    summary:
      'Bedah tuntas perbedaan arsitektur antarmuka PCIe vs AHCI, performa baca-tulis riil dalam penggunaan sehari-hari, serta efisiensi daya.',
    category: 'Perangkat Keras & Gadget',
    publishedDate: '05 Jan 2025',
    readTimeMinutes: 6,
    thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
    author: 'Risa Kurniawan',
    tags: ['Hardware', 'SSD', 'Upgrade PC', 'Performa Komputer'],
    isFeatured: true,
    isAiGenerated: false,
    sections: [
      {
        heading: 'Memahami Batasan Kecepatan Antarmuka',
        body: 'SSD SATA (baik ukuran 2.5 inci maupun format M.2 SATA) dibatasi oleh batas fisik protokol SATA III dengan kecepatan maksimal teoritis sekitar 600 MB/s (riil ~500–550 MB/s). Di sisi lain, SSD NVMe memanfaatkan jalur PCIe berkecepatan tinggi dengan kecepatan tembus 3.500 MB/s pada PCIe Gen 3 hingga lebih dari 7.000 MB/s pada PCIe Gen 4.',
        highlight: 'Angka benchmark NVMe bisa 6x hingga 14x lebih tinggi dibanding SSD SATA konvensional.'
      },
      {
        heading: 'Dampak pada Penggunaan Harian: Apakah Terasa Nyata?',
        body: 'Untuk booting Windows dan membuka aplikasi harian (seperti browser, Microsoft Office, atau software kasir), perbedaan antara SATA dan NVMe hanya berkisar antara 1–2 detik saja karena limitasi utama bukan pada sequential read, melainkan pada 4K Random Read. Namun, saat Anda bekerja dengan transfer file puluhan gigabyte, video editing 4K, atau rendering 3D, SSD NVMe menunjukkan taringnya yang sesungguhnya.'
      },
      {
        heading: 'Pertimbangan Suhu dan Konsumsi Daya',
        body: 'NVMe menghasilkan panas operasional yang jauh lebih tinggi dibanding SATA. Pastikan motherboard Anda memiliki heatsink M.2 bawaan atau gunakan thermal pad yang berkualitas agar drive tidak mengalami thermal throttling saat beban puncak.'
      }
    ],
    conclusion:
      'Jika laptop Anda mendukung slot M.2 PCIe, pilihlah NVMe karena selisih harganya kini sangat tipis dengan SATA. Namun untuk laptop lawas pra-2016, SSD SATA 2.5 inci tetap menjadi opsi upgrade paling bijak.'
  },
  {
    id: 'art-3',
    slug: 'keamanan-siber-dasar-komputer-kantor',
    title: 'Panduan Keamanan Siber Esensial untuk Menjaga Komputer dari Ancaman Ransomware',
    summary:
      'Langkah preventif wajib bagi pengguna PC: prinsip Zero-Trust sederhana, kebiasaan backup 3-2-1, dan mengenali tautan phishing terselubung.',
    category: 'Keamanan Siber',
    publishedDate: '28 Des 2024',
    readTimeMinutes: 8,
    thumbnail: '/images/hero_creative_workspace_1793775537391.jpg',
    author: 'Risa Kurniawan',
    tags: ['Cyber Security', 'Ransomware', 'Backup Data', 'Keamanan Windows'],
    isFeatured: true,
    isAiGenerated: false,
    sections: [
      {
        heading: 'Anatomi Serangan: Mengapa Komputer Kantor Sering Menjadi Sasaran?',
        body: 'Sebagian besar insiden infeksi ransomware tidak dimulai dari celah sistem operasi yang rumit, melainkan dari rekayasa sosial (social engineering): email tagihan palsu berlampiran file ZIP atau dokumen Office berkode makro berbahaya yang diklik oleh karyawan yang kurang waspada.',
        highlight: 'Kelalaian manusia (Human error) merupakan 85% faktor utama masuknya malware ke jaringan lokal.'
      },
      {
        heading: 'Menerapkan Kaidah Backup Emas 3-2-1',
        body: 'Kaidah 3-2-1 mewajibkan Anda memiliki: 3 salinan data penting, disimpan pada 2 jenis media penyimpanan yang berbeda (misalnya internal drive dan eksternal HDD/NAS), dengan 1 salinan disimpan di lokasi terpisah (off-site / cloud storage yang terisolasi).'
      },
      {
        heading: 'Hak Akses Standar vs Administrator',
        body: 'Jangan pernah gunakan akun Windows harian dengan hak akses Administrator penuh. Buatlah akun pengguna standar (Standard User) untuk komputasi harian. Ketika malware mencoba menginstal layanan sistem atau mengubah registry partisi, Windows akan otomatis memunculkan prompt UAC yang memblokir eksekusi tanpa izin.'
      }
    ],
    conclusion:
      'Keamanan siber bukanlah produk sekali beli, melainkan rutinitas disiplin yang dibangun dari kewaspadaan harian.'
  },
  {
    id: 'art-4',
    slug: 'windows-defender-apakah-cukup',
    title: 'Apakah Windows Defender Bawaan Sudah Cukup Tanpa Antivirus Tambahan?',
    summary:
      'Uji objektivitas Microsoft Defender Antivirus di era Windows 11: kapabilitas real-time protection, konsumsi RAM, dan kapan antivirus pihak ketiga tetap dibutuhkan.',
    category: 'Sistem Operasi & Software',
    publishedDate: '15 Des 2024',
    readTimeMinutes: 5,
    thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
    author: 'Risa Kurniawan',
    tags: ['Windows 11', 'Antivirus', 'Windows Defender', 'Tips IT'],
    isFeatured: false,
    isAiGenerated: false,
    sections: [
      {
        heading: 'Evolusi Microsoft Defender dari Masa ke Masa',
        body: 'Dulu di era Windows 7, Microsoft Security Essentials kerap dianggap sebagai antivirus lemah yang lambat merespon varian virus baru. Namun di Windows 10 dan 11, Microsoft telah mengintegrasikan engine berbasis cloud intelligence dengan basis data telemetri miliaran perangkat Windows di seluruh dunia.',
        highlight: 'Dalam pengujian laboratorium independen seperti AV-TEST, Defender konsisten meraih skor deteksi 99%–100%.'
      },
      {
        heading: 'Keuntungan Utama: Tanpa Iklan Pop-up & Ringan di Sistem',
        body: 'Banyak software antivirus gratis pihak ketiga kini disusupi adware, notifikasi pop-up agresif yang menakut-nakuti pengguna, serta browser extension yang justru membebani RAM laptop. Windows Defender bekerja hening di latar belakang tanpa mengganggu alur kerja Anda.'
      }
    ],
    conclusion:
      'Bagi pengguna rumahan dan pekerja profesional yang berhati-hati dalam berselancar, Windows Defender sudah lebih dari cukup.'
  },
  {
    id: 'art-5',
    slug: 'pentingnya-thermal-paste-laptop',
    title: 'Pentingnya Mengganti Thermal Paste Laptop Secara Berkala: Cegah Overheat & Throttling',
    summary:
      'Mengenal masa pakai senyawa termal prosesor, gejala penurunan performa kipas, dan dampak fatal thermal throttling pada usia pakai motherboard.',
    category: 'Perangkat Keras & Gadget',
    publishedDate: '20 Nov 2024',
    readTimeMinutes: 6,
    thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
    author: 'Risa Kurniawan',
    tags: ['Hardware', 'Thermal Paste', 'Perawatan Komputer', 'Laptop'],
    isFeatured: false,
    isAiGenerated: false,
    sections: [
      {
        heading: 'Mengapa Thermal Paste Mengering Seiring Waktu?',
        body: 'Thermal paste bertindak sebagai jembatan penghantar panas mikro antara permukaan logam die prosesor (CPU/GPU) dengan pelat tembaga heatsink. Karena siklus panas dan dingin yang konstan (thermal cycling), cairan silikon di dalamnya akan menguap dan mengeras dalam rentang 1–2 tahun pemakaian aktif.',
        highlight: 'Pasta yang sudah kering berubah menjadi isolator panas dan menyebabkan suhu CPU melonjak hingga 95°C+.'
      },
      {
        heading: 'Tanda-Tanda Laptop Anda Sudah Butuh Repaste',
        body: 'Kipas laptop mendengung kencang meskipun hanya membuka tab browser, permukaan keyboard terasa panas menyengat, atau fps game tiba-tiba drop drastis setelah 10 menit bermain adalah gejala klasik thermal throttling.'
      }
    ],
    conclusion:
      'Melakukan pembersihan debu kipas dan repaste berkala setiap 12–18 bulan adalah investasi termurah untuk memperpanjang usia laptop Anda hingga 5 tahun lebih.'
  }
];
