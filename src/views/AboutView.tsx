import React from 'react';
import { ArrowRight, Mail, Github, Linkedin, Instagram, Code, Wrench, Palette, Sparkles, CheckCircle2, MapPin } from 'lucide-react';
import { useAppData } from '../context/DataContext';

interface AboutViewProps {
  onNavigate: (view: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  const { profile } = useAppData();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-9 sm:space-y-11">
      {/* Profile Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center border-b border-stone-200 pb-7">
        {/* Profile Avatar / Photo Container */}
        <div className="md:col-span-4 flex justify-center md:justify-start">
          <div className="relative group w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-2 border-stone-200 shadow-md bg-stone-100">
            <img
              src={profile.avatarUrl || "/images/hero_creative_workspace_1793775537391.jpg"}
              alt={`Foto Profil ${profile.name}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Bio Highlights */}
        <div className="md:col-span-8 space-y-3">
          <div className="text-xs font-semibold tracking-wider uppercase text-stone-500">
            TENTANG SAYA & RUANG KERJA
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-950 tracking-tight">
            {profile.name}
          </h1>
          <p className="text-sm sm:text-base font-medium text-stone-700">
            {profile.roleTitle}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            <span>{profile.location}</span>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
            {profile.aboutShort}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => onNavigate('contact')}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>Hubungi Saya</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#BEF264]" />
            </button>

            <button
              onClick={() => onNavigate('services')}
              className="px-4 py-2 bg-stone-100 text-stone-800 rounded-lg text-xs font-semibold hover:bg-stone-200 transition-colors cursor-pointer border border-stone-200"
            >
              Lihat Jasa & Layanan
            </button>
          </div>
        </div>
      </div>

      {/* Narrative Bio */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-stone-950 tracking-tight">
          Filosofi & Pendekatan Kerja
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-stone-700 leading-relaxed max-w-3xl">
          {profile.aboutFull.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* Values & Principles */}
      <section className="space-y-4">
        <div className="border-b border-stone-200 pb-3">
          <div className="text-xs font-semibold tracking-wider uppercase text-stone-500 mb-0.5">
            NILAI-NILAI UTAMA
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-950 tracking-tight">
            Prinsip yang Saya Pegang dalam Bekerja
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {profile.values.map((val, idx) => (
            <div
              key={val.title}
              className="p-4 bg-white rounded-xl border border-stone-200 space-y-1.5 shadow-2xs"
            >
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-400">
                <span>0{idx + 1}.</span>
                <span className="text-stone-900 font-sans text-sm sm:text-base font-bold">{val.title}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {val.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Journey Timeline */}
      <section className="space-y-4">
        <div className="border-b border-stone-200 pb-3">
          <div className="text-xs font-semibold tracking-wider uppercase text-stone-500 mb-0.5">
            TIMELINE
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-950 tracking-tight">
            Perjalanan Belajar & Berkarya
          </h2>
        </div>

        <div className="space-y-3.5 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-stone-200">
          {profile.learningJourney.map((item, idx) => (
            <div key={item.year} className="relative flex items-start gap-4 pl-1">
              <div className="w-3.5 h-3.5 rounded-full bg-stone-900 ring-4 ring-white shrink-0 mt-1" />
              <div className="p-4 bg-white rounded-xl border border-stone-200 flex-1 space-y-0.5 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-mono text-stone-500">
                  <span className="font-bold text-stone-900">{item.year}</span>
                </div>
                <h3 className="font-bold text-sm sm:text-base text-stone-900">{item.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed pt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Matrix Detail */}
      <section className="space-y-4">
        <div className="border-b border-stone-200 pb-3">
          <div className="text-xs font-semibold tracking-wider uppercase text-stone-500 mb-0.5">
            KOMPETENSI
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-950 tracking-tight">
            Pengelompokan Keahlian Lengkap
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {profile.skillGroups.map((group, idx) => (
            <div key={group.category} className="p-4 sm:p-5 bg-white rounded-xl border border-stone-200 space-y-2.5">
              <h3 className="font-bold text-base text-stone-900">{group.category}</h3>
              <p className="text-xs text-stone-500 leading-normal">{group.description}</p>
              <ul className="space-y-1.5 text-xs text-stone-700 pt-2 border-t border-stone-100">
                {group.skills.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#84cc16] shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <div className="p-5 sm:p-7 bg-stone-100 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-bold text-stone-900">Tertarik Berdiskusi Lebih Lanjut?</h3>
          <p className="text-xs text-stone-600">
            Kirimkan pesan melalui formulir kontak atau email langsung untuk diskusi ide dan konsultasi.
          </p>
        </div>
        <button
          onClick={() => onNavigate('contact')}
          className="px-4.5 py-2.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
        >
          Buka Halaman Kontak
        </button>
      </div>
    </div>
  );
};
