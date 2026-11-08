import React, { useRef, useState } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Check, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  label?: string;
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label = 'Tautan Gambar / Thumbnail',
  value,
  onChange,
  placeholder = '/images/... atau URL gambar',
  helpText = 'Unggah gambar dari perangkat atau tempel tautan URL gambar.',
  required = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Format file harus berupa gambar (JPG, PNG, WebP, GIF, SVG).');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        setIsProcessing(false);
        return;
      }

      // If SVG or small image, no need to resize via canvas
      if (file.type === 'image/svg+xml') {
        onChange(dataUrl);
        setIsProcessing(false);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
        return;
      }

      // Optimize image resolution to max 1280px to save storage & ensure high performance
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1280;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = Math.round(MAX_DIM);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.86);
          onChange(compressed);
        } else {
          onChange(dataUrl);
        }

        setIsProcessing(false);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      };

      img.onerror = () => {
        onChange(dataUrl);
        setIsProcessing(false);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      setErrorMsg('Gagal membaca file gambar.');
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
    // Reset file input so re-selecting the same file works
    e.target.value = '';
  };

  const handleClear = () => {
    onChange('');
    setErrorMsg(null);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-stone-700 text-xs sm:text-sm flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <X className="w-3 h-3" />
            <span>Hapus Gambar</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {/* Input Text URL & Upload Button Group */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
            />
            <LinkIcon className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Trigger Button for Upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title="Pilih gambar dari komputer atau galeri HP"
          >
            {isProcessing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#BEF264]" />
            ) : uploadSuccess ? (
              <Check className="w-3.5 h-3.5 text-[#BEF264]" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-[#BEF264]" />
            )}
            <span>{isProcessing ? 'Memproses...' : uploadSuccess ? 'Terunggah!' : 'Upload'}</span>
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <p className="text-[11px] text-red-600 font-medium">{errorMsg}</p>
        )}

        {/* Preview & Status Box */}
        {value && (
          <div className="flex items-center gap-3 p-2 bg-stone-50 border border-stone-200 rounded-lg">
            <div className="w-14 h-14 bg-stone-200 rounded-md overflow-hidden shrink-0 border border-stone-300 relative group">
              <img
                src={value}
                alt="Pratinjau Thumbnail"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-stone-800 truncate">
                {value.startsWith('data:image') ? 'Gambar Hasil Upload (Tersimpan Lokal)' : value}
              </p>
              <p className="text-[10px] text-stone-500">
                {value.startsWith('data:image')
                  ? 'Ukuran telah dioptimasi otomatis agar cepat dimuat.'
                  : 'Pratinjau gambar berhasil dimuat.'}
              </p>
            </div>
          </div>
        )}

        {helpText && !value && (
          <p className="text-[11px] text-stone-400">{helpText}</p>
        )}
      </div>
    </div>
  );
};
