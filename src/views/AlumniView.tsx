import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Briefcase,
  Building2,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Download,
  Printer,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  Award,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  LayoutGrid,
  List,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  CheckSquare,
} from 'lucide-react';
import {
  Alumni,
  AlumniStatus,
  HigherEducationType,
  AdmissionTrack,
  SchoolProfile,
} from '../types';
import { OfficialLetterhead } from '../components/OfficialLetterhead';
import { LetterheadToolbarControls } from '../components/LetterheadToolbarControls';

interface AlumniViewProps {
  alumniList: Alumni[];
  profile: SchoolProfile;
  onAddAlumni: (alumni: Omit<Alumni, 'id'>) => void;
  onUpdateAlumni: (id: string, updated: Partial<Alumni>) => void;
  onDeleteAlumni: (id: string) => void;
  onDeleteMultipleAlumni?: (ids: string[]) => void;
  onUpdateProfile?: (updated: Partial<SchoolProfile>) => void;
  onOpenSettings?: () => void;
}

export const AlumniView: React.FC<AlumniViewProps> = ({
  alumniList,
  profile,
  onAddAlumni,
  onUpdateAlumni,
  onDeleteAlumni,
  onDeleteMultipleAlumni,
  onUpdateProfile,
  onOpenSettings,
}) => {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUniversityType, setSelectedUniversityType] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<Alumni | null>(null);
  const [selectedAlumniDetail, setSelectedAlumniDetail] = useState<Alumni | null>(null);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  // Available graduation years
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(alumniList.map((a) => a.graduationYear))).sort(
      (a, b) => b - a
    );
    return years;
  }, [alumniList]);

  // Available classes
  const availableClasses = useMemo(() => {
    const classes = Array.from(new Set(alumniList.map((a) => a.lastClass))).sort();
    return classes;
  }, [alumniList]);

  // Filtered dataset
  const filteredAlumni = useMemo(() => {
    return alumniList.filter((item) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.nisn.toLowerCase().includes(q) ||
        (item.universityName && item.universityName.toLowerCase().includes(q)) ||
        (item.major && item.major.toLowerCase().includes(q)) ||
        (item.companyName && item.companyName.toLowerCase().includes(q)) ||
        (item.jobTitle && item.jobTitle.toLowerCase().includes(q)) ||
        (item.businessName && item.businessName.toLowerCase().includes(q));

      // Year filter
      const matchYear =
        selectedYear === 'all' || item.graduationYear.toString() === selectedYear;

      // Status filter
      const matchStatus =
        selectedStatus === 'all' || item.status === selectedStatus;

      // University type filter
      const matchUniType =
        selectedUniversityType === 'all' ||
        (item.status === 'Kuliah' && item.universityType === selectedUniversityType);

      // Class filter
      const matchClass =
        selectedClass === 'all' || item.lastClass === selectedClass;

      return matchSearch && matchYear && matchStatus && matchUniType && matchClass;
    });
  }, [
    alumniList,
    searchQuery,
    selectedYear,
    selectedStatus,
    selectedUniversityType,
    selectedClass,
  ]);

  // Statistics calculation
  const stats = useMemo(() => {
    const baseList =
      selectedYear === 'all'
        ? alumniList
        : alumniList.filter((a) => a.graduationYear.toString() === selectedYear);

    const total = baseList.length;
    const kuliah = baseList.filter((a) => a.status === 'Kuliah').length;
    const bekerja = baseList.filter((a) => a.status === 'Bekerja').length;
    const wirausaha = baseList.filter((a) => a.status === 'Wirausaha').length;
    const pelatihan = baseList.filter((a) => a.status === 'Pelatihan_Kursus').length;
    const gapYear = baseList.filter((a) => a.status === 'Gap_Year').length;
    const lainnya = baseList.filter((a) => a.status === 'Lainnya').length;

    // Sub-breakdown Kuliah
    const kuliahPTN = baseList.filter((a) => a.status === 'Kuliah' && a.universityType === 'PTN').length;
    const kuliahPTS = baseList.filter((a) => a.status === 'Kuliah' && a.universityType === 'PTS').length;
    const kuliahKedinasan = baseList.filter((a) => a.status === 'Kuliah' && a.universityType === 'Kedinasan').length;
    const kuliahBeasiswa = baseList.filter((a) => a.status === 'Kuliah' && a.hasScholarship).length;

    const kuliahPct = total > 0 ? Math.round((kuliah / total) * 100) : 0;
    const bekerjaPct = total > 0 ? Math.round((bekerja / total) * 100) : 0;
    const wirausahaPct = total > 0 ? Math.round((wirausaha / total) * 100) : 0;
    const pelatihanGapPct = total > 0 ? Math.round(((pelatihan + gapYear + lainnya) / total) * 100) : 0;

    return {
      total,
      kuliah,
      kuliahPct,
      kuliahPTN,
      kuliahPTS,
      kuliahKedinasan,
      kuliahBeasiswa,
      bekerja,
      bekerjaPct,
      wirausaha,
      wirausahaPct,
      pelatihan,
      gapYear,
      lainnya,
      pelatihanGapPct,
    };
  }, [alumniList, selectedYear]);

  // Export to CSV handler
  const handleExportCSV = () => {
    const headers = [
      'No',
      'NISN',
      'Nama Alumni',
      'Jenis Kelamin',
      'Tahun Lulus',
      'Kelas Terakhir',
      'No HP/WA',
      'Email',
      'Status Lulusan',
      'Tipe Perguruan Tinggi',
      'Nama Kampus / Perusahaan / Usaha',
      'Program Studi / Jabatan / Bidang',
      'Jalur Masuk / Status Kerja',
      'Beasiswa',
      'Catatan Bimbingan Karir BK',
    ];

    const rows = filteredAlumni.map((a, idx) => {
      let instansi = '';
      let bidang = '';
      let keterangan = '';

      if (a.status === 'Kuliah') {
        instansi = a.universityName || '-';
        bidang = `${a.faculty ? a.faculty + ' - ' : ''}${a.major || '-'}`;
        keterangan = a.admissionTrack || '-';
      } else if (a.status === 'Bekerja') {
        instansi = a.companyName || '-';
        bidang = a.jobTitle || '-';
        keterangan = `${a.employmentType || '-'} (${a.workCity || '-'})`;
      } else if (a.status === 'Wirausaha') {
        instansi = a.businessName || '-';
        bidang = a.businessField || '-';
        keterangan = 'Wirausaha Mandiri';
      } else if (a.status === 'Pelatihan_Kursus') {
        instansi = a.trainingInstitute || '-';
        bidang = 'Pelatihan / Kursus Kejuruan';
      } else {
        instansi = 'Persiapan Mandiri / Gap Year';
      }

      return [
        idx + 1,
        `"${a.nisn}"`,
        `"${a.name}"`,
        a.gender,
        a.graduationYear,
        `"${a.lastClass}"`,
        `"${a.phone}"`,
        `"${a.email || '-'}"`,
        `"${a.status.replace('_', ' ')}"`,
        `"${a.universityType || '-'}"`,
        `"${instansi}"`,
        `"${bidang}"`,
        `"${keterangan}"`,
        `"${a.hasScholarship ? a.scholarshipName || 'Ya' : 'Tidak'}"`,
        `"${(a.notes || '-').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tracer_Study_Alumni_SMA_Surya_Buana_${selectedYear === 'all' ? 'Semua_Angkatan' : 'Tahun_' + selectedYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Multi-select & Batch Delete States
  const [selectedAlumniIds, setSelectedAlumniIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'single' | 'multiple';
    alumni?: Alumni;
    count?: number;
    ids?: string[];
  } | null>(null);

  const isAllFilteredSelected =
    filteredAlumni.length > 0 &&
    filteredAlumni.every((a) => selectedAlumniIds.includes(a.id));

  const handleToggleSelect = (id: string) => {
    setSelectedAlumniIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      const filteredIdSet = new Set(filteredAlumni.map((a) => a.id));
      setSelectedAlumniIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      const merged = Array.from(
        new Set([...selectedAlumniIds, ...filteredAlumni.map((a) => a.id)])
      );
      setSelectedAlumniIds(merged);
    }
  };

  const handleClearSelection = () => {
    setSelectedAlumniIds([]);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'single' && deleteTarget.alumni) {
      const targetId = deleteTarget.alumni.id;
      onDeleteAlumni(targetId);
      setSelectedAlumniIds((prev) => prev.filter((id) => id !== targetId));
      if (selectedAlumniDetail?.id === targetId) {
        setSelectedAlumniDetail(null);
      }
    } else if (deleteTarget.type === 'multiple' && deleteTarget.ids) {
      if (onDeleteMultipleAlumni) {
        onDeleteMultipleAlumni(deleteTarget.ids);
      } else {
        deleteTarget.ids.forEach((id) => onDeleteAlumni(id));
      }
      setSelectedAlumniIds([]);
      if (selectedAlumniDetail && deleteTarget.ids.includes(selectedAlumniDetail.id)) {
        setSelectedAlumniDetail(null);
      }
    }

    setDeleteTarget(null);
  };

  const handleDeleteConfirm = (alumni: Alumni) => {
    setDeleteTarget({ type: 'single', alumni });
  };

  const handleOpenAddForm = () => {
    setEditingAlumni(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditForm = (alumni: Alumni) => {
    setEditingAlumni(alumni);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & ACTION BAR                                                */}
      {/* ========================================================================= */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Rekapitulasi Alumni & Tracer Study
              </h2>
              <p className="text-xs text-slate-500">
                Pemantauan studi lanjut ke Perguruan Tinggi, penyerapan dunia kerja, dan wirausaha lulusan {profile.schoolName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Ekspor data tracer study ke Excel/CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => setIsPrintPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Cetak format laporan resmi Tracer Study lengkap dengan Kop Surat"
          >
            <Printer className="w-3.5 h-3.5 text-slate-700" />
            <span>Cetak Laporan</span>
          </button>

          <button
            onClick={handleOpenAddForm}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Data Alumni</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STATS & ANALYTICS OVERVIEW                                             */}
      {/* ========================================================================= */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Alumni */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Terdata</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-xs text-slate-500 font-medium">alumni terdata</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {selectedYear === 'all' ? 'Akumulasi seluruh angkatan' : `Angkatan Kelulusan ${selectedYear}`}
          </p>
        </div>

        {/* Card 2: Melanjutkan Kuliah */}
        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Pendidikan Tinggi</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-950">{stats.kuliah}</span>
            <span className="text-xs font-bold text-emerald-700">({stats.kuliahPct}%)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600">
            PTN: {stats.kuliahPTN} · PTS: {stats.kuliahPTS} · Kedinasan: {stats.kuliahKedinasan}
          </p>
        </div>

        {/* Card 3: Bekerja & Karir */}
        <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800">Dunia Kerja & Industri</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-950">{stats.bekerja}</span>
            <span className="text-xs font-bold text-blue-700">({stats.bekerjaPct}%)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600">
            BUMN, swasta, manufaktur & digital
          </p>
        </div>

        {/* Card 4: Wirausaha & Mandiri */}
        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Wirausaha Mandiri</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-950">{stats.wirausaha}</span>
            <span className="text-xs font-bold text-amber-700">({stats.wirausahaPct}%)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600">
            Pelatihan/Gap Year: {stats.pelatihan + stats.gapYear} alumni
          </p>
        </div>
      </div>

      {/* Distribution visual progress bar */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">Distribusi Penelusuran Lulusan (Outcome Distribution)</span>
          <span className="text-slate-500 text-[11px]">Total: {stats.total} alumni terverifikasi</span>
        </div>

        {/* Multi-segmented Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${stats.kuliahPct}%` }}
            className="bg-emerald-700 h-full transition-all"
            title={`Kuliah: ${stats.kuliah} (${stats.kuliahPct}%)`}
          />
          <div
            style={{ width: `${stats.bekerjaPct}%` }}
            className="bg-blue-600 h-full transition-all"
            title={`Bekerja: ${stats.bekerja} (${stats.bekerjaPct}%)`}
          />
          <div
            style={{ width: `${stats.wirausahaPct}%` }}
            className="bg-amber-500 h-full transition-all"
            title={`Wirausaha: ${stats.wirausaha} (${stats.wirausahaPct}%)`}
          />
          <div
            style={{ width: `${stats.pelatihanGapPct}%` }}
            className="bg-slate-400 h-full transition-all"
            title={`Pelatihan & Gap Year: ${stats.pelatihan + stats.gapYear} (${stats.pelatihanGapPct}%)`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
            <span className="font-medium text-slate-700">Kuliah ({stats.kuliah} / {stats.kuliahPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="font-medium text-slate-700">Bekerja ({stats.bekerja} / {stats.bekerjaPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-medium text-slate-700">Wirausaha ({stats.wirausaha} / {stats.wirausahaPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="font-medium text-slate-700">Pelatihan / Gap Year ({stats.pelatihan + stats.gapYear})</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FILTER BAR & SEARCH CONTROLS                                           */}
      {/* ========================================================================= */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari alumni, NISN, nama kampus, prodi, perusahaan, posisi..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg self-end md:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Year Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="all">Semua Angkatan</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Lulusan {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                if (e.target.value !== 'Kuliah') {
                  setSelectedUniversityType('all');
                }
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="Kuliah">Kuliah (Perguruan Tinggi)</option>
              <option value="Bekerja">Bekerja (Dunia Kerja)</option>
              <option value="Wirausaha">Wirausaha Mandiri</option>
              <option value="Pelatihan_Kursus">Pelatihan / Kursus</option>
              <option value="Gap_Year">Gap Year / Persiapan</option>
            </select>
          </div>

          {/* Uni Type Filter (Only if Status Kuliah or All) */}
          {(selectedStatus === 'Kuliah' || selectedStatus === 'all') && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Tipe Kampus:</span>
              <select
                value={selectedUniversityType}
                onChange={(e) => setSelectedUniversityType(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
              >
                <option value="all">Semua Kampus</option>
                <option value="PTN">PTN (Negeri)</option>
                <option value="PTS">PTS (Swasta)</option>
                <option value="Kedinasan">Kedinasan (PTK)</option>
                <option value="Luar_Negeri">Luar Negeri</option>
              </select>
            </div>
          )}

          {/* Class Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Kelas Asal:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="all">Semua Kelas</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button if any active */}
          {(searchQuery ||
            selectedYear !== 'all' ||
            selectedStatus !== 'all' ||
            selectedUniversityType !== 'all' ||
            selectedClass !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedYear('all');
                setSelectedStatus('all');
                setSelectedUniversityType('all');
                setSelectedClass('all');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 hover:bg-rose-50 rounded transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          )}

          <div className="ml-auto text-slate-400 text-[11px]">
            Menampilkan <strong className="text-slate-800">{filteredAlumni.length}</strong> dari {alumniList.length} alumni
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN DATA VIEW: TABLE OR CARDS                                         */}
      {/* ========================================================================= */}
      {filteredAlumni.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Tidak ada data alumni yang cocok</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau ubah filter tahun angkatan dan status kelulusan.
          </p>
          <button
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Data Alumni Sekarang
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[10.5px]">
                  <th className="py-3 px-4">Alumni</th>
                  <th className="py-3 px-4">Lulus / Kelas</th>
                  <th className="py-3 px-4">Status Pasca Lulus</th>
                  <th className="py-3 px-4">Institusi / Perusahaan / Usaha</th>
                  <th className="py-3 px-4">Program Studi / Jabatan</th>
                  <th className="py-3 px-4">Keterangan / Jalur</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredAlumni.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => setSelectedAlumniDetail(item)}
                  >
                    {/* Alumni Name & NISN */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            item.gender === 'L'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            NISN: {item.nisn}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Graduation Year & Class */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.graduationYear}</div>
                      <div className="text-[11px] text-slate-500">{item.lastClass}</div>
                    </td>

                    {/* Status Pasca Lulus */}
                    <td className="py-3.5 px-4">
                      {item.status === 'Kuliah' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                          Kuliah ({item.universityType || 'PT'})
                        </span>
                      )}
                      {item.status === 'Bekerja' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-800">
                          <Briefcase className="w-3.5 h-3.5 text-blue-700" />
                          Bekerja
                        </span>
                      )}
                      {item.status === 'Wirausaha' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-800">
                          <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
                          Wirausaha
                        </span>
                      )}
                      {item.status === 'Pelatihan_Kursus' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-purple-800">
                          <Award className="w-3.5 h-3.5 text-purple-700" />
                          Pelatihan
                        </span>
                      )}
                      {item.status === 'Gap_Year' && (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                          Gap Year
                        </span>
                      )}
                    </td>

                    {/* Institution / Company / Business */}
                    <td className="py-3.5 px-4">
                      {item.status === 'Kuliah' && (
                        <div className="font-medium text-slate-900">
                          {item.universityName || '-'}
                        </div>
                      )}
                      {item.status === 'Bekerja' && (
                        <div className="font-medium text-slate-900">
                          {item.companyName || '-'}
                        </div>
                      )}
                      {item.status === 'Wirausaha' && (
                        <div className="font-medium text-slate-900">
                          {item.businessName || '-'}
                        </div>
                      )}
                      {item.status === 'Pelatihan_Kursus' && (
                        <div className="font-medium text-slate-900 truncate max-w-xs">
                          {item.trainingInstitute || '-'}
                        </div>
                      )}
                      {item.status === 'Gap_Year' && (
                        <div className="text-slate-500 italic">Persiapan Mandiri / UTBK</div>
                      )}
                    </td>

                    {/* Major / Job Title / Business Field */}
                    <td className="py-3.5 px-4">
                      {item.status === 'Kuliah' && (
                        <div>
                          <div className="font-semibold text-slate-800">{item.major || '-'}</div>
                          {item.faculty && (
                            <div className="text-[11px] text-slate-500">{item.faculty}</div>
                          )}
                        </div>
                      )}
                      {item.status === 'Bekerja' && (
                        <div>
                          <div className="font-semibold text-slate-800">{item.jobTitle || '-'}</div>
                          {item.industrySector && (
                            <div className="text-[11px] text-slate-500">{item.industrySector}</div>
                          )}
                        </div>
                      )}
                      {item.status === 'Wirausaha' && (
                        <div>
                          <div className="font-semibold text-slate-800">{item.businessField || '-'}</div>
                        </div>
                      )}
                      {item.status === 'Pelatihan_Kursus' && (
                        <div className="text-slate-600">Pelatihan Kejuruan / Sertifikasi</div>
                      )}
                      {item.status === 'Gap_Year' && (
                        <div className="text-slate-400">-</div>
                      )}
                    </td>

                    {/* Track / Scholarship / Employment Type */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5 text-[11px]">
                        {item.status === 'Kuliah' && (
                          <>
                            {item.admissionTrack && (
                              <span className="font-medium text-slate-700">
                                Jalur: {item.admissionTrack}
                              </span>
                            )}
                            {item.hasScholarship && (
                              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                {item.scholarshipName || 'Beasiswa'}
                              </span>
                            )}
                          </>
                        )}
                        {item.status === 'Bekerja' && (
                          <>
                            <span className="font-medium text-slate-700">
                              Status: {item.employmentType || 'Tetap'}
                            </span>
                            {item.workCity && (
                              <span className="text-slate-500 flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" /> {item.workCity}
                              </span>
                            )}
                          </>
                        )}
                        {item.status === 'Wirausaha' && (
                          <span className="text-amber-800 font-medium">Usaha Mandiri</span>
                        )}
                        {item.status === 'Pelatihan_Kursus' && (
                          <span className="text-purple-800 font-medium">Program Kursus</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditForm(item)}
                          className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Edit Data Alumni"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(item.id, item.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAlumni.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedAlumniDetail(item)}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div>
                {/* Card Header: Avatar & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        item.gender === 'L'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-800 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        NISN: {item.nisn} · Lulus {item.graduationYear}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {item.status === 'Kuliah' && (
                    <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {item.universityType || 'PT'}
                    </span>
                  )}
                  {item.status === 'Bekerja' && (
                    <span className="text-[10.5px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                      Bekerja
                    </span>
                  )}
                  {item.status === 'Wirausaha' && (
                    <span className="text-[10.5px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                      Wirausaha
                    </span>
                  )}
                  {item.status === 'Pelatihan_Kursus' && (
                    <span className="text-[10.5px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
                      Pelatihan
                    </span>
                  )}
                  {item.status === 'Gap_Year' && (
                    <span className="text-[10.5px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      Gap Year
                    </span>
                  )}
                </div>

                {/* Card Body: Outcome Details */}
                <div className="mt-3.5 space-y-1.5 text-xs">
                  {item.status === 'Kuliah' && (
                    <>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">{item.universityName}</span>
                      </div>
                      <div className="text-[11.5px] text-slate-600 pl-5">
                        {item.major} {item.faculty ? `(${item.faculty})` : ''}
                      </div>
                      {item.hasScholarship && (
                        <div className="text-[11px] font-semibold text-emerald-700 pl-5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {item.scholarshipName || 'Penerima Beasiswa'}
                        </div>
                      )}
                    </>
                  )}

                  {item.status === 'Bekerja' && (
                    <>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span className="truncate">{item.companyName}</span>
                      </div>
                      <div className="text-[11.5px] text-slate-600 pl-5">
                        {item.jobTitle} · <span className="text-slate-500">{item.workCity}</span>
                      </div>
                    </>
                  )}

                  {item.status === 'Wirausaha' && (
                    <>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="truncate">{item.businessName}</span>
                      </div>
                      <div className="text-[11.5px] text-slate-600 pl-5">
                        Bidang: {item.businessField}
                      </div>
                    </>
                  )}

                  {item.status === 'Pelatihan_Kursus' && (
                    <>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                        <span className="truncate">{item.trainingInstitute}</span>
                      </div>
                      <div className="text-[11.5px] text-slate-600 pl-5">
                        Pelatihan & Peningkatan Keterampilan
                      </div>
                    </>
                  )}

                  {item.status === 'Gap_Year' && (
                    <div className="text-[11.5px] text-slate-600 italic">
                      {item.notes || 'Persiapan studi lanjut dan ujian masuk PTN tahun depan.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Quick Actions */}
              <div
                className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-medium"
                    title="Hubungi via WhatsApp"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{item.phone}</span>
                  </a>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditForm(item)}
                    className="p-1 text-slate-400 hover:text-emerald-800 rounded transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteConfirm(item.id, item.name)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ADD / EDIT ALUMNI MODAL                                                */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <AlumniFormModal
          isOpen={isFormModalOpen}
          initialData={editingAlumni}
          onClose={() => setIsFormModalOpen(false)}
          onSave={(data) => {
            if (editingAlumni) {
              onUpdateAlumni(editingAlumni.id, data);
            } else {
              onAddAlumni(data);
            }
            setIsFormModalOpen(false);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 6. ALUMNI DETAIL DOSSIER MODAL                                            */}
      {/* ========================================================================= */}
      {selectedAlumniDetail && (
        <AlumniDetailModal
          alumni={selectedAlumniDetail}
          onClose={() => setSelectedAlumniDetail(null)}
          onEdit={() => {
            setEditingAlumni(selectedAlumniDetail);
            setSelectedAlumniDetail(null);
            setIsFormModalOpen(true);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 7. PRINTABLE TRACER STUDY REPORT MODAL                                    */}
      {/* ========================================================================= */}
      {isPrintPreviewOpen && (
        <PrintTracerStudyModal
          isOpen={isPrintPreviewOpen}
          alumniList={filteredAlumni}
          selectedYear={selectedYear}
          stats={stats}
          profile={profile}
          onClose={() => setIsPrintPreviewOpen(false)}
          onUpdateProfile={onUpdateProfile}
          onOpenSettings={onOpenSettings}
        />
      )}
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: ALUMNI FORM MODAL (ADD & EDIT)
// ============================================================================
interface AlumniFormModalProps {
  isOpen: boolean;
  initialData: Alumni | null;
  onClose: () => void;
  onSave: (data: Omit<Alumni, 'id'>) => void;
}

const AlumniFormModal: React.FC<AlumniFormModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Omit<Alumni, 'id'>>({
    nisn: initialData?.nisn || '',
    name: initialData?.name || '',
    gender: initialData?.gender || 'L',
    graduationYear: initialData?.graduationYear || new Date().getFullYear(),
    lastClass: initialData?.lastClass || 'XII-MIPA 1',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    status: initialData?.status || 'Kuliah',
    universityType: initialData?.universityType || 'PTN',
    universityName: initialData?.universityName || '',
    faculty: initialData?.faculty || '',
    major: initialData?.major || '',
    admissionTrack: initialData?.admissionTrack || 'SNBT',
    hasScholarship: initialData?.hasScholarship || false,
    scholarshipName: initialData?.scholarshipName || '',
    companyName: initialData?.companyName || '',
    industrySector: initialData?.industrySector || '',
    jobTitle: initialData?.jobTitle || '',
    workCity: initialData?.workCity || 'Malang',
    employmentType: initialData?.employmentType || 'Tetap',
    businessName: initialData?.businessName || '',
    businessField: initialData?.businessField || '',
    trainingInstitute: initialData?.trainingInstitute || '',
    notes: initialData?.notes || '',
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nisn.trim()) {
      alert('Nama dan NISN wajib diisi');
      return;
    }
    onSave({
      ...formData,
      graduationYear: Number(formData.graduationYear),
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialData ? 'Perbarui Data Alumni' : 'Tambah Rekam Alumni Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Tracer study penelusuran lulusan SMA Surya Buana Malang
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* SECTION 1: IDENTITAS ALUMNI */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Identitas Alumni</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa Lulusan *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Muhammad Wildan Pratama"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Induk Siswa Nasional (NISN) *
                </label>
                <input
                  type="text"
                  name="nisn"
                  value={formData.nisn}
                  onChange={handleChange}
                  required
                  placeholder="10 digit NISN"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kelamin
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tahun Kelulusan *
                </label>
                <input
                  type="number"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  required
                  min={2015}
                  max={2035}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kelas Terakhir di Sekolah
                </label>
                <input
                  type="text"
                  name="lastClass"
                  value={formData.lastClass}
                  onChange={handleChange}
                  placeholder="Contoh: XII-MIPA 1, XII-IPS 2"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. Handphone / WhatsApp Alumni
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Alumni
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  placeholder="alumni@email.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: STATUS PASCA LULUS */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>2. Status Pasca Kelulusan</span>
            </h4>

            {/* Status radio choices */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {[
                { id: 'Kuliah', label: 'Kuliah (Perguruan Tinggi)', icon: BookOpen },
                { id: 'Bekerja', label: 'Bekerja (Industri/Instansi)', icon: Briefcase },
                { id: 'Wirausaha', label: 'Wirausaha Mandiri', icon: TrendingUp },
                { id: 'Pelatihan_Kursus', label: 'Pelatihan / Kursus', icon: Award },
                { id: 'Gap_Year', label: 'Gap Year / Persiapan', icon: HelpCircle },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = formData.status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, status: opt.id as AlumniStatus }))}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      active
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span className="text-[11.5px] leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: CONDITIONAL FIELDS BASED ON STATUS */}
          {formData.status === 'Kuliah' && (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3.5 animate-in fade-in">
              <h5 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                Detail Perguruan Tinggi & Studi Lanjut
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori Perguruan Tinggi
                  </label>
                  <select
                    name="universityType"
                    value={formData.universityType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                  >
                    <option value="PTN">PTN (Perguruan Tinggi Negeri)</option>
                    <option value="PTS">PTS (Perguruan Tinggi Swasta)</option>
                    <option value="Kedinasan">PTK / Ikatan Dinas (STAN, IPDN, Akmil, dll)</option>
                    <option value="Luar_Negeri">Perguruan Tinggi Luar Negeri</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jalur Masuk Kuliah
                  </label>
                  <select
                    name="admissionTrack"
                    value={formData.admissionTrack}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                  >
                    <option value="SNBP">SNBP (Jalur Prestasi Nilai Rapor)</option>
                    <option value="SNBT">SNBT (Jalur Tes UTBK Nasional)</option>
                    <option value="Mandiri">Seleksi Mandiri Kampus</option>
                    <option value="SPAN-PTKIN">SPAN-PTKIN (UIN/IAIN)</option>
                    <option value="Beasiswa">Beasiswa Penuh</option>
                    <option value="Lainnya">Jalur Lainnya</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Perguruan Tinggi / Kampus *
                  </label>
                  <input
                    type="text"
                    name="universityName"
                    value={formData.universityName || ''}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: Universitas Brawijaya (UB) Malang"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fakultas
                  </label>
                  <input
                    type="text"
                    name="faculty"
                    value={formData.faculty || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Fakultas Ilmu Komputer"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Program Studi / Jurusan *
                  </label>
                  <input
                    type="text"
                    name="major"
                    value={formData.major || ''}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: S1 Teknik Informatika"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white font-medium"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="hasScholarship"
                    name="hasScholarship"
                    checked={formData.hasScholarship || false}
                    onChange={handleChange}
                    className="text-emerald-700 focus:ring-emerald-500 rounded"
                  />
                  <label htmlFor="hasScholarship" className="font-semibold text-slate-800 cursor-pointer">
                    Menerima Beasiswa (KIP-Kuliah / Beasiswa Unggulan / Prestasi)
                  </label>
                </div>

                {formData.hasScholarship && (
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Program Beasiswa
                    </label>
                    <input
                      type="text"
                      name="scholarshipName"
                      value={formData.scholarshipName || ''}
                      onChange={handleChange}
                      placeholder="Contoh: KIP-Kuliah Merdeka Kemendikbudristek"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {formData.status === 'Bekerja' && (
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3.5 animate-in fade-in">
              <h5 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-700" />
                Detail Pekerjaan & Perusahaan
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Perusahaan / Instansi Tempat Bekerja *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName || ''}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: PT Telkom Indonesia Tbk"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-700 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bidang Industri / Sektor Usaha
                  </label>
                  <input
                    type="text"
                    name="industrySector"
                    value={formData.industrySector || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Telekomunikasi & IT, Perbankan, Manufaktur"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-700 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Posisi / Jabatan Pekerjaan *
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle || ''}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: Junior Network Engineer"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-700 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kota Tempat Bekerja
                  </label>
                  <input
                    type="text"
                    name="workCity"
                    value={formData.workCity || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Kota Malang, Surabaya, Jakarta"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-700 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status Ketenagakerjaan
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-700 bg-white"
                  >
                    <option value="Tetap">Karyawan Tetap</option>
                    <option value="Kontrak">Karyawan Kontrak (PKWT)</option>
                    <option value="Freelance">Pekerja Lepas / Freelance</option>
                    <option value="Magang">Magang Industri (Internship)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {formData.status === 'Wirausaha' && (
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3.5 animate-in fade-in">
              <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-700" />
                Detail Wirausaha Mandiri
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Usaha / Brand / Toko *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName || ''}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: Surya Creative Apparel & Sablon"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 bg-white font-medium"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bidang Usaha / Produk Jasa
                  </label>
                  <input
                    type="text"
                    name="businessField"
                    value={formData.businessField || ''}
                    onChange={handleChange}
                    placeholder="Contoh: Kuliner & Minuman Kekinian, Konveksi Sablon, Jasa Digital"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-700 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.status === 'Pelatihan_Kursus' && (
            <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3.5 animate-in fade-in">
              <h5 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-700" />
                Detail Lembaga Pelatihan / Kursus Kejuruan
              </h5>

              <div className="text-xs">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lembaga Pelatihan & Program *
                </label>
                <input
                  type="text"
                  name="trainingInstitute"
                  value={formData.trainingInstitute || ''}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: LPK Sakura Nihon Malang (Program Magang Kerja Industri Jepang)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-700 bg-white font-medium"
                />
              </div>
            </div>
          )}

          {/* SECTION 4: CATATAN BIMBINGAN KARIR BK */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="block text-xs font-semibold text-slate-700">
              Catatan Bimbingan Karir / Prestasi / Keterangan Tambahan
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes || ''}
              onChange={handleChange}
              placeholder="Catatan perkembangan pembimbingan karir dari Guru BK Muhammad Burhanudin Muzaqi, M.Psi..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Simpan Data Alumni
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: ALUMNI DETAIL MODAL
// ============================================================================
interface AlumniDetailModalProps {
  alumni: Alumni;
  onClose: () => void;
  onEdit: () => void;
}

const AlumniDetailModal: React.FC<AlumniDetailModalProps> = ({
  alumni,
  onClose,
  onEdit,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                alumni.gender === 'L'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {alumni.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{alumni.name}</h3>
              <p className="text-xs text-slate-500 font-mono">
                NISN: {alumni.nisn} · Angkatan {alumni.graduationYear} ({alumni.lastClass})
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

        <div className="p-6 space-y-4 text-xs">
          {/* Status Box */}
          <div className="p-4 rounded-xl border bg-slate-50/70 border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Status Kelulusan
              </span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md text-xs">
                {alumni.status.replace('_', ' ')}
              </span>
            </div>

            {alumni.status === 'Kuliah' && (
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="text-sm font-extrabold text-slate-900">
                  {alumni.universityName}
                </div>
                <div className="text-slate-700 font-medium">
                  {alumni.major} {alumni.faculty ? `· ${alumni.faculty}` : ''}
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 pt-1">
                  <span>Kategori: <strong>{alumni.universityType}</strong></span>
                  <span>·</span>
                  <span>Jalur: <strong>{alumni.admissionTrack}</strong></span>
                  {alumni.hasScholarship && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-700 font-semibold">
                        Beasiswa: {alumni.scholarshipName || 'Ya'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {alumni.status === 'Bekerja' && (
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="text-sm font-extrabold text-slate-900">
                  {alumni.companyName}
                </div>
                <div className="text-slate-700 font-medium">
                  Posisi: {alumni.jobTitle}
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 pt-1">
                  <span>Industri: <strong>{alumni.industrySector || '-'}</strong></span>
                  <span>·</span>
                  <span>Kota: <strong>{alumni.workCity}</strong></span>
                  <span>·</span>
                  <span>Status: <strong>{alumni.employmentType}</strong></span>
                </div>
              </div>
            )}

            {alumni.status === 'Wirausaha' && (
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="text-sm font-extrabold text-slate-900">
                  {alumni.businessName}
                </div>
                <div className="text-slate-700">
                  Bidang Usaha: <strong>{alumni.businessField}</strong>
                </div>
              </div>
            )}

            {alumni.status === 'Pelatihan_Kursus' && (
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="text-sm font-extrabold text-slate-900">
                  {alumni.trainingInstitute}
                </div>
                <div className="text-slate-600">
                  Program Kursus & Peningkatan Keterampilan Profesi
                </div>
              </div>
            )}
          </div>

          {/* Contact details */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-medium block">Nomor WhatsApp / HP:</span>
              <a
                href={`https://wa.me/${alumni.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-emerald-800 hover:underline flex items-center gap-1 mt-0.5"
              >
                <Phone className="w-3 h-3" />
                {alumni.phone}
              </a>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Email:</span>
              <span className="font-medium text-slate-800 block mt-0.5">
                {alumni.email || '-'}
              </span>
            </div>
          </div>

          {/* Notes */}
          {alumni.notes && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block mb-1">
                Catatan Bimbingan Karir Guru BK:
              </span>
              <p className="text-slate-700 leading-relaxed">{alumni.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: PRINTABLE TRACER STUDY REPORT MODAL
// ============================================================================
interface PrintTracerStudyModalProps {
  isOpen: boolean;
  alumniList: Alumni[];
  selectedYear: string;
  stats: any;
  profile: SchoolProfile;
  onClose: () => void;
  onUpdateProfile?: (updated: Partial<SchoolProfile>) => void;
  onOpenSettings?: () => void;
}

const PrintTracerStudyModal: React.FC<PrintTracerStudyModalProps> = ({
  isOpen,
  alumniList,
  selectedYear,
  stats,
  profile,
  onClose,
  onUpdateProfile,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-200 bg-slate-50 font-sans">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pratinjau & Cetak Laporan Tracer Study
            </h3>
            <p className="text-xs text-slate-500">
              Dokumen rekapitulasi pelacakan kelulusan resmi siap cetak format A4 / simpan PDF
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
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
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

        {/* Printable Document Sheet */}
        <div className="print-container p-8 sm:p-12 text-slate-900 bg-white font-serif">
          {/* Header Kop Surat Resmi */}
          <OfficialLetterhead profile={profile} />

          {/* Document Title */}
          <div className="text-center my-4">
            <h2 className="text-base font-extrabold underline uppercase tracking-wide text-slate-950">
              LAPORAN PENELUSURAN ALUMNI & TRACER STUDY
            </h2>
            <p className="text-xs font-semibold text-slate-700 mt-1 font-sans">
              Periode: {selectedYear === 'all' ? 'Seluruh Angkatan Lulusan' : `Tahun Kelulusan ${selectedYear}`} · {profile.schoolName}
            </p>
          </div>

          {/* Statistical Recap Table */}
          <div className="my-5 text-xs font-sans">
            <h3 className="font-bold text-slate-900 mb-2 uppercase text-[11px] tracking-wider">
              I. REKAPITULASI DISTRIBUSI KELULUSAN
            </h3>
            <table className="w-full border-collapse border border-slate-900 text-center">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-slate-900 py-1.5 px-2">Total Responden</th>
                  <th className="border border-slate-900 py-1.5 px-2">Perguruan Tinggi</th>
                  <th className="border border-slate-900 py-1.5 px-2">Bekerja</th>
                  <th className="border border-slate-900 py-1.5 px-2">Wirausaha</th>
                  <th className="border border-slate-900 py-1.5 px-2">Pelatihan / Gap Year</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-semibold">
                  <td className="border border-slate-900 py-1.5 px-2 font-bold">{stats.total} Siswa</td>
                  <td className="border border-slate-900 py-1.5 px-2">
                    {stats.kuliah} ({stats.kuliahPct}%)
                  </td>
                  <td className="border border-slate-900 py-1.5 px-2">
                    {stats.bekerja} ({stats.bekerjaPct}%)
                  </td>
                  <td className="border border-slate-900 py-1.5 px-2">
                    {stats.wirausaha} ({stats.wirausahaPct}%)
                  </td>
                  <td className="border border-slate-900 py-1.5 px-2">
                    {stats.pelatihan + stats.gapYear} ({stats.pelatihanGapPct}%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Detailed Alumni Table */}
          <div className="my-5 text-xs font-sans">
            <h3 className="font-bold text-slate-900 mb-2 uppercase text-[11px] tracking-wider">
              II. DAFTAR RINCIAN LULUSAN
            </h3>
            <table className="w-full border-collapse border border-slate-900 text-left text-[11px]">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-slate-900 py-1 px-1.5 w-8">No</th>
                  <th className="border border-slate-900 py-1 px-2">Nama Alumni</th>
                  <th className="border border-slate-900 py-1 px-1.5 w-14">Lulus</th>
                  <th className="border border-slate-900 py-1 px-2 w-20">Status</th>
                  <th className="border border-slate-900 py-1 px-2">Institusi / Perusahaan / Usaha</th>
                  <th className="border border-slate-900 py-1 px-2">Program Studi / Posisi</th>
                  <th className="border border-slate-900 py-1 px-2">Jalur / Ket.</th>
                </tr>
              </thead>
              <tbody>
                {alumniList.map((a, idx) => (
                  <tr key={a.id} className="align-top">
                    <td className="border border-slate-900 py-1 px-1.5 text-center">{idx + 1}</td>
                    <td className="border border-slate-900 py-1 px-2">
                      <div className="font-bold text-slate-950">{a.name}</div>
                      <div className="text-[10px] text-slate-600 font-mono">NISN: {a.nisn}</div>
                    </td>
                    <td className="border border-slate-900 py-1 px-1.5 text-center font-medium">
                      {a.graduationYear}
                    </td>
                    <td className="border border-slate-900 py-1 px-2 font-semibold">
                      {a.status.replace('_', ' ')}
                    </td>
                    <td className="border border-slate-900 py-1 px-2">
                      {a.status === 'Kuliah' && a.universityName}
                      {a.status === 'Bekerja' && a.companyName}
                      {a.status === 'Wirausaha' && a.businessName}
                      {a.status === 'Pelatihan_Kursus' && a.trainingInstitute}
                      {a.status === 'Gap_Year' && 'Persiapan Mandiri'}
                    </td>
                    <td className="border border-slate-900 py-1 px-2">
                      {a.status === 'Kuliah' && a.major}
                      {a.status === 'Bekerja' && a.jobTitle}
                      {a.status === 'Wirausaha' && a.businessField}
                      {a.status === 'Pelatihan_Kursus' && 'Kursus Kejuruan'}
                      {a.status === 'Gap_Year' && '-'}
                    </td>
                    <td className="border border-slate-900 py-1 px-2 text-[10px]">
                      {a.status === 'Kuliah' && (
                        <div>
                          <span>{a.admissionTrack}</span>
                          {a.hasScholarship && (
                            <span className="block font-semibold text-emerald-800">
                              (Beasiswa)
                            </span>
                          )}
                        </div>
                      )}
                      {a.status === 'Bekerja' && `${a.employmentType || 'Tetap'} (${a.workCity || 'Malang'})`}
                      {a.status === 'Wirausaha' && 'Mandiri'}
                      {a.status === 'Pelatihan_Kursus' && 'Sertifikasi'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature Block */}
          <div className="mt-8 pt-4 flex justify-between items-start text-xs font-sans print-break-inside-avoid">
            <div className="text-center w-60">
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-semibold text-slate-800">Kepala Sekolah</p>
              <div className="h-20" />
              <p className="font-bold underline text-slate-900">{profile.principalName}</p>
              <p className="text-[11px] text-slate-600">NIP: {profile.principalNIP || '-'}</p>
            </div>

            <div className="text-center w-60">
              <p className="text-slate-600">Malang, {currentDateStr}</p>
              <p className="font-semibold text-slate-800">Guru Bimbingan dan Konseling</p>
              <div className="h-20" />
              <p className="font-bold underline text-slate-900">{profile.leadCounselorName}</p>
              <p className="text-[11px] text-slate-600">NIP: {profile.leadCounselorNIP || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
