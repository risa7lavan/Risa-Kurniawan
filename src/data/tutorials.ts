import { Tutorial } from '../types';

export const tutorialsData: Tutorial[] = [
  {
    id: 'tut-1',
    slug: 'instalasi-windows-11-bersih-laptop-baru',
    title: 'Panduan Lengkap Instalasi Bersih (Clean Install) Windows 11 di Laptop & PC',
    summary:
      'Langkah sistematis melakukan instalasi ulang Windows 11 menggunakan bootable USB UEFI tanpa bloatware bawaan pabrik, lengkap dengan partisi aman.',
    category: 'Instalasi Windows',
    difficulty: 'Pemula',
    readTimeMinutes: 12,
    publishedDate: '15 Okt 2024',
    updatedDate: '02 Jan 2025',
    thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
    isFeatured: true,
    isDemoData: false,
    prerequisites: [
      'Flashdisk USB minimal 8 GB (data akan diformat bersih)',
      'Akses internet stabil di komputer lain untuk mengunduh ISO resmi',
      'Konektor charger laptop terpasang selama proses instalasi'
    ],
    toolsNeeded: [
      'ISO Windows 11 resmi dari situs Microsoft',
      'Software Rufus atau Windows Media Creation Tool',
      'Laptop/PC target dengan RAM minimal 4 GB dan SSD'
    ],
    riskWarning: {
      title: 'Peringatan Risiko Format Drive & Kehilangan Data',
      message:
        'Langkah pembersihan partisi akan menghapus seluruh data pada drive target secara permanen. Pastikan file penting di Local Disk C maupun desktop telah dicadangkan ke drive eksternal atau cloud sebelum menekan tombol Delete partisi!',
      severity: 'danger'
    },
    tableOfContents: [
      { id: 'persiapan-media-bootable', title: '1. Persiapan Flashdisk Bootable UEFI' },
      { id: 'masuk-menu-bios', title: '2. Mengatur Boot Priority di BIOS/UEFI' },
      { id: 'proses-instalasi-os', title: '3. Memilih Tipe Instalasi & Manajemen Partisi' },
      { id: 'setup-oobe', title: '4. Konfigurasi Awal Windows (OOBE)' },
      { id: 'verifikasi-driver', title: '5. Verifikasi Driver & Pembaruan Sistem' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Flashdisk Bootable UEFI dengan Rufus',
        description:
          'Buka aplikasi Rufus di komputer Anda. Pilih flashdisk target, arahkan boot selection ke berkas ISO Windows 11 yang telah diunduh. Pastikan skema partisi diatur ke GPT dan target sistem ke UEFI (non CSM). Klik Start dan tunggu hingga proses pembuatan bootable selesai 100%.'
      },
      {
        stepNumber: 2,
        title: 'Masuk ke Pengaturan BIOS / UEFI Laptop',
        description:
          'Tancapkan flashdisk ke port USB laptop. Nyalakan laptop sambil menekan tombol pintas BIOS secara berulang-ulang (F2 untuk ASUS/Acer, F12 untuk Dell, F9/F10 untuk HP, atau tombol Novo untuk Lenovo). Masuk ke tab Boot dan tempatkan USB Flash Drive di urutan pertama (Boot Priority #1), lalu simpan pengaturan dengan menekan F10 (Save & Exit).'
      },
      {
        stepNumber: 3,
        title: 'Memilih Jenis Instalasi & Manajemen Partisi',
        description:
          'Pada layar Windows Setup, pilih bahasa dan format keyboard. Klik "Install Now", lewati aktivasi jika ingin aktivasi nanti. Pilih "Custom: Install Windows only (advanced)". Pada daftar drive, pilih partisi sistem lama yang ingin diinstal ulang. Jika ingin clean install total pada SSD baru, hapus (Delete) partisi lama hingga tersisa "Unallocated Space", lalu klik Next agar Windows menyusun partisi EFI, MSR, dan Primary secara otomatis.'
      },
      {
        stepNumber: 4,
        title: 'Menuntaskan Setup OOBE (Out-of-Box Experience)',
        description:
          'Setelah proses penyalinan file selesai dan laptop restart otomatis, cabut flashdisk agar tidak kembali masuk ke layar instalasi awal. Ikuti instruksi di layar: pilih negara Indonesia, layout keyboard US, beri nama perangkat, dan masuk dengan akun Microsoft atau opsi akun lokal.'
      },
      {
        stepNumber: 5,
        title: 'Instalasi Driver Perangkat Keras Utama',
        description:
          'Hubungkan laptop ke jaringan internet (Wi-Fi/LAN). Buka Settings > Windows Update > Check for updates. Biarkan Windows mengunduh driver chipset, display, audio, dan touchpad. Anda juga dapat mengunjungi situs resmi pabrikan laptop untuk mengunduh driver kontrol baterai dan utility khusus.'
      }
    ],
    troubleshootingTips: [
      {
        issue: 'Drive SSD tidak terdeteksi pada layar pemilihan partisi (No drives were found)',
        resolution:
          'Pada laptop prosesor Intel generasi 11 ke atas, masalah ini umum terjadi karena ketiadaan driver Intel VMD (Rapid Storage Technology). Solusinya: unduh driver Intel RST dari situs produsen laptop, ekstrak ke flashdisk instalasi, lalu klik "Load driver" pada jendela setup Windows.'
      },
      {
        issue: 'Layar instalasi menyatakan PC tidak memenuhi syarat hardware (TPM 2.0 / Secure Boot)',
        resolution:
          'Saat membuat bootable di Rufus, centang opsi "Remove requirement for 4GB+ RAM, Secure Boot and TPM 2.0" untuk melewati pengecekan perangkat keras non-resmi.'
      }
    ],
    faqs: [
      {
        question: 'Apakah lisensi bawaan Windows original di laptop akan hangus setelah clean install?',
        answer:
          'Tidak. Pada sebagian besar laptop modern, lisensi Windows OEM tertanam secara permanen di BIOS (SLIC/MSDM chip). Begitu laptop terhubung ke internet pasca-instalasi, Windows akan otomatis teraktivasi.'
      },
      {
        question: 'Berapa kapasitas flashdisk ideal untuk membuat bootable Windows 11?',
        answer:
          'Direkomendasikan minimal 8 GB atau 16 GB dengan format filesystem FAT32/NTFS UEFI.'
      }
    ],
    conclusion:
      'Instalasi bersih merupakan metode paling efektif untuk menyegarkan sistem laptop, melenyapkan virus membandel, dan meniadakan aplikasi bloatware pabrikan yang membebani kinerja RAM sejak awal pemakaian.',
    relatedTutorialSlugs: ['cara-membuat-bootable-usb-rufus', 'troubleshooting-laptop-lemot-ssd']
  },
  {
    id: 'tut-2',
    slug: 'panduan-troubleshooting-wifi-jaringan-kantor',
    title: 'Troubleshooting Wi-Fi: Mengatasi Masalah "Connected, No Internet" & Konflik IP',
    summary:
      'Panduan mendiagnosis masalah koneksi jaringan lokal, pembaruan lease DHCP, reset stack TCP/IP, dan pengaturan DNS publik yang stabil.',
    category: 'Jaringan',
    difficulty: 'Menengah',
    readTimeMinutes: 14,
    publishedDate: '28 Sep 2024',
    updatedDate: '10 Jan 2025',
    thumbnail: '/images/hero_creative_workspace_1793775537391.jpg',
    isFeatured: true,
    isDemoData: false,
    prerequisites: [
      'Akses Administrator di komputer Windows',
      'Kemampuan membuka Command Prompt (cmd) atau PowerShell',
      'Pengetahuan letak router atau access point terdekat'
    ],
    toolsNeeded: [
      'Terminal Windows (Command Prompt Administrator)',
      'Kabel LAN RJ-45 (opsional untuk tes isolasi)'
    ],
    tableOfContents: [
      { id: 'uji-konektivitas-ping', title: '1. Uji Ping Gateway & DNS Eksternal' },
      { id: 'reset-stack-ip', title: '2. Reset TCP/IP Stack & Flush DNS' },
      { id: 'periksa-ip-conflict', title: '3. Deteksi Konflik Alamat IP' },
      { id: 'konfigurasi-dns-manual', title: '4. Mengatur DNS Publik yang Stabil' },
      { id: 'reinstall-driver-wifi', title: '5. Reset Adaptor & Driver Wi-Fi' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Uji Ping Gateway Lokal & DNS Eksternal',
        description:
          'Buka Command Prompt dengan hak akses administrator. Uji terlebih dahulu apakah laptop dapat berkomunikasi dengan router lokal, lalu uji koneksi ke internet luar menggunakan perintah ping.',
        codeSnippet: {
          language: 'bash',
          label: 'Command Prompt (Admin)',
          code: `# Cek IP Gateway saat ini
ipconfig

# Ping alamat router lokal (biasanya 192.168.1.1 atau 192.168.0.1)
ping 192.168.1.1 -n 4

# Ping DNS publik Google untuk memastikan jalur keluar internet
ping 8.8.8.8 -n 4`
        }
      },
      {
        stepNumber: 2,
        title: 'Melepas IP Lama & Melakukan Flush DNS Cache',
        description:
          'Terkadang cache DNS yang korup atau sewa IP (DHCP Lease) yang kadaluarsa menyebabkan browser tidak dapat membuka situs web meskipun status Wi-Fi tersambung. Jalankan rangkaian perintah pembersihan berikut secara berurutan.',
        codeSnippet: {
          language: 'bash',
          label: 'Command Prompt (Admin)',
          code: `ipconfig /release
ipconfig /renew
ipconfig /flushdns
netsh int ip reset
netsh winsock reset`
        },
        note: 'Setelah perintah di atas selesai, lakukan restart laptop untuk menerapkan pembaruan Winsock.'
      },
      {
        stepNumber: 3,
        title: 'Memastikan Pengaturan IPv4 Otomatis (DHCP)',
        description:
          'Buka Run (Win + R), ketik "ncpa.cpl" dan tekan Enter. Klik kanan pada adaptor Wi-Fi > Properties > klik ganda pada "Internet Protocol Version 4 (TCP/IPv4)". Pastikan opsi "Obtain an IP address automatically" terpilih agar tidak bentrok dengan perangkat lain di jaringan yang sama.'
      },
      {
        stepNumber: 4,
        title: 'Mengatur DNS Alternatif yang Cepat & Aman',
        description:
          'Jika provider internet Anda mengalami masalah pada server resolver DNS-nya, ubah opsi DNS menjadi manual. Gunakan Cloudflare (1.1.1.1 / 1.0.0.1) atau Google DNS (8.8.8.8 / 8.8.4.4).'
      }
    ],
    troubleshootingTips: [
      {
        issue: 'Status ikon Wi-Fi hilang sama sekali di taskbar Windows',
        resolution:
          'Periksa Device Manager (devmgmt.msc). Di bawah kategori "Network adapters", lihat apakah ada tanda seru kuning pada wireless controller. Klik kanan lalu pilih "Enable device" atau "Update driver".'
      },
      {
        issue: 'Wi-Fi sering putus sambung (disconnecting randomly)',
        resolution:
          'Masuk ke Device Manager > Wi-Fi adapter > Properties > Tab Power Management > Hilangkan centang pada opsi "Allow the computer to turn off this device to save power".'
      }
    ],
    faqs: [
      {
        question: 'Apa perbedaan mendasar antara frekuensi 2.4 GHz dan 5 GHz?',
        answer:
          'Frekuensi 2.4 GHz memiliki jangkauan sinyal lebih luas dan lebih baik menembus tembok, namun kecepatannya lebih rendah dan rentan interferensi. Frekuensi 5 GHz menawarkan kecepatan transfer data jauh lebih tinggi namun memiliki jangkauan sinyal yang lebih pendek.'
      }
    ],
    conclusion:
      'Mayoritas kendala Wi-Fi "Connected, No Internet" bersumber dari kegagalan alokasi DHCP atau cache DNS bermasalah. Dengan menguasai perintah dasar CMD, diagnosa dapat diselesaikan dalam hitungan menit tanpa perlu instal ulang.',
    relatedTutorialSlugs: ['instalasi-windows-11-bersih-laptop-baru', 'cara-cek-kesehatan-ssd-dan-harddisk']
  },
  {
    id: 'tut-3',
    slug: 'troubleshooting-laptop-lemot-ssd',
    title: 'Solusi Menyeluruh Mengatasi Laptop Lemot & Disk Usage 100% di Windows',
    summary:
      'Panduan praktis mematikan service latar belakang yang tidak perlu, mengaudit startup apps, membersihkan file temporary, dan urgensi upgrade SSD.',
    category: 'Pemecahan Masalah Komputer',
    difficulty: 'Menengah',
    readTimeMinutes: 15,
    publishedDate: '05 Sep 2024',
    updatedDate: '18 Des 2024',
    thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
    isFeatured: true,
    isDemoData: false,
    prerequisites: [
      'Mengetahui spesifikasi RAM dan tipe penyimpanan laptop (HDD atau SSD)',
      'Akses administrator di Windows 10/11'
    ],
    toolsNeeded: [
      'Task Manager Windows',
      'Disk Cleanup / Storage Sense',
      'CrystalDiskInfo (opsional untuk cek performa read/write)'
    ],
    tableOfContents: [
      { id: 'audit-task-manager', title: '1. Mengaudit Beban CPU & Disk di Task Manager' },
      { id: 'kelola-startup-apps', title: '2. Menonaktifkan Aplikasi Startup yang Berat' },
      { id: 'nonaktifkan-sysmain', title: '3. Menjinakkan Service SysMain & Windows Search' },
      { id: 'pembersihan-storage', title: '4. Membersihkan Berkas Sampah (Temp & Prefetch)' },
      { id: 'solusi-hardware-ssd', title: '5. Kapan Harus Melakukan Upgrade SSD?' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Mengaudit Beban Sistem Melalui Task Manager',
        description:
          'Tekan Ctrl + Shift + Esc untuk membuka Task Manager. Perhatikan kolom Disk, CPU, dan Memory. Jika kolom Disk berwarna oranye/merah konstan 100% meskipun tidak ada aplikasi yang sedang Anda jalankan, biasanya laptop masih menggunakan harddisk mekanik (HDD) konvensional atau terdapat service background yang mengalami loop indexing.'
      },
      {
        stepNumber: 2,
        title: 'Membatasi Aplikasi Startup yang Berjalan Otomatis',
        description:
          'Pindah ke tab "Startup apps". Urutkan berdasarkan "Startup impact". Nonaktifkan (Disable) aplikasi pihak ketiga seperti Spotify, Discord, Adobe Creative Cloud, atau torrent client agar tidak langsung menyedot RAM saat laptop baru dinyalakan.'
      },
      {
        stepNumber: 3,
        title: 'Menonaktifkan Service SysMain (Khusus Laptop Ber-HDD)',
        description:
          'Buka Run (Win + R), ketik "services.msc". Gulir ke bawah hingga menemukan service bernama "SysMain" (sebelumnya bernama Superfetch). Klik kanan > Properties > ganti Startup type menjadi "Disabled" dan klik Stop. Service ini kerap membebani read/write harddisk lawas.'
      },
      {
        stepNumber: 4,
        title: 'Membersihkan Direktori Temp & Update Cache',
        description:
          'Hapus file sisa instalasi yang membebani partisi C menggunakan utilitas Disk Cleanup bawaan.',
        codeSnippet: {
          language: 'bash',
          label: 'Run Shortcut / Command Prompt',
          code: `# Membuka folder temporary pengguna
%temp%

# Membersihkan sistem cache update
cleanmgr /sageset:1`
        }
      }
    ],
    troubleshootingTips: [
      {
        issue: 'Laptop tetap terasa lambat meskipun Windows sudah dioptimalkan',
        resolution:
          'Jika laptop masih mengandalkan harddisk mekanis 5400 RPM dengan RAM 4 GB, batas fisik perangkat keras telah tercapai. Solusi paling hemat dan berdaya guna tinggi adalah mengganti HDD utama dengan SSD SATA/NVMe dan menambah kapasitas RAM menjadi minimal 8–16 GB.'
      }
    ],
    faqs: [
      {
        question: 'Apakah menambah RAM otomatis membuat laptop yang ber-HDD menjadi secepat SSD?',
        answer:
          'Tidak. RAM membantu menampung lebih banyak aplikasi terbuka bersamaan, namun kecepatan booting dan membuka program ditentukan oleh kecepatan baca-tulis drive penyimpanan (SSD ~500–3500 MB/s vs HDD ~80–120 MB/s).'
      }
    ],
    conclusion:
      'Optimasi software dapat memberikan kelegaan sementara, namun migrasi ke SSD adalah keputusan paling rasional untuk menghidupkan kembali laptop lawas agar gesit dipakai bekerja harian.',
    relatedTutorialSlugs: ['instalasi-windows-11-bersih-laptop-baru', 'cara-cek-kesehatan-ssd-dan-harddisk']
  },
  {
    id: 'tut-4',
    slug: 'cara-cek-kesehatan-ssd-dan-harddisk',
    title: 'Cara Membaca Kesehatan SSD & Harddisk Menggunakan Data S.M.A.R.T',
    summary:
      'Kenali tanda-tanda kerusakan drive sebelum terlambat: indikator persentase Health, Bad Sector, Total Host Writes, dan suhu operasional.',
    category: 'Perangkat Keras & Peningkatan',
    difficulty: 'Pemula',
    readTimeMinutes: 10,
    publishedDate: '12 Agt 2024',
    updatedDate: '05 Nov 2024',
    thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
    isFeatured: false,
    isDemoData: false,
    prerequisites: [
      'Laptop atau PC desktop dalam keadaan menyala',
      'Izin mengunduh aplikasi diagnostik portabel'
    ],
    toolsNeeded: [
      'CrystalDiskInfo (software gratis monitoring disk)',
      'Hard Disk Sentinel (opsional)'
    ],
    tableOfContents: [
      { id: 'apa-itu-smart', title: '1. Memahami Parameter S.M.A.R.T' },
      { id: 'unduh-crystaldiskinfo', title: '2. Menjalankan CrystalDiskInfo' },
      { id: 'interpretasi-status', title: '3. Arti Status Good, Caution, dan Bad' },
      { id: 'tindakan-darurat', title: '4. Langkah Penyelamatan Data Darurat' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Mengunduh dan Menjalankan Aplikasi Diagnostik',
        description:
          'Unduh CrystalDiskInfo Standard Edition (versi zip portabel lebih disukai tanpa instalasi). Ekstrak dan jalankan DiskInfo64.exe dengan hak akses Administrator.'
      },
      {
        stepNumber: 2,
        title: 'Menganalisis Health Status dan Suhu',
        description:
          'Pada bagian atas jendela aplikasi, perhatikan kotak Health Status: Jika berwarna Biru (Good), drive Anda dalam kondisi prima. Jika berwarna Kuning (Caution), terdapat sektor yang dialokasikan ulang (Reallocated Sectors) atau penurunan cadangan cell flash memory. Jika berwarna Merah (Bad), drive berada di ambang kegagalan total.'
      },
      {
        stepNumber: 3,
        title: 'Melihat Total Host Writes (TBW) pada SSD',
        description:
          'SSD memiliki batas daya tahan tulis (Terabytes Written / TBW). Periksa kolom "Total Host Writes" di sudut kanan atas untuk membandingkannya dengan spesifikasi garansi pabrikan SSD Anda.'
      }
    ],
    troubleshootingTips: [
      {
        issue: 'Status berubah menjadi Caution (Kuning)',
        resolution:
          'Segera lakukan backup seluruh file dokumen berharga ke harddisk eksternal atau cloud. Jangan simpan file kerja baru pada partisi drive yang berstatus Caution karena bad sector berpotensi menyebar.'
      }
    ],
    faqs: [
      {
        question: 'Apakah SSD yang berstatus Caution bisa diperbaiki dengan software?',
        answer:
          'Kerusakan fisik pada chip NAND flash tidak dapat diperbaiki oleh software. Sektor yang rusak hanya bisa ditandai agar tidak lagi ditulisi, namun drive sebaiknya segera diganti sebelum mati total.'
      }
    ],
    conclusion:
      'Mengecek kesehatan drive secara berkala setiap 3–6 bulan adalah pencegahan terbaik agar tidak kehilangan data berharga secara tiba-tiba.',
    relatedTutorialSlugs: ['troubleshooting-laptop-lemot-ssd']
  },
  {
    id: 'tut-5',
    slug: 'mengatasi-blue-screen-bsod-windows',
    title: 'Analisis & Penanganan Blue Screen of Death (BSOD) di Windows',
    summary:
      'Langkah sistematis mendeteksi biang kerok BSOD: menganalisis stop code, memverifikasi integritas memori RAM, dan memperbaiki file sistem yang korup.',
    category: 'Pemecahan Masalah Komputer',
    difficulty: 'Lanjutan',
    readTimeMinutes: 18,
    publishedDate: '18 Jul 2024',
    updatedDate: '22 Des 2024',
    thumbnail: '/images/tutorial_it_hardware_lab_1793775539803.jpg',
    isFeatured: false,
    isDemoData: false,
    prerequisites: [
      'Dapat mencatat kode error BSOD (misal: MEMORY_MANAGEMENT, CRITICAL_PROCESS_DIED)',
      'Dapat masuk ke Windows Safe Mode jika sistem boot loop'
    ],
    toolsNeeded: [
      'Windows Memory Diagnostic / MemTest86',
      'BlueScreenView atau WinDbg',
      'Media instalasi Windows untuk opsi repair'
    ],
    tableOfContents: [
      { id: 'catat-stop-code', title: '1. Mengidentifikasi Stop Code Utama' },
      { id: 'perbaiki-file-sistem', title: '2. Pemeriksaan Integritas Sistem (SFC & DISM)' },
      { id: 'uji-kesehatan-ram', title: '3. Menjalankan Uji Diagnostik RAM' },
      { id: 'analisis-minidump', title: '4. Membaca Berkas Minidump dengan BlueScreenView' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Merekam Stop Code & File Driver Penyebab',
        description:
          'Saat layar biru muncul, catat kode stop (misalnya: IRQL_NOT_LESS_OR_EQUAL, DPC_WATCHDOG_VIOLATION, WHEA_UNCORRECTABLE_ERROR). Perhatikan juga apakah tertera nama file berekstensi .sys di bawahnya (misal: nvlddmkm.sys untuk Nvidia atau netwtw.sys untuk Wi-Fi Intel).'
      },
      {
        stepNumber: 2,
        title: 'Menjalankan Perbaikan Sistem Berkas DISM & SFC',
        description:
          'Buka Command Prompt sebagai Administrator dan jalankan pemindaian citra Windows serta file sistem yang rusak.',
        codeSnippet: {
          language: 'bash',
          label: 'Command Prompt (Admin)',
          code: `# 1. Memeriksa dan memulihkan citra komponen Windows
DISM /Online /Cleanup-Image /RestoreHealth

# 2. Memindai dan mengganti file sistem yang korup
sfc /scannow`
        }
      },
      {
        stepNumber: 3,
        title: 'Menguji Kesehatan Modul RAM',
        description:
          'Buka Run (Win + R), ketik "mdsched.exe" dan pilih "Restart now and check for problems". Komputer akan restart dan melakukan pengujian modul memori RAM secara mendalam untuk mencari adanya bit memori yang cacat.'
      }
    ],
    troubleshootingTips: [
      {
        issue: 'BSOD terjadi berulang kali setiap kali membuka game berat',
        resolution:
          'Kemungkinan besar diakibatkan oleh overheat pada GPU/CPU atau driver kartu grafis yang korup. Lakukan clean install driver GPU menggunakan Display Driver Uninstaller (DDU) di Safe Mode.'
      }
    ],
    faqs: [
      {
        question: 'Di mana letak berkas catatan crash dump BSOD di Windows?',
        answer:
          'Berkas dump tersimpan secara default di folder C:\\Windows\\Minidump dengan ekstensi .dmp.'
      }
    ],
    conclusion:
      'BSOD adalah mekanisme perlindungan diri sistem operasi dari kerusakan perangkat keras yang lebih parah. Dengan pendekatan diagnostik terarah, 90% kasus BSOD dapat diidentifikasi pemicunya.',
    relatedTutorialSlugs: ['instalasi-windows-11-bersih-laptop-baru', 'troubleshooting-laptop-lemot-ssd']
  },
  {
    id: 'tut-6',
    slug: 'cara-membuat-bootable-usb-rufus',
    title: 'Cara Membuat Flashdisk Bootable Windows & Linux dengan Rufus & Ventoy',
    summary:
      'Perbandingan praktis membuat media instalasi multi-boot yang kompatibel dengan motherboard UEFI generasi modern dan BIOS Legacy lawas.',
    category: 'Instalasi Windows',
    difficulty: 'Pemula',
    readTimeMinutes: 8,
    publishedDate: '10 Jun 2024',
    updatedDate: '14 Jan 2025',
    thumbnail: '/images/hero_creative_workspace_1793775537391.jpg',
    isFeatured: false,
    isDemoData: false,
    prerequisites: ['Flashdisk berkapasitas minimal 8 GB', 'Berkas ISO OS resmi'],
    toolsNeeded: ['Rufus versi terbaru', 'Ventoy (opsional untuk multi-boot ISO)'],
    tableOfContents: [
      { id: 'unduh-rufus', title: '1. Mengunduh Aplikasi Rufus' },
      { id: 'konfigurasi-partisi', title: '2. Memilih Skema Partisi GPT vs MBR' },
      { id: 'eksekusi-burning', title: '3. Proses Penulisan Data ke USB' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Memilih Skema Partisi yang Sesuai dengan Target PC',
        description:
          'Aturan baku: Gunakan skema GPT + target UEFI untuk laptop atau PC rakitan keluaran tahun 2013 ke atas. Gunakan skema MBR + BIOS (or UEFI-CSM) hanya jika menginstal pada motherboard jadul pra-2012.'
      },
      {
        stepNumber: 2,
        title: 'Memulai Proses Penulisan Bootable',
        description:
          'Pastikan tidak ada file penting di flashdisk. Tekan Start dan konfirmasikan peringatan pembersihan partisi. Tunggu status progress bar berwarna hijau penuh hingga bertuliskan "READY".'
      }
    ],
    troubleshootingTips: [
      {
        issue: 'Flashdisk tidak muncul di BIOS boot menu',
        resolution:
          'Pastikan Secure Boot di BIOS sementara dimatikan jika menggunakan custom ISO, atau gunakan port USB di bagian belakang motherboard (rear I/O) jika menggunakan PC desktop.'
      }
    ],
    faqs: [
      {
        question: 'Apa keunggulan Ventoy dibanding Rufus?',
        answer:
          'Dengan Ventoy, Anda cukup menginstal sistem Ventoy sekali pada flashdisk, setelah itu Anda bisa menaruh 5–10 file ISO berbeda (Windows, Ubuntu, Kali Linux, Hirens Boot) hanya dengan copy-paste biasa.'
      }
    ],
    conclusion:
      'Memiliki flashdisk bootable yang siap pakai adalah senjata wajib bagi siapapun yang berkecimpung di dunia IT support dan perbaikan komputer mandiri.',
    relatedTutorialSlugs: ['instalasi-windows-11-bersih-laptop-baru']
  }
];
