import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Briefcase, Check, Shield, Cpu, Code2, Network, Database, Headphones, Wrench, Globe } from 'lucide-react';
import { ServiceItem, ServiceCategory } from '../../types';

interface ServiceModalProps {
  isOpen: boolean;
  service: ServiceItem | null;
  onClose: () => void;
  onSave: (data: Omit<ServiceItem, 'id'>) => void;
}

const CATEGORIES: Exclude<ServiceCategory, 'Semua'>[] = [
  'Pengembangan Web & AI',
  'IT Support & Hardware',
  'Jaringan & Server',
  'Keamanan & Backup',
  'Konsultasi IT'
];

const ICONS = [
  { id: 'code', label: 'Kode / Web AI', icon: Code2 },
  { id: 'cpu', label: 'Hardware / CPU', icon: Cpu },
  { id: 'network', label: 'Jaringan / Network', icon: Network },
  { id: 'shield', label: 'Keamanan / Shield', icon: Shield },
  { id: 'database', label: 'Database / Storage', icon: Database },
  { id: 'headphones', label: 'Konsultasi / Support', icon: Headphones },
  { id: 'wrench', label: 'Servis / Tools', icon: Wrench },
  { id: 'globe', label: 'Web Publik / Cloud', icon: Globe }
] as const;

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  service,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Pengembangan Web & AI');
  const [priceStartingFrom, setPriceStartingFrom] = useState('Mulai Rp 500.000');
  const [turnaroundTime, setTurnaroundTime] = useState('2 - 5 Hari Kerja');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('UMKM, Kantor, Profesional');
  const [icon, setIcon] = useState<'code' | 'cpu' | 'network' | 'shield' | 'database' | 'headphones' | 'wrench' | 'globe'>('code');
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [features, setFeatures] = useState<string[]>([
    'Konsultasi kebutuhan teknis gratis diawal',
    'Pengerjaan sesuai standar operasional industri IT',
    'Garansi pemeliharaan & dukungan pasca pengerjaan'
  ]);
  const [deliverables, setDeliverables] = useState<string[]>([
    'Hasil kerja tuntas dan siap operasional',
    'Dokumentasi & laporan serah terima'
  ]);
  const [whatsappTemplate, setWhatsappTemplate] = useState('');

  useEffect(() => {
    if (service) {
      setTitle(service.title);
      setSlug(service.slug);
      setCategory(service.category);
      setPriceStartingFrom(service.priceStartingFrom);
      setTurnaroundTime(service.turnaroundTime);
      setShortDescription(service.shortDescription);
      setFullDescription(service.fullDescription);
      setTargetAudience(service.targetAudience);
      setIcon(service.icon || 'code');
      setIsPopular(!!service.isPopular);
      setIsActive(service.isActive !== false);
      setFeatures(service.features && service.features.length > 0 ? service.features : ['']);
      setDeliverables(service.deliverables && service.deliverables.length > 0 ? service.deliverables : ['']);
      setWhatsappTemplate(service.whatsappMessageTemplate || '');
    } else {
      setTitle('');
      setSlug('');
      setCategory('Pengembangan Web & AI');
      setPriceStartingFrom('Mulai Rp 500.000');
      setTurnaroundTime('3 - 5 Hari Kerja');
      setShortDescription('');
      setFullDescription('');
      setTargetAudience('UMKM, Kantor, Perorangan');
      setIcon('code');
      setIsPopular(false);
      setIsActive(true);
      setFeatures([
        'Analisis kebutuhan sistem menyeluruh',
        'Pengerjaan cepat & berstandar profesional',
        'Garansi pengerjaan & konsultasi berkala'
      ]);
      setDeliverables([
        'Sistem/perangkat selesai dan teruji',
        'Dokumentasi petunjuk penggunaan'
      ]);
      setWhatsappTemplate('');
    }
  }, [service, isOpen]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!service) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };

  const handleUpdateFeature = (index: number, val: string) => {
    const next = [...features];
    next[index] = val;
    setFeatures(next);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleAddDeliverable = () => {
    setDeliverables([...deliverables, '']);
  };

  const handleUpdateDeliverable = (index: number, val: string) => {
    const next = [...deliverables];
    next[index] = val;
    setDeliverables(next);
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Judul layanan tidak boleh kosong.');
      return;
    }

    const cleanFeatures = features.map((f) => f.trim()).filter(Boolean);
    const cleanDeliverables = deliverables.map((d) => d.trim()).filter(Boolean);

    onSave({
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      priceStartingFrom: priceStartingFrom.trim() || 'Hubungi Kami',
      turnaroundTime: turnaroundTime.trim() || 'Fleksibel',
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      targetAudience: targetAudience.trim(),
      icon,
      isPopular,
      isActive,
      isDemoData: false,
      features: cleanFeatures.length > 0 ? cleanFeatures : ['Konsultasi teknis awal'],
      deliverables: cleanDeliverables.length > 0 ? cleanDeliverables : ['Hasil kerja tuntas'],
      whatsappMessageTemplate:
        whatsappTemplate.trim() ||
        `Halo, saya ingin menanyakan lebih lanjut mengenai layanan ${title.trim()}. Bisakah berdiskusi?`
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-stone-200 shadow-2xl my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#84cc16]" />
            <h2 className="font-bold text-sm tracking-tight">
              {service ? 'Edit Jasa / Layanan' : 'Tambah Jasa / Layanan Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs text-stone-800">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="font-semibold text-stone-700">Nama Layanan / Jasa *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Contoh: Pembuatan Website Modern & Integrasi AI"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-[#84cc16] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Slug URL *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="pembuatan-website-modern-ai"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#84cc16] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Kategori Layanan *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-[#84cc16] focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Estimasi Biaya / Harga Mulai *</label>
              <input
                type="text"
                required
                value={priceStartingFrom}
                onChange={(e) => setPriceStartingFrom(e.target.value)}
                placeholder="Contoh: Mulai Rp 1.500.000 atau Sesuai Kebutuhan"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-[#84cc16] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Estimasi Waktu Pengerjaan (Turnaround) *</label>
              <input
                type="text"
                required
                value={turnaroundTime}
                onChange={(e) => setTurnaroundTime(e.target.value)}
                placeholder="Contoh: 3 - 5 Hari Kerja atau 1 Hari"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-[#84cc16] focus:outline-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="font-semibold text-stone-700">Target Audiens / Cocok Untuk</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Contoh: UMKM, Startup, Kantor Perusahaan, Mahasiswa, Lembaga"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-[#84cc16] focus:outline-none"
              />
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-1.5">
            <label className="font-semibold text-stone-700">Ikon Representatif</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ICONS.map((ic) => {
                const IconComponent = ic.icon;
                const isSelected = icon === ic.id;
                return (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => setIcon(ic.id)}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-stone-900 bg-stone-900 text-white font-bold'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isSelected ? 'text-[#84cc16]' : 'text-stone-500'}`} />
                    <span className="text-[11px] truncate">{ic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Deskripsi Ringkas (Tampil di Kartu Layanan) *</label>
            <textarea
              required
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Jelaskan dalam 1-2 kalimat apa solusi yang didapatkan klien..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-[#84cc16] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Deskripsi Lengkap & Metodologi Kerja *</label>
            <textarea
              required
              rows={3}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Jelaskan standar operasional, prosedur teknis, dan keunggulan pengerjaan..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-[#84cc16] focus:outline-none"
            />
          </div>

          {/* Features Checklist */}
          <div className="space-y-2 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-700">Fitur & Keunggulan Layanan ({features.length})</label>
              <button
                type="button"
                onClick={handleAddFeature}
                className="text-[11px] font-bold text-stone-900 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#84cc16]" /> Tambah Poin
              </button>
            </div>
            <div className="space-y-2">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 font-mono text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                    placeholder="Contoh: Desain eksklusif tanpa template"
                    className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-[#84cc16] focus:outline-none"
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables Checklist */}
          <div className="space-y-2 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-700">Deliverables / Yang Diterima Klien ({deliverables.length})</label>
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="text-[11px] font-bold text-stone-900 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#84cc16]" /> Tambah Deliverable
              </button>
            </div>
            <div className="space-y-2">
              {deliverables.map((deliv, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 font-mono text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={deliv}
                    onChange={(e) => handleUpdateDeliverable(idx, e.target.value)}
                    placeholder="Contoh: Laporan audit sistem & SOP penanganan insiden"
                    className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-[#84cc16] focus:outline-none"
                  />
                  {deliverables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(idx)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Message Template */}
          <div className="space-y-1 pt-2 border-t border-stone-200">
            <label className="font-semibold text-stone-700">Draft Pesan WhatsApp Klien (Opsional)</label>
            <input
              type="text"
              value={whatsappTemplate}
              onChange={(e) => setWhatsappTemplate(e.target.value)}
              placeholder="Contoh: Halo, saya ingin konsultasi mengenai jasa X untuk kebutuhan kantor saya..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-[#84cc16] focus:outline-none"
            />
            <p className="text-[10px] text-stone-400">
              Pesan ini otomatis terisi di chat WhatsApp klien saat menekan tombol &apos;Konsultasi Sekarang&apos;.
            </p>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-stone-200 bg-stone-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="w-4 h-4 rounded text-[#84cc16] focus:ring-[#84cc16]"
              />
              <div>
                <span className="font-semibold text-stone-900 block">Tandai Layanan Populer / Rekomendasi</span>
                <span className="text-[10px] text-stone-500">Mendapat badge &apos;Paling Banyak Diminati&apos;</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-stone-200 bg-stone-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#84cc16] focus:ring-[#84cc16]"
              />
              <div>
                <span className="font-semibold text-stone-900 block">Status Layanan Aktif</span>
                <span className="text-[10px] text-stone-500">Tampilkan di halaman publik menu Jasa</span>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg text-xs font-semibold hover:bg-stone-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4 text-[#84cc16]" />
              <span>{service ? 'Simpan Perubahan' : 'Terbitkan Layanan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
