import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Globe, Building2, CheckCircle2, Layers } from 'lucide-react';
import { Project, ProjectCategory, ProjectStatus } from '../../types';
import { ImageUploader } from '../../components/ImageUploader';

interface ProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (data: Omit<Project, 'id'>) => void;
}

const CATEGORIES: ProjectCategory[] = [
  'Website Bisnis & UMKM',
  'Website Profil Perusahaan',
  'Toko Online (E-Commerce)',
  'Landing Page',
  'Portal Berita & Media',
  'Aplikasi Web & Sistem',
  'Website Portofolio',
  'Situs Web Bisnis',
  'Dasbor',
  'Perdagangan Elektronik',
  'Aplikasi Berbantuan AI',
  'Portal Lowongan Kerja',
  'Halaman Landing',
  'Situs Web Pendidikan',
  'Proyek Lainnya'
];

const STATUSES: ProjectStatus[] = ['Selesai', 'Pengembangan Aktif', 'Konsep Teruji'];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  project,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'features' | 'tech'>('info');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Website Bisnis & UMKM');
  const [status, setStatus] = useState<ProjectStatus>('Selesai');
  const [year, setYear] = useState('2025');
  const [client, setClient] = useState('');
  const [role, setRole] = useState('Desain UI/UX & Web Developer');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');

  const [thumbnail, setThumbnail] = useState('/src/assets/images/project_ai_web_platform_1793775537859.jpg');
  const [liveDemoUrl, setLiveDemoUrl] = useState('https://');
  const [githubUrl, setGithubUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Tech stack
  const [techStackInput, setTechStackInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>(['React', 'TypeScript', 'Tailwind CSS']);

  // Legacy fields preserved for backward compatibility
  const [background, setBackground] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [aiIdeation, setAiIdeation] = useState('');
  const [aiPrompts, setAiPrompts] = useState<string[]>([]);
  const [aiReview, setAiReview] = useState('');

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setSlug(project.slug);
      setCategory(project.category);
      setStatus(project.status);
      setYear(project.year);
      setClient(project.client || '');
      setRole(project.role || 'Desain UI/UX & Web Developer');
      setShortDescription(project.shortDescription);
      setFullDescription(project.fullDescription);
      setPurpose(project.purpose || project.background || '');
      setFeatures(project.features && project.features.length ? project.features : []);
      setThumbnail(project.thumbnail);
      setLiveDemoUrl(project.liveDemoUrl || '');
      setGithubUrl(project.githubUrl || '');
      setIsFeatured(!!project.isFeatured);
      setTechStack(project.techStack || ['React', 'Tailwind CSS']);

      // preserve legacy fields
      setBackground(project.background || '');
      setProblem(project.problem || '');
      setSolution(project.solution || '');
      if (project.aiWorkflow) {
        setAiIdeation(project.aiWorkflow.ideation || '');
        setAiPrompts(project.aiWorkflow.promptsSample || []);
        setAiReview(project.aiWorkflow.humanReviewAndRefinement || '');
      }
    } else {
      // Defaults for new portfolio website
      setTitle('');
      setSlug('');
      setCategory('Website Bisnis & UMKM');
      setStatus('Selesai');
      setYear(new Date().getFullYear().toString());
      setClient('Klien UMKM / Mandiri');
      setRole('Desain UI/UX & Web Developer');
      setShortDescription('');
      setFullDescription('');
      setPurpose('');
      setFeatures([
        'Desain antarmuka modern yang responsif untuk ponsel & desktop',
        'Integrasi tombol WhatsApp konsultasi / pemesanan langsung',
        'Optimasi kecepatan muat dan struktur SEO ramah mesin pencari'
      ]);
      setThumbnail('/src/assets/images/project_ai_web_platform_1793775537859.jpg');
      setLiveDemoUrl('https://');
      setGithubUrl('');
      setIsFeatured(false);
      setTechStack(['React', 'TypeScript', 'Tailwind CSS', 'Vite']);
      setBackground('');
      setProblem('');
      setSolution('');
      setAiIdeation('');
      setAiPrompts([]);
      setAiReview('');
    }
    setActiveTab('info');
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!project) {
      // auto slugify
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
      );
    }
  };

  const handleAddTech = () => {
    if (techStackInput.trim() && !techStack.includes(techStackInput.trim())) {
      setTechStack([...techStack, techStackInput.trim()]);
      setTechStackInput('');
    }
  };

  const handleRemoveTech = (item: string) => {
    setTechStack(techStack.filter((t) => t !== item));
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      slug: slug.trim() || `web-${Date.now()}`,
      title: title.trim(),
      category,
      status,
      year: year.trim() || '2025',
      client: client.trim() || undefined,
      purpose: purpose.trim() || undefined,
      features: features.length ? features : undefined,
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      background: purpose.trim() || background.trim(),
      problem: problem.trim(),
      solution: solution.trim(),
      role: role.trim() || 'Desain UI/UX & Web Developer',
      thumbnail: thumbnail.trim() || '/src/assets/images/project_ai_web_platform_1793775537859.jpg',
      gallery: [thumbnail.trim() || '/src/assets/images/project_ai_web_platform_1793775537859.jpg'],
      liveDemoUrl: liveDemoUrl.trim() || undefined,
      githubUrl: githubUrl.trim() || undefined,
      isFeatured,
      isDemoData: false,
      techStack: techStack.length ? techStack : ['React', 'TypeScript', 'Tailwind CSS'],
      aiWorkflow: {
        ideation: aiIdeation.trim(),
        promptsSample: aiPrompts.filter((p) => p.trim().length > 0),
        humanReviewAndRefinement: aiReview.trim()
      }
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#FBFBFA] rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#65a30d]" />
              <span>{project ? 'Edit Portofolio Website' : 'Tambah Portofolio Website Baru'}</span>
            </h2>
            <p className="text-xs text-stone-500">
              Formulir terstruktur untuk mengelola portofolio website yang pernah Anda buat.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-stone-200 bg-stone-100/70 px-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'info'
                ? 'border-stone-900 text-stone-950 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            1. Informasi Utama Website
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'features'
                ? 'border-stone-900 text-stone-950 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            2. Deskripsi & Fitur Website ({features.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tech')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'tech'
                ? 'border-stone-900 text-stone-950 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            3. Teknologi & Alat ({techStack.length})
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Nama Website / Judul Portofolio *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                    placeholder="Contoh: KlinikHardware.id — Website Profil & Servis IT"
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Slug URL *</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    placeholder="klinik-hardware-id"
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Kategori Website</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Status Pengerjaan</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Tahun Pembuatan</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2025"
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Klien / Pemilik Website</label>
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="Contoh: KlinikHardware Workshop / PT Surya Mega Integrasi"
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Peran Saya dalam Pembuatan</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Desain UI/UX & Full-Stack Web Developer"
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Ringkasan Singkat Website (Tampil di Kartu)</label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Ringkasan 1-2 kalimat tentang website ini..."
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              {/* Image Uploader */}
              <div className="pt-1">
                <ImageUploader
                  label="Tautan Gambar / Thumbnail"
                  value={thumbnail}
                  onChange={setThumbnail}
                  placeholder="/src/assets/images/... atau URL gambar"
                  helpText="Bisa unggah file gambar langsung dari perangkat Anda atau tempelkan URL gambar."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Tautan Live Website (URL)</label>
                  <input
                    type="text"
                    value={liveDemoUrl}
                    onChange={(e) => setLiveDemoUrl(e.target.value)}
                    placeholder="https://contoh-website.com"
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Tautan</label>
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://... (tautan repositori / proyek)"
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Featured checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-stone-800 font-semibold">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span>Tampilkan sebagai Portofolio Unggulan di Beranda</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Deskripsi Lengkap Website</label>
                <textarea
                  rows={4}
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Penjelasan lengkap mengenai konsep website, target audiens, dan pengalaman pengguna..."
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Tujuan Pembuatan Website</label>
                <textarea
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Mengapa website ini dibuat dan apa sasaran bisnis yang ingin dicapai..."
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              {/* Interactive Features List */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 text-sm">
                    Fitur-Fitur Utama Website ({features.length})
                  </label>
                  <span className="text-[11px] text-stone-400">
                    Fitur ini tampil sebagai checklist visual di halaman detail portofolio.
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Contoh: Integrasi WhatsApp Checkout langsung ke admin"
                    className="flex-1 p-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800 cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Fitur</span>
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-2.5 bg-white rounded-lg border border-stone-200 shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-[#65a30d] shrink-0" />
                        <span className="text-stone-800 truncate">{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-stone-400 hover:text-red-600 p-1 cursor-pointer shrink-0"
                        title="Hapus Fitur"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {features.length === 0 && (
                    <div className="p-4 bg-stone-50 rounded-lg border border-dashed border-stone-200 text-center text-stone-400">
                      Belum ada fitur utama yang ditambahkan. Masukkan poin fitur di atas.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tech' && (
            <div className="space-y-5">
              {/* Tech Stack */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-stone-800 text-sm block">
                    Teknologi & Alat Pengembangan yang Digunakan
                  </label>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Masukkan nama framework, bahasa, CMS, atau pustaka (misal: React, Next.js, WordPress, Tailwind CSS, PHP, MySQL, WhatsApp API).
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTech();
                      }
                    }}
                    placeholder="Ketik teknologi (misal: Next.js) lalu Enter"
                    className="flex-1 p-2 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="px-4 py-2 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800 cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1.5 bg-stone-200 text-stone-800 px-3 py-1.5 rounded-lg font-mono text-xs font-medium"
                    >
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="text-stone-500 hover:text-red-600 cursor-pointer font-bold ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">
              * Kolom bertanda bintang wajib diisi
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
              >
                {project ? 'Simpan Perubahan' : 'Tambahkan Portofolio'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
