import React, { useState } from 'react';
import {
  X,
  Save,
  Download,
  Upload,
  RotateCcw,
  Building,
  UserCheck,
  FileText,
  Image,
  Sparkles,
  Layers,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import { SchoolProfile } from '../types';
import { exportAllDataJSON, importAllDataJSON } from '../utils/storage';
import { OfficialLetterhead } from './OfficialLetterhead';
import { DEFAULT_SURYA_BUANA_KOP_SVG } from '../data/mockData';

interface SchoolProfileModalProps {
  profile: SchoolProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: SchoolProfile) => void;
  onResetData: () => void;
}

export const SchoolProfileModal: React.FC<SchoolProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'kop' | 'profile' | 'backup'>('kop');
  const [formData, setFormData] = useState<SchoolProfile>({ ...profile });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplySuryaBuanaPreset = () => {
    setFormData((prev) => ({
      ...prev,
      foundationName: 'YAYASAN BAHANA CITA PERSADA MALANG',
      schoolCategory: 'SEKOLAH ALAM TERPADU',
      schoolName: 'SMA SURYA BUANA MALANG',
      accreditation: "TERAKREDITASI 'A'",
      nss: '302056104148',
      npsn: '20577541',
      unitName: 'UNIT PELAYANAN BIMBINGAN DAN KONSELING (BK)',
      schoolAddress:
        'Jl. Candi VI D No. 2, Karangbesuki, Kec. Sukun, Kota Malang, Jawa Timur 65149',
      schoolPhone: '(0341) 5024546 / 573212',
      schoolEmail: 'smasuryabuana@gmail.com',
      schoolWebsite: 'www.smaislamsuryabuana.sch.id',
      leadCounselorName: 'Muhammad Burhanudin Muzaqi, M.Psi.',
      principalName: 'Drs. H. Mulyono, M.Pd.',
      regencyCity: 'Kota Malang',
      counselingRoomName:
        'Ruang Layanan Bimbingan & Konseling (BK) SMA Surya Buana Malang',
      kopFormat: 'gambar',
      letterheadImageUrl: DEFAULT_SURYA_BUANA_KOP_SVG,
      letterheadImageHeight: 140,
    }));
    setMessage({
      type: 'success',
      text: 'Format Kop Surat Gambar & profil resmi SMA Surya Buana Malang berhasil diterapkan!',
    });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLetterheadUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const originalDataUrl = event.target?.result as string;
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
            setFormData((prev) => ({
              ...prev,
              kopFormat: 'gambar',
              letterheadImageUrl: optimized,
            }));
            setMessage({ type: 'success', text: 'Berkas gambar kop surat berhasil diunggah & diterapkan!' });
            setTimeout(() => setMessage(null), 3000);
            return;
          }
        }
        setFormData((prev) => ({
          ...prev,
          kopFormat: 'gambar',
          letterheadImageUrl: originalDataUrl,
        }));
        setMessage({ type: 'success', text: 'Berkas gambar kop surat berhasil diunggah & diterapkan!' });
        setTimeout(() => setMessage(null), 3000);
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
      setMessage({ type: 'success', text: 'Logo sekolah berhasil diunggah!' });
      setTimeout(() => setMessage(null), 2500);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setMessage({
      type: 'success',
      text: 'Perubahan Kop Surat & Identitas Sekolah berhasil disimpan!',
    });
    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 1200);
  };

  const handleExportBackup = () => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_SIM_BK_SuryaBuana_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Berkas cadangan data (JSON) berhasil diunduh.' });
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importAllDataJSON(content);
      if (success) {
        setMessage({
          type: 'success',
          text: 'Data cadangan berhasil dipulihkan! Halaman akan dimuat ulang.',
        });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setMessage({ type: 'error', text: 'Gagal memulihkan berkas JSON. Format tidak valid.' });
      }
    };
    reader.readAsText(file);
  };

  const handleResetConfirm = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin mengembalikan seluruh data ke data standar bawaan SMA Surya Buana Malang? Seluruh perubahan kustom akan diatur ulang.'
      )
    ) {
      onResetData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              SB
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pengaturan Kop Surat & Identitas Sekolah
              </h3>
              <p className="text-xs text-slate-500">
                SMA Surya Buana Malang · Guru Pengampu: Muhammad Burhanudin Muzaqi, M.Psi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('kop')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors cursor-pointer ${
              activeTab === 'kop'
                ? 'border-emerald-800 text-emerald-900 bg-white shadow-xs font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Kop Surat Resmi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-emerald-800 text-emerald-900 bg-white shadow-xs font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building className="w-4 h-4" />
            Profil Guru BK & Pejabat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors cursor-pointer ${
              activeTab === 'backup'
                ? 'border-emerald-800 text-emerald-900 bg-white shadow-xs font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Download className="w-4 h-4" />
            Cadangan Data
          </button>
        </div>

        {message && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* ========================================================================= */}
          {/* TAB 1: KOP SURAT RESMI (WYSIWYG PREVIEW & CUSTOMIZATION)                  */}
          {/* ========================================================================= */}
          {activeTab === 'kop' && (
            <div className="space-y-5">
              {/* WYSIWYG Live Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Pratinjau Langsung Kop Surat (Live Preview)
                  </label>
                  <button
                    type="button"
                    onClick={handleApplySuryaBuanaPreset}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    Terapkan Standar Resmi SMA Surya Buana
                  </button>
                </div>

                <div className="p-4 sm:p-6 bg-slate-50 border border-slate-300 rounded-xl overflow-x-auto shadow-inner">
                  <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs min-w-[500px]">
                    <OfficialLetterhead
                      profile={formData}
                      isPreprintedStationery={formData.kopFormat === 'blanko'}
                    />
                  </div>
                </div>
              </div>

              {/* Mode Kop Surat Standar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Format Kop Surat untuk Seluruh Persuratan
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Pilih format kop surat yang otomatis diterapkan pada seluruh surat izin, rekam konseling, dan laporan bulanan.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Pilihan 1: Kop Gambar (Banner) */}
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.kopFormat === 'gambar'
                        ? 'border-emerald-700 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="kopFormat"
                      value="gambar"
                      checked={formData.kopFormat === 'gambar'}
                      onChange={() => setFormData((prev) => ({ ...prev, kopFormat: 'gambar' }))}
                      className="mt-0.5 text-emerald-700 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Image className="w-3.5 h-3.5 text-emerald-700" />
                        Kop Gambar (Banner)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Menggunakan berkas gambar kop surat resmi secara utuh untuk seluruh dokumen.
                      </p>
                    </div>
                  </label>

                  {/* Pilihan 2: Kop Teks Digital */}
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.kopFormat === 'lengkap'
                        ? 'border-emerald-700 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="kopFormat"
                      value="lengkap"
                      checked={formData.kopFormat === 'lengkap'}
                      onChange={() => setFormData((prev) => ({ ...prev, kopFormat: 'lengkap' }))}
                      className="mt-0.5 text-emerald-700 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                        Kop Teks Digital
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Menyusun teks tata naskah dinas dan lambang vektor sekolah secara otomatis.
                      </p>
                    </div>
                  </label>

                  {/* Pilihan 3: Kertas Berkop Fisik */}
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.kopFormat === 'blanko'
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="kopFormat"
                      value="blanko"
                      checked={formData.kopFormat === 'blanko'}
                      onChange={() => setFormData((prev) => ({ ...prev, kopFormat: 'blanko' }))}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-600" />
                        Kertas Berkop (Blanko)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Mengosongkan area atas (~3.5 cm) untuk dicetak pada kertas berkop fisik dari sekolah.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Pengaturan Khusus Gambar Kop Surat */}
                {formData.kopFormat === 'gambar' && (
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-emerald-700" />
                        Berkas Gambar Kop Surat (Banner)
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          Unggah Gambar Baru (PNG/JPG)
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLetterheadUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              letterheadImageUrl: DEFAULT_SURYA_BUANA_KOP_SVG,
                              letterheadImageHeight: 140,
                            }));
                            setMessage({
                              type: 'success',
                              text: 'Gambar kop dikembalikan ke template resmi SMA Surya Buana bawaan!',
                            });
                          }}
                          className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Gunakan Bawaan
                        </button>
                      </div>
                    </div>

                    {/* Height selector */}
                    <div className="flex items-center gap-3 bg-white p-3 border border-slate-200 rounded-lg text-xs">
                      <span className="font-semibold text-slate-700">Tinggi Gambar Kop Saat Dicetak:</span>
                      <div className="flex items-center gap-2">
                        {[100, 120, 140, 160, 180].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, letterheadImageHeight: h }))}
                            className={`px-2.5 py-1 rounded border text-xs font-semibold cursor-pointer transition-colors ${
                              (formData.letterheadImageHeight || 140) === h
                                ? 'bg-emerald-800 text-white border-emerald-800'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {h}px
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Input Detail Kop Surat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Yayasan (Baris Atas Kop Surat)
                  </label>
                  <input
                    type="text"
                    name="foundationName"
                    value={formData.foundationName || ''}
                    onChange={handleChange}
                    placeholder="Contoh: YAYASAN BAHANA CITA PERSADA MALANG"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Sekolah Resmi (Baris Utama Kop Surat)
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: SMA SURYA BUANA MALANG"
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori / Jenjang Sekolah
                  </label>
                  <input
                    type="text"
                    name="schoolCategory"
                    value={formData.schoolCategory || ''}
                    onChange={handleChange}
                    placeholder="Contoh: SEKOLAH ALAM TERPADU"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Akreditasi
                  </label>
                  <input
                    type="text"
                    name="accreditation"
                    value={formData.accreditation || ''}
                    onChange={handleChange}
                    placeholder="Contoh: TERAKREDITASI 'A'"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Pokok Sekolah Nasional (NPSN)
                  </label>
                  <input
                    type="text"
                    name="npsn"
                    value={formData.npsn || ''}
                    onChange={handleChange}
                    placeholder="Contoh: 20577541"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Statistik Sekolah (NSS)
                  </label>
                  <input
                    type="text"
                    name="nss"
                    value={formData.nss || ''}
                    onChange={handleChange}
                    placeholder="Contoh: 302056104148"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Unit Kerja BK
                  </label>
                  <input
                    type="text"
                    name="unitName"
                    value={formData.unitName || ''}
                    onChange={handleChange}
                    placeholder="Contoh: UNIT PELAYANAN BIMBINGAN DAN KONSELING (BK)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Lengkap Sekolah (pada Kop Surat)
                  </label>
                  <textarea
                    rows={2}
                    name="schoolAddress"
                    value={formData.schoolAddress}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: Jl. Candi VI D No. 2, Karangbesuki, Kec. Sukun, Kota Malang, Jawa Timur 65149"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Telepon Sekolah
                  </label>
                  <input
                    type="text"
                    name="schoolPhone"
                    value={formData.schoolPhone}
                    onChange={handleChange}
                    placeholder="Contoh: (0341) 5024546 / 573212"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Resmi Sekolah / BK
                  </label>
                  <input
                    type="email"
                    name="schoolEmail"
                    value={formData.schoolEmail}
                    onChange={handleChange}
                    placeholder="Contoh: smasuryabuana@gmail.com"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Website Resmi Sekolah
                  </label>
                  <input
                    type="text"
                    name="schoolWebsite"
                    value={formData.schoolWebsite}
                    onChange={handleChange}
                    placeholder="Contoh: www.smaislamsuryabuana.sch.id"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Logo Customizer */}
                <div className="md:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Logo Sekolah pada Kop Surat
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <Image className="w-3.5 h-3.5 text-emerald-700" />
                      Unggah File Logo (PNG/JPG)
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, logoUrl: undefined }))}
                        className="px-2.5 py-1 text-xs text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        Kembalikan ke Logo Vektor Bawaan
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Secara bawaan sistem menggunakan lambang vektor resmi SMA Surya Buana Malang (radiasi surya emas, buku & bola dunia). Anda dapat mengunggah file gambar logo sekolah jika diinginkan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PROFIL GURU BK & PEJABAT SEKOLAH                                   */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-800" />
                  Guru Pengampu Bimbingan & Konseling
                </span>
                <p className="text-emerald-800 text-[11px]">
                  Sesuai ketentuan, seluruh layanan bimbingan konseling dan surat perizinan di SMA Surya Buana Malang diampu secara profesional oleh <strong>Muhammad Burhanudin Muzaqi, M.Psi.</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Guru BK (Tanda Tangan)
                  </label>
                  <input
                    type="text"
                    name="leadCounselorName"
                    value={formData.leadCounselorName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP / NUPTK Guru BK
                  </label>
                  <input
                    type="text"
                    name="leadCounselorNIP"
                    value={formData.leadCounselorNIP}
                    onChange={handleChange}
                    placeholder="Isi '-' jika belum ada"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Kepala Sekolah (SMA Surya Buana)
                  </label>
                  <input
                    type="text"
                    name="principalName"
                    value={formData.principalName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP / NUPTK Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    name="principalNIP"
                    value={formData.principalNIP}
                    onChange={handleChange}
                    placeholder="Isi '-' jika belum ada"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Ruang Konseling / Tempat Layanan
                  </label>
                  <input
                    type="text"
                    name="counselingRoomName"
                    value={formData.counselingRoomName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kabupaten / Kota Dokumen (Titimangsa Surat)
                  </label>
                  <input
                    type="text"
                    name="regencyCity"
                    value={formData.regencyCity}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Ajaran Aktif
                  </label>
                  <input
                    type="text"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester Aktif
                  </label>
                  <select
                    name="currentSemester"
                    value={formData.currentSemester}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CADANGAN DATA (BACKUP & RESTORE)                                    */}
          {/* ========================================================================= */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Ekspor & Impor Data (Offline Backup)
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Simpan seluruh basis data (siswa, riwayat absensi, catatan masalah, jurnal konseling, dan surat perizinan) ke file JSON di komputer Anda untuk arsip aman.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-800" />
                    Unduh Cadangan JSON
                  </button>

                  <label className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                    <Upload className="w-4 h-4 text-blue-700" />
                    Pulihkan dari JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                  Atur Ulang ke Data Standar (Reset Default)
                </h4>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Tindakan ini akan mengembalikan profil sekolah ke standar SMA Surya Buana Malang dan mengembalikan sampel data awal.
                </p>
                <button
                  type="button"
                  onClick={handleResetConfirm}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-300 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset ke Standar Awal
                </button>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
