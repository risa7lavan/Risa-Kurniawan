import React, { useState } from 'react';
import { Mail, Github, Linkedin, Instagram, Send, CheckCircle2, AlertCircle, Info, ExternalLink, Link2 } from 'lucide-react';
import { useAppData } from '../context/DataContext';

export const ContactView: React.FC = () => {
  const { profile } = useAppData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'simulated-ready'>('idle');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Alamat email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format alamat email tidak valid.';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subjek pesan tidak boleh kosong.';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Isi pesan tidak boleh kosong.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Isi pesan minimal terdiri dari 10 karakter.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulating frontend processing validation
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionStatus('simulated-ready');
    }, 600);
  };

  const directMailtoUrl = `mailto:${profile.email}?subject=${encodeURIComponent(
    formData.subject || `Inquiry Portofolio ${profile.brandTitle}`
  )}&body=${encodeURIComponent(
    `Halo ${profile.name},\n\nNama: ${formData.name}\nEmail: ${formData.email}\n\nPesan:\n${formData.message}`
  )}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7">
      {/* Header */}
      <div className="space-y-2 border-b border-stone-200 pb-5">
        <div className="text-xs font-semibold tracking-wider uppercase text-stone-500">
          HUBUNGI SAYA
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-950 tracking-tight">
          Mari Memulai Diskusi
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
          {profile.contactDescription || 'Punya pertanyaan seputar proyek web, kebutuhan bantuan teknis IT Support, atau ingin bekerja sama dalam perancangan materi desain grafis? Jangan ragu untuk mengirim pesan.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Contact Information & Channels (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 sm:p-5 bg-white rounded-xl border border-stone-200 space-y-3.5 shadow-2xs">
            <h3 className="font-bold text-sm sm:text-base text-stone-900 border-b border-stone-100 pb-2">
              Saluran Komunikasi Langsung
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              {/* WhatsApp */}
              {profile.whatsapp && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-lime-100 rounded-md text-lime-800 shrink-0">
                    <ExternalLink className="w-4 h-4 text-lime-700" />
                  </div>
                  <div>
                    <span className="text-stone-400 block text-xs">WhatsApp Langsung</span>
                    <a
                      href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo ${profile.name}, saya tertarik berdiskusi mengenai proyek / IT support.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-stone-900 hover:text-lime-700 flex items-center gap-1"
                    >
                      <span>+{profile.whatsapp.replace(/\D/g, '')}</span>
                      <ExternalLink className="w-3 h-3 text-stone-400" />
                    </a>
                    <span className="text-[11px] text-stone-400 block mt-0.5">
                      Respon cepat via chat WhatsApp
                    </span>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-stone-100 rounded-md text-stone-700 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-stone-400 block text-xs">Email Utama</span>
                  <a
                    href={`mailto:${profile.email}`}
                    className="font-medium text-stone-900 hover:text-stone-600 underline underline-offset-2 break-all"
                  >
                    {profile.email}
                  </a>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    (Dapat dikustomisasi di Dashboard Admin)
                  </span>
                </div>
              </div>

              {/* Dynamic Social Media Channels */}
              {profile.socialMedia && profile.socialMedia.length > 0 ? (
                profile.socialMedia.map((soc) => {
                  const p = soc.platform.toLowerCase();
                  let IconComponent = Link2;
                  if (p.includes('github') || p.includes('git')) IconComponent = Github;
                  else if (p.includes('linkedin')) IconComponent = Linkedin;
                  else if (p.includes('instagram')) IconComponent = Instagram;

                  return (
                    <div key={soc.id} className="flex items-start gap-3">
                      <div className="p-2 bg-stone-100 rounded-md text-stone-700 shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-stone-400 block text-xs">{soc.platform}</span>
                        <a
                          href={soc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-stone-900 hover:text-stone-600 flex items-center gap-1 break-all"
                        >
                          <span>{soc.usernameOrHandle || soc.platform}</span>
                          <ExternalLink className="w-3 h-3 text-stone-400 shrink-0" />
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  {/* Fallback Tautan */}
                  {profile.githubUrl && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-stone-100 rounded-md text-stone-700 shrink-0">
                        <Github className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-stone-400 block text-xs">GitHub</span>
                        <a
                          href={profile.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-stone-900 hover:text-stone-600 flex items-center gap-1"
                        >
                          <span>Repository & Kode</span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Fallback LinkedIn */}
                  {profile.linkedinUrl && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-stone-100 rounded-md text-stone-700 shrink-0">
                        <Linkedin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-stone-400 block text-xs">LinkedIn</span>
                        <a
                          href={profile.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-stone-900 hover:text-stone-600 flex items-center gap-1"
                        >
                          <span>Profil Profesional</span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Fallback Instagram */}
                  {profile.instagramUrl && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-stone-100 rounded-md text-stone-700 shrink-0">
                        <Instagram className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-stone-400 block text-xs">Instagram</span>
                        <a
                          href={profile.instagramUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-stone-900 hover:text-stone-600 flex items-center gap-1"
                        >
                          <span>Portofolio & Visual</span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Jam Kerja & Konsultasi */}
              {profile.workingHours && (
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-stone-400 block text-xs">Jadwal Konsultasi & Layanan</span>
                  <span className="font-medium text-stone-800 text-xs mt-0.5 block">
                    {profile.workingHours}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Direct Mail Button */}
          <div className="p-4 bg-stone-100 rounded-xl border border-stone-200 space-y-1.5">
            <span className="text-xs font-bold text-stone-900 block">Ingin Mengirim Email Seketika?</span>
            <p className="text-xs text-stone-600 leading-normal">
              Gunakan klien email bawaan perangkat Anda (Gmail, Outlook, atau Mail) melalui tautan langsung di bawah:
            </p>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors mt-1"
            >
              <Mail className="w-3.5 h-3.5 text-[#BEF264]" />
              <span>Buka Aplikasi Email</span>
            </a>
          </div>
        </div>

        {/* Contact Form Container (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white p-4.5 sm:p-6 rounded-xl border border-stone-200 shadow-2xs space-y-4">
            <div className="space-y-0.5">
              <h3 className="font-bold text-base sm:text-lg text-stone-900">Formulir Pesan</h3>
              <p className="text-xs text-stone-500">
                Silakan lengkapi detail kontak Anda di bawah ini.
              </p>
            </div>

            {submissionStatus === 'simulated-ready' ? (
              <div className="p-6 bg-stone-50 border border-stone-200 rounded-xl space-y-4">
                <div className="flex items-start gap-3 text-stone-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">Validasi Formulir Berhasil</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Format pesan dari <strong>{formData.name}</strong> ({formData.email}) telah tervalidasi dengan baik.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    <span>Catatan Integrasi Backend:</span>
                  </div>
                  <p className="leading-relaxed">
                    Sesuai instruksi pengembangan, website tidak menampilkan konfirmasi email terkirim palsu sebelum backend SMTP / webhook dihubungkan. Anda dapat meneruskan draf pesan ini langsung via email:
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <a
                    href={directMailtoUrl}
                    className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 inline-flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#BEF264]" />
                    <span>Lanjutkan Kirim via Klien Email</span>
                  </a>
                  <button
                    onClick={() => {
                      setSubmissionStatus('idle');
                      setFormData({ name: '', email: '', subject: '', message: '' });
                    }}
                    className="px-3 py-2 bg-stone-200 text-stone-800 text-xs font-medium rounded-lg hover:bg-stone-300"
                  >
                    Tulis Pesan Baru
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Nama */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-xs font-semibold text-stone-700">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border rounded-lg focus:bg-white focus:outline-none transition-colors ${
                      errors.name ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-stone-200 focus:ring-1 focus:ring-stone-900'
                    }`}
                  />
                  {errors.name && <p className="text-[11px] text-red-600">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-semibold text-stone-700">
                    Alamat Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border rounded-lg focus:bg-white focus:outline-none transition-colors ${
                      errors.email ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-stone-200 focus:ring-1 focus:ring-stone-900'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-red-600">{errors.email}</p>}
                </div>

                {/* Subjek */}
                <div className="space-y-1.5">
                  <label htmlFor="subject" className="block text-xs font-semibold text-stone-700">
                    Subjek Diskusi <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Contoh: Konsultasi Proyek Website atau Servis IT"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border rounded-lg focus:bg-white focus:outline-none transition-colors ${
                      errors.subject ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-stone-200 focus:ring-1 focus:ring-stone-900'
                    }`}
                  />
                  {errors.subject && <p className="text-[11px] text-red-600">{errors.subject}</p>}
                </div>

                {/* Pesan */}
                <div className="space-y-1.5">
                  <label htmlFor="message" className="block text-xs font-semibold text-stone-700">
                    Isi Pesan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tuliskan kebutuhan atau detail yang ingin Anda diskusikan..."
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border rounded-lg focus:bg-white focus:outline-none transition-colors ${
                      errors.message ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-stone-200 focus:ring-1 focus:ring-stone-900'
                    }`}
                  />
                  {errors.message && <p className="text-[11px] text-red-600">{errors.message}</p>}
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Memvalidasi Input...</span>
                      </>
                    ) : (
                      <>
                        <span>Kirim Pesan</span>
                        <Send className="w-3.5 h-3.5 text-[#BEF264]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
