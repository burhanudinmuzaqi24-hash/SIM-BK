import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Users,
  AlertTriangle,
  HeartHandshake,
  FileText,
  Clock,
  CheckCircle2,
  CalendarCheck2,
  ArrowRight,
  Plus,
  ShieldAlert,
  ChevronRight,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  Activity,
  Compass,
  BarChart3,
  TrendingUp,
  UserCheck,
  Building,
  Calendar,
  Check,
  Zap,
  Leaf,
} from 'lucide-react';
import {
  Student,
  AttendanceRecord,
  ProblemRecord,
  CounselingRecord,
  PermissionLetter,
  SchoolProfile,
  Alumni,
  GuidanceDomain,
} from '../types';
import { formatDateIndonesian } from '../utils/storage';
import { NavTab } from '../components/Header';

const COUNSELING_ROOM_IMAGE = '/src/assets/images/counseling_room_interior_1790588351807.jpg';

interface DashboardViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  problems: ProblemRecord[];
  counseling: CounselingRecord[];
  letters: PermissionLetter[];
  alumni?: Alumni[];
  profile: SchoolProfile;
  onNavigate: (tab: NavTab) => void;
  onSelectStudent: (student: Student) => void;
  onNewProblem: () => void;
  onNewAttendance: () => void;
  onNewCounseling: () => void;
  onNewLetter: () => void;
}

const getTodayIndonesianFull = () => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
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
  const now = new Date();
  const dayName = days[now.getDay()];
  const date = now.getDate();
  const monthName = months[now.getMonth()];
  const year = now.getFullYear();
  return `${dayName}, ${date} ${monthName} ${year}`;
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  attendance,
  problems,
  counseling,
  letters,
  alumni = [],
  profile,
  onNavigate,
  onSelectStudent,
  onNewProblem,
  onNewAttendance,
  onNewCounseling,
  onNewLetter,
}) => {
  // Tab switcher for recent stream (Kasus vs Surat)
  const [streamTab, setStreamTab] = useState<'problems' | 'letters'>('problems');

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Today's attendance calculation (exception-based)
  const todayAttendance = useMemo(() => {
    return attendance.filter((a) => a.date === todayStr);
  }, [attendance, todayStr]);

  const todaySick = todayAttendance.filter((a) => a.status === 'Sakit').length;
  const todayLeave = todayAttendance.filter((a) => a.status === 'Izin').length;
  const todayAlpa = todayAttendance.filter((a) => a.status === 'Alpa').length;
  const todayLate = todayAttendance.filter((a) => a.status === 'Terlambat').length;
  const todayBolos = todayAttendance.filter((a) => a.status === 'Bolos_KBM').length;
  const todayTotalExceptions = todaySick + todayLeave + todayAlpa + todayBolos;

  const totalStudentsCount = students.length;
  const todayPresentCount = Math.max(0, totalStudentsCount - todayTotalExceptions);
  const todayAttendanceRate =
    totalStudentsCount > 0
      ? Math.round((todayPresentCount / totalStudentsCount) * 100)
      : 100;

  // Problem breakdown
  const activeProblems = problems.filter(
    (p) => p.status === 'Menunggu' || p.status === 'Proses Bimbingan'
  );
  const solvedProblems = problems.filter((p) => p.status === 'Terselesaikan');
  const solvedRate =
    problems.length > 0 ? Math.round((solvedProblems.length / problems.length) * 100) : 0;

  // Watchlist students
  const watchlistStudents = students.filter((s) => s.isWatchlist);

  // Distribution by 4 ABKIN domains
  const domainCounts = useMemo(() => {
    return {
      Pribadi: problems.filter((p) => p.guidanceDomain === 'Pribadi').length,
      Sosial: problems.filter((p) => p.guidanceDomain === 'Sosial').length,
      Belajar: problems.filter((p) => p.guidanceDomain === 'Belajar').length,
      Karir: problems.filter((p) => p.guidanceDomain === 'Karir').length,
    };
  }, [problems]);
  const totalDomainCases = Math.max(1, problems.length);

  // Alumni stats
  const collegeAlumni = alumni.filter((a) => a.status === 'Kuliah').length;
  const workingAlumni = alumni.filter((a) => a.status === 'Bekerja').length;
  const businessAlumni = alumni.filter((a) => a.status === 'Wirausaha').length;

  // Recharts Data 1: Tren Konseling Bulanan Siswa
  const monthlyCounselingTrendData = useMemo(() => {
    const months = [
      { key: 6, label: 'Jul' },
      { key: 7, label: 'Ags' },
      { key: 8, label: 'Sep' },
      { key: 9, label: 'Okt' },
      { key: 10, label: 'Nov' },
      { key: 11, label: 'Des' },
    ];

    return months.map((m) => {
      const recordsThisMonth = counseling.filter((c) => {
        if (!c.date) return false;
        const d = new Date(c.date);
        return !isNaN(d.getTime()) && d.getMonth() === m.key;
      });

      const totalSesi = recordsThisMonth.length;
      const berkembang = recordsThisMonth.filter(
        (c) =>
          c.evaluation === 'Sangat Berkembang' || c.evaluation === 'Mulai Terarah'
      ).length;
      const pendampingan = recordsThisMonth.filter(
        (c) =>
          c.evaluation === 'Perlu Pendampingan Lanjutan' ||
          c.evaluation === 'Butuh Penanganan Khusus'
      ).length;

      return {
        bulan: m.label,
        totalSesi,
        berkembang,
        pendampingan,
      };
    });
  }, [counseling]);

  // Recharts Data 2: Ringkasan Jumlah Permasalahan Siswa per Bidang
  const problemSummaryData = useMemo(() => {
    const domains: GuidanceDomain[] = ['Pribadi', 'Sosial', 'Belajar', 'Karir'];
    return domains.map((d) => {
      const records = problems.filter((p) => p.guidanceDomain === d);
      const total = records.length;
      const selesai = records.filter((p) => p.status === 'Terselesaikan').length;
      const proses = records.filter(
        (p) => p.status === 'Proses Bimbingan' || p.status === 'Menunggu'
      ).length;

      return {
        domain: `Bidang ${d}`,
        shortName: d,
        total,
        selesai,
        proses,
      };
    });
  }, [problems]);

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* 1. EXECUTIVE COMMAND HERO (Modern High-Fidelity Header)               */}
      {/* ===================================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 border border-slate-800 shadow-sm">
        {/* Subtle decorative background ambient glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Contextual unboxed status row */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-300 font-medium">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Ruang Konseling BK Aktif
              </span>
              <span className="text-slate-500" aria-hidden="true">·</span>
              <span className="text-slate-300">{getTodayIndonesianFull()}</span>
              <span className="text-slate-500" aria-hidden="true">·</span>
              <span className="text-slate-300 font-mono">
                TA {profile.academicYear} ({profile.currentSemester})
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                Selamat Bertugas, {profile.leadCounselorName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed text-wrap-balance">
                Pusat kendali bimbingan & konseling peserta didik {profile.schoolName}. Deteksi dini dinamika siswa, pemantauan presensi harian berbasis ketidakhadiran, pendampingan konseling kerahasiaan, dan tata kelola surat resmi.
              </p>
            </div>

            {/* Quick school trust markers (clean unboxed text) */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
              <span>{profile.counselingRoomName}</span>
              <span aria-hidden="true">·</span>
              <span>Koordinator BK: {profile.leadCounselorName}</span>
              <span aria-hidden="true">·</span>
              <span>Kepala Sekolah: {profile.principalName}</span>
            </div>
          </div>

          {/* Quick Action Command Launcher */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <button
              onClick={onNewAttendance}
              className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700/80 hover:bg-emerald-600 rounded-xl transition-all hover:-translate-y-0.5 shadow-xs border border-emerald-500/30 cursor-pointer"
            >
              <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>+ Input Presensi / Terlambat</span>
            </button>

            <button
              onClick={onNewProblem}
              className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-100 bg-rose-950/60 hover:bg-rose-900/80 rounded-xl transition-all hover:-translate-y-0.5 border border-rose-800/40 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
              <span>+ Lapor Kasus Siswa</span>
            </button>

            <button
              onClick={onNewCounseling}
              className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-teal-100 bg-teal-950/60 hover:bg-teal-900/80 rounded-xl transition-all hover:-translate-y-0.5 border border-teal-800/40 cursor-pointer"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-teal-300" />
              <span>+ Jurnal Konseling</span>
            </button>

            <button
              onClick={onNewLetter}
              className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-indigo-100 bg-indigo-950/60 hover:bg-indigo-900/80 rounded-xl transition-all hover:-translate-y-0.5 border border-indigo-800/40 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-300" />
              <span>+ Terbitkan Surat Resmi</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. CORE METRIC TILES (SaaS Bento Stat Rail)                            */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Siswa Binaan */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-600">Peserta Didik Binaan</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
              {students.length}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span className="text-slate-600 font-medium">
              <strong className="text-amber-700 font-bold">{watchlistStudents.length}</strong> pantauan khusus
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Metric 2: Tingkat Presensi Hari Ini */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-600">Presensi Hari Ini</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold font-mono tabular-nums text-emerald-900 tracking-tight flex items-baseline gap-2">
              <span>{todayAttendanceRate}%</span>
              <span className="text-xs font-semibold text-emerald-700 font-sans">
                {todayPresentCount} Hadir
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span className="truncate">
              {todayTotalExceptions > 0 ? (
                <span className="text-rose-700 font-medium font-mono">
                  {todayTotalExceptions} berhalangan ({todaySick}S, {todayLeave}I, {todayAlpa}A)
                </span>
              ) : (
                <span className="text-emerald-700 font-medium">Nihil absen · Tertib</span>
              )}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Metric 3: Penanganan Kasus Siswa */}
        <div
          onClick={() => onNavigate('problems')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-600">Dinamika Kasus Siswa</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>{problems.length}</span>
              <span className="text-xs font-bold text-amber-700 font-sans">
                {activeProblems.length} Aktif
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span className="text-slate-600">
              <strong className="text-emerald-800 font-bold">{solvedRate}%</strong> terselesaikan ({solvedProblems.length} kasus)
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-800 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Metric 4: Surat & Administrasi BK */}
        <div
          onClick={() => onNavigate('letters')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-600">Surat Resmi Diterbitkan</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold font-mono tabular-nums text-indigo-950 tracking-tight">
              {letters.length}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span className="text-slate-600 font-mono text-[11px] truncate">
              6 Kode Resmi: SPK/SIK/SLS/SPO
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-800 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. TODAY'S ATTENDANCE PULSE BANNER                                    */}
      {/* ===================================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Laporan Presensi Hari Ini ({getTodayIndonesianFull().split(',')[0]})
              </h3>
              <span className="text-[10px] font-semibold text-slate-500 font-mono">
                Sistem Pengecualian
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-600 mt-1">
              <span>
                Total Siswa: <strong className="font-mono text-slate-900">{totalStudentsCount}</strong>
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span>
                Masuk (Hadir): <strong className="font-mono text-emerald-800">{todayPresentCount}</strong> ({todayAttendanceRate}%)
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span>
                Sakit: <strong className="font-mono text-blue-900">{todaySick}</strong>
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span>
                Izin: <strong className="font-mono text-purple-900">{todayLeave}</strong>
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span>
                Alpa: <strong className="font-mono text-rose-900">{todayAlpa}</strong>
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span>
                Terlambat: <strong className="font-mono text-amber-900">{todayLate}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={onNewAttendance}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Absen</span>
          </button>
          <button
            onClick={() => onNavigate('attendance')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <span>Rekap Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BOTANICAL SPOTLIGHT: RUANG KONSELING & TUMBUH KEMBANG SISWA           */}
      {/* ===================================================================== */}
      <div className="relative rounded-2xl overflow-hidden border border-emerald-800/40 bg-slate-950 text-white shadow-sm">
        <div className="absolute inset-0">
          <img
            src={COUNSELING_ROOM_IMAGE}
            alt="Interior Ruang BK Ramah Anak dengan Nuansa Hijau & Tanaman Asri"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-slate-950/90 to-emerald-950/80 mix-blend-multiply" />
        </div>

        <div className="relative z-10 p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <Leaf className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Ruang Konseling Bimbingan & Konseling ({profile.counselingRoomName})</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Sanctuari Konseling Teduh, Hijau & Menenangkan</span>
              <span className="text-xs font-normal text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-700/50">
                Ramah Anak
              </span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              "Setiap peserta didik berhak bertumbuh layaknya tunas muda yang disiram empati, penerimaan tanpa syarat, dan arahan penuh keteduhan."
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-mono">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                <strong>{counseling.length}</strong> Sesi Konseling Terlaksana
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <strong>{counseling.filter(c => c.evaluation === 'Sangat Berkembang').length}</strong> Perkembangan Sangat Baik
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-300 font-semibold">
                Konselor: {profile.leadCounselorName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            <button
              onClick={onNewCounseling}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Konseling Baru</span>
            </button>
            <button
              onClick={() => onNavigate('counseling')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-sm transition-all cursor-pointer"
            >
              <span>Buka Ruang Konseling</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. VISUALISASI DATA RECHARTS: TREN KONSELING & PERMASALAHAN SISWA     */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Tren Konseling Bulanan */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Tren Konseling Bulanan Siswa
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Volume sesi bimbingan konseling dan perkembangan konseli semester ini
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Total {counseling.length} Sesi
            </span>
          </div>

          {/* Recharts AreaChart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyCounselingTrendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotalSesi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBerkembang" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="bulan"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="totalSesi"
                  name="Total Sesi Konseling"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTotalSesi)"
                />
                <Area
                  type="monotone"
                  dataKey="berkembang"
                  name="Evaluasi Positif / Terarah"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBerkembang)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Micro Summary Bar */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Rata-rata / Bulan</span>
              <strong className="font-mono text-slate-800">
                {Math.round((counseling.length / 6) * 10) / 10} Sesi
              </strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Efektivitas Positif</span>
              <strong className="font-mono text-emerald-700">
                {counseling.length > 0
                  ? Math.round(
                      (counseling.filter(
                        (c) =>
                          c.evaluation === 'Sangat Berkembang' ||
                          c.evaluation === 'Mulai Terarah'
                      ).length /
                        counseling.length) *
                        100
                    )
                  : 100}
                %
              </strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Sesi Lanjutan</span>
              <strong className="font-mono text-indigo-700">
                {counseling.filter((c) => c.sessionNumber > 1).length} Sesi
              </strong>
            </div>
          </div>
        </div>

        {/* Chart 2: Ringkasan Permasalahan Siswa per Bidang */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm font-bold text-slate-900">
                  Ringkasan Permasalahan Siswa (Standar ABKIN)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Perbandingan kasus dalam proses bimbingan vs selesai per bidang
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Total {problems.length} Kasus
            </span>
          </div>

          {/* Recharts BarChart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={problemSummaryData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <Bar
                  dataKey="proses"
                  name="Proses Bimbingan"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="selesai"
                  name="Selesai / Teratasi"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Micro Summary Bar */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Selesai / Teratasi</span>
              <strong className="font-mono text-emerald-700">
                {problems.filter((p) => p.status === 'Terselesaikan').length} Kasus
              </strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Proses Bimbingan</span>
              <strong className="font-mono text-amber-700">
                {problems.filter((p) => p.status !== 'Terselesaikan').length} Kasus
              </strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Tingkat Penanganan</span>
              <strong className="font-mono text-slate-800">
                {problems.length > 0
                  ? Math.round(
                      (problems.filter((p) => p.status === 'Terselesaikan').length /
                        problems.length) *
                        100
                    )
                  : 100}
                %
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. MAIN WORKSPACE GRID: LEFT (WATCHLIST & ABKIN) + RIGHT (FEED)        */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Siswa Dalam Perhatian Khusus (Watchlist) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Siswa Dalam Pantauan Khusus (Watchlist Konseling)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Daftar peserta didik yang memerlukan pendampingan intensif, kontrak perilaku, atau pemantauan presensi berkala.
                </p>
              </div>

              <button
                onClick={() => onNavigate('students')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <span>Buka Direktori</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {watchlistStudents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5 opacity-80" />
                <p className="font-semibold text-slate-700">Semua siswa dalam kondisi terpantau baik.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Belum ada siswa yang ditandai dalam daftar pantauan khusus (*watchlist*).
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {watchlistStudents.map((st) => {
                  const sProb = problems.filter((p) => p.studentId === st.id);
                  const sAtt = attendance.filter(
                    (a) =>
                      a.studentId === st.id &&
                      (a.status === 'Terlambat' ||
                        a.status === 'Alpa' ||
                        a.status === 'Bolos_KBM')
                  );
                  const sCsl = counseling.filter((c) => c.studentId === st.id);

                  return (
                    <div
                      key={st.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            st.gender === 'L'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {st.gender === 'L' ? 'LK' : 'PR'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => onSelectStudent(st)}
                              className="font-bold text-xs text-slate-900 hover:text-emerald-800 text-left truncate cursor-pointer transition-colors"
                            >
                              {st.name}
                            </button>
                            <span className="text-[11px] font-mono text-slate-500">
                              Kelas {st.className}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              (NISN: {st.nisn})
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                            {st.notes || 'Perlu pemantauan berkala dan pendampingan konseling.'}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-1">
                            <span className="font-semibold text-slate-700">
                              {sProb.length} Masalah
                            </span>
                            <span className="text-slate-300" aria-hidden="true">·</span>
                            <span className="text-amber-800 font-semibold">
                              {sAtt.length} Catatan Absensi
                            </span>
                            <span className="text-slate-300" aria-hidden="true">·</span>
                            <span className="text-emerald-800 font-semibold">
                              {sCsl.length} Sesi Konseling
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => onSelectStudent(st)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        >
                          Profil 360°
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectStudent(st);
                            onNewCounseling();
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-800 hover:text-white border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                        >
                          + Konseling
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Distribusi 4 Bidang ABKIN (Pribadi, Sosial, Belajar, Karir) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-800" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Distribusi 4 Bidang Layanan Bimbingan (Standar ABKIN)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pemetaan topik permasalahan siswa untuk acuan penyusunan program bimbingan tahunan.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-slate-500 tabular-nums">
                Total {problems.length} Kasus
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Pribadi */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Bidang Pribadi</span>
                  <span className="font-mono tabular-nums text-slate-700 font-bold">
                    {domainCounts.Pribadi} kasus ({Math.round((domainCounts.Pribadi / totalDomainCases) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(domainCounts.Pribadi / totalDomainCases) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Manajemen emosi, kedisiplinan diri, tata tertib, kecanduan gawai.
                </p>
              </div>

              {/* 2. Sosial */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Bidang Sosial</span>
                  <span className="font-mono tabular-nums text-slate-700 font-bold">
                    {domainCounts.Sosial} kasus ({Math.round((domainCounts.Sosial / totalDomainCases) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(domainCounts.Sosial / totalDomainCases) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Relasi pertemanan sebaya, penyesuaian lingkungan sekolah, dinamika keluarga.
                </p>
              </div>

              {/* 3. Belajar */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Bidang Belajar</span>
                  <span className="font-mono tabular-nums text-slate-700 font-bold">
                    {domainCounts.Belajar} kasus ({Math.round((domainCounts.Belajar / totalDomainCases) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(domainCounts.Belajar / totalDomainCases) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Motivasi belajar, kesulitan konsentrasi, tugas tertunggak, remedial berulang.
                </p>
              </div>

              {/* 4. Karir */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Bidang Karir</span>
                  <span className="font-mono tabular-nums text-slate-700 font-bold">
                    {domainCounts.Karir} kasus ({Math.round((domainCounts.Karir / totalDomainCases) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(domainCounts.Karir / totalDomainCases) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Peminatan jurusan, persiapan SNBP/SNBT, pemetaan potensi diri dan vokasi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col: Interactive Stream & Tracer Study) */}
        <div className="space-y-6">
          {/* Activity Stream Container */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            {/* Stream Header & Switcher */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setStreamTab('problems')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    streamTab === 'problems'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kasus Baru
                </button>
                <button
                  type="button"
                  onClick={() => setStreamTab('letters')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    streamTab === 'letters'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Surat Izin
                </button>
              </div>

              <button
                onClick={() => onNavigate(streamTab === 'problems' ? 'problems' : 'letters')}
                className="text-[11px] font-semibold text-emerald-800 hover:underline cursor-pointer"
              >
                Lihat Semua →
              </button>
            </div>

            {/* Stream Tab 1: Kasus Siswa Terbaru */}
            {streamTab === 'problems' && (
              <div className="space-y-3">
                {problems.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    Belum ada catatan permasalahan siswa.
                  </p>
                ) : (
                  problems.slice(0, 4).map((prob) => {
                    const st = students.find((s) => s.id === prob.studentId);
                    return (
                      <div
                        key={prob.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 truncate">
                            {st?.name || 'Siswa'}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              prob.severity === 'Berat'
                                ? 'bg-rose-100 text-rose-800'
                                : prob.severity === 'Sedang'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {prob.severity}
                          </span>
                        </div>

                        <p className="text-slate-700 font-medium line-clamp-1">{prob.title}</p>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                          <span className="font-mono">{formatDateIndonesian(prob.incidentDate)}</span>
                          <span className="font-semibold text-slate-700">{prob.status}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Stream Tab 2: Surat Izin & Dispensasi Terakhir */}
            {streamTab === 'letters' && (
              <div className="space-y-3">
                {letters.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    Belum ada surat yang diterbitkan.
                  </p>
                ) : (
                  letters.slice(0, 4).map((letter) => {
                    const st = students.find((s) => s.id === letter.studentId);
                    return (
                      <div
                        key={letter.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 truncate">
                            {st?.name || 'Siswa'} ({st?.className || '-'})
                          </span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900">
                            {letter.type.startsWith('BK-') ? letter.type : 'SURAT'}
                          </span>
                        </div>

                        <p className="text-slate-600 line-clamp-1">{letter.reason || letter.destinationOrActivity}</p>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                          <span className="font-mono text-slate-700">{letter.letterNumber}</span>
                          <span>{formatDateIndonesian(letter.date)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Tracer Study & Alumni Card */}
          {alumni && alumni.length > 0 && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <GraduationCap className="w-4 h-4" />
                    <span>Tracer Study & Alumni</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    Capaian Lulusan {profile.schoolName}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Total {alumni.length} alumni terdata dalam pangkalan data karir.
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('alumni')}
                  className="p-1.5 text-slate-400 hover:text-emerald-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Buka Modul Alumni"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-[10px] text-emerald-800 block font-semibold">Kuliah (PTN/PTS)</span>
                  <span className="text-lg font-bold font-mono tabular-nums text-emerald-950">
                    {collegeAlumni}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                  <span className="text-[10px] text-blue-800 block font-semibold">Bekerja</span>
                  <span className="text-lg font-bold font-mono tabular-nums text-blue-950">
                    {workingAlumni}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                  <span className="text-[10px] text-amber-800 block font-semibold">Wirausaha</span>
                  <span className="text-lg font-bold font-mono tabular-nums text-amber-950">
                    {businessAlumni}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('alumni')}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <span>Buka Tracer Study Lengkap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Access to Monthly Reports */}
          <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-r from-emerald-50/60 to-teal-50/60 p-4.5 text-xs text-slate-700 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-slate-900 block font-bold">Laporan & Rekapitulasi Dinas BK</strong>
                <span className="text-[11px] text-slate-600">
                  Cetak rekap bulanan berstandar dinas dengan kop sekolah.
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('reports')}
              className="px-3 py-1.5 bg-white text-emerald-900 hover:bg-emerald-800 hover:text-white border border-emerald-300 rounded-lg font-bold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
            >
              Buka Laporan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
