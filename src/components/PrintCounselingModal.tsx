import React from 'react';
import { Printer, X, ShieldAlert } from 'lucide-react';
import { CounselingRecord, Student, SchoolProfile } from '../types';
import { formatDateIndonesian } from '../utils/storage';
import { OfficialLetterhead } from './OfficialLetterhead';
import { LetterheadToolbarControls } from './LetterheadToolbarControls';

interface PrintCounselingModalProps {
  record: CounselingRecord;
  student?: Student;
  profile: SchoolProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile?: (updated: Partial<SchoolProfile>) => void;
  onOpenSettings?: () => void;
}

export const PrintCounselingModal: React.FC<PrintCounselingModalProps> = ({
  record,
  student,
  profile,
  isOpen,
  onClose,
  onUpdateProfile,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Modal Toolbar */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-200 bg-slate-50 font-sans">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Laporan Pelaksanaan Layanan Konseling (Resmi)
            </h3>
            <p className="text-xs text-slate-500">
              Dokumentasi akreditasi BK & arsip bimbingan rahasia · SMA Surya Buana Malang
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <LetterheadToolbarControls
              profile={profile}
              onUpdateProfile={onUpdateProfile}
              onOpenSettings={onOpenSettings}
            />

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="print-container p-8 sm:p-12 text-slate-900 bg-white font-serif">
          {/* Header Kop Surat Resmi */}
          <OfficialLetterhead profile={profile} />

          {/* Title */}
          <div className="text-center my-6">
            <h2 className="text-base font-bold underline uppercase tracking-wide text-slate-950">
              LAPORAN PELAKSANAAN LAYANAN {record.serviceType.toUpperCase()}
            </h2>
            <p className="text-xs font-medium text-slate-600 mt-1">
              Sesi Ke-{record.sessionNumber} · Tanggal: {formatDateIndonesian(record.date)} ({record.time})
            </p>
          </div>

          {/* Confidentiality Notice */}
          <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs mb-4">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong>DOKUMEN RAHASIA (CONFIDENTIAL):</strong> Mengacu pada Kode Etik Bimbingan & Konseling Indonesia (ABKIN), dokumen ini dilindungi asas kerahasiaan dan hanya boleh diakses pihak berwenang.
            </span>
          </div>

          {/* Student Identitas Grid */}
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-md text-xs space-y-2 mb-4 font-sans">
            <div className="grid grid-cols-4">
              <span className="text-slate-500 font-medium">Nama Konseli (Siswa)</span>
              <span className="col-span-3 font-bold text-slate-950">: {student?.name || 'Siswa'}</span>
            </div>
            <div className="grid grid-cols-4">
              <span className="text-slate-500 font-medium">NISN / Kelas</span>
              <span className="col-span-3 font-mono tabular-nums text-slate-900">
                : {student?.nisn || '-'} / {student?.className || '-'} ({student?.gender === 'L' ? 'Laki-laki' : 'Perempuan'})
              </span>
            </div>
            <div className="grid grid-cols-4">
              <span className="text-slate-500 font-medium">Wali Kelas</span>
              <span className="col-span-3 text-slate-900">: {student?.homeroomTeacher || '-'}</span>
            </div>
            <div className="grid grid-cols-4">
              <span className="text-slate-500 font-medium">Guru Pembimbing / Konselor</span>
              <span className="col-span-3 text-slate-900">: {record.counselorName}</span>
            </div>
          </div>

          {/* Counseling Service Content */}
          <div className="space-y-4 text-xs">
            <div className="border border-slate-200 rounded-md p-3.5">
              <h4 className="font-bold text-slate-900 mb-1">1. Gambaran / Ringkasan Masalah (Symptom & Issue)</h4>
              <p className="text-slate-700 leading-relaxed text-justify">{record.problemSummary}</p>
            </div>

            <div className="border border-slate-200 rounded-md p-3.5">
              <h4 className="font-bold text-slate-900 mb-1">2. Dinamika Psikologis & Faktor Penyebab</h4>
              <p className="text-slate-700 leading-relaxed text-justify">{record.dynamicsAndEtiology}</p>
            </div>

            <div className="border border-slate-200 rounded-md p-3.5">
              <h4 className="font-bold text-slate-900 mb-1">3. Pendekatan & Teknik Bimbingan Konseling yang Digunakan</h4>
              <p className="text-slate-700 leading-relaxed">{record.techniqueUsed}</p>
            </div>

            <div className="border border-slate-200 rounded-md p-3.5 bg-emerald-50/50 border-emerald-200">
              <h4 className="font-bold text-emerald-950 mb-1">4. Kesepakatan & Kontrak Perilaku Konseli (Student Commitment)</h4>
              <p className="text-slate-800 leading-relaxed text-justify italic">"{record.studentCommitment}"</p>
            </div>

            <div className="border border-slate-200 rounded-md p-3.5">
              <h4 className="font-bold text-slate-900 mb-1">5. Rencana Tindak Lanjut (RTL) & Evaluasi</h4>
              <p className="text-slate-700 leading-relaxed text-justify">{record.followUpPlan}</p>
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-slate-600">
                <span>Hasil Evaluasi: <strong>{record.evaluation}</strong></span>
                {record.nextSessionDate && (
                  <span>Sesi Lanjutan: <strong>{formatDateIndonesian(record.nextSessionDate)}</strong></span>
                )}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-10 pt-4 print-break-inside-avoid">
            <div className="text-right text-xs text-slate-700 mb-4">
              {profile.regencyCity}, {formatDateIndonesian(record.date)}
            </div>

            <div className="grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p className="text-slate-600">Konseli (Siswa),</p>
                <div className="h-16"></div>
                <p className="font-bold underline text-slate-900">
                  {student?.name || 'Siswa'}
                </p>
                <p className="text-slate-500 text-[10px] font-mono tabular-nums">NISN: {student?.nisn || '-'}</p>
              </div>

              <div>
                <p className="text-slate-600">Guru Bimbingan Konseling,</p>
                <div className="h-16"></div>
                <p className="font-bold underline text-slate-900">
                  {record.counselorName}
                </p>
                <p className="text-slate-500 text-[10px] font-mono tabular-nums">
                  {profile.leadCounselorNIP && profile.leadCounselorNIP !== '-' ? `NIP. ${profile.leadCounselorNIP}` : 'Guru Bimbingan Konseling'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
