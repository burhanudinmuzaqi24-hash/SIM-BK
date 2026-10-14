import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Trash2,
  Printer,
  Clock,
  CheckCircle,
  Building,
  User,
  ShieldAlert,
  ClipboardList,
  Download,
  Calendar,
  X,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
  Check,
  BookOpen,
  Tag,
  Layers,
  Edit3,
  Users,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  PermissionLetter,
  Student,
  PermissionLetterType,
  SchoolProfile,
} from '../types';
import {
  formatDateIndonesian,
  generateLetterNumber,
  getMonthRoman,
  getLetterYear,
} from '../utils/storage';
import { OfficialLetterhead } from '../components/OfficialLetterhead';

interface PermissionLetterViewProps {
  letters: PermissionLetter[];
  students: Student[];
  profile: SchoolProfile;
  onAddLetter: (letter: Omit<PermissionLetter, 'id'>) => void;
  onUpdateLetter?: (id: string, updated: Partial<PermissionLetter>) => void;
  onDeleteLetter: (id: string) => void;
  onPrintLetter: (letter: PermissionLetter) => void;
  initialStudentId?: string;
  autoOpenCreate?: boolean;
  onClearInitialState?: () => void;
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

export interface LetterCodeConfig {
  code: 'BK-SPK' | 'BK-SIK' | 'BK-SLS' | 'BK-SLB' | 'BK-SPKS' | 'BK-SPO' | 'BK-SDO';
  title: string;
  shortDesc: string;
  bgLight: string;
  borderLight: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
}

export const LETTER_CODE_CONFIGS: LetterCodeConfig[] = [
  {
    code: 'BK-SDO',
    title: 'Surat Izin Dispen Kegiatan Organisasi',
    shortDesc: 'Dispensasi KBM bagi pengurus & anggota organisasi (OSIS, MPK, Pramuka, PMR, Rohis, dll.) berdasarkan surat permohonan dari organisasi',
    bgLight: 'bg-teal-50/70',
    borderLight: 'border-teal-200',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-900',
    accentColor: 'text-teal-800',
  },
  {
    code: 'BK-SPK',
    title: 'Surat Perizinan Mengikuti Kegiatan',
    shortDesc: 'Dispensasi siswa mengikuti lomba, perkemahan, diklat, atau kegiatan di luar madrasah/sekolah',
    bgLight: 'bg-emerald-50/70',
    borderLight: 'border-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    accentColor: 'text-emerald-800',
  },
  {
    code: 'BK-SIK',
    title: 'Surat Izin Meninggalkan KBM',
    shortDesc: 'Izin meninggalkan kelas atau masuk kembali saat jam kegiatan belajar mengajar berlangsung',
    bgLight: 'bg-indigo-50/70',
    borderLight: 'border-indigo-200',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-900',
    accentColor: 'text-indigo-800',
  },
  {
    code: 'BK-SLS',
    title: 'Surat Izin Keperluan Di Luar Sekolah',
    shortDesc: 'Izin keluar lingkungan sekolah untuk urusan mendesak keluarga atau dinas singkat',
    bgLight: 'bg-blue-50/70',
    borderLight: 'border-blue-200',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
    accentColor: 'text-blue-800',
  },
  {
    code: 'BK-SLB',
    title: 'Surat Perizinan Layanan BK',
    shortDesc: 'Pemberian konseling individual, bimbingan kelompok, mediasi teman sebaya, atau asesmen',
    bgLight: 'bg-purple-50/70',
    borderLight: 'border-purple-200',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
    accentColor: 'text-purple-800',
  },
  {
    code: 'BK-SPKS',
    title: 'Surat Pernyataan dan Komitmen Siswa',
    shortDesc: 'Pernyataan pelanggaran tata tertib dan komitmen perbaikan perilaku serta perjanjian disiplin',
    bgLight: 'bg-amber-50/70',
    borderLight: 'border-amber-200',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    accentColor: 'text-amber-800',
  },
  {
    code: 'BK-SPO',
    title: 'Surat Panggilan Orang Tua / Wali',
    shortDesc: 'Undangan resmi koordinasi tatap muka orang tua ke ruang BK mengenai pembinaan peserta didik',
    bgLight: 'bg-rose-50/70',
    borderLight: 'border-rose-200',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900',
    accentColor: 'text-rose-800',
  },
];

export const getStandardLetterCode = (
  type: PermissionLetterType
): 'BK-SPK' | 'BK-SIK' | 'BK-SLS' | 'BK-SLB' | 'BK-SPKS' | 'BK-SPO' | 'BK-SDO' => {
  if (type === 'BK-SDO' || type === 'Dispensasi_Organisasi') return 'BK-SDO';
  if (type === 'BK-SPK' || type === 'Dispensasi_Kegiatan') return 'BK-SPK';
  if (type === 'BK-SIK' || type === 'Izin_Masuk_Kelas') return 'BK-SIK';
  if (type === 'BK-SLS' || type === 'Izin_Keluar_Sekolah') return 'BK-SLS';
  if (type === 'BK-SLB') return 'BK-SLB';
  if (type === 'BK-SPKS') return 'BK-SPKS';
  if (type === 'BK-SPO' || type === 'Panggilan_Orang_Tua') return 'BK-SPO';
  return 'BK-SIK';
};

export const PermissionLetterView: React.FC<PermissionLetterViewProps> = ({
  letters,
  students,
  profile,
  onAddLetter,
  onUpdateLetter,
  onDeleteLetter,
  onPrintLetter,
  initialStudentId,
  autoOpenCreate,
  onClearInitialState,
}) => {
  // Navigation: Daftar Surat vs Rekapitulasi per Kode
  const [activeTab, setActiveTab] = useState<'list' | 'recap'>('list');

  // Modal State for New Letter
  const [showAddModal, setShowAddModal] = useState(false);
  // Modal State for Print Recap per Code
  const [showPrintRecapModal, setShowPrintRecapModal] = useState(false);

  // Quick Edit Letter Number State
  const [editingLetterNumber, setEditingLetterNumber] = useState<{
    id: string;
    currentNumber: string;
    studentName: string;
  } | null>(null);

  // Filter State in Tab 1 (Daftar Surat)
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Filter State in Tab 2 (Rekapitulasi per Kode)
  const currentDate = new Date();
  const [recapCodeFilter, setRecapCodeFilter] = useState<string>('all');
  const [recapMonthFilter, setRecapMonthFilter] = useState<number | 'all'>('all');
  const [recapYearFilter, setRecapYearFilter] = useState<number>(currentDate.getFullYear());
  const [recapClassFilter, setRecapClassFilter] = useState<string>('all');
  const [recapSearchQuery, setRecapSearchQuery] = useState<string>('');

  // Student Multi-Select Filter State inside Add Modal
  const [studentPickerSearch, setStudentPickerSearch] = useState('');
  const [studentPickerClass, setStudentPickerClass] = useState('all');

  // Form State
  const [formData, setFormData] = useState({
    type: 'BK-SDO' as PermissionLetterType,
    studentId: '',
    studentIds: [] as string[],
    manualLetterNumber: '',
    isManualNumber: false,
    date: new Date().toISOString().slice(0, 10),
    departureTime: '08:00',
    returnTime: '13:30',
    isReturningToSchool: true,
    reason: '',
    destinationOrActivity: 'Persiapan Teknis & Pelaksanaan Kegiatan Organisasi',
    eventOrganizerOrTeacher: 'Ilmi Muhadiatil Izza, S.Pd',
    parentAppointmentDate: '',
    parentAppointmentTime: '09:00 WIB',
    parentAppointmentRoom: profile.counselingRoomName,
    schoolPicketTeacher: 'Drs. Maryono',
    homeroomTeacher: '',
    wakaKesiswaanName: 'Ilmi Muhadiatil Izza S.Pd',
    coachName: 'Mohammad Khoirul Anam',
    coachRole: 'Pelatih Pramuka',
    advisorName: 'Ilmi Muhadiatil Izza, S.Pd.',
    advisorRole: 'Guru Pembina Organisasi',
    serviceTypeChoice: 'Konseling Individu',
    otherServiceText: '',
    incidentPlace: 'Lingkungan SMA Surya Buana Malang',
    incidentDescription: '',
    notes: '',

    // Khusus Surat Izin Dispen Organisasi (BK-SDO)
    organizationName: 'OSIS SMA Surya Buana Malang',
    organizationLetterNumber: '',
    organizationLetterDate: new Date().toISOString().slice(0, 10),
    studentRoleInOrg: 'Ketua Panitia Pelaksana',
    orgLeaderName: 'Fajar Maulana Ilham',
    orgLeaderRole: 'Ketua OSIS',
    orgAdvisorName: 'Ilmi Muhadiatil Izza, S.Pd.',
    activityDuration: 'Sepanjang Jam KBM Efektif (08:00 - 13:30 WIB)',
    participantList: '',
  });

  // Handle direct quick action jump
  useEffect(() => {
    if (autoOpenCreate && initialStudentId) {
      const student = students.find((s) => s.id === initialStudentId);
      setFormData((prev) => ({
        ...prev,
        studentId: initialStudentId,
        studentIds: [initialStudentId],
        homeroomTeacher: student?.homeroomTeacher || prev.homeroomTeacher,
      }));
      setShowAddModal(true);
      onClearInitialState?.();
    }
  }, [autoOpenCreate, initialStudentId, students, onClearInitialState]);

  const classList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.className));
    return Array.from(set).sort();
  }, [students]);

  // Students matching the picker filter in Add Modal
  const pickerStudents = useMemo(() => {
    return students.filter((s) => {
      const q = studentPickerSearch.toLowerCase();
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        (s.nisn && s.nisn.includes(q)) ||
        s.className.toLowerCase().includes(q);
      const matchClass = studentPickerClass === 'all' || s.className === studentPickerClass;
      return matchSearch && matchClass;
    });
  }, [students, studentPickerSearch, studentPickerClass]);

  const toggleStudentSelection = (stId: string) => {
    setFormData((prev) => {
      const exists = prev.studentIds.includes(stId);
      const newIds = exists
        ? prev.studentIds.filter((id) => id !== stId)
        : [...prev.studentIds, stId];
      const primaryId = newIds[0] || '';
      const primaryStudent = students.find((s) => s.id === primaryId);
      return {
        ...prev,
        studentIds: newIds,
        studentId: primaryId,
        homeroomTeacher: primaryStudent?.homeroomTeacher || prev.homeroomTeacher,
      };
    });
  };

  const handleSelectAllPicker = () => {
    const idsToAdd = pickerStudents.map((s) => s.id);
    setFormData((prev) => {
      const merged = Array.from(new Set([...prev.studentIds, ...idsToAdd]));
      const primaryId = merged[0] || '';
      const primaryStudent = students.find((s) => s.id === primaryId);
      return {
        ...prev,
        studentIds: merged,
        studentId: primaryId,
        homeroomTeacher: primaryStudent?.homeroomTeacher || prev.homeroomTeacher,
      };
    });
  };

  const handleClearAllPicker = () => {
    setFormData((prev) => ({
      ...prev,
      studentIds: [],
      studentId: '',
    }));
  };

  // Filtered Letters for Tab 1 (Daftar Surat)
  const filteredLetters = useMemo(() => {
    return letters.filter((letter) => {
      const student = students.find((s) => s.id === letter.studentId);
      const studentName = (student?.name || '').toLowerCase();
      const numLower = letter.letterNumber.toLowerCase();
      const reasonLower = (letter.reason || '').toLowerCase();
      const searchLower = searchQuery.toLowerCase();

      const matchSearch =
        studentName.includes(searchLower) ||
        numLower.includes(searchLower) ||
        reasonLower.includes(searchLower);

      let matchType = typeFilter === 'all';
      if (!matchType) {
        const stdCode = getStandardLetterCode(letter.type);
        matchType = stdCode === typeFilter;
      }

      return matchSearch && matchType;
    });
  }, [letters, students, searchQuery, typeFilter]);

  // =========================================================================
  // REKAPITULASI SURAT PER KODE (TAB 2)
  // =========================================================================

  // Grouped stats per Code
  const codeStats = useMemo(() => {
    const totalAll = letters.length;
    return LETTER_CODE_CONFIGS.map((cfg) => {
      const matchingLetters = letters
        .filter((l) => getStandardLetterCode(l.type) === cfg.code)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const count = matchingLetters.length;
      const percent = totalAll > 0 ? Math.round((count / totalAll) * 100) : 0;
      const latestLetter = matchingLetters[0];

      return {
        ...cfg,
        count,
        percent,
        latestLetterNumber: latestLetter?.letterNumber || '-',
        latestDate: latestLetter?.date || null,
      };
    });
  }, [letters]);

  // Filtered list for the Recap Table
  const filteredRecapLetters = useMemo(() => {
    return letters
      .filter((letter) => {
        const student = students.find((s) => s.id === letter.studentId);
        const studentName = (student?.name || '').toLowerCase();
        const numLower = letter.letterNumber.toLowerCase();
        const reasonLower = (
          letter.reason ||
          letter.destinationOrActivity ||
          letter.incidentDescription ||
          ''
        ).toLowerCase();
        const searchLower = recapSearchQuery.toLowerCase();

        // 1. Search Query
        const matchSearch =
          studentName.includes(searchLower) ||
          numLower.includes(searchLower) ||
          reasonLower.includes(searchLower);

        // 2. Code Filter
        const stdCode = getStandardLetterCode(letter.type);
        const matchCode = recapCodeFilter === 'all' || stdCode === recapCodeFilter;

        // 3. Class Filter
        const matchClass =
          recapClassFilter === 'all' || student?.className === recapClassFilter;

        // 4. Month & Year Filter
        const d = new Date(letter.date);
        const matchYear = isNaN(d.getTime()) || d.getFullYear() === recapYearFilter;
        const matchMonth =
          recapMonthFilter === 'all' ||
          (!isNaN(d.getTime()) && d.getMonth() === recapMonthFilter);

        return matchSearch && matchCode && matchClass && matchYear && matchMonth;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [
    letters,
    students,
    recapSearchQuery,
    recapCodeFilter,
    recapClassFilter,
    recapYearFilter,
    recapMonthFilter,
  ]);

  // Active Code Configuration for details / printing
  const activeCodeConfig = useMemo(() => {
    return LETTER_CODE_CONFIGS.find((c) => c.code === recapCodeFilter) || null;
  }, [recapCodeFilter]);

  // Live calculation of letter number based on same code & creation date
  const liveLetterInfo = useMemo(() => {
    const code = getStandardLetterCode(formData.type);
    const roman = getMonthRoman(formData.date);
    const yr = getLetterYear(formData.date);
    const fullNumber = generateLetterNumber(formData.type, letters, formData.date);

    const match = fullNumber.match(/^(\d+)\//);
    const sequenceNum = match ? parseInt(match[1], 10) : 1;

    const existingSameCodeLetters = letters.filter((l) => {
      const matchCode = getStandardLetterCode(l.type) === code;
      const lYear = getLetterYear(l.date || l.letterNumber);
      return matchCode && lYear === yr;
    });

    let monthName = '-';
    if (formData.date) {
      const matchMonth = formData.date.match(/^\d{4}-(\d{1,2})/);
      if (matchMonth) {
        const mIdx = parseInt(matchMonth[1], 10) - 1;
        if (mIdx >= 0 && mIdx < MONTH_NAMES.length) {
          monthName = MONTH_NAMES[mIdx];
        }
      }
    }

    return {
      code,
      roman,
      year: yr,
      fullNumber,
      sequenceNum,
      existingCount: existingSameCodeLetters.length,
      monthName,
    };
  }, [formData.type, formData.date, letters]);

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalStudentIds =
      formData.studentIds.length > 0
        ? formData.studentIds
        : formData.studentId
        ? [formData.studentId]
        : [];

    if (finalStudentIds.length === 0) {
      alert('Pilih minimal satu siswa yang bersangkutan!');
      return;
    }

    const primaryStudentId = finalStudentIds[0];
    const st = students.find((s) => s.id === primaryStudentId);
    const generatedNum = generateLetterNumber(formData.type, letters, formData.date);
    const finalLetterNumber =
      formData.isManualNumber && formData.manualLetterNumber.trim()
        ? formData.manualLetterNumber.trim()
        : generatedNum;

    onAddLetter({
      letterNumber: finalLetterNumber,
      isManualLetterNumber: formData.isManualNumber,
      type: formData.type,
      studentId: primaryStudentId,
      studentIds: finalStudentIds,
      date: formData.date,
      departureTime: formData.departureTime,
      returnTime: formData.returnTime,
      isReturningToSchool: formData.isReturningToSchool,
      reason: formData.reason || formData.destinationOrActivity,
      destinationOrActivity: formData.destinationOrActivity,
      eventOrganizerOrTeacher: formData.eventOrganizerOrTeacher,
      parentAppointmentDate: formData.parentAppointmentDate || undefined,
      parentAppointmentTime: formData.parentAppointmentTime || undefined,
      parentAppointmentRoom: formData.parentAppointmentRoom || profile.counselingRoomName,
      status: 'Disetujui',
      counselorSignatureName: 'Muhammad Burhanudin Muzaqi, M.Psi.',
      counselorNIP: '-',
      schoolPicketTeacher: formData.schoolPicketTeacher,
      homeroomTeacher: st?.homeroomTeacher || formData.homeroomTeacher,
      headmasterName: profile.principalName,
      headmasterNIP: profile.principalNIP,
      wakaKesiswaanName: formData.wakaKesiswaanName || 'Ilmi Muhadiatil Izza S.Pd',
      coachName: formData.coachName,
      coachRole: formData.coachRole,
      advisorName: formData.advisorName,
      advisorRole: formData.advisorRole,
      serviceTypeChoice: formData.serviceTypeChoice,
      otherServiceText: formData.otherServiceText,
      incidentPlace: formData.incidentPlace,
      incidentDescription: formData.incidentDescription,
      notes: formData.notes,

      // Khusus Surat Izin Dispen Organisasi (BK-SDO)
      organizationName: formData.organizationName,
      organizationLetterNumber: formData.organizationLetterNumber,
      organizationLetterDate: formData.organizationLetterDate,
      studentRoleInOrg: formData.studentRoleInOrg,
      orgLeaderName: formData.orgLeaderName,
      orgLeaderRole: formData.orgLeaderRole,
      orgAdvisorName: formData.orgAdvisorName,
      activityDuration: formData.activityDuration,
      participantList: formData.participantList,
    });

    setShowAddModal(false);
  };

  const getTypeName = (type: PermissionLetterType) => {
    switch (type) {
      case 'BK-SDO':
      case 'Dispensasi_Organisasi':
        return 'Dispensasi Kegiatan Organisasi (BK-SDO)';
      case 'BK-SPK':
      case 'Dispensasi_Kegiatan':
        return 'Perizinan Mengikuti Kegiatan (BK-SPK)';
      case 'BK-SIK':
      case 'Izin_Masuk_Kelas':
        return 'Izin Meninggalkan KBM (BK-SIK)';
      case 'BK-SLS':
      case 'Izin_Keluar_Sekolah':
        return 'Izin Di Luar Sekolah (BK-SLS)';
      case 'BK-SLB':
        return 'Perizinan Layanan BK (BK-SLB)';
      case 'BK-SPKS':
        return 'Pernyataan & Komitmen Siswa (BK-SPKS)';
      case 'BK-SPO':
      case 'Panggilan_Orang_Tua':
        return 'Panggilan Orang Tua (BK-SPO)';
      default:
        return type;
    }
  };

  // CSV Export for Letter Recap per Code
  const handleDownloadRecapCSV = () => {
    const codeLabel = recapCodeFilter === 'all' ? 'SEMUA_KODE' : recapCodeFilter;
    const periodLabel =
      recapMonthFilter === 'all'
        ? `Tahun_${recapYearFilter}`
        : `${MONTH_NAMES[recapMonthFilter]}_${recapYearFilter}`;

    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += `BUKU REGISTER & REKAPITULASI SURAT RESMI BK - ${profile.schoolName}\n`;
    csvContent += `Kode Klasifikasi: ${
      activeCodeConfig ? `${activeCodeConfig.code} - ${activeCodeConfig.title}` : 'Semua Kode Surat'
    }\n`;
    csvContent += `Periode: ${
      recapMonthFilter === 'all'
        ? `Sepanjang Tahun ${recapYearFilter}`
        : `Bulan ${MONTH_NAMES[recapMonthFilter]} ${recapYearFilter}`
    } | Rombel: ${recapClassFilter === 'all' ? 'Semua Kelas' : recapClassFilter}\n`;
    csvContent += `Pengampu Pelayanan BK: ${profile.leadCounselorName}\n\n`;

    csvContent += `No Agenda,No Surat Resmi,Kode,Tanggal Terbit,NISN,Nama Siswa,Kelas,Perihal / Keperluan / Uraian Kegiatan,Tujuan / Tempat,Guru Pendamping / Pelapor / Waka,Status\n`;

    filteredRecapLetters.forEach((letter, idx) => {
      const student = students.find((s) => s.id === letter.studentId);
      const stdCode = getStandardLetterCode(letter.type);
      const cleanReason = `"${(
        letter.reason ||
        letter.destinationOrActivity ||
        letter.incidentDescription ||
        '-'
      ).replace(/"/g, '""')}"`;
      const cleanDestination = `"${(
        letter.destinationOrActivity ||
        letter.incidentPlace ||
        '-'
      ).replace(/"/g, '""')}"`;
      const cleanOfficer = `"${(
        letter.eventOrganizerOrTeacher ||
        letter.coachName ||
        letter.advisorName ||
        letter.schoolPicketTeacher ||
        '-'
      ).replace(/"/g, '""')}"`;

      csvContent += `${idx + 1},"${letter.letterNumber}",${stdCode},${letter.date},'${
        student?.nisn || '-'
      },"${student?.name || 'Siswa'}","${student?.className || '-'}",${cleanReason},${cleanDestination},${cleanOfficer},${letter.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekap_Surat_${codeLabel}_${periodLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-800" />
            <h2 className="text-lg font-bold text-slate-900">
              Penerbitan & Rekapitulasi Surat Resmi BK
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Format resmi 7 kode administrasi: BK-SDO (Dispen Organisasi), BK-SPK (Kegiatan), BK-SIK (Meninggalkan KBM), BK-SLS (Luar Sekolah), BK-SLB (Layanan BK), BK-SPKS (Komitmen Siswa), dan BK-SPO (Panggilan Ortu).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Surat Baru</span>
          </button>
        </div>
      </div>

      {/* Main Tab Switcher: Daftar Surat vs Rekapitulasi per Kode */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Daftar & Terbit Surat Keluar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'recap'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Perekapan Surat per Kode (Buku Register)</span>
          </button>
        </div>

        <div className="text-slate-500 text-xs font-mono tabular-nums">
          Total Terarsip: <strong>{letters.length}</strong> Dokumen Surat
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: DAFTAR & TERBIT SURAT KELUAR                                   */}
      {/* ===================================================================== */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Quick Category Tabs (7 Format Resmi Termasuk Dispen Organisasi) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 text-xs">
            {LETTER_CODE_CONFIGS.map((cfg) => {
              const count = letters.filter(
                (l) => getStandardLetterCode(l.type) === cfg.code
              ).length;
              const isActive = typeFilter === cfg.code;
              return (
                <button
                  key={cfg.code}
                  onClick={() => setTypeFilter(isActive ? 'all' : cfg.code)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="block font-bold">{cfg.code}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                      {count}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                    {cfg.title.replace('Surat ', '').replace('Perizinan ', '').replace('Izin ', '')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Recap Mode Banner Shortcut */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/70 rounded-xl p-3 px-4 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                <BookOpen className="w-3.5 h-3.5" />
              </span>
              <div>
                <strong className="text-slate-900">Fitur Perekapan Surat per Kode:</strong>{' '}
                <span className="text-slate-600">
                  Lihat rekapitulasi buku register, cetak rekap per kode klasifikasi resmi, dan ekspor arsip surat keluar.
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('recap')}
              className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-emerald-800 hover:text-white border border-emerald-300 text-emerald-900 text-[11px] font-bold rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              <span>Buka Perekapan per Kode</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa, nomor surat, atau alasan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
              >
                <option value="all">Semua Kode Surat</option>
                <option value="BK-SDO">BK-SDO : Izin Dispen Kegiatan Organisasi</option>
                <option value="BK-SPK">BK-SPK : Izin Mengikuti Kegiatan</option>
                <option value="BK-SIK">BK-SIK : Izin Meninggalkan KBM</option>
                <option value="BK-SLS">BK-SLS : Izin Keperluan Di Luar Sekolah</option>
                <option value="BK-SLB">BK-SLB : Perizinan Layanan BK</option>
                <option value="BK-SPKS">BK-SPKS : Pernyataan & Komitmen Siswa</option>
                <option value="BK-SPO">BK-SPO : Panggilan Orang Tua</option>
              </select>
            </div>

            <div className="text-slate-500 text-xs font-mono tabular-nums">
              Ditemukan: <strong>{filteredLetters.length}</strong> dokumen
            </div>
          </div>

          {/* Letters Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">No. Surat & Tanggal</th>
                    <th className="py-3 px-4">Kode & Jenis Dokumen</th>
                    <th className="py-3 px-4">Nama Siswa / Kelas</th>
                    <th className="py-3 px-4">Waktu / Jadwal</th>
                    <th className="py-3 px-4">Keperluan / Keterangan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLetters.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        Tidak ada dokumen surat yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLetters.map((letter) => {
                      const student = students.find((s) => s.id === letter.studentId);
                      const stdCode = getStandardLetterCode(letter.type);
                      return (
                        <tr key={letter.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 font-mono tabular-nums">
                                {letter.letterNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingLetterNumber({
                                    id: letter.id,
                                    currentNumber: letter.letterNumber,
                                    studentName: student?.name || 'Siswa',
                                  })
                                }
                                className="text-slate-400 hover:text-emerald-700 p-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Koreksi / Ganti Nomor Surat"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                              {formatDateIndonesian(letter.date)}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-block px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-900 text-white">
                                {stdCode}
                              </span>
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 truncate max-w-[200px]">
                                {getTypeName(letter.type)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                              <span>{student?.name || 'Siswa'}</span>
                              {letter.studentIds && letter.studentIds.length > 1 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-200">
                                  +{letter.studentIds.length - 1} Siswa Lainnya
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                              {letter.studentIds && letter.studentIds.length > 1
                                ? `Total ${letter.studentIds.length} Siswa Terpilih`
                                : `Kelas ${student?.className || '-'}`}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-mono tabular-nums">
                            {letter.departureTime ? (
                              <>
                                {letter.departureTime}{' '}
                                {letter.returnTime ? `s.d. ${letter.returnTime} WIB` : 'WIB'}
                              </>
                            ) : letter.parentAppointmentTime ? (
                              <>Waktu: {letter.parentAppointmentTime}</>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-800 max-w-xs">
                            <p className="line-clamp-2">
                              {letter.reason ||
                                letter.destinationOrActivity ||
                                letter.incidentDescription ||
                                '-'}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onPrintLetter(letter)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                title="Buka & Cetak Format Resmi"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Cetak</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Hapus dokumen surat ini?')) {
                                    onDeleteLetter(letter.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: PEREKAPAN SURAT PER KODE (BUKU REGISTER & AGENDA RESMI)         */}
      {/* ===================================================================== */}
      {activeTab === 'recap' && (
        <div className="space-y-5">
          {/* Dashboard Ringkasan 6 Kode Klasifikasi Surat */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-800" />
                <span>Distribusi & Rekapitulasi Kode Surat Bimbingan dan Konseling</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                Pilih kartu kode untuk memfilter buku register secara instan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {codeStats.map((item) => {
                const isSelected = recapCodeFilter === item.code;
                return (
                  <div
                    key={item.code}
                    onClick={() => setRecapCodeFilter(isSelected ? 'all' : item.code)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm bg-white'
                        : `${item.bgLight} ${item.borderLight} hover:border-slate-300 hover:shadow-2xs`
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded font-mono font-bold text-xs ${item.badgeBg} ${item.badgeText}`}
                        >
                          {item.code}
                        </span>
                        <div className="text-right">
                          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 block leading-tight">
                            {item.count}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.percent}% dari total
                          </span>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs mt-2 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                        {item.shortDesc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 text-[10px] text-slate-500 flex items-center justify-between">
                      <div className="truncate max-w-[170px]" title={item.latestLetterNumber}>
                        Terakhir: <strong className="font-mono text-slate-700">{item.latestLetterNumber}</strong>
                      </div>
                      <span className="text-emerald-800 font-semibold shrink-0">
                        {isSelected ? '✓ Terpilih' : 'Filter Kode →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter Bar Perekapan */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-emerald-800" />
                Filter Rekapitulasi:
              </span>

              {/* Kode Filter */}
              <select
                value={recapCodeFilter}
                onChange={(e) => setRecapCodeFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 font-bold"
              >
                <option value="all">Semua Kode Dokumen (Global)</option>
                {LETTER_CODE_CONFIGS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} : {c.title}
                  </option>
                ))}
              </select>

              {/* Month Filter */}
              <select
                value={recapMonthFilter}
                onChange={(e) =>
                  setRecapMonthFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
              >
                <option value="all">Sepanjang Tahun</option>
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    Bulan {m}
                  </option>
                ))}
              </select>

              {/* Year Filter */}
              <select
                value={recapYearFilter}
                onChange={(e) => setRecapYearFilter(Number(e.target.value))}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
              >
                {[recapYearFilter - 1, recapYearFilter, recapYearFilter + 1].map((yr) => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>

              {/* Class Filter */}
              <select
                value={recapClassFilter}
                onChange={(e) => setRecapClassFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
              >
                <option value="all">Semua Kelas</option>
                {classList.map((c) => (
                  <option key={c} value={c}>
                    Kelas {c}
                  </option>
                ))}
              </select>

              {/* Search text */}
              <div className="relative min-w-[160px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari siswa/nomor..."
                  value={recapSearchQuery}
                  onChange={(e) => setRecapSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadRecapCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                title="Download data rekapitulasi dalam format CSV Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPrintRecapModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold cursor-pointer shadow-2xs"
                title="Cetak lembar buku register surat dinas resmi"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Buku Register ({recapCodeFilter})</span>
              </button>
            </div>
          </div>

          {/* Table Buku Register & Rekapitulasi per Kode */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Buku Register Surat Masuk & Keluar:{' '}
                  <span className="text-emerald-900">
                    {recapCodeFilter === 'all'
                      ? 'Seluruh Kode Klasifikasi'
                      : `${recapCodeFilter} (${activeCodeConfig?.title || ''})`}
                  </span>
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Total Tercatat: <strong>{filteredRecapLetters.length}</strong> Dokumen
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 min-w-[150px]">Nomor Surat & Tanggal</th>
                    <th className="py-2.5 px-3 w-20 text-center">Kode</th>
                    <th className="py-2.5 px-3 min-w-[180px]">Peserta Didik (Siswa)</th>
                    <th className="py-2.5 px-3 min-w-[220px]">Perihal / Keperluan / Kegiatan</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Penanggung Jawab / Pihak Terkait</th>
                    <th className="py-2.5 px-3 min-w-[80px] text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecapLetters.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                        Tidak ada arsip surat yang sesuai dengan kriteria filter kode atau periode ini.
                      </td>
                    </tr>
                  ) : (
                    filteredRecapLetters.map((letter, idx) => {
                      const student = students.find((s) => s.id === letter.studentId);
                      const stdCode = getStandardLetterCode(letter.type);
                      const officer =
                        letter.eventOrganizerOrTeacher ||
                        letter.coachName ||
                        letter.advisorName ||
                        letter.schoolPicketTeacher ||
                        letter.wakaKesiswaanName ||
                        '-';

                      return (
                        <tr key={letter.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 text-center font-mono text-slate-400 tabular-nums">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 font-mono tabular-nums">
                                {letter.letterNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingLetterNumber({
                                    id: letter.id,
                                    currentNumber: letter.letterNumber,
                                    studentName: student?.name || 'Siswa',
                                  })
                                }
                                className="text-slate-400 hover:text-emerald-700 p-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Koreksi / Ganti Nomor Surat"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {formatDateIndonesian(letter.date)}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[10.5px] ${
                                stdCode === 'BK-SDO'
                                  ? 'bg-teal-100 text-teal-900 border border-teal-200'
                                  : stdCode === 'BK-SPK'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : stdCode === 'BK-SIK'
                                  ? 'bg-indigo-100 text-indigo-900'
                                  : stdCode === 'BK-SLS'
                                  ? 'bg-blue-100 text-blue-900'
                                  : stdCode === 'BK-SLB'
                                  ? 'bg-purple-100 text-purple-900'
                                  : stdCode === 'BK-SPKS'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-rose-100 text-rose-900'
                              }`}
                            >
                              {stdCode}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                              <span>{student?.name || 'Siswa'}</span>
                              {letter.studentIds && letter.studentIds.length > 1 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-200">
                                  +{letter.studentIds.length - 1} Siswa
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {letter.studentIds && letter.studentIds.length > 1
                                ? `Total ${letter.studentIds.length} Siswa Terdaftar`
                                : `Kelas ${student?.className || '-'} · NISN: ${student?.nisn || '-'}`}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 max-w-sm">
                            <p className="line-clamp-2">
                              {letter.reason ||
                                letter.destinationOrActivity ||
                                letter.incidentDescription ||
                                '-'}
                            </p>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            <span className="font-medium text-slate-800">{officer}</span>
                            <div className="text-[10px] text-slate-400">
                              Wali: {letter.homeroomTeacher || student?.homeroomTeacher || '-'}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {letter.status || 'Disetujui'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => onPrintLetter(letter)}
                                className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                title="Cetak Dokumen Surat"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm('Hapus dokumen surat ini?')) {
                                    onDeleteLetter(letter.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Hapus Dokumen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: FORM BUAT SURAT BARU                                         */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <h3 className="text-base font-bold text-slate-900">
                Penerbitan Surat Resmi SMA Surya Buana Malang
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Dynamic Numbering Banner + Manual Override Option */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-xl p-3.5 border border-emerald-900/60 shadow-xs space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider">
                      Penomoran Surat Dinas BK
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {formData.isManualNumber ? (
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded border border-amber-600/70 font-bold">
                        Mode Manual / Kustom Aktif
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-700/60 font-bold">
                        Otomatis Standar: {liveLetterInfo.code}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Nomor Surat Resmi (Bisa Diubah Manual Jika Ada Kesalahan):
                    </label>
                    {formData.isManualNumber && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            manualLetterNumber: '',
                            isManualNumber: false,
                          })
                        }
                        className="text-[10px] font-semibold text-emerald-300 hover:text-emerald-200 underline cursor-pointer"
                      >
                        Kembalikan ke Otomatis ({liveLetterInfo.fullNumber})
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.isManualNumber ? formData.manualLetterNumber : liveLetterInfo.fullNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          manualLetterNumber: e.target.value,
                          isManualNumber: true,
                        })
                      }
                      className="flex-1 px-3 py-1.5 text-sm font-mono font-bold rounded-lg border border-emerald-600/60 bg-slate-900 text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 select-all"
                      placeholder="Contoh: 001/BK-SDO/X/2026"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>
                      {formData.isManualNumber
                        ? 'Nomor di atas diedit secara manual dan akan dicetak sesuai ketikan Anda.'
                        : `Otomatis: No. ${String(liveLetterInfo.sequenceNum).padStart(3, '0')} · Romawi ${liveLetterInfo.roman} (${liveLetterInfo.monthName}) · Tahun ${liveLetterInfo.year}`}
                    </span>
                    <span className="font-mono text-slate-400">
                      Kode: <strong>{liveLetterInfo.code}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Pilih Format Surat Resmi *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as PermissionLetterType,
                      manualLetterNumber: '',
                      isManualNumber: false,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white font-semibold"
                >
                  <option value="BK-SDO">BK-SDO : Surat Izin Dispen Kegiatan Organisasi (Surat Masuk Organisasi)</option>
                  <option value="BK-SPK">BK-SPK : Surat Perizinan Mengikuti Kegiatan</option>
                  <option value="BK-SIK">BK-SIK : Surat Izin Meninggalkan KBM</option>
                  <option value="BK-SLS">BK-SLS : Surat Izin Keperluan Di Luar Sekolah</option>
                  <option value="BK-SLB">BK-SLB : Surat Perizinan Layanan BK</option>
                  <option value="BK-SPKS">BK-SPKS : Surat Pernyataan dan Komitmen Siswa</option>
                  <option value="BK-SPO">BK-SPO : Surat Panggilan Orang Tua</option>
                </select>
              </div>

              {/* Multi-Student Selection Section */}
              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-800" />
                    <label className="font-bold text-slate-800 text-xs">
                      Pilih Siswa (Bisa Memilih Beberapa / Banyak Siswa) *
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {formData.studentIds.length} Siswa Terpilih
                    </span>
                  </div>
                </div>

                {/* Filter and quick actions */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-5 relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama siswa atau NISN..."
                      value={studentPickerSearch}
                      onChange={(e) => setStudentPickerSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={studentPickerClass}
                      onChange={(e) => setStudentPickerClass(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
                    >
                      <option value="all">Semua Kelas</option>
                      {classList.map((c) => (
                        <option key={c} value={c}>
                          Kelas {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-4 flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={handleSelectAllPicker}
                      className="px-2 py-1.5 text-[11px] font-semibold bg-white border border-slate-300 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg cursor-pointer transition-colors"
                      title="Pilih seluruh siswa hasil pencarian/filter"
                    >
                      Pilih Semua
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllPicker}
                      className="px-2 py-1.5 text-[11px] font-semibold bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-lg cursor-pointer transition-colors"
                      title="Hapus semua pilihan siswa"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                {/* Selected Student Chips */}
                {formData.studentIds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-lg border border-slate-200 max-h-24 overflow-y-auto">
                    {formData.studentIds.map((stId) => {
                      const st = students.find((s) => s.id === stId);
                      return (
                        <span
                          key={stId}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-950 border border-emerald-300"
                        >
                          <span>
                            {st?.name || 'Siswa'} ({st?.className || '-'})
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleStudentSelection(stId)}
                            className="text-emerald-700 hover:text-rose-700 cursor-pointer ml-0.5"
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Scrollable Checkbox Roster */}
                <div className="border border-slate-200 rounded-lg bg-white max-h-40 overflow-y-auto divide-y divide-slate-100">
                  {pickerStudents.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-xs">
                      Tidak ada siswa yang sesuai kriteria pencarian.
                    </div>
                  ) : (
                    pickerStudents.map((st) => {
                      const isSelected = formData.studentIds.includes(st.id);
                      return (
                        <div
                          key={st.id}
                          onClick={() => toggleStudentSelection(st.id)}
                          className={`flex items-center justify-between p-2 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-emerald-50/80 hover:bg-emerald-100/60'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                                isSelected
                                  ? 'bg-emerald-800 border-emerald-800 text-white font-bold'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected ? '✓' : ''}
                            </span>
                            <span className="font-semibold text-slate-900">{st.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium font-sans">
                              Kelas {st.className}
                            </span>
                            <span>NISN: {st.nisn || '-'}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Hari / Tanggal *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Jam Mulai / Keluar
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 08:00"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Jam Selesai / Perkiraan Kembali
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 11:30"
                    value={formData.returnTime}
                    onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Dynamic Fields for BK-SDO (Dispensasi Kegiatan Organisasi) */}
              {(formData.type === 'BK-SDO' || formData.type === 'Dispensasi_Organisasi') && (
                <div className="space-y-3.5 bg-teal-50/60 p-3.5 rounded-xl border border-teal-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-950 block text-[11px] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                      Detail Khusus Dispensasi Surat dari Organisasi (BK-SDO):
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">
                      Rujukan Surat Masuk Organisasi
                    </span>
                  </div>

                  {/* Preset Pilihan Organisasi Cepat */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Pilih Cepat Nama Organisasi / Lembaga:
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[
                        'OSIS SMA Surya Buana Malang',
                        'MPK (Majelis Perwakilan Kelas)',
                        'Dewan Ambalan Pramuka Gugus Depan',
                        'PMR Wira (Palang Merah Remaja)',
                        'Rohis & Takmir Mushola Sekolah',
                        'Paskibra / Pasus Satya Buana',
                        'Sanggar Seni Budaya & Teater',
                        'Karang Taruna / Forum Remaja',
                      ].map((org) => (
                        <button
                          key={org}
                          type="button"
                          onClick={() => setFormData({ ...formData, organizationName: org })}
                          className={`px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                            formData.organizationName === org
                              ? 'bg-teal-800 text-white font-bold'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-teal-50'
                          }`}
                        >
                          {org}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Tuliskan nama organisasi pemohon / pengirim surat..."
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  {/* No Surat Organisasi & Tanggal Surat */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Nomor Surat Permohonan dari Organisasi *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 018/OSIS-SB/X/2026 atau 05/PAN-LDKS/2026"
                        value={formData.organizationLetterNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, organizationLetterNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Dicantumkan sebagai rujukan legalitas surat permohonan organisasi.
                      </span>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Tanggal Surat dari Organisasi *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.organizationLetterDate}
                        onChange={(e) =>
                          setFormData({ ...formData, organizationLetterDate: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  {/* Jabatan/Peran Siswa di Organisasi & Durasi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Jabatan / Penugasan Siswa di Organisasi *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Ketua Panitia / Sekretaris / Anggota Delegasi"
                        value={formData.studentRoleInOrg}
                        onChange={(e) =>
                          setFormData({ ...formData, studentRoleInOrg: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Cakupan / Durasi Dispensasi KBM *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Sepanjang Jam KBM (Jam 1 s.d. 8) atau 08:00 - 13:30 WIB"
                        value={formData.activityDuration}
                        onChange={(e) =>
                          setFormData({ ...formData, activityDuration: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  {/* Nama Kegiatan & Keperluan */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Nama Kegiatan Organisasi / Keperluan Dispensasi *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Rapat Koordinasi, Gladi Bersih & Pelaksanaan Diklat Kepemimpinan Siswa"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  {/* Tempat / Lokasi Kegiatan */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Tempat / Lokasi Pelaksanaan Kegiatan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Aula Pertemuan SMA Surya Buana Malang / Ruang OSIS"
                      value={formData.destinationOrActivity}
                      onChange={(e) =>
                        setFormData({ ...formData, destinationOrActivity: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  {/* Pengurus Organisasi Penandatangan */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Nama Ketua Organisasi / Panitia
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Fajar Maulana Ilham"
                        value={formData.orgLeaderName}
                        onChange={(e) =>
                          setFormData({ ...formData, orgLeaderName: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Jabatan Ketua Organisasi
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Ketua OSIS / Ketua Panitia"
                        value={formData.orgLeaderRole}
                        onChange={(e) =>
                          setFormData({ ...formData, orgLeaderRole: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Pembina Organisasi / Waka
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Ilmi Muhadiatil Izza, S.Pd."
                        value={formData.orgAdvisorName}
                        onChange={(e) =>
                          setFormData({ ...formData, orgAdvisorName: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  {/* Daftar Siswa Delegasi Lainnya (Kolektif / Rombongan) */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Daftar Anggota / Siswa Delegasi Tambahan (Opsional jika surat izin rombongan/kolektif)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Contoh:&#10;1. Ahmad Faiz Zulkarnaen (XI IPA - Ketua Pelaksana)&#10;2. Nadia Putri (XI IPA - Sekretaris)&#10;3. Dimas Bagus (XI IPS - Sie Perlengkapan)"
                      value={formData.participantList}
                      onChange={(e) =>
                        setFormData({ ...formData, participantList: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      Bila diisi, daftar nama ini akan tercantum rapi pada lembar surat dispensasi resmi.
                    </span>
                  </div>
                </div>
              )}

              {/* Dynamic Fields for BK-SPK (Mengikuti Kegiatan) */}
              {(formData.type === 'BK-SPK' || formData.type === 'Dispensasi_Kegiatan') && (
                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block text-[11px]">
                    Detail Khusus Surat BK-SPK (Mengikuti Kegiatan):
                  </span>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Nama Kegiatan / Keperluan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Lomba Futsal Antar-SMA / Latihan Gabungan Paskibraka"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Guru Pembina / Penanggung Jawab *
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Nabilah Arrahmah, M.Pd"
                      value={formData.eventOrganizerOrTeacher}
                      onChange={(e) =>
                        setFormData({ ...formData, eventOrganizerOrTeacher: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Fields for BK-SIK & BK-SLS */}
              {(formData.type === 'BK-SIK' ||
                formData.type === 'BK-SLS' ||
                formData.type === 'Izin_Keluar_Sekolah' ||
                formData.type === 'Izin_Masuk_Kelas') && (
                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block text-[11px]">
                    Detail Khusus Keterangan Izin:
                  </span>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Keperluan Izin *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Mengambil berkas di rumah / Periksa ke Puskesmas"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Tujuan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Rumah tinggal / Klinik Sehat Dinoyo"
                      value={formData.destinationOrActivity}
                      onChange={(e) =>
                        setFormData({ ...formData, destinationOrActivity: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Guru Piket Sekolah
                      </label>
                      <input
                        type="text"
                        value={formData.schoolPicketTeacher}
                        onChange={(e) =>
                          setFormData({ ...formData, schoolPicketTeacher: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Waka Kesiswaan
                      </label>
                      <input
                        type="text"
                        value={formData.wakaKesiswaanName}
                        onChange={(e) =>
                          setFormData({ ...formData, wakaKesiswaanName: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Fields for BK-SLB */}
              {formData.type === 'BK-SLB' && (
                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block text-[11px]">
                    Detail Khusus Surat BK-SLB (Layanan BK):
                  </span>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Pilih Jenis Layanan BK *
                    </label>
                    <select
                      value={formData.serviceTypeChoice}
                      onChange={(e) => setFormData({ ...formData, serviceTypeChoice: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                    >
                      <option value="Konseling Individu">Konseling Individu</option>
                      <option value="Konseling Kelompok">Konseling Kelompok</option>
                      <option value="Bimbingan Kelompok">Bimbingan Kelompok</option>
                      <option value="Bimbingan Klasikal">Bimbingan Klasikal</option>
                      <option value="Konsultasi">Konsultasi</option>
                      <option value="Mediasi">Mediasi</option>
                      <option value="Asesmen">Asesmen</option>
                      <option value="Tindak Lanjut">Tindak Lanjut</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  {formData.serviceTypeChoice === 'Lainnya' && (
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Sebutkan Layanan Lainnya
                      </label>
                      <input
                        type="text"
                        placeholder="Tuliskan jenis layanan..."
                        value={formData.otherServiceText}
                        onChange={(e) =>
                          setFormData({ ...formData, otherServiceText: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Guru Piket
                    </label>
                    <input
                      type="text"
                      value={formData.schoolPicketTeacher}
                      onChange={(e) =>
                        setFormData({ ...formData, schoolPicketTeacher: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Fields for BK-SPKS */}
              {formData.type === 'BK-SPKS' && (
                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block text-[11px]">
                    Detail Khusus Surat Pernyataan & Komitmen (BK-SPKS):
                  </span>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Tempat Kejadian
                    </label>
                    <input
                      type="text"
                      value={formData.incidentPlace}
                      onChange={(e) => setFormData({ ...formData, incidentPlace: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Kegiatan yang Dilanggar / Ditinggalkan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Ekstrakurikuler Pramuka"
                      value={formData.destinationOrActivity}
                      onChange={(e) =>
                        setFormData({ ...formData, destinationOrActivity: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Deskripsi Kejadian (Kronologi Jujur Siswa) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Tuliskan secara jujur kronologi kejadian, alasan pelanggaran serta hal-hal yang melatarbelakangi..."
                      value={formData.incidentDescription}
                      onChange={(e) =>
                        setFormData({ ...formData, incidentDescription: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Nama Pelatih
                      </label>
                      <input
                        type="text"
                        value={formData.coachName}
                        onChange={(e) => setFormData({ ...formData, coachName: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Jabatan Pelatih
                      </label>
                      <input
                        type="text"
                        value={formData.coachRole}
                        onChange={(e) => setFormData({ ...formData, coachRole: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Nama Guru Pembina
                      </label>
                      <input
                        type="text"
                        value={formData.advisorName}
                        onChange={(e) => setFormData({ ...formData, advisorName: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Waka Kesiswaan
                      </label>
                      <input
                        type="text"
                        value={formData.wakaKesiswaanName}
                        onChange={(e) =>
                          setFormData({ ...formData, wakaKesiswaanName: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Fields for BK-SPO */}
              {(formData.type === 'BK-SPO' || formData.type === 'Panggilan_Orang_Tua') && (
                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block text-[11px]">
                    Detail Khusus Panggilan Orang Tua:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Tanggal Pertemuan Ortu *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.parentAppointmentDate}
                        onChange={(e) =>
                          setFormData({ ...formData, parentAppointmentDate: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Waktu Pertemuan
                      </label>
                      <input
                        type="text"
                        value={formData.parentAppointmentTime}
                        onChange={(e) =>
                          setFormData({ ...formData, parentAppointmentTime: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Keperluan Pemanggilan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Pembahasan perkembangan kedisiplinan dan pembinaan siswa..."
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Terbitkan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: CETAK BUKU REGISTER & REKAPITULASI SURAT PER KODE             */}
      {/* ===================================================================== */}
      {showPrintRecapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            {/* Top Toolbar */}
            <div className="no-print flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pratinjau Cetak: Buku Register & Rekapitulasi Surat ({recapCodeFilter})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Buku Register Sekarang</span>
                </button>
                <button
                  onClick={() => setShowPrintRecapModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content Body */}
            <div className="p-8 overflow-y-auto bg-white print-container text-xs">
              <OfficialLetterhead profile={profile} />

              <div className="text-center my-4 space-y-1">
                <h2 className="text-sm font-bold text-slate-900 uppercase underline tracking-wider">
                  BUKU REGISTER & REKAPITULASI SURAT RESMI BK
                </h2>
                <p className="text-xs text-slate-700 font-semibold">
                  Klasifikasi Kode:{' '}
                  <span className="text-emerald-900 font-bold">
                    {recapCodeFilter === 'all'
                      ? 'Seluruh Kode Dokumen (Global)'
                      : `${recapCodeFilter} - ${activeCodeConfig?.title || ''}`}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Periode:{' '}
                  {recapMonthFilter === 'all'
                    ? `Tahun Ajaran ${profile.academicYear} / ${recapYearFilter}`
                    : `Bulan ${MONTH_NAMES[recapMonthFilter]} ${recapYearFilter}`}{' '}
                  · Kelas: {recapClassFilter === 'all' ? 'Semua Kelas' : recapClassFilter}
                </p>
              </div>

              {/* Summary Stats Box */}
              <div className="grid grid-cols-3 gap-2 my-4 border border-slate-300 rounded p-2.5 text-center text-[11px] bg-slate-50/50">
                <div>
                  <span className="text-slate-500 block">Total Surat Terbit</span>
                  <strong className="font-mono text-sm text-slate-900">
                    {filteredRecapLetters.length} Dokumen
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Kode Klasifikasi</span>
                  <strong className="font-mono text-sm text-emerald-800">
                    {recapCodeFilter === 'all' ? '6 Format Kode' : recapCodeFilter}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Status Pengarsipan</span>
                  <strong className="font-mono text-sm text-blue-900">Tervalidasi BK</strong>
                </div>
              </div>

              {/* Table Register */}
              <table className="w-full text-[10px] border-collapse border border-slate-300 mt-3 text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                    <th className="border border-slate-300 py-1.5 px-2 text-center w-8">No</th>
                    <th className="border border-slate-300 py-1.5 px-2 min-w-[130px]">No. Surat Resmi</th>
                    <th className="border border-slate-300 py-1.5 px-2 text-center w-14">Kode</th>
                    <th className="border border-slate-300 py-1.5 px-2 min-w-[80px]">Tanggal</th>
                    <th className="border border-slate-300 py-1.5 px-2 min-w-[140px]">Peserta Didik</th>
                    <th className="border border-slate-300 py-1.5 px-2 text-center w-12">Kelas</th>
                    <th className="border border-slate-300 py-1.5 px-2">Keperluan / Keterangan</th>
                    <th className="border border-slate-300 py-1.5 px-2 min-w-[120px]">Penanggung Jawab</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecapLetters.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="border border-slate-300 py-4 text-center text-slate-400">
                        Nihil (Tidak ada dokumen surat tercatat pada kriteria filter).
                      </td>
                    </tr>
                  ) : (
                    filteredRecapLetters.map((letter, idx) => {
                      const student = students.find((s) => s.id === letter.studentId);
                      const stdCode = getStandardLetterCode(letter.type);
                      const officer =
                        letter.eventOrganizerOrTeacher ||
                        letter.coachName ||
                        letter.advisorName ||
                        letter.schoolPicketTeacher ||
                        '-';

                      return (
                        <tr key={letter.id} className="border-b border-slate-200">
                          <td className="border border-slate-300 py-1 px-1.5 text-center font-mono">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-300 py-1 px-2 font-mono font-bold text-slate-900">
                            {letter.letterNumber}
                          </td>
                          <td className="border border-slate-300 py-1 px-1 text-center font-mono font-bold">
                            {stdCode}
                          </td>
                          <td className="border border-slate-300 py-1 px-2 font-mono">
                            {formatDateIndonesian(letter.date)}
                          </td>
                          <td className="border border-slate-300 py-1 px-2 font-semibold text-slate-900">
                            {student?.name || 'Siswa'}
                          </td>
                          <td className="border border-slate-300 py-1 px-1.5 text-center font-semibold">
                            {student?.className || '-'}
                          </td>
                          <td className="border border-slate-300 py-1 px-2 text-slate-700">
                            {letter.reason || letter.destinationOrActivity || '-'}
                          </td>
                          <td className="border border-slate-300 py-1 px-2 text-slate-600">
                            {officer}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Signatures Block */}
              <div className="mt-8 grid grid-cols-2 text-xs pt-4 break-inside-avoid">
                <div className="text-center space-y-14">
                  <div>
                    <p className="text-slate-500">Mengetahui,</p>
                    <p className="font-bold text-slate-900">Kepala {profile.schoolName}</p>
                  </div>
                  <div>
                    <p className="font-bold underline text-slate-900">{profile.principalName}</p>
                    <p className="text-[11px] text-slate-600">NIP. {profile.principalNIP || '-'}</p>
                  </div>
                </div>

                <div className="text-center space-y-14">
                  <div>
                    <p className="text-slate-500">
                      {profile.regencyCity || 'Malang'},{' '}
                      {formatDateIndonesian(new Date().toISOString().slice(0, 10))}
                    </p>
                    <p className="font-bold text-slate-900">Guru Bimbingan dan Konseling</p>
                  </div>
                  <div>
                    <p className="font-bold underline text-slate-900">{profile.leadCounselorName}</p>
                    <p className="text-[11px] text-slate-600">
                      NIP. {profile.leadCounselorNIP || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: KOREKSI / GANTI NOMOR SURAT SECARA MANUAL                    */}
      {/* ===================================================================== */}
      {editingLetterNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-800" />
                <span>Koreksi / Ganti Nomor Surat</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingLetterNumber(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>
                Dokumen Siswa: <strong className="text-slate-900">{editingLetterNumber.studentName}</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Silakan ganti atau perbaiki nomor surat jika terdapat kesalahan penomoran, penyesuaian register, atau format khusus:
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Surat Baru / Koreksi *
              </label>
              <input
                type="text"
                value={editingLetterNumber.currentNumber}
                onChange={(e) =>
                  setEditingLetterNumber({
                    ...editingLetterNumber,
                    currentNumber: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white text-emerald-950"
                placeholder="Contoh: 001/BK-SDO/X/2026"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingLetterNumber(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const trimmed = editingLetterNumber.currentNumber.trim();
                  if (trimmed) {
                    onUpdateLetter?.(editingLetterNumber.id, {
                      letterNumber: trimmed,
                      isManualLetterNumber: true,
                    });
                    setEditingLetterNumber(null);
                  }
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                Simpan Nomor Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
