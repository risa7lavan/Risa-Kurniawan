import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, User, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { AdminUser, AdminRole } from '../../types';

interface AdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminToEdit: AdminUser | null;
  onSave: (data: {
    name: string;
    username: string;
    role: AdminRole;
    password?: string;
  }) => { success: boolean; message?: string };
}

export const AdminUserModal: React.FC<AdminUserModalProps> = ({
  isOpen,
  onClose,
  adminToEdit,
  onSave
}) => {
  const isEditing = Boolean(adminToEdit);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<AdminRole>('Admin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (adminToEdit) {
      setName(adminToEdit.name);
      setUsername(adminToEdit.username);
      setRole(adminToEdit.role);
      setPassword('');
      setConfirmPassword('');
      setErrorMessage('');
    } else {
      setName('');
      setUsername('');
      setRole('Admin');
      setPassword('');
      setConfirmPassword('');
      setErrorMessage('');
    }
    setShowPassword(false);
  }, [adminToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = name.trim();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedName) {
      setErrorMessage('Nama lengkap administrator wajib diisi.');
      return;
    }

    if (!trimmedUsername) {
      setErrorMessage('Username login wajib diisi.');
      return;
    }

    if (trimmedUsername.length < 3) {
      setErrorMessage('Username minimal 3 karakter.');
      return;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedUsername)) {
      setErrorMessage('Username hanya boleh menggunakan huruf, angka, garis bawah (_), atau titik (.).');
      return;
    }

    // Password validation
    if (!isEditing) {
      if (!trimmedPassword) {
        setErrorMessage('Kata sandi wajib diisi untuk akun baru.');
        return;
      }
      if (trimmedPassword.length < 4) {
        setErrorMessage('Kata sandi minimal 4 karakter.');
        return;
      }
      if (trimmedPassword !== confirmPassword.trim()) {
        setErrorMessage('Konfirmasi kata sandi tidak cocok.');
        return;
      }
    } else {
      // If editing and password provided
      if (trimmedPassword) {
        if (trimmedPassword.length < 4) {
          setErrorMessage('Kata sandi baru minimal 4 karakter.');
          return;
        }
        if (trimmedPassword !== confirmPassword.trim()) {
          setErrorMessage('Konfirmasi kata sandi tidak cocok.');
          return;
        }
      }
    }

    const res = onSave({
      name: trimmedName,
      username: trimmedUsername,
      role,
      password: trimmedPassword || undefined
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.message || 'Gagal menyimpan akun admin.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-[#BEF264]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {isEditing ? 'Edit Akun Administrator' : 'Tambah Administrator Baru'}
              </h2>
              <p className="text-xs text-stone-400">
                {isEditing
                  ? 'Perbarui data identitas, hak akses, atau kata sandi admin.'
                  : 'Buat kredensial akses baru untuk mengelola dashboard website.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-300">
              Nama Lengkap Administrator <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Contoh: Risa Lavan / Admin Utama"
                className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-white placeholder:text-stone-600 focus:border-[#BEF264] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-stone-500">
              Nama ini akan ditampilkan pada sesi dashboard dan status aktivitas.
            </p>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-300">
              Username Login <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                required
                placeholder="contoh: risa / admin_web"
                className="w-full pl-8 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs font-mono text-white placeholder:text-stone-600 focus:border-[#BEF264] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-stone-500">
              Hanya huruf kecil, angka, titik, atau garis bawah. Digunakan saat form login.
            </p>
          </div>

          {/* Role / Hak Akses */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-300">
              Peran & Tingkat Akses <span className="text-red-400">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-white focus:border-[#BEF264] focus:outline-none"
            >
              <option value="Super Admin">Super Admin (Akses Penuh Seluruh Sistem)</option>
              <option value="Admin">Admin (Kelola Konten & Konfigurasi)</option>
              <option value="Admin Editor">Admin Editor (Kelola Artikel & Tutorial)</option>
            </select>
            <p className="text-[11px] text-stone-500">
              Menentukan wewenang dan tanda pengenal peran admin dalam sistem.
            </p>
          </div>

          {/* Password Section */}
          <div className="pt-2 border-t border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-stone-300">
                {isEditing ? 'Kata Sandi Baru (Opsional)' : 'Kata Sandi Login'} {!isEditing && <span className="text-red-400">*</span>}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Sembunyikan' : 'Tampilkan'}</span>
              </button>
            </div>

            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? 'Biarkan kosong jika tidak ingin mengubah kata sandi' : 'Minimal 4 karakter'}
                className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-white placeholder:text-stone-600 focus:border-[#BEF264] focus:outline-none font-mono"
              />
            </div>

            {/* Confirm Password (only needed if password has been typed) */}
            {(!isEditing || password.trim().length > 0) && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-stone-300">
                  Konfirmasi Kata Sandi <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi di atas"
                    className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-white placeholder:text-stone-600 focus:border-[#BEF264] focus:outline-none font-mono"
                  />
                </div>
              </div>
            )}
            {isEditing && (
              <p className="text-[11px] text-stone-500">
                Jika Anda tidak ingin mengganti kata sandi admin ini, biarkan kotak kata sandi tetap kosong.
              </p>
            )}
          </div>

          {/* Modal Footer / Actions */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#BEF264] hover:bg-[#a3e635] text-stone-950 font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
            >
              {isEditing ? 'Simpan Perubahan Akun' : 'Tambah Akun Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
