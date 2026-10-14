import React, { useRef, useState } from 'react';
import { Image as ImageIcon, FileText, Layers, Upload, Check, Settings, Trash2 } from 'lucide-react';
import { SchoolProfile } from '../types';
import { DEFAULT_SURYA_BUANA_KOP_SVG } from '../data/mockData';

interface LetterheadToolbarControlsProps {
  profile: SchoolProfile;
  onUpdateProfile?: (updated: Partial<SchoolProfile>) => void;
  onOpenSettings?: () => void;
  className?: string;
}

export const LetterheadToolbarControls: React.FC<LetterheadToolbarControlsProps> = ({
  profile,
  onUpdateProfile,
  onOpenSettings,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const currentFormat = profile.kopFormat || 'gambar';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFormatChange = (newFormat: 'gambar' | 'lengkap' | 'blanko') => {
    if (onUpdateProfile) {
      onUpdateProfile({ kopFormat: newFormat });
      if (newFormat === 'gambar') {
        showToast('Mode Kop Gambar Aktif untuk seluruh persuratan');
      } else if (newFormat === 'lengkap') {
        showToast('Mode Kop Teks Digital Aktif');
      } else {
        showToast('Mode Kertas Berkop Fisik Aktif (Area atas dikosongkan)');
      }
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const originalDataUrl = event.target?.result as string;

      // Optimize image resolution if too large for smooth localStorage storage
      const img = new window.Image();
      img.onload = () => {
        const maxWidth = 1600;
        if (img.width > maxWidth) {
          const canvas = document.createElement('canvas');
          const scale = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const optimized = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92);
            if (onUpdateProfile) {
              onUpdateProfile({
                kopFormat: 'gambar',
                letterheadImageUrl: optimized,
              });
              showToast('Gambar kop surat berhasil dipasang untuk SEMUA surat!');
            }
            return;
          }
        }

        // Within normal limits
        if (onUpdateProfile) {
          onUpdateProfile({
            kopFormat: 'gambar',
            letterheadImageUrl: originalDataUrl,
          });
          showToast('Gambar kop surat berhasil dipasang untuk SEMUA surat!');
        }
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);

    // Reset input so re-selecting same file works
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetToOfficialSvg = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        kopFormat: 'gambar',
        letterheadImageUrl: DEFAULT_SURYA_BUANA_KOP_SVG,
        letterheadImageHeight: 140,
      });
      showToast('Gambar kop dikembalikan ke template resmi SMA Surya Buana!');
    }
  };

  return (
    <div className={`relative flex flex-wrap items-center gap-1.5 ${className}`}>
      {/* Toast floating badge */}
      {toastMessage && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 whitespace-nowrap">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mode Format Tabs */}
      <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs text-xs">
        <button
          type="button"
          onClick={() => handleFormatChange('gambar')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
            currentFormat === 'gambar'
              ? 'bg-emerald-800 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Gunakan format gambar kop surat (banner) untuk seluruh persuratan"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Kop Gambar</span>
        </button>

        <button
          type="button"
          onClick={() => handleFormatChange('lengkap')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
            currentFormat === 'lengkap'
              ? 'bg-emerald-800 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Gunakan format teks digital resmi dengan lambang vektor"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Kop Teks</span>
        </button>

        <button
          type="button"
          onClick={() => handleFormatChange('blanko')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
            currentFormat === 'blanko'
              ? 'bg-amber-600 text-white font-bold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Kosongkan area kop untuk dicetak pada kertas berkop fisik sekolah"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Kertas Berkop</span>
        </button>
      </div>

      {/* Quick Upload Button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleImageFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
        title="Unggah berkas gambar kop surat Anda (PNG/JPG) untuk digunakan pada semua persuratan"
      >
        <Upload className="w-3.5 h-3.5 text-emerald-700" />
        <span>Unggah Gambar Kop</span>
      </button>

      {/* Height Adjuster dropdown if in image mode */}
      {currentFormat === 'gambar' && (
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs text-slate-700">
          <span className="text-[10.5px] text-slate-500 font-medium">Tinggi:</span>
          <select
            value={profile.letterheadImageHeight || 140}
            onChange={(e) => {
              if (onUpdateProfile) {
                onUpdateProfile({ letterheadImageHeight: Number(e.target.value) });
                showToast(`Tinggi kop surat diatur ke ${e.target.value}px`);
              }
            }}
            className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            title="Atur tinggi gambar kop surat pada lembar cetak"
          >
            <option value={100}>100px (Kompak)</option>
            <option value={120}>120px (Sedang)</option>
            <option value={140}>140px (Standar)</option>
            <option value={160}>160px (Besar)</option>
            <option value={180}>180px (Ekstra)</option>
          </select>
        </div>
      )}

      {/* Open full Settings Modal if provided */}
      {onOpenSettings && (
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          title="Pengaturan Kop Surat & Identitas Sekolah Lengkap"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Quick revert if using custom image */}
      {profile.letterheadImageUrl && profile.letterheadImageUrl !== DEFAULT_SURYA_BUANA_KOP_SVG && (
        <button
          type="button"
          onClick={handleResetToOfficialSvg}
          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
          title="Kembalikan ke gambar banner resmi SMA Surya Buana bawaan"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
