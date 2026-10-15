import React, { useState, useEffect, useMemo } from 'react';
import { Printer, X, Edit3, Check, RotateCcw, Users, FileText } from 'lucide-react';
import { PermissionLetter, Student, SchoolProfile, PaperSize } from '../types';
import { formatDateIndonesian } from '../utils/storage';
import { OfficialLetterhead } from './OfficialLetterhead';
import { LetterheadToolbarControls } from './LetterheadToolbarControls';

interface PrintLetterModalProps {
  letter: PermissionLetter;
  student?: Student;
  students?: Student[];
  profile: SchoolProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile?: (updated: Partial<SchoolProfile>) => void;
  onOpenSettings?: () => void;
  onUpdateLetterNumber?: (id: string, num: string) => void;
}

export const PrintLetterModal: React.FC<PrintLetterModalProps> = ({
  letter,
  student,
  students = [],
  profile,
  isOpen,
  onClose,
  onUpdateProfile,
  onOpenSettings,
  onUpdateLetterNumber,
}) => {
  if (!isOpen) return null;

  // Paper size state (A4 or A5)
  const [paperSize, setPaperSize] = useState<PaperSize>(() => {
    return profile.defaultPaperSize || 'A4';
  });

  const isA5 = paperSize === 'A5';

  useEffect(() => {
    if (paperSize === 'A5') {
      document.body.classList.add('paper-size-a5');
    } else {
      document.body.classList.remove('paper-size-a5');
    }
    return () => {
      document.body.classList.remove('paper-size-a5');
    };
  }, [paperSize]);

  const handlePaperSizeChange = (newSize: PaperSize) => {
    setPaperSize(newSize);
    onUpdateProfile?.({ defaultPaperSize: newSize });
  };

  // Active Letter Number state with quick manual override
  const [activeNumber, setActiveNumber] = useState(letter.letterNumber);
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [editNumberInput, setEditNumberInput] = useState(letter.letterNumber);

  useEffect(() => {
    setActiveNumber(letter.letterNumber);
    setEditNumberInput(letter.letterNumber);
  }, [letter.letterNumber]);

  const handleSaveNumber = () => {
    const trimmed = editNumberInput.trim();
    if (trimmed) {
      setActiveNumber(trimmed);
      onUpdateLetterNumber?.(letter.id, trimmed);
    }
    setIsEditingNumber(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Resolve all participant students (multi-student support)
  const participantStudents = useMemo(() => {
    if (letter.studentIds && letter.studentIds.length > 0) {
      const list = letter.studentIds
        .map((id) => students.find((s) => s.id === id))
        .filter(Boolean) as Student[];
      if (list.length > 0) return list;
    }
    return student ? [student] : [];
  }, [letter.studentIds, students, student]);

  const hasMultiple = participantStudents.length > 1;

  const isType = (checkType: string) => {
    if (checkType === 'BK-SDO') return letter.type === 'BK-SDO' || letter.type === 'Dispensasi_Organisasi';
    if (checkType === 'BK-SPK') return letter.type === 'BK-SPK' || letter.type === 'Dispensasi_Kegiatan';
    if (checkType === 'BK-SIK') return letter.type === 'BK-SIK' || letter.type === 'Izin_Masuk_Kelas';
    if (checkType === 'BK-SLS') return letter.type === 'BK-SLS' || letter.type === 'Izin_Keluar_Sekolah';
    if (checkType === 'BK-SLB') return letter.type === 'BK-SLB';
    if (checkType === 'BK-SPKS') return letter.type === 'BK-SPKS';
    if (checkType === 'BK-SPO') return letter.type === 'BK-SPO' || letter.type === 'Panggilan_Orang_Tua';
    return letter.type === checkType;
  };

  const defaultTeachers = [
    { no: 1, subject: '', teacherName: '' },
    { no: 2, subject: '', teacherName: '' },
    { no: 3, subject: '', teacherName: '' },
    { no: 4, subject: '', teacherName: '' },
    { no: 5, subject: '', teacherName: '' },
  ];

  const teacherRows = letter.subjectTeachers && letter.subjectTeachers.length > 0
    ? letter.subjectTeachers
    : defaultTeachers;

  const serviceOptions = [
    'Konseling Individu',
    'Konseling Kelompok',
    'Bimbingan Kelompok',
    'Bimbingan Klasikal',
    'Konsultasi',
    'Mediasi',
    'Asesmen',
    'Tindak Lanjut',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      {/* Dynamic Injected CSS for @page and print layout sizing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: ${paperSize === 'A5' ? 'A5 portrait' : 'A4 portrait'} !important;
          margin: ${paperSize === 'A5' ? '0.7cm 0.9cm 0.7cm 0.9cm' : '1.2cm 1.5cm 1.2cm 1.5cm'} !important;
        }
      `}} />

      <div className={`relative w-full ${isA5 ? 'preview-paper-a5' : 'preview-paper-a4'} bg-white rounded-xl shadow-2xl overflow-hidden my-8 transition-all`}>
        {/* Modal Toolbar (hidden when printing) */}
        <div className="no-print flex flex-col gap-2.5 px-6 py-4 border-b border-slate-200 bg-slate-50 font-sans">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Pratinjau & Cetak Dokumen Resmi SMA Surya Buana Malang</span>
                {hasMultiple && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">
                    <Users className="w-3 h-3" />
                    Kolektif ({participantStudents.length} Siswa)
                  </span>
                )}
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${isA5 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'}`}>
                  Ukuran {paperSize}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Format standar surat resmi Guru BK Muhammad Burhanudin Muzaqi, M.Psi. (Siap cetak kertas <strong>{paperSize}</strong> · {paperSize === 'A5' ? '148×210 mm (Buku / Setengah Folio)' : '210×297 mm (Standar Surat Dinas)'})
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Paper Size Selector: A4 vs A5 */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-300 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-600 px-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-800" />
                  Kertas:
                </span>
                <button
                  type="button"
                  onClick={() => handlePaperSizeChange('A4')}
                  className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer transition-all ${
                    paperSize === 'A4'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Ukuran Cetak A4 (210 x 297 mm) - Standar Surat Dinas Resmi Kemdikbud"
                >
                  A4 <span className="text-[10px] opacity-75 font-normal hidden sm:inline">(210×297)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePaperSizeChange('A5')}
                  className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer transition-all ${
                    paperSize === 'A5'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Ukuran Cetak A5 (148 x 210 mm) - Format Setengah Folio / Buku (Ringkas & Hemat Kertas)"
                >
                  A5 <span className="text-[10px] opacity-75 font-normal hidden sm:inline">(148×210)</span>
                </button>
              </div>

              {/* Toolbar Kontrol Kop Surat: Kop Gambar, Kop Teks, Kertas Berkop & Upload Gambar */}
              <LetterheadToolbarControls
                profile={profile}
                onUpdateProfile={onUpdateProfile}
                onOpenSettings={onOpenSettings}
              />

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Cetak / Simpan PDF ({paperSize})
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Manual Letter Number Toolbar Editor */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Nomor Surat Cetak:</span>
              {!isEditingNumber ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-300">
                    {activeNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditNumberInput(activeNumber);
                      setIsEditingNumber(true);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded cursor-pointer transition-colors"
                    title="Ubah atau koreksi nomor surat jika ada kesalahan"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Ganti / Koreksi Nomor</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={editNumberInput}
                    onChange={(e) => setEditNumberInput(e.target.value)}
                    className="font-mono font-bold text-xs px-2.5 py-1 border border-emerald-600 rounded bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 min-w-[220px]"
                    placeholder="Koreksi nomor surat..."
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveNumber}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-[11px] font-bold cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Simpan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingNumber(false)}
                    className="px-2 py-1 text-slate-500 hover:text-slate-700 text-[11px] cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>

            {hasMultiple && (
              <div className="text-[11px] text-slate-600 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-teal-700" />
                <span>
                  Mencakup <strong>{participantStudents.length} siswa</strong> dalam satu dokumen perizinan kolektif.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Printable Document Area */}
        <div className={`print-container ${isA5 ? 'p-5 sm:p-7 text-xs' : 'p-8 sm:p-12 text-sm leading-relaxed'} text-slate-900 bg-white font-serif transition-all`}>
          {/* Header Kop Surat Resmi SMA Surya Buana Malang */}
          <OfficialLetterhead profile={profile} paperSize={paperSize} />

          {/* ========================================================================= */}
          {/* FORMAT 0: SURAT IZIN DISPENSASI KEGIATAN ORGANISASI (/BK-SDO/)           */}
          {/* ========================================================================= */}
          {isType('BK-SDO') && (
            <div className="space-y-4 text-sm leading-relaxed">
              <div className="text-center my-4">
                <h2 className="text-base font-bold underline uppercase tracking-wide">
                  SURAT IZIN DISPENSASI KEGIATAN ORGANISASI
                </h2>
                <p className="text-xs font-medium font-mono tabular-nums mt-0.5">
                  No. Surat : {activeNumber}
                </p>
              </div>

              {/* Rujukan Surat Masuk dari Organisasi */}
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-sans space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-1 mb-1">
                  <span>Dasar Rujukan Permohonan Organisasi:</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <span className="text-slate-600 font-medium">Organisasi Pemohon</span>
                  <span className="col-span-3 font-semibold text-slate-900">: {letter.organizationName || 'Organisasi Siswa Intra Sekolah (OSIS)'}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <span className="text-slate-600 font-medium">Nomor Surat Masuk</span>
                  <span className="col-span-3 font-mono font-medium text-slate-900">: {letter.organizationLetterNumber || '-'}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <span className="text-slate-600 font-medium">Tanggal Surat Masuk</span>
                  <span className="col-span-3">: {formatDateIndonesian(letter.organizationLetterDate || letter.date)}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <span className="text-slate-600 font-medium">Perihal Permohonan</span>
                  <span className="col-span-3">: {letter.reason || 'Permohonan Izin Dispensasi Mengikuti Kegiatan Organisasi'}</span>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <p>Kepada Yth.</p>
                <p><strong>Bapak/Ibu Guru Mata Pelajaran & Wali Kelas</strong></p>
                <p>di Tempat</p>
              </div>

              <p className="text-justify pt-1">
                Dengan hormat,
                <br />
                Berdasarkan surat permohonan dispensasi resmi yang diajukan oleh pengurus/panitia <strong>{letter.organizationName || 'Organisasi Siswa'}</strong> sebagaimana tercantum di atas, pihak Bimbingan dan Konseling (BK) memberikan izin dispensasi kepada {hasMultiple ? 'para peserta didik berikut' : 'peserta didik berikut'} untuk meninggalkan Kegiatan Belajar Mengajar (KBM) sementara guna menjalankan tugas organisasi:
              </p>

              {/* Multi-student Participant Table or Single-Student Box */}
              {hasMultiple ? (
                <div className="space-y-2 py-1 font-sans text-xs">
                  <div className="font-semibold text-slate-800">
                    Daftar Peserta Didik ({participantStudents.length} Siswa):
                  </div>
                  <table className="w-full text-xs border-collapse border border-slate-900 text-left">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                        <th className="border border-slate-900 py-1.5 px-2 w-8">No</th>
                        <th className="border border-slate-900 py-1.5 px-3">Nama Lengkap Siswa</th>
                        <th className="border border-slate-900 py-1.5 px-2 w-28 text-center">Kelas</th>
                        <th className="border border-slate-900 py-1.5 px-3 w-32 text-center">NISN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participantStudents.map((st, idx) => (
                        <tr key={st.id} className="border-b border-slate-900">
                          <td className="border border-slate-900 py-1 px-2 text-center font-mono">{idx + 1}.</td>
                          <td className="border border-slate-900 py-1 px-3 font-semibold text-slate-900">{st.name}</td>
                          <td className="border border-slate-900 py-1 px-2 text-center font-medium">{st.className}</td>
                          <td className="border border-slate-900 py-1 px-3 text-center font-mono">{st.nisn || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Activity Details for Multi-Students */}
                  <div className="space-y-1 pl-4 py-2 bg-slate-50/60 rounded-md border border-slate-200/80">
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Hari / Tanggal Kegiatan</span>
                      <span className="col-span-3 font-semibold text-slate-900">: {formatDateIndonesian(letter.date)}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Nama Kegiatan</span>
                      <span className="col-span-3 font-medium">: {letter.reason || letter.destinationOrActivity}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Lokasi / Tempat</span>
                      <span className="col-span-3">: {letter.destinationOrActivity || letter.incidentPlace || 'Lingkungan SMA Surya Buana Malang'}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Waktu / Durasi</span>
                      <span className="col-span-3 font-mono tabular-nums">: Pukul {letter.departureTime || '08:00'} s.d. {letter.returnTime || '13:30'} WIB ({letter.activityDuration || 'Dispensasi KBM'})</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 pl-4 py-2 font-sans text-xs bg-slate-50/60 rounded-md border border-slate-200/80">
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Nama Siswa</span>
                    <span className="col-span-3 font-bold text-slate-950">: {student?.name || 'Siswa'}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">NISN / NIS</span>
                    <span className="col-span-3 font-mono">: {student?.nisn || '-'}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Kelas / Rombel</span>
                    <span className="col-span-3 font-semibold">: {student?.className || '-'}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Hari / Tanggal Kegiatan</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {formatDateIndonesian(letter.date)}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Nama Kegiatan</span>
                    <span className="col-span-3 font-medium">: {letter.reason || letter.destinationOrActivity}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Lokasi / Tempat</span>
                    <span className="col-span-3">: {letter.destinationOrActivity || letter.incidentPlace || 'Lingkungan SMA Surya Buana Malang'}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Waktu / Durasi</span>
                    <span className="col-span-3 font-mono tabular-nums">: Pukul {letter.departureTime || '08:00'} s.d. {letter.returnTime || '13:30'} WIB ({letter.activityDuration || 'Dispensasi KBM'})</span>
                  </div>
                </div>
              )}

              {/* Box Rombongan Peserta Tambahan jika ada */}
              {letter.participantList && letter.participantList.trim() && (
                <div className="p-3 border border-slate-300 rounded font-sans text-xs bg-slate-50/40">
                  <span className="font-bold text-slate-800 block mb-1">
                    Daftar Siswa / Anggota Delegasi Terkait (Kolektif):
                  </span>
                  <pre className="font-sans whitespace-pre-wrap text-[11px] text-slate-700 leading-relaxed">
                    {letter.participantList}
                  </pre>
                </div>
              )}

              {/* Ketentuan Komitmen Siswa Dispen */}
              <div className="text-[11px] text-slate-600 bg-emerald-50/50 p-2.5 rounded border border-emerald-200/60 font-sans space-y-0.5">
                <span className="font-bold text-emerald-950 block">Ketentuan bagi peserta didik yang bersangkutan:</span>
                <p>1. Wajib berkoordinasi dengan Guru Mata Pelajaran untuk menyusul materi/tugas yang ditinggalkan.</p>
                <p>2. Menjaga ketertiban, sopan santun, serta nama baik sekolah selama berkegiatan.</p>
                <p>3. Segera kembali ke kelas setelah kegiatan organisasi selesai.</p>
              </div>

              <p className="text-justify pt-1">
                Demikian surat izin dispensasi ini dibuat dan diberikan agar dapat dipergunakan sebagaimana mestinya. Atas perhatian, pengertian, dan kerja sama Bapak/Ibu Guru, kami mengucapkan terima kasih.
              </p>

              {/* Tanda Tangan: Pihak BK dan Ketua Panitia/Organisasi (Kesiswaan dan Jabatan Dihapus) */}
              <div className="grid grid-cols-2 gap-8 text-center text-xs pt-6 print-break-inside-avoid font-sans">
                <div>
                  <p className="text-slate-700">Ketua Panitia / Organisasi</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-slate-900">
                    ( {letter.orgLeaderName || '.............................................'} )
                  </p>
                </div>
                <div>
                  <p className="text-slate-700">{profile.regencyCity || 'Malang'}, {formatDateIndonesian(letter.date)}</p>
                  <p className="font-semibold text-slate-900">Guru Bimbingan Konseling</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-slate-900">
                    Muhammad Burhanudin Muzaqi, M.Psi.
                  </p>
                </div>
              </div>

              {/* Mengetahui Guru kelas Table */}
              <div className="pt-4 print-break-inside-avoid font-sans">
                <p className="text-xs font-bold text-slate-800 mb-2">
                  Mengetahui & Menyetujui Guru Mata Pelajaran yang Ditinggalkan:
                </p>
                <table className="w-full text-xs border-collapse border border-slate-900 text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-900 text-center">
                      <th className="border border-slate-900 py-1.5 px-2 w-10">No</th>
                      <th className="border border-slate-900 py-1.5 px-3">Mata Pelajaran</th>
                      <th className="border border-slate-900 py-1.5 px-3">Nama Guru</th>
                      <th className="border border-slate-900 py-1.5 px-3 w-32">Tanda Tangan / Paraf</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-900 h-8">
                        <td className="border border-slate-900 py-1 px-2 text-center font-mono">{idx + 1}.</td>
                        <td className="border border-slate-900 py-1 px-3">{row.subject}</td>
                        <td className="border border-slate-900 py-1 px-3">{row.teacherName}</td>
                        <td className="border border-slate-900 py-1 px-3"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FORMAT 1: SURAT PERIZINAN MENGIKUTI KEGIATAN (/BK-SPK/)                  */}
          {/* ========================================================================= */}
          {isType('BK-SPK') && (
            <div className="space-y-4 text-sm leading-relaxed">
              <div className="text-center my-4">
                <h2 className="text-base font-bold underline uppercase tracking-wide">
                  SURAT PERIZINAN MENGIKUTI KEGIATAN
                </h2>
                <p className="text-xs font-medium font-mono tabular-nums mt-0.5">
                  No. Surat : {activeNumber}
                </p>
              </div>

              <div className="space-y-1">
                <p>Kepada Yth.</p>
                <p><strong>Bapak/Ibu Guru Mata Pelajaran</strong></p>
                <p>di Tempat</p>
              </div>

              <p className="text-justify pt-2">
                Dengan hormat,
                <br />
                Sehubungan dengan pelaksanaan kegiatan sekolah/organisasi, Memohon izin kepada Bapak/Ibu Guru untuk memberikan izin kepada {hasMultiple ? 'siswa-siswi berikut' : 'siswa berikut'} agar dapat meninggalkan kegiatan pembelajaran sementara.
              </p>

              {hasMultiple ? (
                <div className="space-y-2 py-1 font-sans text-xs">
                  <div className="font-semibold text-slate-800">
                    Daftar Peserta Didik ({participantStudents.length} Siswa):
                  </div>
                  <table className="w-full text-xs border-collapse border border-slate-900 text-left">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                        <th className="border border-slate-900 py-1 px-2 w-8">No</th>
                        <th className="border border-slate-900 py-1 px-3">Nama Lengkap Siswa</th>
                        <th className="border border-slate-900 py-1 px-2 w-24 text-center">Kelas</th>
                        <th className="border border-slate-900 py-1 px-3 w-28 text-center">NISN</th>
                        <th className="border border-slate-900 py-1 px-3">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participantStudents.map((st, idx) => (
                        <tr key={st.id} className="border-b border-slate-900">
                          <td className="border border-slate-900 py-1 px-2 text-center font-mono">{idx + 1}.</td>
                          <td className="border border-slate-900 py-1 px-3 font-semibold text-slate-900">{st.name}</td>
                          <td className="border border-slate-900 py-1 px-2 text-center font-medium">{st.className}</td>
                          <td className="border border-slate-900 py-1 px-3 text-center font-mono">{st.nisn || '-'}</td>
                          <td className="border border-slate-900 py-1 px-3 text-slate-700">Peserta Kegiatan</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="space-y-1 pl-4 py-2 bg-slate-50/60 rounded-md border border-slate-200/80">
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Nama Kegiatan/Keperluan</span>
                      <span className="col-span-3 font-medium">: {letter.reason || letter.destinationOrActivity}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Hari/Tanggal</span>
                      <span className="col-span-3">: {formatDateIndonesian(letter.date)}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Waktu Kegiatan</span>
                      <span className="col-span-3 font-mono tabular-nums">: Pukul {letter.departureTime || '..........'} WIB s.d. {letter.returnTime || '..........'} WIB</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 pl-4 py-2 font-sans text-xs">
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Nama</span>
                    <span className="col-span-3 font-bold text-slate-950">: {student?.name || 'Siswa'}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Kelas</span>
                    <span className="col-span-3 font-semibold">: {student?.className || '-'}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Nama Kegiatan/Keperluan</span>
                    <span className="col-span-3">: {letter.reason || letter.destinationOrActivity}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Hari/Tanggal</span>
                    <span className="col-span-3">: {formatDateIndonesian(letter.date)}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Waktu Kegiatan</span>
                    <span className="col-span-3 font-mono tabular-nums">: Pukul {letter.departureTime || '..........'} WIB s.d. {letter.returnTime || '..........'} WIB</span>
                  </div>
                </div>
              )}

              <p className="text-justify">
                Demikian surat perizinan ini disampaikan. Atas perhatian, pengertian, dan kerja sama Bapak/Ibu Guru, kami ucapkan terima kasih.
              </p>

              {/* Tanda Tangan Pembina & Guru BK */}
              <div className="grid grid-cols-2 gap-8 text-center text-xs pt-6 print-break-inside-avoid font-sans">
                <div>
                  <p className="text-slate-700">Guru Pembina/Penanggung Jawab</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-slate-900">
                    ( {letter.eventOrganizerOrTeacher || '.............................................'} )
                  </p>
                </div>
                <div>
                  <p className="text-slate-700">Malang, {formatDateIndonesian(letter.date)}</p>
                  <p className="font-semibold text-slate-900">Guru BK</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-slate-900">
                    Muhammad Burhanudin Muzaqi.M.Psi
                  </p>
                </div>
              </div>

              {/* Mengetahui Guru kelas Table */}
              <div className="pt-4 print-break-inside-avoid font-sans">
                <p className="text-xs font-bold text-slate-800 mb-2">Mengetahui Guru kelas ,</p>
                <table className="w-full text-xs border-collapse border border-slate-900 text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-900 text-center">
                      <th className="border border-slate-900 py-1.5 px-2 w-10">No</th>
                      <th className="border border-slate-900 py-1.5 px-3">Mata Pelajaran</th>
                      <th className="border border-slate-900 py-1.5 px-3">Nama Guru</th>
                      <th className="border border-slate-900 py-1.5 px-3 w-32">Tanda Tangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-900 h-8">
                        <td className="border border-slate-900 py-1 px-2 text-center font-mono">{idx + 1}.</td>
                        <td className="border border-slate-900 py-1 px-3">{row.subject}</td>
                        <td className="border border-slate-900 py-1 px-3">{row.teacherName}</td>
                        <td className="border border-slate-900 py-1 px-3"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FORMAT 2: SURAT IZIN MENINGGALKAN KBM (/BK-SIK/)                         */}
          {/* ========================================================================= */}
          {isType('BK-SIK') && (
            <div className="space-y-4 text-sm leading-relaxed">
              <div className="text-center my-4">
                <h2 className="text-base font-bold underline uppercase tracking-wide">
                  SURAT IZIN MENINGGALKAN KBM
                </h2>
                <p className="text-xs font-medium font-mono tabular-nums mt-0.5">
                  No. Surat : {activeNumber}
                </p>
              </div>

              <div className="space-y-1">
                <p>Kepada Yth.</p>
                <p><strong>Bapak/Ibu Guru Mata Pelajaran</strong></p>
                <p>di Tempat</p>
              </div>

              <p className="text-justify pt-2">
                Dengan hormat,
                <br />
                Mohon izin kepada Bapak/Ibu Guru agar {hasMultiple ? 'siswa-siswi berikut' : 'siswa berikut'} diberikan izin untuk meninggalkan kegiatan belajar mengajar (KBM) sementara dengan keterangan sebagai berikut:
              </p>

              {hasMultiple ? (
                <div className="space-y-2 py-1 font-sans text-xs">
                  <div className="font-semibold text-slate-800">
                    Daftar Peserta Didik ({participantStudents.length} Siswa):
                  </div>
                  <table className="w-full text-xs border-collapse border border-slate-900 text-left">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                        <th className="border border-slate-900 py-1 px-2 w-8">No</th>
                        <th className="border border-slate-900 py-1 px-3">Nama Lengkap Siswa</th>
                        <th className="border border-slate-900 py-1 px-2 w-24 text-center">Kelas</th>
                        <th className="border border-slate-900 py-1 px-3 w-28 text-center">NISN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participantStudents.map((st, idx) => (
                        <tr key={st.id} className="border-b border-slate-900">
                          <td className="border border-slate-900 py-1 px-2 text-center font-mono">{idx + 1}.</td>
                          <td className="border border-slate-900 py-1 px-3 font-semibold text-slate-900">{st.name}</td>
                          <td className="border border-slate-900 py-1 px-2 text-center font-medium">{st.className}</td>
                          <td className="border border-slate-900 py-1 px-3 text-center font-mono">{st.nisn || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="space-y-1 pl-4 py-2 bg-slate-50/60 rounded-md border border-slate-200/80">
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Hari / Tanggal Izin</span>
                      <span className="col-span-3 font-semibold text-slate-900">: {formatDateIndonesian(letter.date)}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Keperluan</span>
                      <span className="col-span-3">: {letter.reason}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Tujuan</span>
                      <span className="col-span-3">: {letter.destinationOrActivity}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Waktu Izin</span>
                      <span className="col-span-3 font-mono tabular-nums">: Pukul {letter.departureTime || '..........'} WIB s.d. {letter.returnTime || '..........'} WIB</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 pl-4 py-2 font-sans text-xs">
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Nama</span>
                    <span className="col-span-3 font-bold text-slate-950">: {student?.name || 'Siswa'}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Kelas</span>
                    <span className="col-span-3 font-semibold">: {student?.className || '-'}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Hari / Tanggal Izin</span>
                    <span className="col-span-3 font-semibold text-slate-900">: {formatDateIndonesian(letter.date)}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Keperluan</span>
                    <span className="col-span-3">: {letter.reason}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Tujuan</span>
                    <span className="col-span-3">: {letter.destinationOrActivity}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Waktu Izin</span>
                    <span className="col-span-3 font-mono tabular-nums">: Pukul {letter.departureTime || '..........'} WIB s.d. {letter.returnTime || '..........'} WIB</span>
                  </div>
                </div>
              )}

              <p className="text-justify">
                Demikian surat perizinan ini dibuat untuk dapat dipergunakan sebagaimana mestinya. Atas perhatian, pengertian, dan kerja sama Bapak/Ibu Guru, kami mengucapkan terima kasih.
              </p>

              {/* Tanda Tangan Piket & Guru BK */}
              <div className="grid grid-cols-2 gap-8 text-center text-xs pt-6 print-break-inside-avoid font-sans">
                <div>
                  <p className="text-slate-700">Guru Piket</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-slate-900">
                    ( {letter.schoolPicketTeacher || '.............................................'} )
                  </p>
                </div>
                <div>
                  <p className="text-slate-700">Malang, {formatDateIndonesian(letter.date)}</p>
                  <p className="font-semibold text-slate-900">Guru BK</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-slate-900">
                    Muhammad Burhanudin Muzaqi.M.Psi
                  </p>
                </div>
              </div>

              {/* Mengetahui Guru kelas Table */}
              <div className="pt-4 print-break-inside-avoid font-sans">
                <p className="text-xs font-bold text-slate-800 mb-2">Mengetahui Guru kelas ,</p>
                <table className="w-full text-xs border-collapse border border-slate-900 text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-900 text-center">
                      <th className="border border-slate-900 py-1.5 px-2 w-10">No</th>
                      <th className="border border-slate-900 py-1.5 px-3">Mata Pelajaran</th>
                      <th className="border border-slate-900 py-1.5 px-3">Nama Guru</th>
                      <th className="border border-slate-900 py-1.5 px-3 w-32">Tanda Tangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-900 h-8">
                        <td className="border border-slate-900 py-1 px-2 text-center font-mono">{idx + 1}.</td>
                        <td className="border border-slate-900 py-1 px-3">{row.subject}</td>
                        <td className="border border-slate-900 py-1 px-3">{row.teacherName}</td>
                        <td className="border border-slate-900 py-1 px-3"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FORMAT 3: SURAT IZIN KEPERLUAN DI LUAR SEKOLAH (/BK-SLS/)                */}
          {/* ========================================================================= */}
          {isType('BK-SLS') && (
            <div className="space-y-5 text-sm leading-relaxed">
              <div className="text-center my-4">
                <h2 className="text-base font-bold underline uppercase tracking-wide">
                  SURAT IZIN KEPERLUAN DI LUAR SEKOLAH
                </h2>
                <p className="text-xs font-medium font-mono tabular-nums mt-0.5">
                  No. Surat : {activeNumber}
                </p>
              </div>

              {hasMultiple ? (
                <div className="space-y-2 py-1 font-sans text-xs">
                  <div className="font-semibold text-slate-800">
                    Daftar Peserta Didik ({participantStudents.length} Siswa):
                  </div>
                  <table className="w-full text-xs border-collapse border border-slate-900 text-left">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                        <th className="border border-slate-900 py-1 px-2 w-8">No</th>
                        <th className="border border-slate-900 py-1 px-3">Nama Lengkap Siswa</th>
                        <th className="border border-slate-900 py-1 px-2 w-24 text-center">Kelas</th>
                        <th className="border border-slate-900 py-1 px-3 w-28 text-center">NISN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participantStudents.map((st, idx) => (
                        <tr key={st.id} className="border-b border-slate-900">
                          <td className="border border-slate-900 py-1 px-2 text-center font-mono">{idx + 1}.</td>
                          <td className="border border-slate-900 py-1 px-3 font-semibold text-slate-900">{st.name}</td>
                          <td className="border border-slate-900 py-1 px-2 text-center font-medium">{st.className}</td>
                          <td className="border border-slate-900 py-1 px-3 text-center font-mono">{st.nisn || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="space-y-1 pl-4 py-2 bg-slate-50/60 rounded-md border border-slate-200/80">
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Hari/Tanggal</span>
                      <span className="col-span-3">: {formatDateIndonesian(letter.date)}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Keperluan</span>
                      <span className="col-span-3">: {letter.reason}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Tujuan</span>
                      <span className="col-span-3">: {letter.destinationOrActivity}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Jam Keluar</span>
                      <span className="col-span-3 font-mono tabular-nums">: {letter.departureTime || '...............'} WIB</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Perkiraan Kembali</span>
                      <span className="col-span-3 font-mono tabular-nums">: {letter.returnTime || '...............'} WIB</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pl-4 py-2 font-sans text-xs">
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Nama</span>
                    <span className="col-span-3 font-bold text-slate-950">: {student?.name || 'Siswa'}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Kelas</span>
                    <span className="col-span-3 font-semibold">: {student?.className || '-'}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Hari/Tanggal</span>
                    <span className="col-span-3">: {formatDateIndonesian(letter.date)}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Keperluan</span>
                    <span className="col-span-3">: {letter.reason}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Tujuan</span>
                    <span className="col-span-3">: {letter.destinationOrActivity}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Jam Keluar</span>
                    <span className="col-span-3 font-mono tabular-nums">: {letter.departureTime || '...............'} WIB</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Perkiraan Kembali</span>
                    <span className="col-span-3 font-mono tabular-nums">: {letter.returnTime || '...............'} WIB</span>
                  </div>
                </div>
              )}

              {/* Tanda Tangan 3 Kolom: Piket, Guru BK, Waka Kesiswaan */}
              <div className="pt-10 print-break-inside-avoid font-sans">
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                  <div>
                    <p className="text-slate-600">Mengetahui</p>
                    <p className="font-semibold text-slate-900">Guru Piket</p>
                    <div className="h-20"></div>
                    <p className="font-bold underline text-slate-900">
                      ( {letter.schoolPicketTeacher || '………………………'} )
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Guru BK</p>
                    <div className="h-20"></div>
                    <p className="font-bold underline text-slate-900">
                      M.Burhanudin Muzaqi.M.Psi
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Waka Kesiswaan</p>
                    <div className="h-20"></div>
                    <p className="font-bold underline text-slate-900">
                      {letter.wakaKesiswaanName || 'Ilmi Muhadiatil Izza S.Pd'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FORMAT 4: SURAT PERIZINAN LAYANAN BIMBINGAN DAN KONSELING (/BK-SLB/)     */}
          {/* ========================================================================= */}
          {isType('BK-SLB') && (
            <div className="space-y-4 text-sm leading-relaxed">
              <div className="text-center my-4">
                <h2 className="text-base font-bold underline uppercase tracking-wide">
                  SURAT PERIZINAN LAYANAN BIMBINGAN DAN KONSELING (BK)
                </h2>
                <p className="text-xs font-medium font-mono tabular-nums mt-0.5">
                  No. Surat : {activeNumber}
                </p>
              </div>

              <div className="space-y-1">
                <p>Kepada Yth.</p>
                <p><strong>Bapak/Ibu Guru Mata Pelajaran</strong></p>
                <p>di Tempat</p>
              </div>

              <p className="text-justify pt-2">
                Dengan hormat,
                <br />
                Sehubungan dengan pelaksanaan layanan Bimbingan dan Konseling (BK), kami memohon izin kepada Bapak/Ibu Guru agar {hasMultiple ? 'siswa-siswi berikut' : 'siswa berikut'} diberikan izin untuk meninggalkan kegiatan belajar mengajar (KBM) sementara guna mengikuti layanan BK.
              </p>

              {hasMultiple ? (
                <div className="space-y-2 py-1 font-sans text-xs">
                  <div className="font-semibold text-slate-800">
                    Daftar Siswa Peserta Layanan BK ({participantStudents.length} Siswa):
                  </div>
                  <table className="w-full text-xs border-collapse border border-slate-900 text-left">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                        <th className="border border-slate-900 py-1 px-2 w-8">No</th>
                        <th className="border border-slate-900 py-1 px-3">Nama Lengkap Siswa</th>
                        <th className="border border-slate-900 py-1 px-2 w-24 text-center">Kelas</th>
                        <th className="border border-slate-900 py-1 px-3 w-28 text-center">NISN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participantStudents.map((st, idx) => (
                        <tr key={st.id} className="border-b border-slate-900">
                          <td className="border border-slate-900 py-1 px-2 text-center font-mono">{idx + 1}.</td>
                          <td className="border border-slate-900 py-1 px-3 font-semibold text-slate-900">{st.name}</td>
                          <td className="border border-slate-900 py-1 px-2 text-center font-medium">{st.className}</td>
                          <td className="border border-slate-900 py-1 px-3 text-center font-mono">{st.nisn || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="space-y-2 pl-4 py-2 bg-slate-50/60 rounded-md border border-slate-200/80">
                    <div className="grid grid-cols-4 items-start">
                      <span className="text-slate-600 font-medium">Jenis Layanan</span>
                      <div className="col-span-3 grid grid-cols-2 gap-x-4 gap-y-1">
                        {serviceOptions.map((opt) => (
                          <div key={opt} className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 border border-slate-900 inline-flex items-center justify-center text-[10px] font-bold">
                              {letter.serviceTypeChoice === opt ? '✓' : ''}
                            </span>
                            <span className="text-slate-800">{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 pt-1">
                      <span className="text-slate-600 font-medium">Hari/Tanggal</span>
                      <span className="col-span-3">: {formatDateIndonesian(letter.date)}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600 font-medium">Waktu</span>
                      <span className="col-span-3 font-mono tabular-nums">: Pukul {letter.departureTime || '...............'} WIB s.d. {letter.returnTime || '...............'} WIB</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pl-4 py-2 font-sans text-xs">
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Nama</span>
                    <span className="col-span-3 font-bold text-slate-950">: {student?.name || 'Siswa'}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Kelas</span>
                    <span className="col-span-3 font-semibold">: {student?.className || '-'}</span>
                  </div>
                  <div className="grid grid-cols-4 items-start">
                    <span className="text-slate-600 font-medium">Jenis Layanan</span>
                    <div className="col-span-3 grid grid-cols-2 gap-x-4 gap-y-1">
                      {serviceOptions.map((opt) => (
                        <div key={opt} className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border border-slate-900 inline-flex items-center justify-center text-[10px] font-bold">
                            {letter.serviceTypeChoice === opt ? '✓' : ''}
                          </span>
                          <span className="text-slate-800">{opt}</span>
                        </div>
                      ))}
                      <div className="col-span-2 flex items-center gap-1.5 mt-0.5">
                        <span className="w-3.5 h-3.5 border border-slate-900 inline-flex items-center justify-center text-[10px] font-bold">
                          {letter.serviceTypeChoice === 'Lainnya' ? '✓' : ''}
                        </span>
                        <span>Lainnya : <u>{letter.otherServiceText || '_________'}</u></span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 pt-1">
                    <span className="text-slate-600 font-medium">Hari/Tanggal</span>
                    <span className="col-span-3">: {formatDateIndonesian(letter.date)}</span>
                  </div>
                  <div className="grid grid-cols-4">
                    <span className="text-slate-600 font-medium">Waktu</span>
                    <span className="col-span-3 font-mono tabular-nums">: Pukul {letter.departureTime || '...............'} WIB s.d. {letter.returnTime || '...............'} WIB</span>
                  </div>
                </div>
              )}

              <p className="text-justify">
                Demikian surat perizinan ini disampaikan. Atas perhatian, pengertian, dan kerja sama Bapak/Ibu Guru, kami mengucapkan terima kasih.
              </p>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-2 gap-8 text-center text-xs pt-6 print-break-inside-avoid font-sans">
                <div>
                  <p className="text-slate-700">Guru Piket</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-slate-900">
                    ( {letter.schoolPicketTeacher || '.............................................'} )
                  </p>
                </div>
                <div>
                  <p className="text-slate-700">Malang, {formatDateIndonesian(letter.date)}</p>
                  <p className="font-semibold text-slate-900">Guru BK</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-slate-900">
                    Muhammad Burhanudin Muzaqi.M.Psi
                  </p>
                </div>
              </div>

              {/* Mengetahui Guru kelas Table */}
              <div className="pt-4 print-break-inside-avoid font-sans">
                <p className="text-xs font-bold text-slate-800 mb-2">Mengetahui Guru kelas,</p>
                <table className="w-full text-xs border-collapse border border-slate-900 text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-900 text-center">
                      <th className="border border-slate-900 py-1.5 px-2 w-10">No</th>
                      <th className="border border-slate-900 py-1.5 px-3">Mata Pelajaran</th>
                      <th className="border border-slate-900 py-1.5 px-3">Nama Guru</th>
                      <th className="border border-slate-900 py-1.5 px-3 w-32">Tanda Tangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherRows.slice(0, 3).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-900 h-8">
                        <td className="border border-slate-900 py-1 px-2 text-center font-mono">{idx + 1}.</td>
                        <td className="border border-slate-900 py-1 px-3">{row.subject}</td>
                        <td className="border border-slate-900 py-1 px-3">{row.teacherName}</td>
                        <td className="border border-slate-900 py-1 px-3"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FORMAT 5: SURAT PERNYATAAN DAN KOMITMEN SISWA (/BK-SPKS/)                */}
          {/* ========================================================================= */}
          {isType('BK-SPKS') && (
            <div className="space-y-4 text-sm leading-relaxed">
              <div className="text-center my-3">
                <h2 className="text-sm font-bold uppercase tracking-wide">
                  SURAT PERNYATAAN DAN KOMITMEN SISWA
                </h2>
                <h3 className="text-sm font-bold uppercase tracking-wide">
                  PELANGGARAN KEGIATAN SISWA
                </h3>
                <h4 className="text-xs font-bold uppercase tracking-wide">
                  SMA SURYA BUANA KOTA MALANG
                </h4>
                <p className="text-xs font-semibold">
                  TAHUN PELAJARAN {profile.academicYear || '2026–2027'}
                </p>
                <p className="text-xs font-medium font-mono tabular-nums mt-1">
                  No. Surat : {activeNumber}
                </p>
              </div>

              {/* A. IDENTITAS SISWA */}
              <div className="space-y-1">
                <h4 className="font-bold text-xs">A. IDENTITAS SISWA</h4>
                {hasMultiple ? (
                  <div className="py-1 font-sans text-xs">
                    <table className="w-full text-xs border-collapse border border-slate-900 text-left">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
                          <th className="border border-slate-900 py-1 px-2 w-8">No</th>
                          <th className="border border-slate-900 py-1 px-3">Nama Lengkap Siswa</th>
                          <th className="border border-slate-900 py-1 px-2 w-24 text-center">Kelas</th>
                          <th className="border border-slate-900 py-1 px-3 w-28 text-center">NISN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participantStudents.map((st, idx) => (
                          <tr key={st.id} className="border-b border-slate-900">
                            <td className="border border-slate-900 py-1 px-2 text-center font-mono">{idx + 1}.</td>
                            <td className="border border-slate-900 py-1 px-3 font-semibold text-slate-900">{st.name}</td>
                            <td className="border border-slate-900 py-1 px-2 text-center font-medium">{st.className}</td>
                            <td className="border border-slate-900 py-1 px-3 text-center font-mono">{st.nisn || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="grid grid-cols-4 pt-2 pl-2">
                      <span className="text-slate-600">Hari / tanggal</span>
                      <span className="col-span-3">: {formatDateIndonesian(letter.date)}</span>
                    </div>
                    <div className="grid grid-cols-4 pl-2">
                      <span className="text-slate-600">Tempat Kejadian</span>
                      <span className="col-span-3">: {letter.incidentPlace || 'Lingkungan SMA Surya Buana Malang'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="pl-4 space-y-1 font-sans text-xs">
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600">Nama</span>
                      <span className="col-span-3 font-bold">: {student?.name || 'Siswa'}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600">Kelas</span>
                      <span className="col-span-3 font-semibold">: {student?.className || '-'}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600">Hari / tanggal</span>
                      <span className="col-span-3">: {formatDateIndonesian(letter.date)}</span>
                    </div>
                    <div className="grid grid-cols-4">
                      <span className="text-slate-600">Tempat</span>
                      <span className="col-span-3">: {letter.incidentPlace || 'Lingkungan SMA Surya Buana Malang'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* B. DESKRIPSI KEJADIAN */}
              <div className="space-y-1">
                <h4 className="font-bold text-xs">B. DESKRIPSI KEJADIAN</h4>
                <p className="text-[11px] text-slate-500 italic pl-4">
                  (secara jujur kronologi kejadian, alasan pelanggaran serta hal-hal yang melatar belakangi kejadian tersebut).
                </p>
                <div className="p-3 border border-slate-300 rounded font-sans text-xs leading-relaxed text-justify bg-slate-50/50">
                  {letter.incidentDescription || letter.reason || '....................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................'}
                </div>
              </div>

              {/* C. SURAT PERNYATAAN DAN KOMITMEN */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-xs">C. SURAT PERNYATAAN DAN KOMITMEN</h4>
                <p className="text-justify text-xs">
                  {hasMultiple ? 'Kami yang bertanda tangan di bawah ini menyatakan bahwa:' : 'Saya yang bertanda tangan di bawah ini menyatakan bahwa:'}
                </p>
                <ol className="list-decimal pl-5 text-xs space-y-1 text-justify">
                  <li>
                    {hasMultiple ? 'Kami mengakui' : 'Saya mengakui'} telah meninggalkan kegiatan {letter.destinationOrActivity || 'Ekstrakurikuler Pramuka'} tanpa sepengetahuan atau izin dari Guru Pembina maupun Pelatih {letter.destinationOrActivity || 'Pramuka'}.
                  </li>
                  <li>
                    {hasMultiple ? 'Kami menyadari' : 'Saya menyadari'} bahwa tindakan tersebut merupakan pelanggaran terhadap tata tertib sekolah dan tata tertib kegiatan {letter.destinationOrActivity || 'Ekstrakurikuler Pramuka'} serta dapat membahayakan keselamatan diri kami.
                  </li>
                  <li>
                    {hasMultiple ? 'Kami menyesali' : 'Saya menyesali'} perbuatan tersebut dan berjanji untuk tidak mengulanginya kembali.
                  </li>
                  <li>
                    {hasMultiple ? 'Kami bersedia' : 'Saya bersedia'} mengikuti seluruh ketentuan, arahan, serta pembinaan yang diberikan oleh Guru BK, Guru Pembina {letter.destinationOrActivity || 'Pramuka'}, Pelatih {letter.destinationOrActivity || 'Pramuka'}, dan pihak sekolah.
                  </li>
                  <li>
                    Apabila {hasMultiple ? 'kami' : 'saya'} kembali melakukan pelanggaran yang sama, yaitu meninggalkan atau kabur dari kegiatan {letter.destinationOrActivity || 'Ekstrakurikuler Pramuka'} ataupun Ekstrakurikuler lain tanpa izin, {hasMultiple ? 'kami bersedia' : 'saya bersedia'} menerima tindak lanjut dan pembinaan sesuai dengan tata tertib serta kebijakan sekolah.
                  </li>
                </ol>
                <p className="text-justify text-xs pt-1">
                  Demikian surat pernyataan dan komitmen ini {hasMultiple ? 'kami buat' : 'saya buat'} dengan sebenar-benarnya, dalam keadaan sadar, tanpa paksaan dari pihak mana pun, sebagai bentuk tanggung jawab atas tindakan yang telah dilakukan.
                </p>
              </div>

              {/* D. PENGESAHAN */}
              <div className="pt-4 space-y-4 print-break-inside-avoid font-sans">
                <h4 className="font-bold text-xs">D. PENGESAHAN</h4>

                {/* Siswa & Pelatih */}
                <div className="grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <p className="text-slate-600">Yang membuat Pernyataan</p>
                    <p className="text-slate-500 text-[11px]">Malang, {formatDateIndonesian(letter.date)}</p>
                    <p className="text-slate-600 text-[11px]">{hasMultiple ? 'Tanda tangan perwakilan siswa' : 'Tanda tangan siswa'}</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-slate-900">
                      ( {hasMultiple ? `${participantStudents[0]?.name} dkk.` : (student?.name || '………………..……….')} )
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Mengetahui</p>
                    <p className="text-slate-500 text-[11px]">Malang, {formatDateIndonesian(letter.date)}</p>
                    <p className="font-semibold text-slate-900">{letter.coachRole || 'Pelatih Pramuka'}</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-slate-900">
                      {letter.coachName || 'Mohammad Khoirul Anam'}
                    </p>
                  </div>
                </div>

                {/* Pembina & Guru BK */}
                <div className="grid grid-cols-2 gap-8 text-center text-xs pt-2">
                  <div>
                    <p className="text-slate-600">Mengetahui</p>
                    <p className="text-slate-500 text-[11px]">Malang, {formatDateIndonesian(letter.date)}</p>
                    <p className="font-semibold text-slate-900">{letter.advisorRole || 'Guru Pembina Pramuka'}</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-slate-900">
                      {letter.advisorName || 'Nabilah Arrahmah, M.Pd'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Pembimbing</p>
                    <p className="text-slate-500 text-[11px]">Malang, {formatDateIndonesian(letter.date)}</p>
                    <p className="font-semibold text-slate-900">Bimbingan dan konseling</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-slate-900">
                      Muhammad Burhanudin Muzaqi.M.Psi
                    </p>
                  </div>
                </div>

                {/* Waka Kesiswaan */}
                <div className="text-center text-xs pt-2">
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-bold text-slate-900">Waka kesiswaan</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-slate-900">
                    {letter.wakaKesiswaanName || 'Ilmi Muhadiatil Izza S.Pd'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FORMAT 6: SURAT PANGGILAN ORANG TUA / WALI MURID (/BK-SPO/)              */}
          {/* ========================================================================= */}
          {isType('BK-SPO') && (
            <div className="space-y-4 text-sm leading-relaxed">
              <div className="text-center my-4">
                <h2 className="text-base font-bold underline uppercase tracking-wide">
                  SURAT PANGGILAN ORANG TUA / WALI MURID
                </h2>
                <p className="text-xs font-medium font-mono tabular-nums mt-0.5">
                  No. Surat : {activeNumber}
                </p>
              </div>

              <div className="space-y-1">
                <p>Kepada Yth.</p>
                <p>
                  <strong>
                    Orang Tua / Wali Murid dari ananda:{' '}
                    {hasMultiple
                      ? participantStudents.map((s) => s.name).join(', ')
                      : (student?.name || 'Siswa')}
                  </strong>
                </p>
                <p>Di Tempat</p>
              </div>

              <p className="text-justify pt-2">
                Dengan hormat,
                <br />
                Sehubungan dengan perlunya koordinasi dan konsultasi bersama mengenai perkembangan belajar, kedisiplinan, serta pembinaan ananda di sekolah, maka melalui surat ini kami mengharap kehadiran Bapak/Ibu/Wali murid pada:
              </p>

              <div className="bg-slate-50 p-4 border border-slate-200 rounded-md my-2 text-xs space-y-2 font-sans">
                {hasMultiple && (
                  <div className="grid grid-cols-3 border-b border-slate-200 pb-2 mb-2">
                    <span className="text-slate-600 font-medium">Daftar Siswa Binaan</span>
                    <span className="col-span-2 font-semibold text-slate-900">
                      {participantStudents.map((s) => `${s.name} (${s.className})`).join(' · ')}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-3">
                  <span className="text-slate-600 font-medium">Hari / Tanggal</span>
                  <span className="col-span-2 font-semibold text-slate-900">: {formatDateIndonesian(letter.parentAppointmentDate || letter.date)}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-600 font-medium">Waktu</span>
                  <span className="col-span-2 font-semibold text-slate-900">: {letter.parentAppointmentTime || '09:00 WIB'} s.d. Selesai</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-600 font-medium">Tempat</span>
                  <span className="col-span-2 font-semibold text-slate-900">: {letter.parentAppointmentRoom || profile.counselingRoomName}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-600 font-medium">Menemui</span>
                  <span className="col-span-2 font-semibold text-slate-900">: Guru BK (Muhammad Burhanudin Muzaqi.M.Psi) & Wali Kelas</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-600 font-medium">Keperluan</span>
                  <span className="col-span-2 font-semibold text-slate-900">: {letter.reason}</span>
                </div>
              </div>

              <p className="text-justify">
                Mengingat pentingnya hal tersebut demi kebaikan dan masa depan ananda tercinta, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktu yang telah ditentukan. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.
              </p>

              {/* Tanda tangan Pengesahan Panggilan Ortu */}
              <div className="grid grid-cols-3 gap-6 text-center text-xs pt-6 print-break-inside-avoid font-sans">
                <div>
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-semibold text-slate-900">Wali Kelas</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-slate-900">
                    {student?.homeroomTeacher || '.............................'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Guru Bimbingan Konseling,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-slate-900">
                    Muhammad Burhanudin Muzaqi.M.Psi
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-semibold text-slate-900">Waka Kesiswaan</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-slate-900">
                    {letter.wakaKesiswaanName || 'Ilmi Muhadiatil Izza S.Pd'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Validation / Security Footer note */}
          <div className="mt-8 pt-3 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between items-center font-sans">
            <span>SIM BK Pro · SMA Surya Buana Malang</span>
            <span className="font-mono tabular-nums">Nomor: {activeNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
