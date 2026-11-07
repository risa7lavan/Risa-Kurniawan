import React, { useState } from 'react';
import { Lock, User, ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAppData } from '../../context/DataContext';

interface AdminLoginProps {
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToSite }) => {
  const { login } = useAppData();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message || 'Login gagal.');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-center items-center px-4 py-12">
      {/* Top Back Link */}
      <div className="w-full max-w-md mb-6">
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Website Publik</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Brand / Title Header */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-center mx-auto text-[#BEF264]">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Portal Kelola Konten
          </h1>
          <p className="text-xs text-stone-400">
            Masuk untuk mengelola seluruh proyek web, tutorial IT Support, jasa layanan, artikel, dan akun admin.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-200">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-300">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white placeholder:text-stone-600 focus:border-[#BEF264] focus:outline-none"
                placeholder="Username"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white placeholder:text-stone-600 focus:border-[#BEF264] focus:outline-none"
                placeholder="Password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 p-1"
                aria-label="Lihat password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#BEF264] hover:bg-[#a3e635] text-stone-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Masuk ke Dashboard</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-stone-500">
          Sesi admin tersimpan pada browser ini. Semua modifikasi konten dapat diunduh dalam format JSON.
        </div>
      </div>
    </div>
  );
};
