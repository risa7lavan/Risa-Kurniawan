import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, Link2, CheckCircle2, Globe, Building2, Calendar, UserCheck, MessageSquare, ArrowRight, ShieldCheck, Laptop } from 'lucide-react';
import { useAppData } from '../context/DataContext';
import { Project } from '../types';

interface ProjectDetailViewProps {
  slug: string;
  onBack: () => void;
  onSelectProject: (slug: string) => void;
  onNavigate?: (view: string, slug?: string) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  slug,
  onBack,
  onSelectProject,
  onNavigate
}) => {
  const { projects, profile } = useAppData();
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">Website Tidak Ditemukan</h2>
        <p className="text-stone-600 text-sm">
          Maaf, data portofolio website dengan tautan tersebut tidak tersedia atau telah dipindahkan.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2.5 bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Kembali ke Portofolio Website
        </button>
      </div>
    );
  }

  const relatedProjects = projects
    .filter((p) => p.id !== project.id && (p.category === project.category || p.status === project.status))
    .slice(0, 3);

  const currentHeroImage = activeImage || project.thumbnail;

  const displayUrl = project.liveDemoUrl && project.liveDemoUrl !== '#'
    ? project.liveDemoUrl
    : `https://${project.slug}.com`;

  // WhatsApp consultation link
  const waNumber = profile.whatsapp || '6281234567890';
  const waText = encodeURIComponent(
    `Halo ${profile.name}, saya melihat portofolio website "${project.title}" di website Anda dan tertarik untuk konsultasi pembuatan website serupa.`
  );
  const waUrl = `https://wa.me/${waNumber.replace(/[^0-9]/g, '')}?text=${waText}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-7">
      {/* Top Navigation Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors cursor-pointer py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Portofolio Website</span>
        </button>

        <span className="text-xs text-stone-400 font-mono hidden sm:inline-block">
          Portofolio #{project.year}
        </span>
      </div>

      {/* Header Info */}
      <div className="space-y-3 border-b border-stone-200 pb-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
          <span className="font-semibold text-stone-900 bg-stone-100 px-2.5 py-1 rounded border border-stone-200">
            {project.category}
          </span>
          <span aria-hidden="true">·</span>
          <span>Tahun {project.year}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">
            ● {project.status}
          </span>
          {project.client && (
            <>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-stone-700 font-medium">
                <Building2 className="w-3.5 h-3.5 text-stone-400" />
                <span>{project.client}</span>
              </span>
            </>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-950 tracking-tight leading-tight">
          {project.title}
        </h1>

        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-3xl">
          {project.shortDescription}
        </p>

        {/* Action Links Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
          {project.liveDemoUrl && (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-stone-950 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Globe className="w-4 h-4 text-[#BEF264]" />
              <span>Kunjungi Website Langsung</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </a>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-stone-100 text-stone-800 rounded-lg text-xs font-semibold hover:bg-stone-200 transition-colors cursor-pointer flex items-center gap-2 border border-stone-200"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Tautan</span>
            </a>
          )}

          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-[#BEF264] hover:bg-[#a3e635] text-stone-950 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-stone-900" />
            <span>Konsultasi Pembuatan Website Serupa</span>
          </a>
        </div>
      </div>

      {/* Main Browser Window Mockup Frame */}
      <div className="space-y-4">
        <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 shadow-md">
          {/* Browser Chrome Header */}
          <div className="px-4 py-3 bg-stone-900 border-b border-stone-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            <div className="flex-1 max-w-md mx-auto bg-stone-800/90 border border-stone-700 rounded-md px-3 py-1 flex items-center gap-2 text-stone-300 text-xs font-mono truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{displayUrl}</span>
            </div>

            <div className="flex items-center gap-1.5 text-stone-400">
              <Laptop className="w-4 h-4" />
            </div>
          </div>

          {/* Screenshot viewport */}
          <div className="relative aspect-[16/9] bg-stone-950 overflow-hidden">
            <img
              src={currentHeroImage}
              alt={project.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Gallery Selector Thumbnails if available */}
        {project.gallery && project.gallery.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <span className="text-xs font-semibold text-stone-400 shrink-0">Tangkapan Layar:</span>
            {project.gallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  currentHeroImage === img ? 'border-stone-950 ring-2 ring-stone-950/20' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`${project.title} — Tangkapan Layar ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Portfolio Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 pt-2">
        {/* Left Column: Website Details (8 Cols) */}
        <div className="md:col-span-8 space-y-6">
          {/* Tentang Website Ini */}
          <div className="space-y-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-stone-950 tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#65a30d]" />
              <span>Tentang Website Ini</span>
            </h2>
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
              {project.fullDescription}
            </p>
          </div>

          {/* Tujuan Pembuatan Website */}
          {(project.purpose || project.background) && (
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                Tujuan Pembuatan Website:
              </span>
              <p className="text-sm text-stone-700 leading-relaxed">
                {project.purpose || project.background}
              </p>
            </div>
          )}

          {/* Fitur-Fitur Utama Website */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-stone-950 tracking-tight">
              Fitur-Fitur Utama Website
            </h2>

            {project.features && project.features.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5">
                {project.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white rounded-xl border border-stone-200/90 shadow-2xs flex items-start gap-2.5"
                  >
                    <div className="p-1 bg-[#84cc16]/20 rounded-md text-[#4d7c0f] shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900 leading-snug">
                        {feature}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : project.solution ? (
              <div className="p-3.5 bg-white rounded-xl border border-stone-200 text-sm text-stone-700 space-y-2">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#84cc16]" />
                  <span>Solusi & Fitur yang Diimplementasikan:</span>
                </span>
                <p className="leading-relaxed">{project.solution}</p>
              </div>
            ) : null}
          </div>

          {/* CTA Box: Tertarik membuat website serupa? */}
          <div className="p-5 sm:p-6 bg-gradient-to-br from-stone-950 to-stone-900 text-white rounded-2xl space-y-3">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold">
                Ingin Memiliki Website Seperti Ini untuk Bisnis Anda?
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Saya menyediakan jasa pembuatan website profil perusahaan, toko online, dan landing page profesional dengan desain modern, navigasi cepat, dan integrasi WhatsApp.
              </p>
            </div>
            <div className="pt-1.5 flex flex-wrap items-center gap-2.5">
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#BEF264] hover:bg-[#a3e635] text-stone-950 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Konsultasi Sekarang via WhatsApp</span>
              </a>
              {project.liveDemoUrl && (
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Kunjungi Website</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Metadata Sidebar (4 Cols) */}
        <div className="md:col-span-4 space-y-4 sm:space-y-5">
          <div className="p-4 sm:p-5 bg-white rounded-xl border border-stone-200 space-y-3 shadow-2xs">
            <h3 className="font-bold text-xs sm:text-sm text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2">
              Spesifikasi Portofolio
            </h3>

            <div className="space-y-2.5 text-xs">
              {project.client && (
                <div>
                  <span className="text-stone-400 block mb-0.5">Klien / Pemilik:</span>
                  <span className="font-semibold text-stone-900">{project.client}</span>
                </div>
              )}

              <div>
                <span className="text-stone-400 block mb-0.5">Peran Saya:</span>
                <span className="font-semibold text-stone-800">{project.role}</span>
              </div>

              <div>
                <span className="text-stone-400 block mb-0.5">Kategori Website:</span>
                <span className="font-semibold text-stone-800">{project.category}</span>
              </div>

              <div>
                <span className="text-stone-400 block mb-0.5">Tahun Pembuatan:</span>
                <span className="font-mono text-stone-800">{project.year}</span>
              </div>

              <div>
                <span className="text-stone-400 block mb-0.5">Status Website:</span>
                <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ● {project.status}
                </span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-stone-100 space-y-1.5">
              <span className="text-stone-400 text-xs block font-semibold">Teknologi & Stack:</span>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Related Portfolios */}
          {relatedProjects.length > 0 && (
            <div className="p-4 bg-stone-100/70 rounded-xl border border-stone-200 space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700">
                Portofolio Website Lainnya
              </h4>
              <div className="space-y-2">
                {relatedProjects.map((rel) => (
                  <button
                    key={rel.id}
                    onClick={() => {
                      onSelectProject(rel.slug);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full text-left p-2.5 bg-white rounded-lg border border-stone-200/80 hover:border-stone-400 hover:shadow-2xs transition-all cursor-pointer group"
                  >
                    <div className="text-[11px] text-stone-400">{rel.category}</div>
                    <div className="text-xs font-bold text-stone-900 group-hover:text-stone-700 truncate">
                      {rel.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
