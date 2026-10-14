import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarCheck2,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  AlertCircle,
  Clock,
  User,
  HeartHandshake,
  FileText,
  CheckCircle,
  Printer,
  Download,
  Users,
  FileSpreadsheet,
  TrendingUp,
  BarChart3,
  ChevronRight,
  Info,
  Calendar,
  X,
  ShieldAlert,
  ArrowRight,
  Check,
  Sparkles,
  CalendarDays,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AttendanceRecord, Student, AttendanceStatus, SchoolProfile } from '../types';
import { formatDateIndonesian, formatDateWithDayIndonesian } from '../utils/storage';
import { OfficialLetterhead } from '../components/OfficialLetterhead';

interface AttendanceViewProps {
  attendance: AttendanceRecord[];
  students: Student[];
  profile: SchoolProfile;
  onAddAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  onUpdateAttendance: (id: string, updated: Partial<AttendanceRecord>) => void;
  onDeleteAttendance: (id: string) => void;
  onStartCounselingForStudent: (student: Student) => void;
  onIssueLetterForStudent: (student: Student) => void;
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

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendance,
  students,
  profile,
  onAddAttendance,
  onUpdateAttendance,
  onDeleteAttendance,
  onStartCounselingForStudent,
  onIssueLetterForStudent,
  initialStudentId,
  autoOpenCreate,
  onClearInitialState,
}) => {
  // Navigation: Jurnal Harian vs Visualisasi Presensi vs Pelaporan Rekapitulasi
  const [activeTab, setActiveTab] = useState<'log' | 'analytics' | 'reports'>('log');

  // Dalam Pelaporan: Pilihan Semua Siswa vs Per Siswa
  const [reportScope, setReportScope] = useState<'all' | 'individual'>('all');
  const [selectedStudentIdForReport, setSelectedStudentIdForReport] = useState<string>(
    students[0]?.id || ''
  );

  // Print Modals
  const [showPrintAllModal, setShowPrintAllModal] = useState(false);
  const [showPrintStudentModal, setShowPrintStudentModal] = useState(false);

  // Edit / Koreksi Record Modal
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  // Form State & Add Modal (Dilengkapi Fitur Tanggal & Rentang Tanggal)
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    date: new Date().toISOString().slice(0, 10),
    isDateRange: false,
    endDate: new Date().toISOString().slice(0, 10),
    status: 'Sakit' as AttendanceStatus,
    arrivalTime: '',
    subjectOrPeriod: 'Hari Penuh',
    reason: '',
    sanctionOrNote: '',
    reportedBy: 'Guru Piket',
  });

  // Filter states for Log tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Filter states for Analytics tab (Visualisasi Presensi)
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'month' | '30days' | 'all'>('month');
  const [analyticsClass, setAnalyticsClass] = useState<string>('all');

  // Quick date presets for 1-click date picking
  const quickDatePresets = [
    { label: 'Hari Ini', getDate: () => new Date().toISOString().slice(0, 10) },
    {
      label: 'Kemarin',
      getDate: () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().slice(0, 10);
      },
    },
    {
      label: 'H-2',
      getDate: () => {
        const d = new Date();
        d.setDate(d.getDate() - 2);
        return d.toISOString().slice(0, 10);
      },
    },
    {
      label: 'H-3',
      getDate: () => {
        const d = new Date();
        d.setDate(d.getDate() - 3);
        return d.toISOString().slice(0, 10);
      },
    },
  ];

  // Helper untuk menghitung array tanggal dalam rentang hari sekolah (lewati hari Minggu)
  const getDatesInRange = (startDateStr: string, endDateStr: string): string[] => {
    const dates: string[] = [];
    if (!startDateStr || !endDateStr) return [startDateStr];
    if (startDateStr > endDateStr) return [startDateStr];
    const curr = new Date(startDateStr);
    const end = new Date(endDateStr);
    let count = 0;
    while (curr <= end && count < 31) {
      if (curr.getDay() !== 0) {
        dates.push(curr.toISOString().slice(0, 10));
      }
      curr.setDate(curr.getDate() + 1);
      count++;
    }
    return dates.length > 0 ? dates : [startDateStr];
  };

  // Filter states for Reports tab
  const currentDate = new Date();
  const [reportYear, setReportYear] = useState<number>(currentDate.getFullYear());
  const [reportMonth, setReportMonth] = useState<number>(currentDate.getMonth()); // 0-11
  const [reportClass, setReportClass] = useState<string>('all');
  const [effectiveSchoolDays, setEffectiveSchoolDays] = useState<number>(24);

  // Handle direct quick action jump
  useEffect(() => {
    if (autoOpenCreate && initialStudentId) {
      setFormData((prev) => ({
        ...prev,
        studentId: initialStudentId,
        status: 'Terlambat',
        arrivalTime: '07:25 WIB',
        subjectOrPeriod: 'Jam Ke-1',
      }));
      setShowAddModal(true);
      onClearInitialState?.();
    }
  }, [autoOpenCreate, initialStudentId, onClearInitialState]);

  // Synchronize initial student for individual report if selected
  useEffect(() => {
    if (initialStudentId && students.some((s) => s.id === initialStudentId)) {
      setSelectedStudentIdForReport(initialStudentId);
    }
  }, [initialStudentId, students]);

  const classList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.className));
    return Array.from(set).sort();
  }, [students]);

  // Filtered attendance log list (tab 1)
  const filteredAttendance = useMemo(() => {
    return attendance.filter((rec) => {
      const student = students.find((s) => s.id === rec.studentId);
      const studentName = (student?.name || rec.studentName || '').toLowerCase();
      const studentClass = student?.className || rec.className || '';

      const matchSearch =
        studentName.includes(searchQuery.toLowerCase()) ||
        (rec.reason || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass = selectedClass === 'all' || studentClass === selectedClass;
      const matchStatus = selectedStatus === 'all' || rec.status === selectedStatus;
      const matchDate = !selectedDate || rec.date === selectedDate;

      return matchSearch && matchClass && matchStatus && matchDate;
    });
  }, [attendance, students, searchQuery, selectedClass, selectedStatus, selectedDate]);

  // Overall statistics per student for Early Warning
  const studentAlertStats = useMemo(() => {
    const map = new Map<
      string,
      { student: Student; late: number; alpa: number; sick: number; leave: number; bolos: number }
    >();
    attendance.forEach((rec) => {
      const st = students.find((s) => s.id === rec.studentId);
      if (!st) return;
      if (!map.has(st.id)) {
        map.set(st.id, { student: st, late: 0, alpa: 0, sick: 0, leave: 0, bolos: 0 });
      }
      const item = map.get(st.id)!;
      if (rec.status === 'Terlambat') item.late += 1;
      else if (rec.status === 'Alpa') item.alpa += 1;
      else if (rec.status === 'Bolos_KBM') item.bolos += 1;
      else if (rec.status === 'Sakit') item.sick += 1;
      else if (rec.status === 'Izin') item.leave += 1;
    });
    return Array.from(map.values()).sort(
      (a, b) => b.late + b.alpa + b.bolos - (a.late + a.alpa + a.bolos)
    );
  }, [attendance, students]);

  // =========================================================================
  // EXCEPTION-BASED ATTENDANCE CALCULATIONS (Untuk Pelaporan Semua Siswa)
  // "Siswa dianggap MASUK/HADIR kecuali ada catatan Sakit, Izin, Alpa, atau Bolos"
  // =========================================================================
  const allStudentsReportData = useMemo(() => {
    const targetStudents =
      reportClass === 'all'
        ? students
        : students.filter((s) => s.className === reportClass);

    return targetStudents.map((st) => {
      // Filter records in the chosen month & year for this student
      const studentRecords = attendance.filter((rec) => {
        if (rec.studentId !== st.id) return false;
        const d = new Date(rec.date);
        return (
          !isNaN(d.getTime()) &&
          d.getFullYear() === reportYear &&
          d.getMonth() === reportMonth
        );
      });

      const sickCount = studentRecords.filter((r) => r.status === 'Sakit').length;
      const leaveCount = studentRecords.filter((r) => r.status === 'Izin').length;
      const alpaCount = studentRecords.filter((r) => r.status === 'Alpa').length;
      const bolosCount = studentRecords.filter((r) => r.status === 'Bolos_KBM').length;
      const lateCount = studentRecords.filter((r) => r.status === 'Terlambat').length;

      // Total days absent / not fully present
      const totalAbsentDays = sickCount + leaveCount + alpaCount + bolosCount;
      // In exception-based model: Hadir = Effective Days - Absent Days (cannot drop below 0)
      const presentDays = Math.max(0, effectiveSchoolDays - totalAbsentDays);
      const attendancePercentage =
        effectiveSchoolDays > 0
          ? Math.min(100, Math.round((presentDays / effectiveSchoolDays) * 100))
          : 100;

      let disciplineStatus: 'Sangat Tertib' | 'Cukup' | 'Perlu Perhatian' | 'Peringatan Serius' =
        'Sangat Tertib';
      if (alpaCount >= 2 || totalAbsentDays >= 5 || lateCount >= 3) {
        disciplineStatus = 'Peringatan Serius';
      } else if (alpaCount === 1 || totalAbsentDays >= 3 || lateCount >= 2) {
        disciplineStatus = 'Perlu Perhatian';
      } else if (totalAbsentDays > 0 || lateCount > 0) {
        disciplineStatus = 'Cukup';
      }

      return {
        student: st,
        records: studentRecords,
        sickCount,
        leaveCount,
        alpaCount,
        bolosCount,
        lateCount,
        totalAbsentDays,
        presentDays,
        attendancePercentage,
        disciplineStatus,
      };
    });
  }, [students, attendance, reportClass, reportYear, reportMonth, effectiveSchoolDays]);

  // Aggregate stats for All Students report
  const allStudentsSummary = useMemo(() => {
    const totalStudents = allStudentsReportData.length;
    const totalSick = allStudentsReportData.reduce((acc, curr) => acc + curr.sickCount, 0);
    const totalLeave = allStudentsReportData.reduce((acc, curr) => acc + curr.leaveCount, 0);
    const totalAlpa = allStudentsReportData.reduce((acc, curr) => acc + curr.alpaCount, 0);
    const totalBolos = allStudentsReportData.reduce((acc, curr) => acc + curr.bolosCount, 0);
    const totalLate = allStudentsReportData.reduce((acc, curr) => acc + curr.lateCount, 0);
    const totalAbsentAll = totalSick + totalLeave + totalAlpa + totalBolos;

    const avgAttendancePercent =
      totalStudents > 0
        ? Math.round(
            allStudentsReportData.reduce((acc, curr) => acc + curr.attendancePercentage, 0) /
              totalStudents
          )
        : 100;

    return {
      totalStudents,
      totalSick,
      totalLeave,
      totalAlpa,
      totalBolos,
      totalLate,
      totalAbsentAll,
      avgAttendancePercent,
    };
  }, [allStudentsReportData]);

  // =========================================================================
  // ANALYTICS & VISUALISASI PRESENSI DATA CALCULATIONS (Recharts)
  // =========================================================================
  const analyticsAttendance = useMemo(() => {
    return attendance.filter((rec) => {
      const student = students.find((s) => s.id === rec.studentId);
      const studentClass = student?.className || rec.className || '';
      const matchClass = analyticsClass === 'all' || studentClass === analyticsClass;
      if (!matchClass) return false;

      const d = new Date(rec.date);
      if (isNaN(d.getTime())) return true;

      if (analyticsPeriod === 'month') {
        return (
          d.getMonth() === currentDate.getMonth() &&
          d.getFullYear() === currentDate.getFullYear()
        );
      } else if (analyticsPeriod === '30days') {
        const past30 = new Date();
        past30.setDate(past30.getDate() - 30);
        return d >= past30;
      }
      return true;
    });
  }, [attendance, analyticsClass, analyticsPeriod, students, currentDate]);

  const targetStudentsForAnalytics = useMemo(() => {
    return analyticsClass === 'all'
      ? students
      : students.filter((s) => s.className === analyticsClass);
  }, [students, analyticsClass]);

  const totalStudentsInAnalytics = Math.max(1, targetStudentsForAnalytics.length);

  // 1. Daily Trend Data for Recharts AreaChart
  const analyticsDailyTrend = useMemo(() => {
    const dateMap = new Map<string, AttendanceRecord[]>();

    analyticsAttendance.forEach((rec) => {
      if (!dateMap.has(rec.date)) {
        dateMap.set(rec.date, []);
      }
      dateMap.get(rec.date)!.push(rec);
    });

    // Ensure recent 7 days are represented
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      if (!dateMap.has(dStr)) {
        dateMap.set(dStr, []);
      }
    }

    const sortedDates = Array.from(dateMap.keys()).sort();

    return sortedDates.map((dateStr) => {
      const recs = dateMap.get(dateStr) || [];
      const sakit = recs.filter((r) => r.status === 'Sakit').length;
      const izin = recs.filter((r) => r.status === 'Izin').length;
      const alpa = recs.filter((r) => r.status === 'Alpa').length;
      const terlambat = recs.filter((r) => r.status === 'Terlambat').length;
      const bolos = recs.filter((r) => r.status === 'Bolos_KBM').length;

      const tidakHadir = sakit + izin + alpa + bolos;
      const hadir = Math.max(0, totalStudentsInAnalytics - tidakHadir);
      const persentase = Math.min(100, Math.round((hadir / totalStudentsInAnalytics) * 100));

      const dObj = new Date(dateStr);
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'Mei',
        'Jun',
        'Jul',
        'Agu',
        'Sep',
        'Okt',
        'Nov',
        'Des',
      ];
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const shortLabel = !isNaN(dObj.getTime())
        ? `${dObj.getDate()} ${monthNames[dObj.getMonth()]}`
        : dateStr;
      const dayLabel = !isNaN(dObj.getTime()) ? dayNames[dObj.getDay()] : '';

      return {
        date: dateStr,
        displayDate: shortLabel,
        day: dayLabel,
        label: `${dayLabel}, ${shortLabel}`,
        hadir,
        tidakHadir,
        persentase,
        sakit,
        izin,
        alpa,
        terlambat,
        bolos,
      };
    });
  }, [analyticsAttendance, totalStudentsInAnalytics]);

  // 2. Status Composition Data for Recharts PieChart
  const analyticsStatusComposition = useMemo(() => {
    const sick = analyticsAttendance.filter((r) => r.status === 'Sakit').length;
    const leave = analyticsAttendance.filter((r) => r.status === 'Izin').length;
    const alpa = analyticsAttendance.filter((r) => r.status === 'Alpa').length;
    const late = analyticsAttendance.filter((r) => r.status === 'Terlambat').length;
    const bolos = analyticsAttendance.filter((r) => r.status === 'Bolos_KBM').length;

    return [
      { name: 'Sakit (S)', count: sick, color: '#2563eb' },
      { name: 'Izin (I)', count: leave, color: '#7c3aed' },
      { name: 'Alpa (A)', count: alpa, color: '#dc2626' },
      { name: 'Terlambat (T)', count: late, color: '#d97706' },
      { name: 'Bolos KBM (B)', count: bolos, color: '#e11d48' },
    ];
  }, [analyticsAttendance]);

  // 3. Class Comparison Data for Recharts BarChart
  const analyticsClassComparison = useMemo(() => {
    return classList.map((cls) => {
      const classStudents = students.filter((s) => s.className === cls);
      const totalClsStudents = Math.max(1, classStudents.length);
      const classRecords = analyticsAttendance.filter((r) => {
        const st = students.find((s) => s.id === r.studentId);
        return (st?.className || r.className) === cls;
      });

      const sakit = classRecords.filter((r) => r.status === 'Sakit').length;
      const izin = classRecords.filter((r) => r.status === 'Izin').length;
      const alpa = classRecords.filter((r) => r.status === 'Alpa').length;
      const terlambat = classRecords.filter((r) => r.status === 'Terlambat').length;
      const bolos = classRecords.filter((r) => r.status === 'Bolos_KBM').length;

      const totalTidakHadir = sakit + izin + alpa + bolos;
      const estimatedRate = Math.max(
        75,
        Math.min(100, Math.round(100 - (totalTidakHadir / totalClsStudents) * 5))
      );

      return {
        className: cls,
        displayName: `Kelas ${cls}`,
        persentase: estimatedRate,
        totalTidakHadir,
        alpa,
        terlambat,
        sakit,
        izin,
        totalSiswa: totalClsStudents,
      };
    });
  }, [classList, students, analyticsAttendance]);

  // 4. Day of Week Pattern Data for Recharts BarChart
  const analyticsDayOfWeek = useMemo(() => {
    const days = [
      { key: 1, name: 'Senin' },
      { key: 2, name: 'Selasa' },
      { key: 3, name: 'Rabu' },
      { key: 4, name: 'Kamis' },
      { key: 5, name: 'Jumat' },
      { key: 6, name: 'Sabtu' },
    ];

    return days.map((d) => {
      const recordsOnDay = analyticsAttendance.filter((r) => {
        const dateObj = new Date(r.date);
        return !isNaN(dateObj.getTime()) && dateObj.getDay() === d.key;
      });

      return {
        hari: d.name,
        terlambat: recordsOnDay.filter((r) => r.status === 'Terlambat').length,
        alpa: recordsOnDay.filter((r) => r.status === 'Alpa' || r.status === 'Bolos_KBM').length,
        sakitIzin: recordsOnDay.filter((r) => r.status === 'Sakit' || r.status === 'Izin').length,
        total: recordsOnDay.length,
      };
    });
  }, [analyticsAttendance]);

  // =========================================================================
  // INDIVIDUAL STUDENT REPORT DATA (Pelaporan Per Siswa)
  // =========================================================================
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentIdForReport) || students[0];
  }, [students, selectedStudentIdForReport]);

  const individualStudentData = useMemo(() => {
    if (!selectedStudent) return null;

    // Filter records for this student in chosen month/year (or all months if desired)
    const records = attendance
      .filter((rec) => {
        if (rec.studentId !== selectedStudent.id) return false;
        const d = new Date(rec.date);
        return (
          !isNaN(d.getTime()) &&
          d.getFullYear() === reportYear &&
          d.getMonth() === reportMonth
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const sickCount = records.filter((r) => r.status === 'Sakit').length;
    const leaveCount = records.filter((r) => r.status === 'Izin').length;
    const alpaCount = records.filter((r) => r.status === 'Alpa').length;
    const bolosCount = records.filter((r) => r.status === 'Bolos_KBM').length;
    const lateCount = records.filter((r) => r.status === 'Terlambat').length;
    const totalAbsentDays = sickCount + leaveCount + alpaCount + bolosCount;
    const presentDays = Math.max(0, effectiveSchoolDays - totalAbsentDays);
    const attendancePercentage =
      effectiveSchoolDays > 0
        ? Math.min(100, Math.round((presentDays / effectiveSchoolDays) * 100))
        : 100;

    return {
      student: selectedStudent,
      records,
      sickCount,
      leaveCount,
      alpaCount,
      bolosCount,
      lateCount,
      totalAbsentDays,
      presentDays,
      attendancePercentage,
    };
  }, [selectedStudent, attendance, reportYear, reportMonth, effectiveSchoolDays]);

  // Preset status quick picker helper
  const handleQuickStatusPreset = (status: AttendanceStatus) => {
    let reasonPreset = '';
    let arrivalPreset = '';
    let periodPreset = 'Hari Penuh';

    if (status === 'Sakit') {
      reasonPreset = 'Sakit flu & demam, istirahat di rumah sesuai surat dokter/keterangan ortu';
    } else if (status === 'Izin') {
      reasonPreset = 'Izin ada keperluan keluarga mendesak di luar kota';
    } else if (status === 'Alpa') {
      reasonPreset = 'Tanpa keterangan / tidak hadir tanpa kabar dari orang tua/wali';
    } else if (status === 'Terlambat') {
      arrivalPreset = '07:25 WIB';
      periodPreset = 'Jam Ke-1';
      reasonPreset = 'Terlambat hadir karena kendala lalu lintas / kendaraan';
    } else if (status === 'Bolos_KBM') {
      periodPreset = 'Jam Ke-4 s.d 6';
      reasonPreset = 'Meninggalkan area kelas/sekolah saat jam pembelajaran berlangsung';
    }

    setFormData((prev) => ({
      ...prev,
      status,
      reason: reasonPreset,
      arrivalTime: arrivalPreset,
      subjectOrPeriod: periodPreset,
    }));
  };

  // Submit new attendance record (dengan dukungan input rentang tanggal)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === formData.studentId);
    if (!st) {
      alert('Pilih siswa terlebih dahulu!');
      return;
    }

    if (formData.isDateRange && formData.endDate && formData.endDate >= formData.date) {
      const datesToRecord = getDatesInRange(formData.date, formData.endDate);
      datesToRecord.forEach((d) => {
        onAddAttendance({
          studentId: formData.studentId,
          studentName: st.name,
          className: st.className,
          date: d,
          status: formData.status,
          arrivalTime: formData.arrivalTime,
          subjectOrPeriod: formData.subjectOrPeriod,
          reason: formData.reason,
          sanctionOrNote: formData.sanctionOrNote,
          reportedBy: formData.reportedBy,
        });
      });
    } else {
      onAddAttendance({
        studentId: formData.studentId,
        studentName: st.name,
        className: st.className,
        date: formData.date,
        status: formData.status,
        arrivalTime: formData.arrivalTime,
        subjectOrPeriod: formData.subjectOrPeriod,
        reason: formData.reason,
        sanctionOrNote: formData.sanctionOrNote,
        reportedBy: formData.reportedBy,
      });
    }

    setShowAddModal(false);
    setFormData({
      studentId: '',
      date: new Date().toISOString().slice(0, 10),
      isDateRange: false,
      endDate: new Date().toISOString().slice(0, 10),
      status: 'Sakit',
      arrivalTime: '',
      subjectOrPeriod: 'Hari Penuh',
      reason: '',
      sanctionOrNote: '',
      reportedBy: 'Guru Piket',
    });
  };

  // Submit edit / koreksi attendance record
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    onUpdateAttendance(editingRecord.id, {
      date: editingRecord.date,
      status: editingRecord.status,
      arrivalTime: editingRecord.arrivalTime,
      subjectOrPeriod: editingRecord.subjectOrPeriod,
      reason: editingRecord.reason,
      sanctionOrNote: editingRecord.sanctionOrNote,
      reportedBy: editingRecord.reportedBy,
    });
    setEditingRecord(null);
  };

  // Export CSV for All Students
  const handleDownloadAllCSV = () => {
    const periodLabel = `${MONTH_NAMES[reportMonth]}_${reportYear}`;
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += `REKAPITULASI PRESENSI PESERTA DIDIK - ${profile.schoolName}\n`;
    csvContent += `Bulan/Tahun: ${MONTH_NAMES[reportMonth]} ${reportYear} | Hari Efektif: ${effectiveSchoolDays} Hari\n`;
    csvContent += `Kelas: ${reportClass === 'all' ? 'Semua Kelas' : reportClass} | Guru BK: ${profile.leadCounselorName}\n\n`;

    csvContent += `No,NISN,Nama Siswa,Kelas,Sakit (S),Izin (I),Alpa (A),Terlambat (T),Bolos KBM (B),Total Tidak Hadir,Hari Masuk (Hadir),% Kehadiran,Status Disiplin\n`;

    allStudentsReportData.forEach((item, idx) => {
      csvContent += `${idx + 1},'${item.student.nisn},"${item.student.name}","${item.student.className}",${item.sickCount},${item.leaveCount},${item.alpaCount},${item.lateCount},${item.bolosCount},${item.totalAbsentDays},${item.presentDays},${item.attendancePercentage}%,"${item.disciplineStatus}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Rekap_Presensi_${profile.schoolName.replace(/\s+/g, '_')}_${periodLabel}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-emerald-800" />
            <h2 className="text-lg font-bold text-slate-900">
              Absensi & Rekapitulasi Presensi Siswa
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem presensi berbasis ketidakhadiran (hanya catat yang Sakit, Izin, Alpa, Terlambat, Bolos; selain itu otomatis Masuk/Hadir).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Ketidakhadiran / Terlambat</span>
          </button>
        </div>
      </div>

      {/* Main Mode Switcher: Jurnal Harian vs Visualisasi vs Pelaporan Rekapitulasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('log')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'log'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Jurnal Harian</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Visualisasi & Statistik Presensi</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                activeTab === 'analytics'
                  ? 'bg-emerald-950/40 text-emerald-100'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              Grafik
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Pelaporan & Rekapitulasi</span>
          </button>
        </div>

        {activeTab === 'reports' && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 px-2">Cakupan Laporan:</span>
            <button
              type="button"
              onClick={() => setReportScope('all')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                reportScope === 'all'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Semua Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => setReportScope('individual')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                reportScope === 'individual'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Per Siswa</span>
            </button>
          </div>
        )}
      </div>

      {/* Exception-Based Attendance Notice Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs text-slate-700 flex items-start gap-3 shadow-2xs">
        <div className="w-6 h-6 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <strong className="text-slate-900">Sistem Presensi Berbasis Ketidakhadiran (Exception-Based):</strong>
            <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
              Hadir Otomatis
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Guru BK & piket <strong>hanya perlu mencatat siswa yang tidak masuk (Sakit, Izin, Alpa), terlambat, atau bolos KBM</strong>. Seluruh siswa yang tidak memiliki catatan ketidakhadiran pada tanggal tersebut secara otomatis dihitung <strong>HADIR / MASUK</strong> oleh sistem.
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: JURNAL KETIDAKHADIRAN & INPUT HARIAN                           */}
      {/* ===================================================================== */}
      {activeTab === 'log' && (
        <div className="space-y-4">
          {/* Summary Alert: Siswa dengan Tingkat Absensi Tinggi */}
          {studentAlertStats.some((s) => s.late >= 2 || s.alpa >= 1 || s.bolos >= 1) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-900">
                    Peringatan Dini Ketidakhadiran (Early Warning Presensi):
                  </span>
                  <p className="text-amber-800 text-[11px]">
                    Siswa berikut terdeteksi memiliki akumulasi ketidakhadiran, bolos, atau keterlambatan berulang. Disarankan segera dijadwalkan konseling atau panggilan orang tua:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {studentAlertStats
                      .filter((s) => s.late >= 2 || s.alpa >= 1 || s.bolos >= 1)
                      .slice(0, 5)
                      .map((item) => (
                        <div
                          key={item.student.id}
                          className="bg-white px-2.5 py-1 rounded-lg border border-amber-300 text-amber-900 flex items-center gap-2 shadow-2xs"
                        >
                          <span className="font-bold">{item.student.name}</span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            ({item.student.className})
                          </span>
                          <span className="font-mono tabular-nums text-rose-700 font-semibold text-[11px]">
                            {item.late > 0 ? `${item.late}x Terlambat` : ''}{' '}
                            {item.alpa > 0 ? `${item.alpa}x Alpa` : ''}{' '}
                            {item.bolos > 0 ? `${item.bolos}x Bolos` : ''}
                          </span>
                          <button
                            onClick={() => onStartCounselingForStudent(item.student)}
                            className="text-[10px] bg-emerald-800 hover:bg-emerald-900 text-white px-2 py-0.5 rounded cursor-pointer font-medium"
                            title="Beri Layanan Konseling"
                          >
                            Beri Konseling
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa atau alasan ketidakhadiran..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* Class Filter */}
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
              >
                <option value="all">Semua Kelas</option>
                {classList.map((c) => (
                  <option key={c} value={c}>
                    Kelas {c}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
              >
                <option value="all">Semua Status Ketidakhadiran</option>
                <option value="Sakit">Sakit</option>
                <option value="Izin">Izin</option>
                <option value="Alpa">Alpa (Tanpa Keterangan)</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Bolos_KBM">Bolos KBM</option>
              </select>

              {/* Date Picker & Quick Actions */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
                  title="Filter Tanggal Tertentu"
                />

                {selectedDate && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedDate('')}
                      className="text-slate-500 hover:text-slate-800 text-[11px] underline cursor-pointer"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          date: selectedDate,
                          endDate: selectedDate,
                        }));
                        setShowAddModal(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                      title={`Catat ketidakhadiran baru khusus pada tanggal ${formatDateIndonesian(selectedDate)}`}
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Catat di Tgl Ini</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="text-slate-500 text-xs font-mono tabular-nums">
              Ditemukan: <strong>{filteredAttendance.length}</strong> catatan ketidakhadiran
            </div>
          </div>

          {/* Main Table Log */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Tanggal & Waktu</th>
                    <th className="py-3 px-4">Nama Siswa / Rombel</th>
                    <th className="py-3 px-4">Status Ketidakhadiran</th>
                    <th className="py-3 px-4">Jam Pelajaran</th>
                    <th className="py-3 px-4">Alasan / Keterangan</th>
                    <th className="py-3 px-4">Tindakan Edukatif BK</th>
                    <th className="py-3 px-4">Pelapor</th>
                    <th className="py-3 px-4 text-right">Aksi BK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-500 text-xs">
                        Tidak ada catatan ketidakhadiran yang sesuai dengan filter (seluruh siswa diasumsikan Hadir).
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((rec) => {
                      const student = students.find((s) => s.id === rec.studentId);
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-900 font-mono tabular-nums">
                              {formatDateIndonesian(rec.date)}
                            </div>
                            {rec.arrivalTime && (
                              <div className="text-[11px] text-slate-500 font-mono">
                                {rec.arrivalTime}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">
                              {student?.name || rec.studentName || '-'}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                              Kelas {student?.className || rec.className || '-'} · NISN:{' '}
                              {student?.nisn || '-'}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                                rec.status === 'Sakit'
                                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                  : rec.status === 'Izin'
                                  ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                  : rec.status === 'Alpa'
                                  ? 'bg-red-100 text-red-900 border border-red-200'
                                  : rec.status === 'Terlambat'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : rec.status === 'Bolos_KBM'
                                  ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                  : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              }`}
                            >
                              {rec.status === 'Bolos_KBM' ? 'Bolos KBM' : rec.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 whitespace-nowrap font-medium">
                            {rec.subjectOrPeriod || '-'}
                          </td>
                          <td className="py-3 px-4 text-slate-800 max-w-xs">
                            <p className="line-clamp-2">{rec.reason || '-'}</p>
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs">
                            <p className="line-clamp-2">{rec.sanctionOrNote || '-'}</p>
                          </td>
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {rec.reportedBy || '-'}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {student && (
                                <>
                                  <button
                                    onClick={() => onIssueLetterForStudent(student)}
                                    className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                    title="Terbitkan Surat Izin / Dispensasi"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onStartCounselingForStudent(student)}
                                    className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                    title="Beri Sesi Konseling"
                                  >
                                    <HeartHandshake className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedStudentIdForReport(student.id);
                                      setActiveTab('reports');
                                      setReportScope('individual');
                                    }}
                                    className="p-1.5 text-slate-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                                    title="Lihat Kartu Presensi Siswa Ini"
                                  >
                                    <User className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => setEditingRecord(rec)}
                                className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                title="Koreksi Tanggal & Data Presensi"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Hapus catatan ketidakhadiran ini?')) {
                                    onDeleteAttendance(rec.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Hapus Catatan"
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
      {/* TAB 2: VISUALISASI & ANALISIS PRESENSI (RECHARTS)                     */}
      {/* ===================================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Header & Filter Controls Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 shadow-2xs">
                    <BarChart3 className="w-5 h-5 text-emerald-800" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>Visualisasi & Tren Kehadiran Siswa</span>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-mono">
                        Recharts Analytics
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Visualisasi grafik fluktuasi presensi harian, pola hari rawan absen, dan perbandingan kedisiplinan antar kelas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Period Selector */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setAnalyticsPeriod('month')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      analyticsPeriod === 'month'
                        ? 'bg-white text-emerald-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bulan Berjalan ({MONTH_NAMES[currentDate.getMonth()]})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalyticsPeriod('30days')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      analyticsPeriod === '30days'
                        ? 'bg-white text-emerald-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    30 Hari Terakhir
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalyticsPeriod('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      analyticsPeriod === 'all'
                        ? 'bg-white text-emerald-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua Data
                  </button>
                </div>

                {/* Class Selector */}
                <select
                  value={analyticsClass}
                  onChange={(e) => setAnalyticsClass(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 font-medium focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                >
                  <option value="all">Semua Rombel (Kelas)</option>
                  {classList.map((c) => (
                    <option key={c} value={c}>
                      Kelas {c}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Catat Absen</span>
                </button>
              </div>
            </div>

            {/* KPI Metrics Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                <span className="text-[11px] font-medium text-emerald-800 block">Rata-rata Kehadiran</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono text-emerald-900">
                    {analyticsDailyTrend.length > 0
                      ? Math.round(
                          analyticsDailyTrend.reduce((acc, c) => acc + c.persentase, 0) /
                            analyticsDailyTrend.length
                        )
                      : 100}
                    %
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Tinggi</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-medium text-slate-600 block">Siswa Hadir / Hari</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {analyticsDailyTrend.length > 0
                      ? Math.round(
                          analyticsDailyTrend.reduce((acc, c) => acc + c.hadir, 0) /
                            analyticsDailyTrend.length
                        )
                      : totalStudentsInAnalytics}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">/ {totalStudentsInAnalytics}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl">
                <span className="text-[11px] font-medium text-blue-800 block">Sakit (S)</span>
                <span className="text-xl font-bold font-mono text-blue-900 mt-1 block">
                  {analyticsAttendance.filter((r) => r.status === 'Sakit').length}
                </span>
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl">
                <span className="text-[11px] font-medium text-purple-800 block">Izin (I)</span>
                <span className="text-xl font-bold font-mono text-purple-900 mt-1 block">
                  {analyticsAttendance.filter((r) => r.status === 'Izin').length}
                </span>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl">
                <span className="text-[11px] font-medium text-rose-800 block">Alpa (A)</span>
                <span className="text-xl font-bold font-mono text-rose-900 mt-1 block">
                  {analyticsAttendance.filter((r) => r.status === 'Alpa').length}
                </span>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                <span className="text-[11px] font-medium text-amber-800 block">Terlambat & Bolos</span>
                <span className="text-xl font-bold font-mono text-amber-900 mt-1 block">
                  {analyticsAttendance.filter(
                    (r) => r.status === 'Terlambat' || r.status === 'Bolos_KBM'
                  ).length}
                </span>
              </div>
            </div>
          </div>

          {/* Row 1 Charts: Tren Harian (Area) & Komposisi Status (Pie) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Tren Fluktuasi Kehadiran Siswa Harian */}
            <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Tren Persentase Kehadiran Harian (% Hadir)
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tingkat siswa masuk vs catatan ketidakhadiran per tanggal pelaksanaan KBM
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-800 font-semibold font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    Tingkat Kehadiran (%)
                  </span>
                </div>
              </div>

              {/* AreaChart Recharts */}
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analyticsDailyTrend}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorHadirRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="displayDate"
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
                      domain={[70, 100]}
                      unit="%"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const dataItem = payload[0].payload;
                          return (
                            <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs text-slate-200 space-y-1.5">
                              <p className="font-bold text-white border-b border-slate-700 pb-1">
                                {dataItem.label || label}
                              </p>
                              <div className="flex justify-between gap-4 text-emerald-400 font-semibold">
                                <span>Persentase Kehadiran:</span>
                                <span className="font-mono">{dataItem.persentase}%</span>
                              </div>
                              <div className="flex justify-between gap-4 text-slate-300">
                                <span>Estimasi Siswa Masuk:</span>
                                <span className="font-mono font-bold text-white">
                                  {dataItem.hadir} Siswa
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-1 text-[11px] text-slate-400 border-t border-slate-800">
                                <span>Sakit: <strong className="text-blue-400 font-mono">{dataItem.sakit}</strong></span>
                                <span>Izin: <strong className="text-purple-400 font-mono">{dataItem.izin}</strong></span>
                                <span>Alpa: <strong className="text-rose-400 font-mono">{dataItem.alpa}</strong></span>
                                <span>Terlambat: <strong className="text-amber-400 font-mono">{dataItem.terlambat}</strong></span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="persentase"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorHadirRate)"
                      name="Persentase Kehadiran"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom Guidance Note */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-emerald-700" />
                  Target standar disiplin sekolah minimal: <strong>95% kehadiran efektif</strong>.
                </span>
                <span className="font-mono">
                  {analyticsDailyTrend.length} Titik Data Presensi
                </span>
              </div>
            </div>

            {/* Chart 2: Komposisi Alasan & Kategori Ketidakhadiran */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CalendarCheck2 className="w-4 h-4 text-emerald-800" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Komposisi Ketidakhadiran
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Distribusi alasan absensi peserta didik periode ini
                  </p>
                </div>

                {/* PieChart Recharts */}
                <div className="h-56 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsStatusComposition}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="count"
                        nameKey="name"
                      >
                        {analyticsStatusComposition.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#f8fafc',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
                {analyticsStatusComposition.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {item.count} catatan
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2 Charts: Perbandingan Antar Kelas & Hari Rawan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 3: Perbandingan Kehadiran Antar Kelas */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-800" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Perbandingan Tingkat Kehadiran Antar Kelas
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Evaluasi kedisiplinan per rombongan belajar untuk koordinasi BK dengan Wali Kelas
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {classList.length} Rombel
                </span>
              </div>

              {/* BarChart Recharts */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsClassComparison}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="className"
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
                      domain={[70, 100]}
                      unit="%"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '11px',
                      }}
                      formatter={(val: any) => [`${val ?? 0}%`, 'Tingkat Kehadiran']}
                    />
                    <Bar
                      dataKey="persentase"
                      name="% Kehadiran"
                      fill="#059669"
                      radius={[6, 6, 0, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Sangat Tertib: {analyticsClassComparison.filter(c => c.persentase >= 95).length} Rombel</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Perlu Perhatian: {analyticsClassComparison.filter(c => c.persentase < 95).length} Rombel</span>
                </div>
              </div>
            </div>

            {/* Chart 4: Pola Hari Rawan Absensi & Keterlambatan */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-800" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Pola Hari Rawan Absensi & Keterlambatan
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Frekuensi ketidakhadiran dan keterlambatan berdasarkan hari dalam seminggu
                  </p>
                </div>
                <span className="text-[11px] font-mono text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Senin - Sabtu
                </span>
              </div>

              {/* BarChart Recharts */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsDayOfWeek}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="hari"
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
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      iconType="circle"
                    />
                    <Bar
                      dataKey="terlambat"
                      name="Terlambat Hadir"
                      fill="#d97706"
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                    <Bar
                      dataKey="alpa"
                      name="Alpa / Bolos KBM"
                      fill="#dc2626"
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                    <Bar
                      dataKey="sakitIzin"
                      name="Sakit / Izin Sah"
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>Insight BK: Hari Senin umumnya memerlukan pengawasan piket ketat saat upacara bendera.</span>
              </div>
            </div>
          </div>

          {/* Section: Siswa Perlu Intervensi BK Berdasarkan Pola Presensi */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Daftar Peserta Didik Butuh Tindak Lanjut Bimbingan Konseling (BK)
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Peringatan Dini Kedisiplinan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Nama Siswa</th>
                    <th className="py-2.5 px-4">Kelas</th>
                    <th className="py-2.5 px-4">NISN</th>
                    <th className="py-2.5 px-4 text-center">Terlambat</th>
                    <th className="py-2.5 px-4 text-center">Alpa</th>
                    <th className="py-2.5 px-4 text-center">Bolos KBM</th>
                    <th className="py-2.5 px-4 text-center">Status Disiplin</th>
                    <th className="py-2.5 px-4 text-right">Rekomendasi Aksi BK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentAlertStats.filter((s) => s.late >= 1 || s.alpa >= 1 || s.bolos >= 1).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Tidak ada siswa dengan catatan pelanggaran presensi atau keterlambatan berulang.
                      </td>
                    </tr>
                  ) : (
                    studentAlertStats
                      .filter((s) => s.late >= 1 || s.alpa >= 1 || s.bolos >= 1)
                      .slice(0, 10)
                      .map((item) => (
                        <tr key={item.student.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-4 font-semibold text-slate-900">
                            {item.student.name}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 font-medium">
                            {item.student.className}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-slate-500">
                            {item.student.nisn}
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono font-bold text-amber-700">
                            {item.late}x
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono font-bold text-rose-700">
                            {item.alpa}x
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono font-bold text-red-800">
                            {item.bolos}x
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.alpa >= 2 || item.bolos >= 2 || item.late >= 3
                                  ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}
                            >
                              {item.alpa >= 2 || item.bolos >= 2 || item.late >= 3
                                ? 'Peringatan Serius'
                                : 'Perlu Pendampingan'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => onStartCounselingForStudent(item.student)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                              >
                                <HeartHandshake className="w-3 h-3" />
                                <span>Konseling BK</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onIssueLetterForStudent(item.student)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors cursor-pointer border border-slate-300"
                              >
                                <FileText className="w-3 h-3 text-slate-600" />
                                <span>Panggilan Ortu</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: PELAPORAN & REKAPITULASI PRESENSI                              */}
      {/* ===================================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-5">
          {/* Shared Filter Bar for Reports */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-emerald-800" />
                Filter Periode:
              </span>

              {/* Month */}
              <select
                value={reportMonth}
                onChange={(e) => setReportMonth(Number(e.target.value))}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    Bulan {m}
                  </option>
                ))}
              </select>

              {/* Year */}
              <select
                value={reportYear}
                onChange={(e) => setReportYear(Number(e.target.value))}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
              >
                {[reportYear - 1, reportYear, reportYear + 1].map((yr) => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>

              {/* Class Filter (active in All Students scope) */}
              {reportScope === 'all' && (
                <select
                  value={reportClass}
                  onChange={(e) => setReportClass(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
                >
                  <option value="all">Semua Rombel / Kelas</option>
                  {classList.map((c) => (
                    <option key={c} value={c}>
                      Kelas {c}
                    </option>
                  ))}
                </select>
              )}

              {/* Effective school days input */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="text-slate-500 text-[11px]">Hari Efektif KBM:</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={effectiveSchoolDays}
                  onChange={(e) => setEffectiveSchoolDays(Number(e.target.value) || 24)}
                  className="w-14 px-2 py-1 border border-slate-300 rounded text-xs font-mono font-bold text-center"
                />
                <span className="text-slate-400 text-[10px]">Hari</span>
              </div>
            </div>

            {/* Scope Action Buttons */}
            <div className="flex items-center gap-2">
              {reportScope === 'all' ? (
                <>
                  <button
                    onClick={handleDownloadAllCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => setShowPrintAllModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Rekapitulasi Semua Siswa</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowPrintStudentModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Kartu Kendali Siswa Ini</span>
                </button>
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* OPTION A: PELAPORAN SEMUA SISWA                                   */}
          {/* ================================================================= */}
          {reportScope === 'all' && (
            <div className="space-y-4">
              {/* Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] text-slate-500 block">Total Siswa Binaan</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                    {allStudentsSummary.totalStudents}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {reportClass === 'all' ? 'Seluruh Kelas' : `Kelas ${reportClass}`}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] text-emerald-800 block font-semibold">
                    Rata-rata Kehadiran
                  </span>
                  <span className="text-xl font-bold font-mono tabular-nums text-emerald-900">
                    {allStudentsSummary.avgAttendancePercent}%
                  </span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">
                    Tingkat Presensi Masuk
                  </span>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] text-blue-800 block font-semibold">Total Sakit (S)</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-blue-900">
                    {allStudentsSummary.totalSick}
                  </span>
                  <span className="text-[10px] text-blue-600 block mt-0.5">Kasus Sakit</span>
                </div>

                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] text-purple-800 block font-semibold">Total Izin (I)</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-purple-900">
                    {allStudentsSummary.totalLeave}
                  </span>
                  <span className="text-[10px] text-purple-600 block mt-0.5">Izin Resmi</span>
                </div>

                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] text-rose-800 block font-semibold">Total Alpa (A)</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-rose-900">
                    {allStudentsSummary.totalAlpa}
                  </span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">Tanpa Keterangan</span>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] text-amber-800 block font-semibold">
                    Terlambat / Bolos
                  </span>
                  <span className="text-xl font-bold font-mono tabular-nums text-amber-900">
                    {allStudentsSummary.totalLate} / {allStudentsSummary.totalBolos}
                  </span>
                  <span className="text-[10px] text-amber-600 block mt-0.5">Kasus Kedisiplinan</span>
                </div>
              </div>

              {/* Table Rekapitulasi Presensi Semua Siswa */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Matriks Rekapitulasi Presensi Periode: {MONTH_NAMES[reportMonth]} {reportYear}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Standar Hari Efektif: <strong>{effectiveSchoolDays} Hari</strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">No</th>
                        <th className="py-2.5 px-3 min-w-[180px]">Nama Peserta Didik</th>
                        <th className="py-2.5 px-3 min-w-[90px]">Rombel</th>
                        <th className="py-2.5 px-2 text-center w-12 text-blue-900" title="Sakit">S</th>
                        <th className="py-2.5 px-2 text-center w-12 text-purple-900" title="Izin">I</th>
                        <th className="py-2.5 px-2 text-center w-12 text-rose-900" title="Alpa">A</th>
                        <th className="py-2.5 px-2 text-center w-12 text-amber-900" title="Terlambat">T</th>
                        <th className="py-2.5 px-2 text-center w-12 text-red-900" title="Bolos KBM">B</th>
                        <th className="py-2.5 px-3 text-center min-w-[90px] bg-slate-50 font-bold">
                          Total Tdk Masuk
                        </th>
                        <th className="py-2.5 px-3 text-center min-w-[90px] bg-emerald-50/50 font-bold text-emerald-900">
                          Hari Masuk
                        </th>
                        <th className="py-2.5 px-3 text-center min-w-[80px] font-bold">% Kehadiran</th>
                        <th className="py-2.5 px-3 min-w-[110px] text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allStudentsReportData.length === 0 ? (
                        <tr>
                          <td colSpan={13} className="py-8 text-center text-slate-400 text-xs">
                            Tidak ada siswa di rombel terpilih.
                          </td>
                        </tr>
                      ) : (
                        allStudentsReportData.map((row, idx) => (
                          <tr key={row.student.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 text-center font-mono text-slate-400 tabular-nums">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{row.student.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                NISN: {row.student.nisn}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-700">
                              {row.student.className}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono tabular-nums font-semibold text-blue-900">
                              {row.sickCount > 0 ? row.sickCount : '-'}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono tabular-nums font-semibold text-purple-900">
                              {row.leaveCount > 0 ? row.leaveCount : '-'}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono tabular-nums font-bold text-rose-700">
                              {row.alpaCount > 0 ? row.alpaCount : '-'}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono tabular-nums font-semibold text-amber-800">
                              {row.lateCount > 0 ? row.lateCount : '-'}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono tabular-nums font-semibold text-red-800">
                              {row.bolosCount > 0 ? row.bolosCount : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono tabular-nums font-bold bg-slate-50 text-slate-800">
                              {row.totalAbsentDays}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono tabular-nums font-bold bg-emerald-50/50 text-emerald-900">
                              {row.presentDays}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono tabular-nums font-bold">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] ${
                                  row.attendancePercentage >= 90
                                    ? 'text-emerald-800 bg-emerald-50'
                                    : row.attendancePercentage >= 75
                                    ? 'text-amber-800 bg-amber-50'
                                    : 'text-rose-800 bg-rose-50'
                                }`}
                              >
                                {row.attendancePercentage}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  row.disciplineStatus === 'Sangat Tertib'
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : row.disciplineStatus === 'Cukup'
                                    ? 'bg-blue-100 text-blue-900'
                                    : row.disciplineStatus === 'Perlu Perhatian'
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-rose-100 text-rose-900'
                                }`}
                              >
                                {row.disciplineStatus}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStudentIdForReport(row.student.id);
                                  setReportScope('individual');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:text-white bg-emerald-50 hover:bg-emerald-800 rounded border border-emerald-200 transition-colors cursor-pointer"
                              >
                                <span>Lihat Laporan</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* OPTION B: PELAPORAN PER SISWA                                     */}
          {/* ================================================================= */}
          {reportScope === 'individual' && individualStudentData && (
            <div className="space-y-4">
              {/* Student Selector Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      individualStudentData.student.gender === 'L'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {individualStudentData.student.gender === 'L' ? 'LK' : 'PR'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {individualStudentData.student.name}
                      </h3>
                      {individualStudentData.student.isWatchlist && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          Pantauan Khusus
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      NISN: {individualStudentData.student.nisn} · Kelas{' '}
                      {individualStudentData.student.className} · Wali:{' '}
                      {individualStudentData.student.homeroomTeacher || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                    Pilih Siswa:
                  </label>
                  <select
                    value={selectedStudentIdForReport}
                    onChange={(e) => setSelectedStudentIdForReport(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 font-semibold max-w-[240px]"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.className})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student KPI Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] text-emerald-800 block font-semibold">
                    Hari Masuk (Hadir)
                  </span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-emerald-900">
                    {individualStudentData.presentDays}
                  </span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5 font-mono">
                    dari {effectiveSchoolDays} Hari
                  </span>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] text-slate-500 block">Persentase Presensi</span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                    {individualStudentData.attendancePercentage}%
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Tingkat Kehadiran</span>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] text-blue-800 block font-semibold">Sakit (S)</span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-blue-900">
                    {individualStudentData.sickCount}
                  </span>
                  <span className="text-[10px] text-blue-600 block mt-0.5">Hari Izin Sakit</span>
                </div>

                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] text-purple-800 block font-semibold">Izin (I)</span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-purple-900">
                    {individualStudentData.leaveCount}
                  </span>
                  <span className="text-[10px] text-purple-600 block mt-0.5">Hari Izin Keperluan</span>
                </div>

                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] text-rose-800 block font-semibold">Alpa (A)</span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-rose-900">
                    {individualStudentData.alpaCount}
                  </span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">Tanpa Keterangan</span>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] text-amber-800 block font-semibold">Terlambat (T)</span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-amber-900">
                    {individualStudentData.lateCount}
                  </span>
                  <span className="text-[10px] text-amber-600 block mt-0.5">Kali Keterlambatan</span>
                </div>

                <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl shadow-2xs">
                  <span className="text-[11px] text-red-800 block font-semibold">Bolos KBM (B)</span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-red-900">
                    {individualStudentData.bolosCount}
                  </span>
                  <span className="text-[10px] text-red-600 block mt-0.5">Meninggalkan Jam KBM</span>
                </div>
              </div>

              {/* Chronological Table of Recorded Exceptions for this Student */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-800" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Riwayat Catatan Ketidakhadiran & Keterlambatan ({MONTH_NAMES[reportMonth]} {reportYear})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onStartCounselingForStudent(individualStudentData.student)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-800 hover:text-white border border-emerald-200 rounded transition-colors cursor-pointer"
                    >
                      + Sesi Konseling
                    </button>
                    <button
                      type="button"
                      onClick={() => onIssueLetterForStudent(individualStudentData.student)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-800 hover:text-white border border-indigo-200 rounded transition-colors cursor-pointer"
                    >
                      + Terbitkan Surat Izin
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4 w-12 text-center">No</th>
                        <th className="py-2.5 px-4 min-w-[120px]">Tanggal & Waktu</th>
                        <th className="py-2.5 px-4 min-w-[110px]">Status</th>
                        <th className="py-2.5 px-4 min-w-[100px]">Jam Pelajaran</th>
                        <th className="py-2.5 px-4 min-w-[220px]">Alasan / Keterangan</th>
                        <th className="py-2.5 px-4 min-w-[200px]">Tindakan Pembinaan BK</th>
                        <th className="py-2.5 px-4 min-w-[120px]">Pelapor</th>
                        <th className="py-2.5 px-4 text-right">Aksi Koreksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {individualStudentData.records.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                              <span className="font-semibold text-slate-700">
                                Tidak ada catatan ketidakhadiran pada periode ini.
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Peserta didik memiliki presensi sempurna (Hadir 100% pada hari efektif KBM).
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        individualStudentData.records.map((rec, idx) => (
                          <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-4 text-center font-mono text-slate-400 tabular-nums">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap font-mono tabular-nums">
                              <div className="font-semibold text-slate-900">
                                {formatDateIndonesian(rec.date)}
                              </div>
                              {rec.arrivalTime && (
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {rec.arrivalTime}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                                  rec.status === 'Sakit'
                                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                    : rec.status === 'Izin'
                                    ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                    : rec.status === 'Alpa'
                                    ? 'bg-red-100 text-red-900 border border-red-200'
                                    : rec.status === 'Terlambat'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                    : rec.status === 'Bolos_KBM'
                                    ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                    : 'bg-emerald-100 text-emerald-900'
                                }`}
                              >
                                {rec.status === 'Bolos_KBM' ? 'Bolos KBM' : rec.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-700 font-medium">
                              {rec.subjectOrPeriod || '-'}
                            </td>
                            <td className="py-2.5 px-4 text-slate-800">
                              {rec.reason || '-'}
                            </td>
                            <td className="py-2.5 px-4 text-slate-600">
                              {rec.sanctionOrNote || '-'}
                            </td>
                            <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                              {rec.reportedBy || '-'}
                            </td>
                            <td className="py-2.5 px-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setEditingRecord(rec)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-emerald-900 bg-slate-100 hover:bg-emerald-50 rounded border border-slate-200 transition-colors cursor-pointer shadow-2xs mr-1"
                                title="Koreksi tanggal atau data presensi ini"
                              >
                                <Edit2 className="w-3 h-3 text-emerald-700" />
                                <span>Koreksi</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Hapus catatan presensi (${rec.status}) tanggal ${formatDateIndonesian(
                                        rec.date
                                      )} untuk ${individualStudentData.student.name}? Siswa otomatis dihitung Hadir.`
                                    )
                                  ) {
                                    onDeleteAttendance(rec.id);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 rounded border border-rose-200 transition-colors cursor-pointer shadow-2xs"
                                title="Hapus catatan untuk koreksi data presensi"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Hapus</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: FORM INPUT PRESENSI / KETIDAKHADIRAN                         */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-emerald-800" />
                <h3 className="text-base font-bold text-slate-900">
                  Pencatatan Presensi & Ketidakhadiran
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Pilih Siswa yang Tidak Hadir / Terlambat *
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white font-medium"
                >
                  <option value="">-- Pilih Peserta Didik --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} - Kelas {st.className} (NISN: {st.nisn})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Preset Quick Pickers */}
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Status Ketidakhadiran (Klik Preset 1-Klik) *:
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickStatusPreset('Sakit')}
                    className={`py-1.5 px-2 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                      formData.status === 'Sakit'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    Sakit (S)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStatusPreset('Izin')}
                    className={`py-1.5 px-2 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                      formData.status === 'Izin'
                        ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                        : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    Izin (I)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStatusPreset('Alpa')}
                    className={`py-1.5 px-2 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                      formData.status === 'Alpa'
                        ? 'bg-red-600 text-white border-red-700 shadow-xs'
                        : 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100'
                    }`}
                  >
                    Alpa (A)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStatusPreset('Terlambat')}
                    className={`py-1.5 px-2 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                      formData.status === 'Terlambat'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    Terlambat
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStatusPreset('Bolos_KBM')}
                    className={`py-1.5 px-2 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                      formData.status === 'Bolos_KBM'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    Bolos KBM
                  </button>
                </div>
              </div>

              {/* Fitur Tanggal & Rentang Tanggal */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <label className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Fitur Tanggal Presensi *</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {quickDatePresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          const dateStr = preset.getDate();
                          setFormData((prev) => ({
                            ...prev,
                            date: dateStr,
                            endDate:
                              prev.isDateRange && prev.endDate < dateStr ? dateStr : prev.endDate,
                          }));
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                          formData.date === preset.getDate()
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      {formData.isDateRange ? 'Tanggal Mulai *:' : 'Tanggal Ketidakhadiran *:'}
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                    />
                    <span className="text-[10px] text-emerald-800 font-medium mt-1 block">
                      📅 {formatDateWithDayIndonesian(formData.date)}
                    </span>
                  </div>

                  {formData.isDateRange ? (
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Sampai Tanggal (Selesai) *:
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        min={formData.date}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                      />
                      <span className="text-[10px] text-emerald-800 font-medium mt-1 block">
                        🏁 {formatDateWithDayIndonesian(formData.endDate)}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Jam Kedatangan (Jika Terlambat):
                      </label>
                      <input
                        type="text"
                        placeholder="Misal: 07:25 WIB"
                        value={formData.arrivalTime}
                        onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* Multi-day date range toggle */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={formData.isDateRange}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isDateRange: e.target.checked,
                          endDate: formData.date,
                        })
                      }
                      className="w-3.5 h-3.5 rounded text-emerald-800 focus:ring-emerald-700 border-slate-300"
                    />
                    <span>Input Rentang Tanggal (Contoh: Sakit / Izin berturut-turut lebih dari 1 hari)</span>
                  </label>
                  {formData.isDateRange && formData.endDate && formData.endDate >= formData.date && (
                    <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {getDatesInRange(formData.date, formData.endDate).length} Hari Presensi
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Periode / Jam Pelajaran
                </label>
                <input
                  type="text"
                  placeholder="Hari Penuh / Jam Ke-1 / Jam Ke-3 s.d 4"
                  value={formData.subjectOrPeriod}
                  onChange={(e) => setFormData({ ...formData, subjectOrPeriod: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Alasan / Keterangan Ketidakhadiran *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Sakit demam, ada surat dokter / Izin acara keluarga di Surabaya / Alpa tanpa kabar"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tindakan Edukatif BK / Guru Piket
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Diberi edukasi pembinaan, pembinaan kedisiplinan"
                    value={formData.sanctionOrNote}
                    onChange={(e) => setFormData({ ...formData, sanctionOrNote: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Pihak Pelapor
                  </label>
                  <input
                    type="text"
                    placeholder="Guru Piket / Wali Kelas"
                    value={formData.reportedBy}
                    onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
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
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: CETAK REKAPITULASI SEMUA SISWA (OFFICIAL LETTERHEAD)          */}
      {/* ===================================================================== */}
      {showPrintAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            {/* Top Toolbar */}
            <div className="no-print flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pratinjau Cetak: Rekapitulasi Presensi Peserta Didik
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen Sekarang</span>
                </button>
                <button
                  onClick={() => setShowPrintAllModal(false)}
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
                  REKAPITULASI PRESENSI & KETIDAKHADIRAN PESERTA DIDIK
                </h2>
                <p className="text-xs text-slate-600">
                  Periode: <strong>{MONTH_NAMES[reportMonth]} {reportYear}</strong> · Kelas:{' '}
                  <strong>{reportClass === 'all' ? 'Seluruh Kelas' : reportClass}</strong> · Hari Efektif:{' '}
                  <strong>{effectiveSchoolDays} Hari</strong>
                </p>
              </div>

              {/* Summary Box */}
              <div className="grid grid-cols-4 gap-2 my-4 border border-slate-200 rounded p-2.5 text-center text-[11px] bg-slate-50/50">
                <div>
                  <span className="text-slate-500 block">Total Siswa</span>
                  <strong className="font-mono text-sm">{allStudentsSummary.totalStudents}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Rata-rata Kehadiran</span>
                  <strong className="font-mono text-sm text-emerald-800">
                    {allStudentsSummary.avgAttendancePercent}%
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Ketidakhadiran</span>
                  <strong className="font-mono text-sm">{allStudentsSummary.totalAbsentAll} kali</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Keterlambatan</span>
                  <strong className="font-mono text-sm">{allStudentsSummary.totalLate} kali</strong>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-[10.5px] border-collapse border border-slate-300 mt-3 text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                    <th className="border border-slate-300 py-1.5 px-2 text-center w-8">No</th>
                    <th className="border border-slate-300 py-1.5 px-2">Nama Siswa</th>
                    <th className="border border-slate-300 py-1.5 px-2 text-center w-16">NISN</th>
                    <th className="border border-slate-300 py-1.5 px-2 text-center w-14">Kelas</th>
                    <th className="border border-slate-300 py-1.5 px-1 text-center w-8">S</th>
                    <th className="border border-slate-300 py-1.5 px-1 text-center w-8">I</th>
                    <th className="border border-slate-300 py-1.5 px-1 text-center w-8">A</th>
                    <th className="border border-slate-300 py-1.5 px-1 text-center w-8">T</th>
                    <th className="border border-slate-300 py-1.5 px-1 text-center w-8">B</th>
                    <th className="border border-slate-300 py-1.5 px-2 text-center w-16">Tdk Hadir</th>
                    <th className="border border-slate-300 py-1.5 px-2 text-center w-16">Hari Masuk</th>
                    <th className="border border-slate-300 py-1.5 px-2 text-center w-14">% Hadir</th>
                  </tr>
                </thead>
                <tbody>
                  {allStudentsReportData.map((row, idx) => (
                    <tr key={row.student.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 py-1 px-1.5 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 py-1 px-2 font-semibold text-slate-900">{row.student.name}</td>
                      <td className="border border-slate-300 py-1 px-2 text-center font-mono">{row.student.nisn}</td>
                      <td className="border border-slate-300 py-1 px-2 text-center font-semibold">{row.student.className}</td>
                      <td className="border border-slate-300 py-1 px-1 text-center font-mono">{row.sickCount || '-'}</td>
                      <td className="border border-slate-300 py-1 px-1 text-center font-mono">{row.leaveCount || '-'}</td>
                      <td className="border border-slate-300 py-1 px-1 text-center font-mono">{row.alpaCount || '-'}</td>
                      <td className="border border-slate-300 py-1 px-1 text-center font-mono">{row.lateCount || '-'}</td>
                      <td className="border border-slate-300 py-1 px-1 text-center font-mono">{row.bolosCount || '-'}</td>
                      <td className="border border-slate-300 py-1 px-2 text-center font-mono font-bold">{row.totalAbsentDays}</td>
                      <td className="border border-slate-300 py-1 px-2 text-center font-mono font-bold text-emerald-900">{row.presentDays}</td>
                      <td className="border border-slate-300 py-1 px-2 text-center font-mono font-bold">{row.attendancePercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures Block */}
              <div className="mt-8 grid grid-cols-2 text-xs pt-4 break-inside-avoid">
                <div className="text-center space-y-14">
                  <div>
                    <p className="text-slate-500">Mengetahui,</p>
                    <p className="font-bold text-slate-900">Kepala Sekolah</p>
                  </div>
                  <div>
                    <p className="font-bold underline text-slate-900">{profile.principalName}</p>
                    <p className="text-[11px] text-slate-600">NIP. {profile.principalNIP || '-'}</p>
                  </div>
                </div>

                <div className="text-center space-y-14">
                  <div>
                    <p className="text-slate-500">
                      {profile.regencyCity || 'Malang'}, {formatDateIndonesian(new Date().toISOString().slice(0, 10))}
                    </p>
                    <p className="font-bold text-slate-900">Guru Bimbingan dan Konseling</p>
                  </div>
                  <div>
                    <p className="font-bold underline text-slate-900">{profile.leadCounselorName}</p>
                    <p className="text-[11px] text-slate-600">NIP. {profile.leadCounselorNIP || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: CETAK KARTU KENDALI PRESENSI PER SISWA                       */}
      {/* ===================================================================== */}
      {showPrintStudentModal && individualStudentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            {/* Top Toolbar */}
            <div className="no-print flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pratinjau Cetak: Kartu Kendali Presensi Individu Siswa
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen Sekarang</span>
                </button>
                <button
                  onClick={() => setShowPrintStudentModal(false)}
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
                  KARTU KENDALI & REKAPITULASI PRESENSI PESERTA DIDIK
                </h2>
                <p className="text-xs text-slate-600">
                  Tahun Ajaran {profile.academicYear} · Semester {profile.currentSemester} · Periode:{' '}
                  <strong>{MONTH_NAMES[reportMonth]} {reportYear}</strong>
                </p>
              </div>

              {/* Student Identity Block */}
              <div className="border border-slate-300 rounded p-3 my-4 bg-slate-50/40 text-xs">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nama Lengkap Siswa:</span>
                    <strong className="text-slate-900 font-bold">{individualStudentData.student.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">NISN / No Induk:</span>
                    <strong className="text-slate-900 font-mono">{individualStudentData.student.nisn}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kelas / Rombel:</span>
                    <span className="font-semibold text-slate-800">{individualStudentData.student.className}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wali Kelas:</span>
                    <span className="text-slate-800">{individualStudentData.student.homeroomTeacher || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nama Orang Tua / Wali:</span>
                    <span className="text-slate-800">{individualStudentData.student.parentName || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kontak Telepon:</span>
                    <span className="text-slate-800 font-mono">{individualStudentData.student.parentPhone || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Recap Metrics Box */}
              <div className="grid grid-cols-6 gap-2 my-4 border border-slate-300 rounded p-2.5 text-center text-[11px] bg-slate-50/50">
                <div>
                  <span className="text-slate-500 block">Hari Masuk</span>
                  <strong className="font-mono text-sm text-emerald-800">
                    {individualStudentData.presentDays} / {effectiveSchoolDays}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">% Kehadiran</span>
                  <strong className="font-mono text-sm text-slate-900">
                    {individualStudentData.attendancePercentage}%
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Sakit (S)</span>
                  <strong className="font-mono text-sm text-blue-900">
                    {individualStudentData.sickCount}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Izin (I)</span>
                  <strong className="font-mono text-sm text-purple-900">
                    {individualStudentData.leaveCount}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Alpa (A)</span>
                  <strong className="font-mono text-sm text-rose-900">
                    {individualStudentData.alpaCount}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Terlambat (T)</span>
                  <strong className="font-mono text-sm text-amber-900">
                    {individualStudentData.lateCount}
                  </strong>
                </div>
              </div>

              {/* Table of Absence Dates */}
              <div className="my-4">
                <h4 className="font-bold text-slate-800 mb-1.5 uppercase text-[11px]">
                  Rincian Tanggal Ketidakhadiran & Keterlambatan:
                </h4>
                <table className="w-full text-[10.5px] border-collapse border border-slate-300 text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                      <th className="border border-slate-300 py-1.5 px-2 text-center w-8">No</th>
                      <th className="border border-slate-300 py-1.5 px-3 min-w-[100px]">Tanggal</th>
                      <th className="border border-slate-300 py-1.5 px-2 text-center w-24">Status</th>
                      <th className="border border-slate-300 py-1.5 px-2 text-center w-24">Jam</th>
                      <th className="border border-slate-300 py-1.5 px-3">Keterangan / Alasan</th>
                      <th className="border border-slate-300 py-1.5 px-3">Tindakan / Petugas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {individualStudentData.records.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="border border-slate-300 py-4 text-center text-slate-500">
                          Nihil (Peserta didik hadir penuh tanpa catatan ketidakhadiran pada periode ini).
                        </td>
                      </tr>
                    ) : (
                      individualStudentData.records.map((rec, idx) => (
                        <tr key={rec.id} className="border-b border-slate-200">
                          <td className="border border-slate-300 py-1 px-2 text-center font-mono">{idx + 1}</td>
                          <td className="border border-slate-300 py-1 px-3 font-mono font-medium">{formatDateIndonesian(rec.date)}</td>
                          <td className="border border-slate-300 py-1 px-2 text-center font-bold">
                            {rec.status === 'Bolos_KBM' ? 'Bolos KBM' : rec.status}
                          </td>
                          <td className="border border-slate-300 py-1 px-2 text-center font-mono">{rec.arrivalTime || rec.subjectOrPeriod || '-'}</td>
                          <td className="border border-slate-300 py-1 px-3">{rec.reason || '-'}</td>
                          <td className="border border-slate-300 py-1 px-3 text-slate-600">
                            {rec.sanctionOrNote ? `${rec.sanctionOrNote} (${rec.reportedBy || 'Piket'})` : rec.reportedBy || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Counselor Recommendation / Notes */}
              <div className="border border-slate-300 rounded p-3 my-4 bg-slate-50/30 text-[11px] space-y-1">
                <span className="font-bold text-slate-800 block">Catatan & Rekomendasi Guru BK:</span>
                <p className="text-slate-600 italic">
                  {individualStudentData.attendancePercentage >= 90
                    ? 'Peserta didik menunjukkan tingkat kedisiplinan dan kehadiran yang sangat baik. Dipertahankan prestasinya.'
                    : individualStudentData.alpaCount >= 2 || individualStudentData.totalAbsentDays >= 5
                    ? 'Tingkat ketidakhadiran/keterlambatan memerlukan pembinaan intensif dan koordinasi dengan orang tua murid.'
                    : 'Peserta didik diharapkan menjaga ketertiban kehadiran sesuai tata tertib sekolah.'}
                </p>
              </div>

              {/* 3-Column Signatures Block (Orang Tua, Wali Kelas, Guru BK) */}
              <div className="mt-8 grid grid-cols-3 text-xs pt-4 break-inside-avoid">
                <div className="text-center space-y-14">
                  <div>
                    <p className="text-slate-500">Mengetahui,</p>
                    <p className="font-bold text-slate-900">Orang Tua / Wali Siswa</p>
                  </div>
                  <div>
                    <p className="font-bold underline text-slate-900">
                      ( {individualStudentData.student.parentName || '...............................'} )
                    </p>
                  </div>
                </div>

                <div className="text-center space-y-14">
                  <div>
                    <p className="text-slate-500">Menyetujui,</p>
                    <p className="font-bold text-slate-900">Wali Kelas</p>
                  </div>
                  <div>
                    <p className="font-bold underline text-slate-900">
                      ( {individualStudentData.student.homeroomTeacher || '...............................'} )
                    </p>
                  </div>
                </div>

                <div className="text-center space-y-14">
                  <div>
                    <p className="text-slate-500">
                      {profile.regencyCity || 'Malang'}, {formatDateIndonesian(new Date().toISOString().slice(0, 10))}
                    </p>
                    <p className="font-bold text-slate-900">Guru Bimbingan dan Konseling</p>
                  </div>
                  <div>
                    <p className="font-bold underline text-slate-900">{profile.leadCounselorName}</p>
                    <p className="text-[11px] text-slate-600">NIP. {profile.leadCounselorNIP || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
