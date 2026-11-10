import React from 'react';
import { ArrowRight, ArrowUpRight, Terminal, Wrench, Palette, Code, CheckCircle, ExternalLink, Github, Link2, ChevronRight, Eye, BookOpen, Clock, Calendar, Sparkles, Tag, FileText, Briefcase, Check } from 'lucide-react';
import { useAppData } from '../context/DataContext';
import { DesignItem } from '../types';

interface HomeViewProps {
  onNavigate: (view: string, slug?: string) => void;
  onOpenLightbox?: (item: DesignItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { projects, services, tutorials, articles, profile } = useAppData();
  const featuredProjects = projects.filter((p) => p.isFeatured).slice(0, 3);
  const featuredServices = services.filter((s) => s.isActive !== false).slice(0, 3);
  const featuredTutorials = tutorials.filter((t) => t.isFeatured).slice(0, 3);
  const featuredArticles = articles.slice(0, 3);

  return (
    <div className="space-y-12 sm:space-y-16 pb-8">
      {/* ========================================================= */}
      {/* A. BAGIAN HERO (Creative Tech Portfolio — Ruang Kerja Digital) */}
      {/* ========================================================= */}
      <section className="pt-3 sm:pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-stretch">
            {/* Left Column: Typographic Impact */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Quiet Unboxed Kicker */}
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-stone-500">
                  <span>{profile.heroKicker || 'PORTOFOLIO TEKNOLOGI KREATIF · RUANG KERJA DIGITAL'}</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-950 tracking-tight leading-[1.15] text-balance">
                  {profile.heroHeadline}
                </h1>

                {/* Subheadline & Lead Description */}
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl">
                  {profile.heroDescription}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={() => onNavigate('projects')}
                  className="px-4.5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <span>Jelajahi Karya Saya</span>
                  <ArrowRight className="w-4 h-4 text-[#BEF264]" />
                </button>

                <button
                  onClick={() => onNavigate('services')}
                  className="px-4.5 py-2.5 text-xs sm:text-sm font-semibold text-stone-900 bg-[#84cc16] hover:bg-[#a3e635] rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Jasa & Layanan</span>
                </button>

                <button
                  onClick={() => onNavigate('tutorials')}
                  className="px-4.5 py-2.5 text-xs sm:text-sm font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer border border-stone-200"
                >
                  Tutorial IT
                </button>

                <button
                  onClick={() => onNavigate('contact')}
                  className="px-4 py-2.5 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Hubungi Saya
                </button>
              </div>

              {/* Metadata Micro Summary (Unboxed Text with Separators) */}
              <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-500">
                <span className="font-semibold text-stone-900">Fokus Bidang:</span>
                {(profile.heroFocusAreas && profile.heroFocusAreas.length > 0
                  ? profile.heroFocusAreas
                  : ['Web Berbantuan AI', 'Troubleshooting Hardware & Jaringan', 'Artikel & Wawasan Teknologi']
                ).map((area, idx, arr) => (
                  <React.Fragment key={idx}>
                    <span>{area}</span>
                    {idx < arr.length - 1 && <span aria-hidden="true">/</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Right Column: Curated Visual Anchor Composition */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="relative group bg-stone-100 rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-stone-900">
                  <img
                    src={profile.heroImageUrl || "/images/hero_creative_workspace_1793775537391.jpg"}
                    alt={profile.heroImageCaption || "Meja Kerja Digital Kreatif"}
                    referrerPolicy="no-referrer"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Micro Overlay Details */}
                <div className="p-3.5 bg-white border-t border-stone-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900">{profile.heroImageCaption || 'Studio & Laboratorium Digital'}</span>
                    <span className="text-stone-500 font-mono">{profile.heroImageYear || '2024–2026'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    {(profile.heroImageTags && profile.heroImageTags.length > 0
                      ? profile.heroImageTags
                      : ['Hardware Lab', 'AI Prototyping', 'Swiss Typography']
                    ).map((tag, i, arr) => (
                      <React.Fragment key={i}>
                        <span>{tag}</span>
                        {i < arr.length - 1 && <span aria-hidden="true">·</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* B. PENDAHULUAN / ABOUT PREVIEW */}
      {/* ========================================================= */}
      <section className="bg-stone-100/60 py-8 sm:py-10 border-y border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="text-xs font-semibold tracking-wider uppercase text-stone-500">
              01. PENDAHULUAN & PROFIL
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Menghubungkan Ketepatan Teknis dengan Kepekaan Visual
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              {profile.aboutShort}
            </p>
            <div className="pt-1">
              <button
                onClick={() => onNavigate('about')}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-900 hover:text-stone-700 underline underline-offset-4 cursor-pointer"
              >
                <span>Kenali Saya Lebih Dekat & Riwayat Belajar</span>
                <ArrowRight className="w-4 h-4 text-stone-500" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* C. PROYEK UNGGULAN (Situs Web Berbantuan AI) */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-stone-200">
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-stone-500 mb-0.5">
              02. SELECTED WORKS
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-950 tracking-tight">
              Portofolio Website Pilihan
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Karya website dan aplikasi web nyata yang pernah saya bangun untuk kebutuhan bisnis, toko online, dan profil perusahaan.
            </p>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-stone-900 hover:text-stone-700 cursor-pointer shrink-0"
          >
            <span>Semua Portofolio ({projects.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {featuredProjects.map((project) => (
            <article
              key={project.id}
              className="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md hover:border-stone-400 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail with Browser Frame mockup dots */}
                <div
                  onClick={() => onNavigate('project-detail', project.slug)}
                  className="relative aspect-[16/10] bg-stone-950 overflow-hidden cursor-pointer"
                >
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-stone-900/80 backdrop-blur-xs px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-stone-900/90 backdrop-blur-xs text-stone-200 text-[10px] px-2 py-0.5 rounded-full font-mono border border-stone-700/60">
                    {project.status}
                  </div>
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
                    onClick={() => onNavigate('project-detail', project.slug)}
                    className="font-bold text-base text-stone-950 group-hover:text-stone-700 transition-colors cursor-pointer leading-snug line-clamp-1"
                  >
                    {project.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {project.shortDescription}
                  </p>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/60 font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="text-[10px] text-stone-400 py-0.5">
                        +{project.techStack.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onNavigate('project-detail', project.slug)}
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
                      className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      title="Kunjungi Website Langsung"
                    >
                      <ExternalLink className="w-3 h-3 text-[#65a30d]" />
                      <span>Live</span>
                    </a>
                  )}

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-stone-400 hover:text-stone-800"
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
      </section>

      {/* ========================================================= */}
      {/* C. JASA & LAYANAN TEKNOLOGI */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-stone-200">
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-stone-500 mb-0.5">
              03. LAYANAN & SOLUSI TEKNOLOGI
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-950 tracking-tight">
              Jasa Profesional & Solusi Digital
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Dukungan teknis komputasi, pengembangan website modern berbantuan AI, dan keamanan data bergaransi.
            </p>
          </div>
          <button
            onClick={() => onNavigate('services')}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-stone-900 hover:text-stone-700 cursor-pointer shrink-0"
          >
            <span>Lihat Semua Layanan ({services.length})</span>
            <ArrowRight className="w-4 h-4 text-[#84cc16]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {featuredServices.map((srv) => (
            <div
              key={srv.id}
              onClick={() => onNavigate('services')}
              className={`p-4 sm:p-5 bg-white rounded-xl border transition-all duration-200 flex flex-col justify-between hover:shadow-md cursor-pointer ${
                srv.isPopular ? 'border-stone-900 ring-2 ring-[#84cc16]/40' : 'border-stone-200 hover:border-stone-400'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-1.5 rounded-lg bg-stone-100 text-stone-900">
                    <Briefcase className="w-4.5 h-4.5 text-stone-800" />
                  </span>
                  {srv.isPopular && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#84cc16] text-stone-950 px-2 py-0.5 rounded shadow-2xs">
                      Populer
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-stone-500">{srv.category}</span>
                  <h3 className="font-bold text-base text-stone-950 leading-snug">{srv.title}</h3>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {srv.shortDescription}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 block font-bold">Mulai Dari</span>
                    <span className="font-extrabold text-stone-900">{srv.priceStartingFrom}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-stone-400 block font-bold">Waktu</span>
                    <span className="font-mono text-stone-700">{srv.turnaroundTime}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-900">
                <span>Pelajari Paket</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#84cc16]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* D. PUSAT PENGETAHUAN DUKUNGAN TI (IT Support) */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-stone-200">
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-stone-500 mb-0.5">
              04. BASIS PENGETAHUAN TEKNIS
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-950 tracking-tight">
              Tutorial & Dokumentasi IT Support
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Panduan pemecahan masalah komputer, laptop, konfigurasi Windows, dan jaringan lokal.
            </p>
          </div>
          <button
            onClick={() => onNavigate('tutorials')}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-stone-900 hover:text-stone-700 cursor-pointer shrink-0"
          >
            <span>Jelajahi Semua Tutorial ({tutorials.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {featuredTutorials.map((tut) => (
            <article
              key={tut.id}
              onClick={() => onNavigate('tutorial-detail', tut.slug)}
              className="group bg-white p-4 sm:p-5 rounded-xl border border-stone-200 hover:border-stone-400 transition-all cursor-pointer flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-semibold text-stone-800 text-[11px] bg-stone-100 px-2 py-0.5 rounded">{tut.category}</span>
                  <span className="text-xs">{tut.difficulty}</span>
                </div>

                <h3 className="font-bold text-base text-stone-900 group-hover:text-stone-700 leading-snug transition-colors line-clamp-2">
                  {tut.title}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {tut.summary}
                </p>
              </div>

              <div className="pt-3.5 border-t border-stone-100 mt-3.5 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span>{tut.readTimeMinutes} menit baca</span>
                  <span aria-hidden="true">·</span>
                  <span>{tut.steps.length} langkah</span>
                </div>
                <div className="flex items-center gap-1 text-stone-900 font-semibold group-hover:translate-x-1 transition-transform text-xs">
                  <span>Baca Panduan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* E. ARTIKEL & WAWASAN TEKNOLOGI */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-stone-200">
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-stone-500 mb-0.5">
              05. EDITORIAL & WAWASAN IT
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-950 tracking-tight">
              Artikel & Wawasan Teknologi
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Tulisan mendalam seputar perbandingan hardware, panduan keamanan siber, dan analisis tren komputasi.
            </p>
          </div>
          <button
            onClick={() => onNavigate('articles')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-900 hover:text-stone-700 cursor-pointer shrink-0"
          >
            <span>Lihat Semua Artikel ({articles.length})</span>
            <ArrowRight className="w-4 h-4 text-[#84cc16]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {featuredArticles.map((item) => (
            <article
              key={item.id}
              onClick={() => onNavigate('article-detail', item.slug)}
              className="group bg-white rounded-xl border border-stone-200 overflow-hidden cursor-pointer shadow-xs hover:shadow-md hover:border-stone-400 transition-all flex flex-col justify-between"
            >
              {/* Thumbnail */}
              <div className="relative h-36 sm:h-40 bg-stone-100 overflow-hidden">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-70" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-stone-900/80 text-white rounded">
                    {item.category}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-stone-200">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.publishedDate}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {item.readTimeMinutes} mnt baca
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base text-stone-950 group-hover:text-stone-700 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 font-semibold text-stone-900 group-hover:translate-x-0.5 transition-transform text-xs">
                    Baca
                    <ArrowRight className="w-3 h-3 text-[#84cc16]" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* F. KETERAMPILAN & ALAT KERJA */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 pb-3 border-b border-stone-200">
          <div className="text-xs font-semibold tracking-wider uppercase text-stone-500 mb-0.5">
            06. KOMPETENSI & PERALATAN
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-950 tracking-tight">
            Keterampilan & Alat Kerja Digital
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Matriks keterampilan terbagi rapi berdasarkan domain fungsional kerja nyata.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {profile.skillGroups.map((group, idx) => (
            <div
              key={group.category}
              className="p-4 sm:p-5 bg-white rounded-xl border border-stone-200 space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-stone-400">0{idx + 1}.</span>
                <h3 className="font-bold text-base text-stone-900">{group.category}</h3>
              </div>
              <p className="text-xs text-stone-500 leading-normal">{group.description}</p>
              <ul className="space-y-1.5 text-xs text-stone-700 pt-2 border-t border-stone-100">
                {group.skills.map((skill) => (
                  <li key={skill} className="flex items-start gap-2">
                    <span className="text-[#84cc16] mt-0.5" aria-hidden="true">▪</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tools row */}
        <div className="mt-5 p-4 sm:p-5 bg-stone-100/80 rounded-xl border border-stone-200 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-600">
            Perangkat Lunak & Utilitas Utama
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.tools.map((t) => (
              <span
                key={t.name}
                className="text-xs bg-white text-stone-800 px-2.5 py-1 rounded-md border border-stone-200 shadow-2xs font-mono"
              >
                {t.name} <span className="text-stone-400">({t.category})</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* G. CTA PENUTUP */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-10 relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="text-xs font-mono uppercase tracking-wider text-[#BEF264]">
              {profile.ctaKicker || 'TERBUKA UNTUK KOLABORASI'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              {profile.ctaHeadline || 'Punya Ide atau Masalah Digital yang Ingin Diselesaikan?'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {profile.ctaDescription || 'Saya terbuka untuk berdiskusi, berkolaborasi, dan berbagi pengetahuan seputar teknologi serta desain.'}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-3">
              <button
                onClick={() => onNavigate('contact')}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-stone-900 bg-[#BEF264] hover:bg-[#a3e635] rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                {profile.ctaPrimaryBtnText || 'Hubungi Saya'}
              </button>
              <button
                onClick={() => onNavigate('projects')}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-stone-100 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors cursor-pointer border border-stone-700"
              >
                {profile.ctaSecondaryBtnText || 'Lihat Karya Saya'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
