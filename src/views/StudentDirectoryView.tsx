import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  User,
  Phone,
  ShieldAlert,
  ChevronRight,
  Edit2,
  Trash2,
  HeartHandshake,
  FileText,
  CalendarCheck2,
  LayoutGrid,
  List,
  Sparkles,
  Zap,
  RotateCcw,
  GraduationCap,
  Check,
} from 'lucide-react';
import { Student } from '../types';

export const STUDENT_STANDARD_CLASSES = ['X', 'XI IPA', 'XI IPS', 'XII IPA', 'XII IPS'] as const;

interface StudentDirectoryViewProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onUpdateStudent: (id: string, updated: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
  onToggleWatchlist: (id: string) => void;
  onQuickCounseling: (student: Student) => void;
  onQuickLetter: (student: Student) => void;
  onQuickAttendance: (student: Student) => void;
}

export const StudentDirectoryView: React.FC<StudentDirectoryViewProps> = ({
  students,
  onSelectStudent,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onToggleWatchlist,
  onQuickCounseling,
  onQuickLetter,
  onQuickAttendance,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [onlyWatchlist, setOnlyWatchlist] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State for Add Student (NISN, Nama Orang Tua, Kontak Orang Tua removed)
  const initialFormData = {
    name: '',
    selectedClass: 'X' as string,
    customClass: '',
    isCustomClass: false,
    gender: 'L' as 'L' | 'P',
    phone: '',
    address: '',
    homeroomTeacher: '',
    notes: '',
    isWatchlist: false,
  };

  const [formData, setFormData] = useState(initialFormData);

  // State for Edit Student custom class
  const [editIsCustomClass, setEditIsCustomClass] = useState(false);
  const [editCustomClass, setEditCustomClass] = useState('');

  const classList = useMemo(() => {
    const set = new Set<string>(STUDENT_STANDARD_CLASSES);
    students.forEach((s) => {
      if (s.className) set.add(s.className);
    });
    return Array.from(set);
  }, [students]);

  // List of existing homeroom teachers to provide auto-suggestions
  const existingTeachers = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.homeroomTeacher && s.homeroomTeacher.trim() && s.homeroomTeacher !== 'Wali Kelas') {
        set.add(s.homeroomTeacher.trim());
      }
    });
    return Array.from(set);
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const searchLower = searchQuery.toLowerCase();
      const matchSearch =
        s.name.toLowerCase().includes(searchLower) ||
        (s.homeroomTeacher && s.homeroomTeacher.toLowerCase().includes(searchLower)) ||
        (s.className && s.className.toLowerCase().includes(searchLower)) ||
        (s.nisn && s.nisn.toLowerCase().includes(searchLower));

      const matchClass = classFilter === 'all' || s.className === classFilter;
      const matchWatchlist = !onlyWatchlist || s.isWatchlist;
      return matchSearch && matchClass && matchWatchlist;
    });
  }, [students, searchQuery, classFilter, onlyWatchlist]);

  const handleResetAddForm = () => {
    setFormData(initialFormData);
  };

  const handleStartEdit = (student: Student) => {
    const isStandard = (STUDENT_STANDARD_CLASSES as readonly string[]).includes(student.className);
    setEditIsCustomClass(!isStandard);
    setEditCustomClass(!isStandard ? student.className : '');
    setEditingStudent(student);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalClassName = formData.isCustomClass
      ? (formData.customClass.trim() || 'X')
      : formData.selectedClass;

    onAddStudent({
      name: formData.name.trim(),
      className: finalClassName,
      gender: formData.gender,
      homeroomTeacher: formData.homeroomTeacher.trim() || 'Wali Kelas',
      phone: formData.phone.trim() || undefined,
      address: formData.address.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      isWatchlist: formData.isWatchlist,
    });

    setShowAddModal(false);
    setFormData(initialFormData);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const finalClassName = editIsCustomClass
      ? (editCustomClass.trim() || 'X')
      : editingStudent.className;

    onUpdateStudent(editingStudent.id, {
      name: editingStudent.name.trim(),
      className: finalClassName,
      gender: editingStudent.gender,
      homeroomTeacher: editingStudent.homeroomTeacher.trim() || 'Wali Kelas',
      phone: editingStudent.phone?.trim() || undefined,
      address: editingStudent.address?.trim() || undefined,
      notes: editingStudent.notes?.trim() || undefined,
      isWatchlist: editingStudent.isWatchlist,
    });
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-800" />
            <h2 className="text-lg font-bold text-slate-900">
              Direktori & Buku Induk Bimbingan Siswa
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pangkalan data peserta didik, kontak wali murid, dan akses instan ke seluruh rekam jejak konseling, masalah, presensi, dan perizinan.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Siswa Binaan</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama siswa, rombel (X, XI IPA...), atau wali kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="all">Semua Rombel / Kelas</option>
            {classList.map((c) => (
              <option key={c} value={c}>
                Kelas {c}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyWatchlist}
              onChange={(e) => setOnlyWatchlist(e.target.checked)}
              className="rounded text-emerald-800 focus:ring-emerald-700"
            />
            <span className="text-slate-700 font-medium">Hanya Pantauan Khusus</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle: Table Rows vs Cards */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-emerald-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Tabel / Baris Siswa (Rekomendasi untuk Aksi Cepat)"
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabel Baris</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-emerald-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Kartu Siswa"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu Grid</span>
            </button>
          </div>

          <div className="text-slate-500 text-xs font-mono tabular-nums whitespace-nowrap">
            Total: <strong>{filteredStudents.length}</strong> siswa
          </div>
        </div>
      </div>

      {/* Quick Action Hint Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/70 rounded-xl p-3 px-4 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-800 text-white font-bold text-xs shadow-2xs">
            <Zap className="w-3.5 h-3.5" />
          </span>
          <div>
            <strong className="text-slate-900">Tombol Aksi Cepat (Quick Action 1-Klik):</strong>{' '}
            <span className="text-slate-600">
              Langsung catat sesi konseling, terbitkan surat izin KBM/dispensasi, atau catat presensi siswa dalam satu kali klik tanpa harus mencari manual.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800">
            <HeartHandshake className="w-3 h-3" /> Konseling
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-100/70 text-indigo-800">
            <FileText className="w-3 h-3" /> Surat Izin
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100/70 text-amber-800">
            <CalendarCheck2 className="w-3 h-3" /> Presensi
          </span>
        </div>
      </div>

      {/* Main Student Display: Table View or Cards View */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 min-w-[200px]">Data Peserta Didik</th>
                  <th className="py-3 px-4 min-w-[130px]">Rombel / Tingkat</th>
                  <th className="py-3 px-4 min-w-[180px]">Nama Wali Kelas</th>
                  <th className="py-3 px-4 min-w-[90px] text-center">Status</th>
                  <th className="py-3 px-4 min-w-[340px] text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-900 font-bold">
                      <Zap className="w-3.5 h-3.5" />
                      Aksi Cepat 1-Klik (Quick Actions)
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      Tidak ada peserta didik yang sesuai dengan pencarian atau filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st, idx) => (
                    <tr
                      key={st.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-default"
                    >
                      <td className="py-3.5 px-4 text-center font-mono tabular-nums text-slate-400">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              st.gender === 'L'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {st.gender === 'L' ? 'LK' : 'PR'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                              {st.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {st.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                              {st.phone ? ` · WA: ${st.phone}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                          Kelas {st.className}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="truncate max-w-[180px]" title={st.homeroomTeacher}>
                            {st.homeroomTeacher || 'Belum Diatur'}
                          </span>
                        </div>
                        {st.address && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]" title={st.address}>
                            {st.address}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {st.isWatchlist ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            Pantauan
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Reguler</span>
                        )}
                      </td>

                      {/* Floating Quick Action Cluster */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-50/90 border border-slate-200/90 shadow-2xs group-hover:bg-white group-hover:border-emerald-300 group-hover:shadow-xs transition-all">
                          {/* Quick Action: Konseling */}
                          <button
                            type="button"
                            onClick={() => onQuickCounseling(st)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800 bg-white hover:bg-emerald-700 hover:text-white border border-emerald-200/80 rounded-lg shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
                            title={`1-Klik: Buka formulir konseling baru untuk ${st.name}`}
                          >
                            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600 group-hover/btn:text-white" />
                            <span>+ Konseling</span>
                          </button>

                          {/* Quick Action: Surat Izin */}
                          <button
                            type="button"
                            onClick={() => onQuickLetter(st)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-800 bg-white hover:bg-indigo-700 hover:text-white border border-indigo-200/80 rounded-lg shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
                            title={`1-Klik: Terbitkan surat izin KBM / dispensasi untuk ${st.name}`}
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-600 group-hover/btn:text-white" />
                            <span>+ Surat Izin</span>
                          </button>

                          {/* Quick Action: Presensi */}
                          <button
                            type="button"
                            onClick={() => onQuickAttendance(st)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-amber-900 bg-white hover:bg-amber-600 hover:text-white border border-amber-200/80 rounded-lg shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
                            title={`1-Klik: Catat keterlambatan / absensi untuk ${st.name}`}
                          >
                            <CalendarCheck2 className="w-3.5 h-3.5 text-amber-600 group-hover/btn:text-white" />
                            <span>+ Presensi</span>
                          </button>

                          <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                          {/* Profile Button */}
                          <button
                            type="button"
                            onClick={() => onSelectStudent(st)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                            title={`Buka Profil 360° & Buku Induk ${st.name}`}
                          >
                            <User className="w-3.5 h-3.5" />
                            <span>Profil</span>
                          </button>

                          {/* Edit / Koreksi Button */}
                          <button
                            type="button"
                            onClick={() => setEditingStudent(st)}
                            className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title={`Koreksi Data ${st.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Hapus data siswa "${st.name}" (Kelas: ${st.className})? Data ini akan dihapus untuk koreksi.`
                                )
                              ) {
                                onDeleteStudent(st.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={`Hapus data ${st.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      ) : (
        /* Students Grid / Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
              Tidak ada siswa yang ditemukan.
            </div>
          ) : (
            filteredStudents.map((st) => (
              <div
                key={st.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          st.gender === 'L'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {st.gender === 'L' ? 'LK' : 'PR'}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-900 transition-colors">
                          {st.name}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {st.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                          {st.phone ? ` · ${st.phone}` : ''}
                        </p>
                      </div>
                    </div>

                    {st.isWatchlist && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        Pantauan
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Rombel:</span>
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Kelas {st.className}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Wali Kelas:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]" title={st.homeroomTeacher}>
                        {st.homeroomTeacher || '-'}
                      </span>
                    </div>
                  </div>

                  {st.notes && (
                    <p className="mt-2 text-[11px] text-slate-500 line-clamp-2 bg-slate-50 p-1.5 rounded">
                      {st.notes}
                    </p>
                  )}
                </div>

                {/* Floating Quick Action Bar for Cards */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-0.5">
                    <span className="flex items-center gap-1 text-slate-600 font-semibold">
                      <Zap className="w-3 h-3 text-emerald-700" />
                      Aksi Cepat 1-Klik:
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleWatchlist(st.id)}
                      className="text-[10px] text-slate-400 hover:text-slate-800 underline cursor-pointer"
                    >
                      {st.isWatchlist ? 'Hapus Pantauan' : '+ Pantau'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => onQuickCounseling(st)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-semibold text-emerald-800 bg-white hover:bg-emerald-700 hover:text-white border border-emerald-200/80 rounded-lg shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
                      title={`Catat Jurnal Konseling untuk ${st.name}`}
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>Konseling</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onQuickLetter(st)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-semibold text-indigo-800 bg-white hover:bg-indigo-700 hover:text-white border border-indigo-200/80 rounded-lg shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
                      title={`Buat Surat Izin / Dispensasi untuk ${st.name}`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Surat Izin</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onQuickAttendance(st)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-semibold text-amber-900 bg-white hover:bg-amber-600 hover:text-white border border-amber-200/80 rounded-lg shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 cursor-pointer"
                      title={`Catat Presensi / Keterlambatan untuk ${st.name}`}
                    >
                      <CalendarCheck2 className="w-3.5 h-3.5" />
                      <span>Presensi</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectStudent(st)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>Buka Profil</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingStudent(st)}
                      className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Koreksi Data Siswa"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Hapus data siswa "${st.name}"? Tindakan ini untuk koreksi data.`)) {
                          onDeleteStudent(st.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Siswa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Tambah Siswa */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Pendaftaran Siswa Binaan Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap sesuai akta / dapodik"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* Pemilihan Rombel / Tingkat Kelas */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800">
                    Pilih Rombel / Tingkat Kelas *
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isCustomClass: !formData.isCustomClass })}
                    className="text-[11px] text-emerald-800 hover:text-emerald-900 font-medium hover:underline cursor-pointer"
                  >
                    {formData.isCustomClass ? '← Pilih dari Rombel Standar' : '+ Rombel Khusus / Lainnya'}
                  </button>
                </div>

                {!formData.isCustomClass ? (
                  <div>
                    <div className="grid grid-cols-5 gap-2">
                      {STUDENT_STANDARD_CLASSES.map((cls) => {
                        const isSelected = formData.selectedClass === cls;
                        return (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => setFormData({ ...formData, selectedClass: cls })}
                            className={`py-2 px-1 text-center font-bold text-xs rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                              isSelected
                                ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs ring-2 ring-emerald-500/30'
                                : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/50'
                            }`}
                          >
                            <span>{cls}</span>
                            {isSelected && <span className="text-[9px] text-emerald-200">✓ Terpilih</span>}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                      <span>Rombel aktif yang dipilih:</span>
                      <strong className="text-emerald-800 font-bold bg-emerald-100/70 px-1.5 py-0.2 rounded">
                        Kelas {formData.selectedClass}
                      </strong>
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Ketik rombel khusus (Contoh: X-A, XI-MIPA 1, dsb)"
                      value={formData.customClass}
                      onChange={(e) => setFormData({ ...formData, customClass: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Nama Wali Kelas & Jenis Kelamin */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">
                    Nama Wali Kelas *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      list="teacher-suggestions-add"
                      placeholder="Contoh: Budi Santoso, S.Pd."
                      value={formData.homeroomTeacher}
                      onChange={(e) => setFormData({ ...formData, homeroomTeacher: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                    />
                    <datalist id="teacher-suggestions-add">
                      {existingTeachers.map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Nama guru wali kelas untuk rombel ini
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                  >
                    <option value="L">Laki-laki (LK)</option>
                    <option value="P">Perempuan (PR)</option>
                  </select>
                </div>
              </div>

              {/* Kontak Siswa */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nomor WhatsApp Siswa (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 0812-xxxx-xxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Alamat Tempat Tinggal
                </label>
                <input
                  type="text"
                  placeholder="Jl. / RT / RW / Desa"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Catatan Awal Guru BK
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan latar belakang, prestasi, atau kecenderungan sikap..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="watchlistCheck"
                  checked={formData.isWatchlist}
                  onChange={(e) => setFormData({ ...formData, isWatchlist: e.target.checked })}
                  className="rounded text-emerald-800 focus:ring-emerald-700"
                />
                <label htmlFor="watchlistCheck" className="text-slate-700 cursor-pointer">
                  Tandai sebagai siswa dalam perhatian khusus (Watchlist)
                </label>
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
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit / Koreksi Data Siswa */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-800" />
                <h3 className="text-base font-bold text-slate-900">
                  Koreksi & Edit Data Siswa Binaan
                </h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* Pemilihan Rombel / Tingkat Kelas */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800">
                    Pilih Rombel / Tingkat Kelas *
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditIsCustomClass(!editIsCustomClass)}
                    className="text-[11px] text-emerald-800 hover:text-emerald-900 font-medium hover:underline cursor-pointer"
                  >
                    {editIsCustomClass ? '← Pilih dari Rombel Standar' : '+ Rombel Khusus / Lainnya'}
                  </button>
                </div>

                {!editIsCustomClass ? (
                  <div>
                    <div className="grid grid-cols-5 gap-2">
                      {STUDENT_STANDARD_CLASSES.map((cls) => {
                        const isSelected = editingStudent.className === cls;
                        return (
                          <button
                            key={cls}
                            type="button"
                            onClick={() =>
                              setEditingStudent({ ...editingStudent, className: cls })
                            }
                            className={`py-2 px-1 text-center font-bold text-xs rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                              isSelected
                                ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs ring-2 ring-emerald-500/30'
                                : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/50'
                            }`}
                          >
                            <span>{cls}</span>
                            {isSelected && (
                              <span className="text-[9px] text-emerald-200">✓ Terpilih</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                      <span>Rombel aktif siswa:</span>
                      <strong className="text-emerald-800 font-bold bg-emerald-100/70 px-1.5 py-0.2 rounded">
                        Kelas {editingStudent.className}
                      </strong>
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Ketik rombel khusus (Contoh: X-A, XI-MIPA 1, dsb)"
                      value={editCustomClass}
                      onChange={(e) => setEditCustomClass(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Nama Wali Kelas & Jenis Kelamin */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">
                    Nama Wali Kelas *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      list="teacher-suggestions-edit"
                      placeholder="Contoh: Budi Santoso, S.Pd."
                      value={editingStudent.homeroomTeacher}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          homeroomTeacher: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                    />
                    <datalist id="teacher-suggestions-edit">
                      {existingTeachers.map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Nama guru wali kelas untuk rombel ini
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={editingStudent.gender}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        gender: e.target.value as 'L' | 'P',
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                  >
                    <option value="L">Laki-laki (LK)</option>
                    <option value="P">Perempuan (PR)</option>
                  </select>
                </div>
              </div>

              {/* Kontak Siswa */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nomor WhatsApp Siswa (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 0812-xxxx-xxxx"
                  value={editingStudent.phone || ''}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Alamat Tempat Tinggal
                </label>
                <input
                  type="text"
                  value={editingStudent.address}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, address: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Catatan Guru BK
                </label>
                <textarea
                  rows={2}
                  value={editingStudent.notes}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editWatchlistCheck"
                  checked={editingStudent.isWatchlist}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      isWatchlist: e.target.checked,
                    })
                  }
                  className="rounded text-emerald-800 focus:ring-emerald-700"
                />
                <label
                  htmlFor="editWatchlistCheck"
                  className="text-slate-700 cursor-pointer"
                >
                  Tandai sebagai siswa dalam perhatian khusus (Watchlist)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Yakin ingin menghapus siswa "${editingStudent.name}"? Tindakan ini permanen.`
                      )
                    ) {
                      onDeleteStudent(editingStudent.id);
                      setEditingStudent(null);
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Siswa Ini</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
