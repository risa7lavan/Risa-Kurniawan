import React, { useState, useMemo } from 'react';
import { Search, X, Filter, ArrowRight, ExternalLink, Link2, RotateCcw, Globe, CheckCircle2, Building2 } from 'lucide-react';
import { useAppData } from '../context/DataContext';
import { Project } from '../types';

interface ProjectsViewProps {
  onSelectProject: (slug: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onSelectProject }) => {
  const { projects } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [selectedTech, setSelectedTech] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  // Categories list gathered dynamically from projects + standard web types
  const categories = useMemo(() => {
    const defaultList = [
      'Semua',
      'Website Bisnis & UMKM',
      'Website Profil Perusahaan',
      'Toko Online (E-Commerce)',
      'Landing Page',
      'Portal Berita & Media'
    ];
    const projectCategories = Array.from(new Set(projects.map((p) => p.category)));
    const merged = Array.from(new Set([...defaultList, ...projectCategories]));
    return merged;
  }, [projects]);

  // Tech list gathered from projects
  const allTechs = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.techStack.forEach((t) => set.add(t)));
    return ['Semua', ...Array.from(set)];
  }, [projects]);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.client && p.client.toLowerCase().includes(q)) ||
          p.techStack.some((tech) => tech.toLowerCase().includes(q)) ||
          (p.features && p.features.some((f) => f.toLowerCase().includes(q)))
      );
    }

    // Category
    if (selectedCategory !== 'Semua') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Status
    if (selectedStatus !== 'Semua') {
      result = result.filter((p) => p.status === selectedStatus);
    }

    // Tech
    if (selectedTech !== 'Semua') {
      result = result.filter((p) => p.techStack.includes(selectedTech));
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') return parseInt(b.year) - parseInt(a.year);
      if (sortBy === 'oldest') return parseInt(a.year) - parseInt(b.year);
      return a.title.localeCompare(b.title);
    });

    return result;
  }, [projects, searchQuery, selectedCategory, selectedStatus, selectedTech, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua');
    setSelectedStatus('Semua');
    setSelectedTech('Semua');
    setSortBy('newest');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'Semua' ||
    selectedStatus !== 'Semua' ||
    selectedTech !== 'Semua' ||
    sortBy !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2 border-b border-stone-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#84cc16]/15 border border-[#84cc16]/30 text-stone-900 text-[11px] font-semibold tracking-wider uppercase">
          <Globe className="w-3.5 h-3.5 text-[#65a30d]" />
          <span>PORTOFOLIO WEBSITE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-950 tracking-tight">
          Koleksi Website yang Pernah Saya Buat
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-3xl leading-relaxed">
          Eksplorasi ragam website dan aplikasi web yang telah saya rancang dan kembangkan—mulai dari website profil perusahaan, toko online (e-commerce), landing page promosi, hingga portal dan sistem bisnis digital siap pakai.
        </p>
      </div>

      {/* Control Bar: Search & Selectors */}
      <div className="space-y-3 bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari website, jenis usaha, fitur, atau teknologi..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 focus:bg-white focus:outline-none"
            >
              <option value="Semua">Semua Status</option>
              <option value="Selesai">Selesai (Live / Siap Pakai)</option>
              <option value="Pengembangan Aktif">Pengembangan Aktif</option>
              <option value="Konsep Teruji">Konsep Teruji</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 focus:bg-white focus:outline-none"
            >
              <option value="newest">Tahun Terbaru</option>
              <option value="oldest">Tahun Terdahulu</option>
              <option value="alphabetical">Nama Website (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
          <div className="flex items-center gap-1.5 text-xs text-stone-400 shrink-0 pr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Kategori:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tech Stack Horizontal Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
          <span className="text-stone-400 font-semibold shrink-0 pr-1">Teknologi:</span>
          {allTechs.slice(0, 10).map((tech) => (
            <button
              key={tech}
              onClick={() => setSelectedTech(tech)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors whitespace-nowrap cursor-pointer ${
                selectedTech === tech
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tech}
            </button>
          ))}
        </div>

        {/* Active filter counter and Reset */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
          <div>
            Menampilkan <span className="font-semibold text-stone-900">{filteredProjects.length}</span> dari {projects.length} website
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-stone-600 hover:text-stone-950 flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-4">
          <Globe className="w-10 h-10 mx-auto text-stone-300" />
          <h3 className="text-base font-bold text-stone-800">
            Tidak ada website yang sesuai dengan kriteria pencarian
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Coba sesuaikan kata kunci pencarian Anda atau kembalikan pilihan filter ke kondisi awal.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className="group bg-white rounded-xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-stone-400 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Browser Mockup Header & Thumbnail */}
                <div
                  onClick={() => onSelectProject(project.slug)}
                  className="relative aspect-[16/10] bg-stone-950 overflow-hidden cursor-pointer"
                >
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent opacity-80" />

                  {/* Browser Chrome Top Pills */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-stone-900/80 backdrop-blur-xs px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2.5 right-2.5 bg-stone-900/90 backdrop-blur-xs text-stone-200 text-[10px] px-2 py-0.5 rounded-full font-mono border border-stone-700/60">
                    {project.status}
                  </div>

                  {/* Client / Owner Badge bottom */}
                  {project.client && (
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-1.5 text-[11px] text-stone-200 font-medium truncate">
                      <Building2 className="w-3.5 h-3.5 text-[#BEF264] shrink-0" />
                      <span className="truncate">{project.client}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                      {project.category}
                    </span>
                    <span className="font-mono text-stone-400 text-xs">{project.year}</span>
                  </div>

                  <h3
                    onClick={() => onSelectProject(project.slug)}
                    className="font-bold text-base text-stone-950 group-hover:text-stone-700 transition-colors cursor-pointer leading-snug line-clamp-1"
                  >
                    {project.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {project.shortDescription}
                  </p>

                  {/* Highlight Features (if available) */}
                  {project.features && project.features.length > 0 && (
                    <div className="space-y-1 pt-0.5 border-t border-stone-100">
                      {project.features.slice(0, 2).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-stone-700 leading-tight">
                          <CheckCircle2 className="w-3 h-3 text-[#65a30d] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {project.techStack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/60 font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 4 && (
                      <span className="text-[10px] text-stone-400 py-0.5">
                        +{project.techStack.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectProject(project.slug)}
                  className="text-xs font-semibold text-stone-900 hover:text-stone-600 inline-flex items-center gap-1 cursor-pointer py-0.5"
                >
                  <span>Lihat Portofolio</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#65a30d]" />
                </button>

                <div className="flex items-center gap-1.5">
                  {project.liveDemoUrl && (
                    <a
                      href={project.liveDemoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      title="Kunjungi Website Langsung"
                    >
                      <ExternalLink className="w-3 h-3 text-[#65a30d]" />
                      <span>Live Website</span>
                    </a>
                  )}

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors"
                      title="Tautan"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
