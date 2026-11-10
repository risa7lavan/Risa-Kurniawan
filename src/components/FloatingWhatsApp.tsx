import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useAppData } from '../context/DataContext';

interface FloatingWhatsAppProps {
  currentView: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ currentView }) => {
  const { profile } = useAppData();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show floating button after user scrolls down 120px
      if (window.scrollY > 120) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Do not render on admin dashboard
  if (currentView === 'admin' || isDismissed) {
    return null;
  }

  const rawPhone = profile.whatsapp || profile.phone || '6281297770752';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const waMessage = encodeURIComponent(
    `Halo ${profile.name || 'Risa Kurniawan'}, saya berkunjung ke website Anda dan tertarik untuk konsultasi pembuatan website / IT Support.`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

  return (
    <div
      className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
    >
      {/* WhatsApp Action Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Konsultasi langsung via WhatsApp"
        className="group flex items-center gap-2.5 px-4 py-2.5 bg-stone-950 text-white hover:bg-stone-900 border border-stone-800 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#BEF264]/80"
      >
        {/* Pulsing Green Indicator */}
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BEF264] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#BEF264]" />
        </span>

        {/* WhatsApp Icon */}
        <div className="text-[#BEF264] shrink-0">
          <MessageSquare className="w-4 h-4 fill-current" />
        </div>

        {/* Label */}
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-stone-400 font-mono leading-none">Tersedia Online</span>
          <span className="text-xs font-bold text-white group-hover:text-[#BEF264] transition-colors leading-tight">
            Konsultasi WhatsApp
          </span>
        </div>
      </a>

      {/* Dismiss micro-button */}
      <button
        onClick={() => setIsDismissed(true)}
        aria-label="Tutup tombol floating WhatsApp"
        className="w-6 h-6 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
        title="Sembunyikan"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
