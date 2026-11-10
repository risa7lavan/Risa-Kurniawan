import React, { useState, useMemo } from 'react';
import {
  Code2,
  Cpu,
  Network,
  Shield,
  Database,
  Headphones,
  Wrench,
  Globe,
  Clock,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Check,
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { useAppData } from '../context/DataContext';
import { ServiceItem, ServiceCategory } from '../types';

interface ServicesViewProps {
  onNavigate?: (view: string) => void;
}

const CATEGORY_TABS: ServiceCategory[] = [
  'Semua',
  'Pengembangan Web & AI',
  'IT Support & Hardware',
  'Jaringan & Server',
  'Keamanan & Backup',
  'Konsultasi IT'
];

export const ServicesView: React.FC<ServicesViewProps> = ({ onNavigate }) => {
  const { services, profile } = useAppData();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('Semua');

  // Filter only active services
  const activeServices = useMemo(() => {
    return services.filter((s) => s.isActive !== false);
  }, [services]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'Semua') return activeServices;
    return activeServices.filter((s) => s.category === selectedCategory);
  }, [activeServices, selectedCategory]);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'cpu':
        return <Cpu className="w-5 h-5 text-stone-900" />;
      case 'network':
        return <Network className="w-5 h-5 text-stone-900" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-stone-900" />;
      case 'database':
        return <Database className="w-5 h-5 text-stone-900" />;
      case 'headphones':
        return <Headphones className="w-5 h-5 text-stone-900" />;
      case 'wrench':
        return <Wrench className="w-5 h-5 text-stone-900" />;
      case 'globe':
        return <Globe className="w-5 h-5 text-stone-900" />;
      case 'code':
      default:
        return <Code2 className="w-5 h-5 text-stone-900" />;
    }
  };

  const handleContactService = (service: ServiceItem) => {
    const rawPhone = '6281234567890';
    const message = encodeURIComponent(
      service.whatsappMessageTemplate ||
        `Halo ${profile.name}, saya tertarik dengan layanan "${service.title}". Bisakah berdiskusi mengenai jadwal dan kebutuhan proyek saya?`
    );
    window.open(`https://wa.me/${rawPhone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      {/* Header Section */}
      <section className="border-b border-stone-200/80 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
          <div className="max-w-3xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-stone-100 border border-stone-200 rounded-full text-[11px] font-semibold text-stone-700">
              <span className="w-2 h-2 rounded-full bg-[#84cc16]" />
              <span>Layanan Profesional & Solusi Digital</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Jasa & Solusi Teknologi Terintegrasi
            </h1>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Membantu bisnis, kantor, profesional, dan perorangan menyelesaikan kendala komputasi,
              membangun sistem web berbantuan AI modern, menata jaringan stabil, serta mengamankan arsip digital.
            </p>

            {/* Quality Guarantees */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 pt-2 text-xs font-medium text-stone-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#65a30d]" />
                <span>Konsultasi Awal Gratis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#65a30d]" />
                <span>Garansi Purna Pengerjaan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-[#65a30d]" />
                <span>Dokumentasi & Laporan Tuntas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === 'Semua'
                ? activeServices.length
                : activeServices.filter((s) => s.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-xl border transition-all duration-200 flex flex-col justify-between hover:shadow-md ${
                service.isPopular
                  ? 'border-stone-900 ring-2 ring-[#84cc16]/40'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              {/* Card Top */}
              <div className="p-4 sm:p-5 space-y-3">
                {/* Header row with icon and badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                    {renderIcon(service.icon)}
                  </div>

                  {service.isPopular ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#84cc16] text-stone-950 font-bold text-[10px] uppercase tracking-wider rounded-md shadow-2xs">
                      <Sparkles className="w-3 h-3" />
                      Paling Diminati
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                      {service.category}
                    </span>
                  )}
                </div>

                {/* Title & Short Description */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-stone-950 tracking-tight leading-snug">
                    {service.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {service.shortDescription}
                  </p>
                </div>

                {/* Price & Turnaround Metric Pills */}
                <div className="pt-2 pb-1 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/80">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                      Biaya Mulai
                    </span>
                    <span className="font-extrabold text-stone-900 text-xs">
                      {service.priceStartingFrom}
                    </span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/80">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> Pengerjaan
                    </span>
                    <span className="font-semibold text-stone-800 text-xs truncate block">
                      {service.turnaroundTime}
                    </span>
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wide block">
                    Cakupan Layanan:
                  </span>
                  <ul className="space-y-1.5">
                    {service.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-stone-600 leading-relaxed">
                        <Check className="w-3.5 h-3.5 text-[#65a30d] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deliverables / Output */}
                {service.deliverables && service.deliverables.length > 0 && (
                  <div className="pt-3 border-t border-stone-100 space-y-1.5">
                    <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide block">
                      Yang Klien Dapatkan:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {service.deliverables.map((deliv, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200"
                        >
                          {deliv}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Audience */}
                {service.targetAudience && (
                  <div className="pt-1.5 text-[11px] text-stone-500 italic">
                    Cocok untuk: <span className="text-stone-700 font-medium">{service.targetAudience}</span>
                  </div>
                )}
              </div>

              {/* Card Footer CTA */}
              <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 mt-2">
                <button
                  onClick={() => handleContactService(service)}
                  className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                    service.isPopular
                      ? 'bg-stone-900 hover:bg-stone-800 text-white'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#84cc16]" />
                  <span>Konsultasi / Pesan Jasa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-10 bg-white rounded-xl border border-stone-200 space-y-2">
            <HelpCircle className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs sm:text-sm font-semibold text-stone-700">
              Tidak ada layanan untuk kategori &quot;{selectedCategory}&quot; saat ini.
            </p>
            <button
              onClick={() => setSelectedCategory('Semua')}
              className="text-xs font-bold text-stone-900 underline cursor-pointer"
            >
              Lihat Semua Layanan
            </button>
          </div>
        )}

        {/* 4-Step Standard Workflow Section */}
        <section className="bg-white rounded-xl border border-stone-200 p-5 sm:p-7 space-y-5 shadow-xs">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <span className="text-xs font-bold text-[#65a30d] uppercase tracking-wider">
              Standar Operasional Kerja
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-950 tracking-tight">
              Bagaimana Alur Pengerjaan Layanan Kami?
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Proses transparan, terukur, dan mengutamakan keamanan data serta kepuasan Anda di setiap langkah.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-2">
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-1.5 relative">
              <span className="font-mono text-xl font-black text-stone-300">01</span>
              <h3 className="font-bold text-sm text-stone-900">Konsultasi & Diagnosa</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Diskusi gratis mengenai kebutuhan website atau analisa kendala hardware/jaringan secara menyeluruh.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-1.5 relative">
              <span className="font-mono text-xl font-black text-stone-300">02</span>
              <h3 className="font-bold text-sm text-stone-900">Estimasi & Kesepakatan</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Penyampaian estimasi biaya transparan, jangka waktu pengerjaan, dan ruang lingkup deliverables tertulis.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-1.5 relative">
              <span className="font-mono text-xl font-black text-stone-300">03</span>
              <h3 className="font-bold text-sm text-stone-900">Eksekusi & Uji Kualitas</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pengerjaan sistematis, backup data sebelum modifikasi, dan uji kestabilan (stress test / speed test).
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-1.5 relative">
              <span className="font-mono text-xl font-black text-stone-300">04</span>
              <h3 className="font-bold text-sm text-stone-900">Serah Terima & Garansi</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Penyerahan hasil kerja lengkap dengan dokumentasi panduan, serta masa garansi purnajual aktif.
              </p>
            </div>
          </div>
        </section>

        {/* Transparent Pricing & Service Tiers Overview */}
        <section className="bg-white rounded-xl border border-stone-200 p-5 sm:p-7 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#65a30d] font-mono">
                TRANSPARANSI BIAYA & GARANSI
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
                Estimasi Biaya & Paket Layanan
              </h2>
            </div>
            <span className="text-[11px] text-stone-500">
              *Biaya final disesuaikan dengan skala spesifik pengerjaan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Konsultasi Awal</span>
                <div className="text-base font-extrabold text-[#65a30d]">GRATIS</div>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Diskusi diagnosis 15-20 menit via chat WhatsApp untuk memetakan solusi kebutuhan Anda.
                </p>
              </div>
              <div className="pt-2 border-t border-stone-200 text-[10px] text-stone-500 font-mono">
                SLA: Respon Instan (Jam Kerja)
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">IT Support & Servis</span>
                <div className="text-base font-extrabold text-stone-900">Mulai Rp 150.000</div>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Pembersihan thermal paste, instalasi OS bersih, pembersihan virus, dan diagnosa hardware.
                </p>
              </div>
              <div className="pt-2 border-t border-stone-200 text-[10px] text-stone-500 font-mono">
                Garansi Resmi: 14 Hari
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Jaringan & Wi-Fi Router</span>
                <div className="text-base font-extrabold text-stone-900">Mulai Rp 350.000</div>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Setup MikroTik, manajemen bandwidth kantor, penarikan kabel LAN Cat6, dan proteksi firewall.
                </p>
              </div>
              <div className="pt-2 border-t border-stone-200 text-[10px] text-stone-500 font-mono">
                Garansi Resmi: 30 Hari
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Pembuatan Website Modern</span>
                <div className="text-base font-extrabold text-stone-900">Mulai Rp 1.500.000</div>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Desain responsif, integrasi AI, admin CMS mandiri, domain & hosting, serta SEO Core Web Vitals.
                </p>
              </div>
              <div className="pt-2 border-t border-stone-200 text-[10px] text-stone-500 font-mono">
                Garansi Resmi: 30 Hari Penuh
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="bg-stone-50 rounded-xl border border-stone-200 p-5 sm:p-7 space-y-4">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-xs text-stone-500">
              Hal-hal umum seputar pemesanan jasa, metode pengerjaan, dan garansi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-white rounded-lg border border-stone-200 space-y-1">
              <h3 className="font-bold text-stone-900">Apakah ada garansi untuk servis komputer atau website?</h3>
              <p className="text-stone-600 leading-relaxed">
                Ya, setiap layanan memiliki masa garansi resmi mulai dari 14 hari hingga 30 hari tergantung jenis pekerjaan. Bila ada kendala dalam masa garansi, kami perbaiki tanpa biaya tambahan.
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-stone-200 space-y-1">
              <h3 className="font-bold text-stone-900">Apakah melayani panggilan ke lokasi kantor / rumah (Onsite)?</h3>
              <p className="text-stone-600 leading-relaxed">
                Ya, untuk wilayah operasional kami melayani kunjungan langsung (onsite visit) untuk setup jaringan MikroTik, audit IT kantor, atau perbaikan server fisik.
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-stone-200 space-y-1">
              <h3 className="font-bold text-stone-900">Bagaimana dengan kerahasiaan data pribadi & dokumen kantor?</h3>
              <p className="text-stone-600 leading-relaxed">
                Keamanan dan privasi data klien adalah prioritas utama. Kami menerapkan protokol Read-Only pada media recovery serta siap menandatangani Non-Disclosure Agreement (NDA).
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-stone-200 space-y-1">
              <h3 className="font-bold text-stone-900">Bagaimana sistem pembayarannya?</h3>
              <p className="text-stone-600 leading-relaxed">
                Untuk proyek website umumnya menggunakan skema DP 50% di awal dan pelunasan setelah serah terima. Untuk servis komputer dan recovery, pembayaran dilakukan setelah unit selesai diperiksa.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Banner CTA */}
        <section className="bg-stone-900 text-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
          <div className="space-y-1.5 max-w-xl z-10 text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#84cc16]">
              Diskusi Langsung Bebas Biaya
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Punya Masalah Teknologi atau Proyek Khusus?
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Jelaskan kebutuhan Anda, kami siap memberikan saran teknis yang objektif, hemat anggaran, dan tepat guna.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 z-10">
            <button
              onClick={() => {
                const rawPhone = profile.whatsapp || profile.phone || '6281297770752';
                const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
                const message = encodeURIComponent(
                  `Halo ${profile.name || 'Risa Kurniawan'}, saya ingin konsultasi kebutuhan IT / proyek digital saya.`
                );
                window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank', 'noopener,noreferrer');
              }}
              className="px-5 py-2.5 bg-[#84cc16] hover:bg-[#a3e635] text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat WhatsApp Sekarang</span>
            </button>

            {onNavigate && (
              <button
                onClick={() => onNavigate('contact')}
                className="px-4.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Kirim Formulir Kontak</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </section>
      </section>
    </div>
  );
};
