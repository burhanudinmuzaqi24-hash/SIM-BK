import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  Users,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  Clock,
  ArrowDownToLine,
  FileText,
  Building,
  FileCheck,
  Layers,
} from 'lucide-react';
import {
  Student,
  AttendanceRecord,
  ProblemRecord,
  CounselingRecord,
  PermissionLetter,
  SchoolProfile,
} from '../types';
import { formatDateIndonesian } from '../utils/storage';
import { OfficialLetterhead } from '../components/OfficialLetterhead';
import { LetterheadToolbarControls } from '../components/LetterheadToolbarControls';

interface ReportsViewProps {
  students: Student[];
  problems: ProblemRecord[];
  counseling: CounselingRecord[];
  attendance: AttendanceRecord[];
  letters: PermissionLetter[];
  profile: SchoolProfile;
  onSelectStudent?: (student: Student) => void;
  onUpdateProfile?: (updated: Partial<SchoolProfile>) => void;
  onOpenSettings?: () => void;
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  problems,
  counseling,
  attendance,
  letters,
  profile,
  onSelectStudent,
  onUpdateProfile,
  onOpenSettings,
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-indexed
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const classList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.className));
    return Array.from(set).sort();
  }, [students]);

  // Year choices (current, -1, +1)
  const availableYears = [selectedYear - 1, selectedYear, selectedYear + 1];

  // Helper to check if a date string falls in selected month and year
  const isMatchMonthYear = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  };

  // Filtered dataset for the month
  const monthlyProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchMonth = isMatchMonthYear(p.incidentDate) || isMatchMonthYear(p.reportDate);
      const student = students.find((s) => s.id === p.studentId);
      const matchClass = selectedClass === 'all' || student?.className === selectedClass;
      const matchDomain = selectedDomain === 'all' || p.guidanceDomain === selectedDomain;
      return matchMonth && matchClass && matchDomain;
    });
  }, [problems, students, selectedYear, selectedMonth, selectedClass, selectedDomain]);

  const monthlyCounseling = useMemo(() => {
    return counseling.filter((c) => {
      const matchMonth = isMatchMonthYear(c.date);
      const student = students.find((s) => s.id === c.studentId);
      const matchClass = selectedClass === 'all' || student?.className === selectedClass;
      return matchMonth && matchClass;
    });
  }, [counseling, students, selectedYear, selectedMonth, selectedClass]);

  const monthlyAttendance = useMemo(() => {
    return attendance.filter((a) => {
      const matchMonth = isMatchMonthYear(a.date);
      const student = students.find((s) => s.id === a.studentId);
      const matchClass = selectedClass === 'all' || student?.className === selectedClass;
      return matchMonth && matchClass;
    });
  }, [attendance, students, selectedYear, selectedMonth, selectedClass]);

  const monthlyLetters = useMemo(() => {
    return letters.filter((l) => {
      const matchMonth = isMatchMonthYear(l.date);
      const student = students.find((s) => s.id === l.studentId);
      const matchClass = selectedClass === 'all' || student?.className === selectedClass;
      return matchMonth && matchClass;
    });
  }, [letters, students, selectedYear, selectedMonth, selectedClass]);

  // Statistical calculations
  const stats = useMemo(() => {
    const totalProblems = monthlyProblems.length;
    const solved = monthlyProblems.filter((p) => p.status === 'Terselesaikan').length;
    const inProgress = monthlyProblems.filter((p) => p.status === 'Proses Bimbingan').length;
    const waiting = monthlyProblems.filter((p) => p.status === 'Menunggu').length;
    const referral = monthlyProblems.filter((p) => p.status === 'Alih Tangan / Referal').length;

    const severityCount = {
      Ringan: monthlyProblems.filter((p) => p.severity === 'Ringan').length,
      Sedang: monthlyProblems.filter((p) => p.severity === 'Sedang').length,
      Berat: monthlyProblems.filter((p) => p.severity === 'Berat').length,
    };

    const domainCount = {
      Pribadi: monthlyProblems.filter((p) => p.guidanceDomain === 'Pribadi').length,
      Sosial: monthlyProblems.filter((p) => p.guidanceDomain === 'Sosial').length,
      Belajar: monthlyProblems.filter((p) => p.guidanceDomain === 'Belajar').length,
      Karir: monthlyProblems.filter((p) => p.guidanceDomain === 'Karir').length,
    };

    const counselingTypes = {
      individual: monthlyCounseling.filter((c) => c.serviceType === 'Konseling Individual').length,
      group: monthlyCounseling.filter((c) => c.serviceType === 'Konseling Kelompok').length,
      consultation: monthlyCounseling.filter((c) => c.serviceType === 'Konsultasi Guru/Ortu').length,
      conference: monthlyCounseling.filter((c) => c.serviceType === 'Konferensi Kasus').length,
      mediation: monthlyCounseling.filter((c) => c.serviceType === 'Mediasi Teman Sebaya').length,
      homeVisit: monthlyCounseling.filter((c) => c.serviceType === 'Kunjungan Rumah (Home Visit)').length,
    };

    const totalLate = monthlyAttendance.filter((a) => a.status === 'Terlambat').length;
    const totalAlpa = monthlyAttendance.filter((a) => a.status === 'Alpa').length;
    const totalBolos = monthlyAttendance.filter((a) => a.status === 'Bolos_KBM').length;
    const totalSick = monthlyAttendance.filter((a) => a.status === 'Sakit').length;
    const totalLeave = monthlyAttendance.filter((a) => a.status === 'Izin').length;

    return {
      totalProblems,
      solved,
      inProgress,
      waiting,
      referral,
      severityCount,
      domainCount,
      totalCounseling: monthlyCounseling.length,
      counselingTypes,
      totalLate,
      totalAlpa,
      totalBolos,
      totalSick,
      totalLeave,
      totalExceptions: monthlyAttendance.length,
      totalLetters: monthlyLetters.length,
    };
  }, [monthlyProblems, monthlyCounseling, monthlyAttendance, monthlyLetters]);

  // Handlers for print & downloads
  const handlePrint = () => {
    window.print();
  };

  // CSV Export
  const handleDownloadCSV = () => {
    const periodLabel = `${MONTH_NAMES[selectedMonth]}_${selectedYear}`;
    let csvContent = '\uFEFF'; // UTF-8 BOM for Microsoft Excel

    // Header
    csvContent += `REKAPITULASI PELAYANAN BIMBINGAN DAN KONSELING - ${profile.schoolName}\n`;
    csvContent += `Guru Pengampu: ${profile.leadCounselorName}\n`;
    csvContent += `Periode Laporan: ${MONTH_NAMES[selectedMonth]} ${selectedYear}\n\n`;

    // Table 1: Permasalahan Siswa
    csvContent += `=== DAFTAR LAPORAN PERMASALAHAN SISWA ===\n`;
    csvContent += `No,Tanggal Kejadian,NISN,Nama Siswa,Kelas,Bidang Bimbingan,Kategori Masalah,Tingkat Kasus,Status Penanganan,Pelapor,Uraian Kronologis Singkat\n`;

    monthlyProblems.forEach((p, idx) => {
      const st = students.find((s) => s.id === p.studentId);
      const cleanDesc = `"${(p.chronologicalDescription || '').replace(/"/g, '""')}"`;
      const cleanTitle = `"${p.title.replace(/"/g, '""')}"`;
      csvContent += `${idx + 1},${p.incidentDate},'${st?.nisn || '-'},"${st?.name || 'Siswa'}","${st?.className || '-'}","${p.guidanceDomain}","${p.problemCategory}","${p.severity}","${p.status}","${p.reportedBy} (${p.reporterName})",${cleanDesc}\n`;
    });

    csvContent += `\n\n=== JURNAL LAYANAN KONSELING SISWA ===\n`;
    csvContent += `No,Tanggal,Waktu,NISN,Nama Siswa,Kelas,Jenis Layanan,Ringkasan Masalah,Teknik Konseling,Komitmen Siswa,Evaluasi,Rencana Tindak Lanjut\n`;

    monthlyCounseling.forEach((c, idx) => {
      const st = students.find((s) => s.id === c.studentId);
      const cleanSummary = `"${(c.problemSummary || '').replace(/"/g, '""')}"`;
      const cleanCommitment = `"${(c.studentCommitment || '').replace(/"/g, '""')}"`;
      const cleanPlan = `"${(c.followUpPlan || '').replace(/"/g, '""')}"`;
      csvContent += `${idx + 1},${c.date},"${c.time}",'${st?.nisn || '-'},"${st?.name || 'Siswa'}","${st?.className || '-'}","${c.serviceType}",${cleanSummary},"${c.techniqueUsed}",${cleanCommitment},"${c.evaluation}",${cleanPlan}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_BK_${profile.schoolName.replace(/\s+/g, '_')}_${periodLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Executive summary text export
  const handleDownloadSummaryText = () => {
    const periodLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
    let text = `========================================================================\n`;
    text += `LAPORAN BULANAN PELAYANAN BIMBINGAN DAN KONSELING (BK)\n`;
    text += `${profile.schoolName}\n`;
    text += `Guru Pengampu : ${profile.leadCounselorName}\n`;
    text += `Periode       : ${periodLabel}\n`;
    text += `========================================================================\n\n`;

    text += `I. RINGKASAN DATA & INDIKATOR KINERJA BK\n`;
    text += `------------------------------------------------------------------------\n`;
    text += `- Total Kasus/Masalah Terdata     : ${stats.totalProblems} kasus\n`;
    text += `  * Terselesaikan                  : ${stats.solved} kasus\n`;
    text += `  * Sedang Dalam Bimbingan         : ${stats.inProgress} kasus\n`;
    text += `  * Menunggu Penanganan            : ${stats.waiting} kasus\n`;
    text += `  * Alih Tangan (Referal)          : ${stats.referral} kasus\n\n`;

    text += `- Distribusi 4 Bidang Layanan BK:\n`;
    text += `  * Bidang Pribadi                 : ${stats.domainCount.Pribadi} kasus\n`;
    text += `  * Bidang Sosial                  : ${stats.domainCount.Sosial} kasus\n`;
    text += `  * Bidang Belajar                 : ${stats.domainCount.Belajar} kasus\n`;
    text += `  * Bidang Karir                   : ${stats.domainCount.Karir} kasus\n\n`;

    text += `- Tingkat Urgensi Permasalahan:\n`;
    text += `  * Kasus Ringan                   : ${stats.severityCount.Ringan} kasus\n`;
    text += `  * Kasus Sedang                   : ${stats.severityCount.Sedang} kasus\n`;
    text += `  * Kasus Berat                    : ${stats.severityCount.Berat} kasus\n\n`;

    text += `- Pelaksanaan Layanan Konseling    : ${stats.totalCounseling} sesi terlaksana\n`;
    text += `  * Konseling Individual           : ${stats.counselingTypes.individual} sesi\n`;
    text += `  * Konseling Kelompok             : ${stats.counselingTypes.group} sesi\n`;
    text += `  * Konsultasi Orang Tua/Guru      : ${stats.counselingTypes.consultation} sesi\n`;
    text += `  * Konferensi Kasus               : ${stats.counselingTypes.conference} sesi\n`;
    text += `  * Mediasi Konflik                : ${stats.counselingTypes.mediation} sesi\n`;
    text += `  * Kunjungan Rumah (Home Visit)   : ${stats.counselingTypes.homeVisit} kali\n\n`;

    text += `- Rekapitulasi Presensi Terkait   :\n`;
    text += `  * Total Keterlambatan Masuk      : ${stats.totalLate} catatan\n`;
    text += `  * Total Alpa / Bolos KBM         : ${stats.totalAlpa} catatan\n`;
    text += `  * Surat Perizinan Diterbitkan    : ${stats.totalLetters} dokumen\n\n`;

    text += `II. CATATAN & REKOMENDASI GURU BK KEPADA KEPALA SEKOLAH\n`;
    text += `------------------------------------------------------------------------\n`;
    text += `1. Pembinaan kedisiplinan dan kehadiran siswa perlu didukung sinkronisasi antara Guru Piket dan Wali Kelas.\n`;
    text += `2. Siswa yang sedang dalam proses konseling kasus sedang/berat terus mendapatkan pemantauan berkala.\n`;
    text += `3. Penguatan layanan bimbingan karir dan pemetaan minat bakat terus digencarkan untuk kelas XII dan XI.\n\n`;

    text += `Malang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
    text += `Guru Bimbingan Konseling,\n\n\n\n`;
    text += `${profile.leadCounselorName}\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ringkasan_Eksekutif_BK_${periodLabel.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Area (Hidden when printing) */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-800" />
            <h2 className="text-lg font-bold text-slate-900">
              Pusat Laporan & Rekapitulasi Bulanan BK
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ekspor dan cetak ringkasan komprehensif catatan konseling serta laporan permasalahan siswa per bulan untuk pelaporan administratif dinas/sekolah.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Unduh format tabel CSV untuk Microsoft Excel / Google Sheets"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Unduh CSV (Excel)</span>
          </button>

          <button
            onClick={handleDownloadSummaryText}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Unduh ringkasan naratif format teks"
          >
            <FileText className="w-3.5 h-3.5 text-blue-700" />
            <span>Ringkasan Teks</span>
          </button>

          {/* Toolbar Kontrol Kop Surat: Kop Gambar, Kop Teks, Kertas Berkop & Unggah Gambar */}
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
            <span>Cetak / PDF Resmi</span>
          </button>
        </div>
      </div>

      {/* Month & Period Selector Bar (Hidden when printing) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 font-mono tabular-nums font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                Tahun {y}
              </option>
            ))}
          </select>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            <option value="all">Semua Kelas</option>
            {classList.map((c) => (
              <option key={c} value={c}>
                Kelas {c}
              </option>
            ))}
          </select>

          {/* Domain Filter */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            <option value="all">Semua Bidang Bimbingan</option>
            <option value="Pribadi">Bidang Pribadi</option>
            <option value="Sosial">Bidang Sosial</option>
            <option value="Belajar">Bidang Belajar</option>
            <option value="Karir">Bidang Karir</option>
          </select>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const now = new Date();
              setSelectedMonth(now.getMonth());
              setSelectedYear(now.getFullYear());
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium cursor-pointer"
          >
            Bulan Ini
          </button>
          <button
            onClick={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear((prev) => prev - 1);
              } else {
                setSelectedMonth((prev) => prev - 1);
              }
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium cursor-pointer"
          >
            Bulan Lalu
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE OFFICIAL REPORT DOCUMENT (PRINTABLE & ON-SCREEN PRESENTATION)          */}
      {/* ========================================================================= */}
      <div className="print-container bg-white border border-slate-200 rounded-xl p-6 sm:p-10 shadow-xs space-y-6 text-slate-900">
        {/* Official Letterhead (Kop Surat Resmi SMA Surya Buana Malang) */}
        <OfficialLetterhead profile={profile} />

        {/* Document Title */}
        <div className="text-center my-4">
          <h2 className="text-base font-extrabold underline uppercase tracking-wide text-slate-950">
            LAPORAN BULANAN PELAYANAN BIMBINGAN DAN KONSELING
          </h2>
          <p className="text-xs font-semibold text-slate-700 mt-1">
            Periode: Bulan {MONTH_NAMES[selectedMonth]} {selectedYear}
            {selectedClass !== 'all' && ` · Kelas ${selectedClass}`}
            {selectedDomain !== 'all' && ` · Bidang ${selectedDomain}`}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* SECTION I: EXECUTIVE SUMMARY & STATISTICAL INDICATORS                     */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            I. Ringkasan Eksekutif & Statistik Kasus Siswa
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Total Masalah Terdata</span>
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                {stats.totalProblems}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {stats.solved} terselesaikan ({stats.totalProblems > 0 ? Math.round((stats.solved / stats.totalProblems) * 100) : 0}%)
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Sesi Konseling Terlaksana</span>
              <span className="text-xl font-bold font-mono tabular-nums text-emerald-800">
                {stats.totalCounseling}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {stats.counselingTypes.individual} individu · {stats.counselingTypes.consultation} konsultasi ortu
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Status Penanganan</span>
              <div className="text-xs text-slate-700 font-mono tabular-nums mt-1 space-y-0.5">
                <div>Proses: <strong>{stats.inProgress}</strong></div>
                <div>Menunggu: <strong>{stats.waiting}</strong></div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Ketidakhadiran (Exceptions)</span>
              <div className="text-xs text-slate-700 font-mono tabular-nums mt-1 space-y-0.5">
                <div>S/I/A: <strong>{stats.totalSick + stats.totalLeave + stats.totalAlpa}</strong> kasus</div>
                <div>T/B: <strong>{stats.totalLate + stats.totalBolos}</strong> kasus</div>
              </div>
              <span className="text-[9px] text-slate-400 block mt-0.5">Lainnya Hadir Otomatis</span>
            </div>
          </div>

          {/* Breakdown Tables in compact 2-columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="font-bold text-slate-900 block mb-1">
                Distribusi 4 Bidang Layanan Bimbingan (ABKIN):
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex justify-between border-b border-slate-200 py-1">
                  <span>Bidang Pribadi:</span>
                  <span className="font-mono tabular-nums font-bold">{stats.domainCount.Pribadi} kasus</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-1">
                  <span>Bidang Sosial:</span>
                  <span className="font-mono tabular-nums font-bold">{stats.domainCount.Sosial} kasus</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-1">
                  <span>Bidang Belajar:</span>
                  <span className="font-mono tabular-nums font-bold">{stats.domainCount.Belajar} kasus</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-1">
                  <span>Bidang Karir:</span>
                  <span className="font-mono tabular-nums font-bold">{stats.domainCount.Karir} kasus</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="font-bold text-slate-900 block mb-1">
                Tingkat Keparahan Kasus Siswa:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] mt-2">
                <div className="p-1.5 bg-white border border-slate-200 rounded">
                  <span className="text-slate-500 block text-[10px]">Ringan</span>
                  <span className="font-mono tabular-nums font-bold text-slate-800 text-sm">
                    {stats.severityCount.Ringan}
                  </span>
                </div>
                <div className="p-1.5 bg-white border border-amber-200 rounded">
                  <span className="text-amber-700 block text-[10px]">Sedang</span>
                  <span className="font-mono tabular-nums font-bold text-amber-900 text-sm">
                    {stats.severityCount.Sedang}
                  </span>
                </div>
                <div className="p-1.5 bg-white border border-rose-200 rounded">
                  <span className="text-rose-700 block text-[10px]">Berat</span>
                  <span className="font-mono tabular-nums font-bold text-rose-900 text-sm">
                    {stats.severityCount.Berat}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION II: REKAPITULASI LAPORAN PERMASALAHAN SISWA                      */}
        {/* ========================================================================= */}
        <div className="space-y-3 print-break-inside-avoid">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              II. Daftar Rekapitulasi Kasus & Permasalahan Siswa
            </h3>
            <span className="text-[11px] text-slate-500 font-mono tabular-nums">
              Total: {monthlyProblems.length} Catatan Kasus
            </span>
          </div>

          {monthlyProblems.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center italic border border-dashed border-slate-200 rounded-lg">
              Tidak ada catatan permasalahan siswa pada periode bulan {MONTH_NAMES[selectedMonth]} {selectedYear}.
            </p>
          ) : (
            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 w-8">No</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Tanggal</th>
                    <th className="py-2.5 px-3">Nama Siswa / Kelas</th>
                    <th className="py-2.5 px-3">Bidang / Kategori</th>
                    <th className="py-2.5 px-3 w-16">Tingkat</th>
                    <th className="py-2.5 px-3">Uraian Pokok Masalah</th>
                    <th className="py-2.5 px-3 w-28 whitespace-nowrap">Status Penanganan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monthlyProblems.map((prob, idx) => {
                    const student = students.find((s) => s.id === prob.studentId);
                    return (
                      <tr key={prob.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono tabular-nums text-slate-500 text-center">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-mono tabular-nums whitespace-nowrap">
                          {formatDateIndonesian(prob.incidentDate)}
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-slate-900 block">
                            {student?.name || 'Siswa'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                            Kelas {student?.className || '-'} (NISN: {student?.nisn || '-'})
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          <span className="font-semibold block">{prob.guidanceDomain}</span>
                          <span className="text-[10px] text-slate-500">{prob.problemCategory}</span>
                        </td>
                        <td className="py-2 px-3 font-medium">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            prob.severity === 'Berat'
                              ? 'bg-rose-100 text-rose-900 font-bold'
                              : prob.severity === 'Sedang'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {prob.severity}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-800 max-w-sm">
                          <p className="font-semibold">{prob.title}</p>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                            {prob.chronologicalDescription}
                          </p>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 text-[11px]">
                            {prob.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION III: JURNAL & DOKUMENTASI LAYANAN KONSELING                      */}
        {/* ========================================================================= */}
        <div className="space-y-3 print-break-inside-avoid">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              III. Jurnal Pelaksanaan Layanan Konseling
            </h3>
            <span className="text-[11px] text-slate-500 font-mono tabular-nums">
              Total: {monthlyCounseling.length} Sesi Terlaksana
            </span>
          </div>

          {monthlyCounseling.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center italic border border-dashed border-slate-200 rounded-lg">
              Tidak ada sesi konseling tercatat pada periode bulan {MONTH_NAMES[selectedMonth]} {selectedYear}.
            </p>
          ) : (
            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 w-8">No</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Tanggal & Waktu</th>
                    <th className="py-2.5 px-3">Konseli (Siswa)</th>
                    <th className="py-2.5 px-3">Jenis Layanan</th>
                    <th className="py-2.5 px-3">Ringkasan Masalah & Teknik</th>
                    <th className="py-2.5 px-3">Komitmen Konseli</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Hasil Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monthlyCounseling.map((csl, idx) => {
                    const student = students.find((s) => s.id === csl.studentId);
                    return (
                      <tr key={csl.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono tabular-nums text-slate-500 text-center">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="font-mono tabular-nums font-semibold block">
                            {formatDateIndonesian(csl.date)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {csl.time} (Sesi {csl.sessionNumber})
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-slate-900 block">
                            {student?.name || 'Siswa'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                            Kelas {student?.className || '-'}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800 whitespace-nowrap">
                          {csl.serviceType}
                        </td>
                        <td className="py-2 px-3 text-slate-800 max-w-xs">
                          <p className="line-clamp-2">{csl.problemSummary}</p>
                          <p className="text-[10px] text-slate-500 italic mt-0.5">
                            Teknik: {csl.techniqueUsed}
                          </p>
                        </td>
                        <td className="py-2 px-3 text-slate-700 italic max-w-xs">
                          <p className="line-clamp-2">"{csl.studentCommitment}"</p>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="text-[11px] font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {csl.evaluation}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION IV: REKAPITULASI PRESENSI & KETIDAKHADIRAN (EXCEPTION-BASED)     */}
        {/* ========================================================================= */}
        <div className="space-y-3 print-break-inside-avoid">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              IV. Rekapitulasi Presensi & Catatan Ketidakhadiran Siswa
            </h3>
            <span className="text-[11px] text-slate-500 font-mono tabular-nums">
              Total Catatan: {monthlyAttendance.length} Pengecualian (S/I/A/T/B)
            </span>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * Menggunakan sistem presensi berbasis ketidakhadiran: seluruh siswa yang tidak tercatat di bawah ini diasumsikan hadir/masuk mengikuti KBM secara normal.
          </p>

          {monthlyAttendance.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center italic border border-dashed border-slate-200 rounded-lg">
              Tidak ada catatan ketidakhadiran pada periode bulan {MONTH_NAMES[selectedMonth]} {selectedYear} (presensi tertib 100%).
            </p>
          ) : (
            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 w-8">No</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Tanggal</th>
                    <th className="py-2.5 px-3">Nama Siswa / Rombel</th>
                    <th className="py-2.5 px-3 w-24">Status</th>
                    <th className="py-2.5 px-3">Alasan / Keterangan</th>
                    <th className="py-2.5 px-3">Tindakan BK / Pelapor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monthlyAttendance.map((att, idx) => {
                    const student = students.find((s) => s.id === att.studentId);
                    return (
                      <tr key={att.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono tabular-nums text-slate-500 text-center">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-mono tabular-nums whitespace-nowrap">
                          {formatDateIndonesian(att.date)}
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-slate-900 block">
                            {student?.name || att.studentName || 'Siswa'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                            Kelas {student?.className || att.className || '-'}
                          </span>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded ${
                            att.status === 'Sakit'
                              ? 'bg-blue-100 text-blue-900'
                              : att.status === 'Izin'
                              ? 'bg-purple-100 text-purple-900'
                              : att.status === 'Alpa'
                              ? 'bg-red-100 text-red-900'
                              : att.status === 'Terlambat'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}>
                            {att.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-800 max-w-xs">
                          <p className="line-clamp-2">{att.reason || '-'}</p>
                        </td>
                        <td className="py-2 px-3 text-slate-600 max-w-xs text-[11px]">
                          <p>{att.sanctionOrNote || '-'}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Pelapor: {att.reportedBy || 'Piket'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION V: REFLECTION & RECOMMENDATIONS                                  */}
        {/* ========================================================================= */}
        <div className="space-y-2 border border-slate-200 bg-slate-50 p-4 rounded-lg text-xs print-break-inside-avoid">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            V. Catatan Evaluasi & Rekomendasi Guru BK:
          </h4>
          <ul className="list-disc pl-4 space-y-1 text-slate-700 leading-relaxed text-justify">
            <li>
              Pencegahan pelanggaran tata tertib dan keterlambatan terus dikoordinasikan secara berkala dengan Guru Piket dan Tim Ketertiban Sekolah.
            </li>
            <li>
              Siswa dengan kasus kategori sedang dan berat mendapatkan pendampingan konseling intensif dengan penjadwalan kontrak perilaku (*behavioral contract*).
            </li>
            <li>
              Koordinasi dengan orang tua siswa terus diprioritaskan melalui keterbukaan komunikasi dan kemudahan penerbitan surat pemanggilan resmi jika diperlukan intervensi bersama keluarga.
            </li>
          </ul>
        </div>

        {/* ========================================================================= */}
        {/* SECTION VI: OFFICIAL SIGNATURES & VALIDATION (PENGESAHAN)                */}
        {/* ========================================================================= */}
        <div className="mt-8 pt-4 print-break-inside-avoid">
          <div className="text-right text-xs text-slate-700 mb-6 font-medium">
            {profile.regencyCity}, {formatDateIndonesian(new Date().toISOString().slice(0, 10))}
          </div>

          <div className="grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-slate-600">Mengetahui,</p>
              <p className="font-bold text-slate-900">Kepala {profile.schoolName}</p>
              <div className="h-20"></div>
              <p className="font-bold underline text-slate-900 text-sm">
                {profile.principalName}
              </p>
              <p className="text-slate-500 text-[11px] font-mono tabular-nums">
                {profile.principalNIP && profile.principalNIP !== '-' ? `NIP. ${profile.principalNIP}` : 'Kepala Sekolah'}
              </p>
            </div>

            <div>
              <p className="text-slate-600">Guru Bimbingan dan Konseling,</p>
              <p className="font-bold text-slate-900">Pengampu Pelayanan BK</p>
              <div className="h-20"></div>
              <p className="font-bold underline text-slate-900 text-sm">
                {profile.leadCounselorName}
              </p>
              <p className="text-slate-500 text-[11px] font-mono tabular-nums">
                {profile.leadCounselorNIP && profile.leadCounselorNIP !== '-' ? `NIP. ${profile.leadCounselorNIP}` : 'Guru Bimbingan Konseling'}
              </p>
            </div>
          </div>

          {/* Verification footer */}
          <div className="mt-10 pt-3 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between items-center">
            <span>SIM BK Pro · Sistem Informasi Manajemen Bimbingan dan Konseling {profile.schoolName}</span>
            <span className="font-mono tabular-nums">Periode Dokumen: {MONTH_NAMES[selectedMonth]} {selectedYear}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
