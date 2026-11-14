import React from 'react';
import { ArrowUp, Github, Linkedin, Instagram, Mail, Lock, MapPin, Clock, Globe } from 'lucide-react';
import { useAppData } from '../context/DataContext';
import { getRoutePath } from '../utils/routes';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { profile } = useAppData();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('github') || p.includes('git')) return <Github className="w-4 h-4" />;
    if (p.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    if (p.includes('instagram')) return <Instagram className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <footer className="bg-stone-900 text-stone-200 border-t border-stone-800 mt-10 sm:mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#BEF264] rounded-xs" aria-hidden="true" />
              <span className="font-extrabold tracking-tight text-xl text-white">
                {profile.brandTitle}
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-md leading-relaxed">
              {profile.footerDescription || 'Ruang kerja digital yang menampilkan karya pembuatan website modern berbantuan AI, dokumentasi solusi teknis IT Support harian, dan penyediaan jasa layanan IT profesional.'}
            </p>
            <div className="flex items-center flex-wrap gap-2.5 pt-2">
              {profile.socialMedia && profile.socialMedia.length > 0 ? (
                profile.socialMedia.map((soc) => (
                  <a
                    key={soc.id}
                    href={soc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-md transition-colors flex items-center gap-1.5 text-xs"
                    title={`${soc.platform}${soc.usernameOrHandle ? ` (${soc.usernameOrHandle})` : ''}`}
                    aria-label={soc.platform}
                  >
                    {renderSocialIcon(soc.platform)}
                    <span className="text-[11px] font-medium hidden sm:inline">{soc.platform}</span>
                  </a>
                ))
              ) : (
                <>
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-md transition-colors"
                    aria-label="Tautan"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-md transition-colors"
                    aria-label="LinkedIn Profile"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href={profile.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-md transition-colors"
                    aria-label="Instagram Profile"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                </>
              )}
              <a
                href={`mailto:${profile.email}`}
                className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-md transition-colors"
                aria-label="Kirim Email"
                title={`Kirim Email: ${profile.email}`}
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Eksplorasi
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={getRoutePath('projects')}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    e.preventDefault();
                    onNavigate('projects');
                    scrollToTop();
                  }}
                  className="text-stone-300 hover:text-white transition-colors cursor-pointer"
                >
                  Proyek Situs Web
                </a>
              </li>
              <li>
                <a
                  href={getRoutePath('services')}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    e.preventDefault();
                    onNavigate('services');
                    scrollToTop();
                  }}
                  className="text-stone-300 hover:text-white transition-colors cursor-pointer"
                >
                  Jasa & Layanan IT
                </a>
              </li>
              <li>
                <a
                  href={getRoutePath('tutorials')}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    e.preventDefault();
                    onNavigate('tutorials');
                    scrollToTop();
                  }}
                  className="text-stone-300 hover:text-white transition-colors cursor-pointer"
                >
                  Tutorial IT Support
                </a>
              </li>
              <li>
                <a
                  href={getRoutePath('articles')}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    e.preventDefault();
                    onNavigate('articles');
                    scrollToTop();
                  }}
                  className="text-stone-300 hover:text-white transition-colors cursor-pointer"
                >
                  Artikel IT & Wawasan
                </a>
              </li>
              <li>
                <a
                  href={getRoutePath('about')}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    e.preventDefault();
                    onNavigate('about');
                    scrollToTop();
                  }}
                  className="text-stone-300 hover:text-white transition-colors cursor-pointer"
                >
                  Tentang & Pengalaman
                </a>
              </li>
            </ul>
          </div>

          {/* Layanan & Konsultasi */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Layanan & Konsultasi
            </h4>
            <div className="p-3.5 bg-stone-800/40 rounded-lg border border-stone-800 text-xs space-y-2.5 text-stone-400">
              <p className="leading-relaxed">
                Melayani jasa pembuatan website profesional, instalasi jaringan, dan solusi perbaikan IT Support untuk bisnis maupun individu.
              </p>
              <div className="flex items-center gap-2 text-stone-300 font-medium pt-1">
                <Clock className="w-3.5 h-3.5 text-[#BEF264] shrink-0" />
                <span>{profile.workingHours || 'Senin – Sabtu, 08.00 – 20.00 WIB'}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>{profile.location || 'Indonesia (Tersedia Onsite & Remote)'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <div>
            © {new Date().getFullYear()} {profile.brandTitle} ({profile.name}). Dibuat dengan standar desain modern.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                onNavigate('admin');
                scrollToTop();
              }}
              className="hover:text-stone-200 transition-colors cursor-pointer flex items-center gap-1 font-semibold text-stone-300"
            >
              <Lock className="w-3.5 h-3.5 text-[#BEF264]" />
              <span>Panel Admin</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>Kembali ke atas</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
