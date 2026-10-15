import React, { useState, useMemo, useEffect } from 'react';
import {
  HeartHandshake,
  Plus,
  Search,
  Filter,
  Trash2,
  Printer,
  ShieldAlert,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  FileText,
  Leaf,
  Sparkles,
  ShieldCheck,
  CheckSquare,
} from 'lucide-react';
import {
  CounselingRecord,
  Student,
  CounselingServiceType,
  SchoolProfile,
} from '../types';
import { formatDateIndonesian } from '../utils/storage';

const COUNSELING_LEAVES_HERO = '/src/assets/images/counseling_green_leaves_1790588316539.jpg';
const COUNSELING_GROWTH_IMAGE = '/src/assets/images/counseling_growth_nature_1790588331792.jpg';

interface CounselingViewProps {
  counselingRecords: CounselingRecord[];
  students: Student[];
  profile: SchoolProfile;
  onAddCounseling: (record: Omit<CounselingRecord, 'id'>) => void;
  onDeleteCounseling: (id: string) => void;
  onDeleteMultipleCounseling?: (ids: string[]) => void;
  onPrintCounseling: (record: CounselingRecord) => void;
  initialStudentId?: string;
  autoOpenCreate?: boolean;
  onClearInitialState?: () => void;
}

export const CounselingView: React.FC<CounselingViewProps> = ({
  counselingRecords,
  students,
  profile,
  onAddCounseling,
  onDeleteCounseling,
  onDeleteMultipleCounseling,
  onPrintCounseling,
  initialStudentId,
  autoOpenCreate,
  onClearInitialState,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
  const [evaluationFilter, setEvaluationFilter] = useState<string>('all');

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    sessionNumber: 1,
    date: new Date().toISOString().slice(0, 10),
    time: '09:00 - 09:45 WIB',
    serviceType: 'Konseling Individual' as CounselingServiceType,
    problemSummary: '',
    dynamicsAndEtiology: '',
    techniqueUsed: 'Pendekatan Realitas (WDEP) & Kontrak Perilaku',
    studentCommitment: '',
    followUpPlan: 'Pemantauan perkembangan perilaku selama 1 minggu ke depan.',
    evaluation: 'Mulai Terarah' as CounselingRecord['evaluation'],
    nextSessionDate: '',
    confidentialityNote: 'Sangat Rahasia. Tersimpan di arsip khusus BK.',
    counselorName: profile.leadCounselorName,
  });

  // Handle direct quick action jump
  useEffect(() => {
    if (autoOpenCreate && initialStudentId) {
      setFormData((prev) => ({
        ...prev,
        studentId: initialStudentId,
      }));
      setShowAddModal(true);
      onClearInitialState?.();
    }
  }, [autoOpenCreate, initialStudentId, onClearInitialState]);

  const filteredRecords = useMemo(() => {
    return counselingRecords.filter((rec) => {
      const student = students.find((s) => s.id === rec.studentId);
      const studentName = (student?.name || '').toLowerCase();
      const summaryLower = rec.problemSummary.toLowerCase();
      const techLower = rec.techniqueUsed.toLowerCase();
      const searchLower = searchQuery.toLowerCase();

      const matchSearch =
        studentName.includes(searchLower) ||
        summaryLower.includes(searchLower) ||
        techLower.includes(searchLower);

      const matchService = serviceTypeFilter === 'all' || rec.serviceType === serviceTypeFilter;
      const matchEval = evaluationFilter === 'all' || rec.evaluation === evaluationFilter;

      return matchSearch && matchService && matchEval;
    });
  }, [counselingRecords, students, searchQuery, serviceTypeFilter, evaluationFilter]);

  // Multi-select & Batch Delete States
  const [selectedCounselingIds, setSelectedCounselingIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'single' | 'multiple';
    record?: CounselingRecord;
    count?: number;
    ids?: string[];
  } | null>(null);

  const isAllFilteredSelected =
    filteredRecords.length > 0 &&
    filteredRecords.every((r) => selectedCounselingIds.includes(r.id));

  const handleToggleSelect = (id: string) => {
    setSelectedCounselingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      const filteredIdSet = new Set(filteredRecords.map((r) => r.id));
      setSelectedCounselingIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      const merged = Array.from(
        new Set([...selectedCounselingIds, ...filteredRecords.map((r) => r.id)])
      );
      setSelectedCounselingIds(merged);
    }
  };

  const handleClearSelection = () => {
    setSelectedCounselingIds([]);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'single' && deleteTarget.record) {
      const targetId = deleteTarget.record.id;
      onDeleteCounseling(targetId);
      setSelectedCounselingIds((prev) => prev.filter((id) => id !== targetId));
    } else if (deleteTarget.type === 'multiple' && deleteTarget.ids) {
      if (onDeleteMultipleCounseling) {
        onDeleteMultipleCounseling(deleteTarget.ids);
      } else {
        deleteTarget.ids.forEach((id) => onDeleteCounseling(id));
      }
      setSelectedCounselingIds([]);
    }

    setDeleteTarget(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) {
      alert('Pilih siswa konseli terlebih dahulu!');
      return;
    }

    onAddCounseling({
      studentId: formData.studentId,
      sessionNumber: Number(formData.sessionNumber) || 1,
      date: formData.date,
      time: formData.time,
      serviceType: formData.serviceType,
      problemSummary: formData.problemSummary,
      dynamicsAndEtiology: formData.dynamicsAndEtiology,
      techniqueUsed: formData.techniqueUsed,
      studentCommitment: formData.studentCommitment,
      followUpPlan: formData.followUpPlan,
      evaluation: formData.evaluation,
      nextSessionDate: formData.nextSessionDate || undefined,
      confidentialityNote: formData.confidentialityNote,
      counselorName: formData.counselorName || profile.leadCounselorName,
    });

    setShowAddModal(false);
    setFormData({
      studentId: '',
      sessionNumber: 1,
      date: new Date().toISOString().slice(0, 10),
      time: '09:00 - 09:45 WIB',
      serviceType: 'Konseling Individual',
      problemSummary: '',
      dynamicsAndEtiology: '',
      techniqueUsed: 'Pendekatan Realitas (WDEP) & Kontrak Perilaku',
      studentCommitment: '',
      followUpPlan: 'Pemantauan perkembangan perilaku selama 1 minggu ke depan.',
      evaluation: 'Mulai Terarah',
      nextSessionDate: '',
      confidentialityNote: 'Sangat Rahasia. Tersimpan di arsip khusus BK.',
      counselorName: profile.leadCounselorName,
    });
  };

  return (
    <div className="space-y-6">
      {/* Botanical Green Hero Sanctuary Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-md border border-emerald-800/40 bg-slate-950 text-white">
        {/* Background Image with botanical green atmosphere */}
        <div className="absolute inset-0">
          <img
            src={COUNSELING_LEAVES_HERO}
            alt="Suasana Ruang Konseling Teduh dengan Dedaunan Hijau"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-35 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-slate-950/90 to-emerald-950/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Pill & Leaf Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <Leaf className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Ruang Konseling & Tumbuh Kembang Siswa</span>
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-emerald-200/90">Nuansa Hijau, Asri & Menenangkan</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-snug">
              Layanan Konseling & Pemulihan Diri{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
                Ramah Anak
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Pendampingan psikologis dengan empati mendalam, penerimaan tanpa syarat, dan teknik berbasis solusi dalam suasana yang hangat, teduh, dan bebas intimidasi.
            </p>

            {/* Micro Stats & Principles */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/40 border border-emerald-700/40 text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Asas Kerahasiaan ABKIN</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/50 text-slate-300 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span><strong>{counselingRecords.length}</strong> Sesi Terarsip</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/50 text-slate-300 font-mono">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  <strong>{counselingRecords.filter(c => c.evaluation === 'Sangat Berkembang').length}</strong> Berkembang Sangat Baik
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Button & Aesthetic Card */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 transition-all cursor-pointer transform active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Jurnal Konseling Baru</span>
            </button>

            <div className="text-right text-[11px] text-slate-400 hidden sm:block">
              Konselor: <strong className="text-emerald-300">{profile.leadCounselorName}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama konseli, teknik, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <select
            value={serviceTypeFilter}
            onChange={(e) => setServiceTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="all">Semua Jenis Layanan</option>
            <option value="Konseling Individual">Konseling Individual</option>
            <option value="Konseling Kelompok">Konseling Kelompok</option>
            <option value="Konsultasi Guru/Ortu">Konsultasi Guru/Ortu</option>
            <option value="Konferensi Kasus">Konferensi Kasus</option>
            <option value="Mediasi Teman Sebaya">Mediasi Teman Sebaya</option>
            <option value="Kunjungan Rumah (Home Visit)">Kunjungan Rumah (Home Visit)</option>
          </select>

          <select
            value={evaluationFilter}
            onChange={(e) => setEvaluationFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="all">Semua Evaluasi</option>
            <option value="Sangat Berkembang">Sangat Berkembang</option>
            <option value="Mulai Terarah">Mulai Terarah</option>
            <option value="Perlu Pendampingan Lanjutan">Perlu Pendampingan Lanjutan</option>
            <option value="Butuh Penanganan Khusus">Butuh Penanganan Khusus</option>
          </select>

          <button
            type="button"
            onClick={handleToggleSelectAllFiltered}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer select-none ${
              isAllFilteredSelected
                ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold'
                : selectedCounselingIds.length > 0
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
            title="Pilih atau batalkan pilihan semua sesi konseling"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-800" />
            <span>
              {isAllFilteredSelected
                ? 'Batal Pilih Semua'
                : selectedCounselingIds.length > 0
                ? `${selectedCounselingIds.length} Sesi Terpilih`
                : 'Pilih Semua Sesi'}
            </span>
          </button>
        </div>

        <div className="text-slate-500 text-xs font-mono tabular-nums">
          Ditemukan: <strong>{filteredRecords.length}</strong> sesi
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Banner */}
      {selectedCounselingIds.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-3.5 px-5 rounded-xl shadow-lg border border-emerald-800/40 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 shrink-0">
              <CheckSquare className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-bold flex items-center gap-2">
                <span className="text-sm text-white font-extrabold">{selectedCounselingIds.length} Sesi Konseling Terpilih</span>
                <span className="text-[11px] font-medium text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-700/60">
                  {selectedCounselingIds.length === counselingRecords.length
                    ? 'Seluruh arsip konseling'
                    : `${selectedCounselingIds.length} dari ${counselingRecords.length} sesi`}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Pilih sesi konseling untuk dihapus dari rekam jejak bimbingan siswa sekaligus.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!isAllFilteredSelected && (
              <button
                type="button"
                onClick={handleToggleSelectAllFiltered}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 rounded-lg transition-colors cursor-pointer border border-emerald-600/50"
              >
                Pilih Semua {filteredRecords.length} Hasil Filter
              </button>
            )}

            <button
              type="button"
              onClick={handleClearSelection}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-600"
            >
              Batal Pilih
            </button>

            <button
              type="button"
              onClick={() => {
                setDeleteTarget({
                  type: 'multiple',
                  count: selectedCounselingIds.length,
                  ids: selectedCounselingIds,
                });
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus {selectedCounselingIds.length} Sesi Sekaligus</span>
            </button>
          </div>
        </div>
      )}

      {/* Counseling Cards List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
            Belum ada data jurnal konseling yang sesuai dengan kriteria filter.
          </div>
        ) : (
          filteredRecords.map((record) => {
            const student = students.find((s) => s.id === record.studentId);
            const isSelected = selectedCounselingIds.includes(record.id);
            return (
              <div
                key={record.id}
                className={`bg-white border rounded-xl p-5 shadow-xs transition-all space-y-3 ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(record.id)}
                        className="rounded text-emerald-800 focus:ring-emerald-700 w-4 h-4 cursor-pointer mr-0.5"
                        title="Pilih sesi ini"
                      />
                      <span className="text-xs font-bold text-slate-900">
                        {record.serviceType} (Sesi Ke-{record.sessionNumber})
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-bold text-emerald-900">
                        Konseli: {student?.name || 'Siswa'} (Kelas {student?.className || '-'})
                      </span>
                      {student?.homeroomTeacher && (
                        <>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-600">
                            Wali: {student.homeroomTeacher}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 pl-6">
                      <span>{formatDateIndonesian(record.date)}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">{record.time}</span>
                      <span>·</span>
                      <span>Konselor: {record.counselorName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Leaf className="w-3 h-3 text-emerald-600" />
                      Evaluasi: {record.evaluation}
                    </span>
                    <button
                      onClick={() => onPrintCounseling(record)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Cetak Berkas
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: 'single', record })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-1">
                      Ringkasan Keluhan / Masalah:
                    </span>
                    <p className="text-slate-700 leading-relaxed text-justify">
                      {record.problemSummary}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-1">
                      Dinamika Psikologis & Etiologi Masalah:
                    </span>
                    <p className="text-slate-700 leading-relaxed text-justify">
                      {record.dynamicsAndEtiology}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                  <span className="font-bold text-slate-900 block mb-0.5">
                    Pendekatan & Teknik Konseling yang Diterapkan:
                  </span>
                  <p className="text-slate-700">{record.techniqueUsed}</p>
                </div>

                {/* Student Commitment & RTL with Growth Leaf Motif */}
                <div className="bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-slate-50 border border-emerald-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-emerald-300 shadow-2xs hidden sm:block">
                    <img
                      src={COUNSELING_GROWTH_IMAGE}
                      alt="Simbol Pertumbuhan Siswa"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-emerald-900/10"></div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="font-bold text-emerald-950 text-xs">
                        Komitmen & Kontrak Perilaku Siswa (Tunas Perubahan):
                      </span>
                    </div>
                    <p className="text-slate-800 text-xs italic leading-relaxed">
                      "{record.studentCommitment || 'Siswa berkomitmen melakukan perubahan perilaku ke arah positif.'}"
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs text-slate-500">
                  <span>Rencana Tindak Lanjut (RTL): <strong>{record.followUpPlan}</strong></span>
                  {record.nextSessionDate && (
                    <span className="font-mono tabular-nums text-emerald-800 font-semibold">
                      Jadwal Sesi Selanjutnya: {formatDateIndonesian(record.nextSessionDate)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Tambah Jurnal Konseling */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
            <div className="relative px-6 py-5 border-b border-emerald-900/30 overflow-hidden bg-slate-950 text-white shrink-0">
              <img
                src={COUNSELING_LEAVES_HERO}
                alt="Nuansa Konseling Hijau Asri"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-slate-950/90 to-emerald-950/80" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
                    <Leaf className="w-3.5 h-3.5" />
                    <span>Ruang Konseling & Bimbingan BK</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Formulir Jurnal Layanan Konseling Resmi
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Dokumentasikan dinamika psikologis, teknik konseling, dan kesepakatan perubahan perilaku.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Pilih Siswa (Konseli) *
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} - Kelas {st.className}{st.homeroomTeacher ? ` (Wali: ${st.homeroomTeacher})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Jenis Layanan Bimbingan *
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as CounselingServiceType })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white font-medium"
                  >
                    <option value="Konseling Individual">Konseling Individual</option>
                    <option value="Konseling Kelompok">Konseling Kelompok</option>
                    <option value="Konsultasi Guru/Ortu">Konsultasi Guru/Ortu</option>
                    <option value="Konferensi Kasus">Konferensi Kasus</option>
                    <option value="Mediasi Teman Sebaya">Mediasi Teman Sebaya</option>
                    <option value="Kunjungan Rumah (Home Visit)">Kunjungan Rumah (Home Visit)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tanggal Pelaksanaan *
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
                    Waktu / Jam
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="09:00 - 09:45 WIB"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Sesi Ke-
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.sessionNumber}
                    onChange={(e) => setFormData({ ...formData, sessionNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Gambaran Masalah yang Disampaikan Konseli *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Keluhan, perasaan yang dirasakan, kesulitan yang dihadapi..."
                  value={formData.problemSummary}
                  onChange={(e) => setFormData({ ...formData, problemSummary: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                ></textarea>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Analisis Dinamika Psikologis & Faktor Penyebab *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Eksplorasi akar masalah: pola asuh keluarga, teman sebaya, konsep diri, ketakutan/trauma..."
                  value={formData.dynamicsAndEtiology}
                  onChange={(e) => setFormData({ ...formData, dynamicsAndEtiology: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Teknik / Pendekatan Konseling
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: CBT, WDEP Realitas, Empty Chair, Behavioral..."
                    value={formData.techniqueUsed}
                    onChange={(e) => setFormData({ ...formData, techniqueUsed: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Evaluasi Hasil Sesi
                  </label>
                  <select
                    value={formData.evaluation}
                    onChange={(e) => setFormData({ ...formData, evaluation: e.target.value as CounselingRecord['evaluation'] })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white font-medium"
                  >
                    <option value="Sangat Berkembang">Sangat Berkembang (Tuntas)</option>
                    <option value="Mulai Terarah">Mulai Terarah (Positif)</option>
                    <option value="Perlu Pendampingan Lanjutan">Perlu Pendampingan Lanjutan</option>
                    <option value="Butuh Penanganan Khusus">Butuh Penanganan Khusus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Komitmen & Kesepakatan Siswa (Behavioral Contract) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Kalimat pernyataan komitmen yang disepakati oleh siswa..."
                  value={formData.studentCommitment}
                  onChange={(e) => setFormData({ ...formData, studentCommitment: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Rencana Tindak Lanjut (RTL)
                  </label>
                  <input
                    type="text"
                    value={formData.followUpPlan}
                    onChange={(e) => setFormData({ ...formData, followUpPlan: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Jadwal Sesi Selanjutnya (Opsional)
                  </label>
                  <input
                    type="date"
                    value={formData.nextSessionDate}
                    onChange={(e) => setFormData({ ...formData, nextSessionDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

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
                  Simpan Jurnal Konseling
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Sesi Konseling (Single atau Bulk) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-slate-900 text-center">
                {deleteTarget.type === 'single'
                  ? `Hapus Jurnal Konseling ${deleteTarget.record?.serviceType}?`
                  : `Hapus ${deleteTarget.ids?.length || 0} Sesi Konseling Sekaligus?`}
              </h3>

              <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
                {deleteTarget.type === 'single' ? (
                  <>
                    Arsip catatan konseling ini akan dihapus permanen dari buku jurnal BK.
                  </>
                ) : (
                  <>
                    Anda akan menghapus sebanyak <strong className="text-rose-600 font-bold">{deleteTarget.ids?.length} berkas konseling</strong> sekaligus. Data yang dihapus tidak dapat dipulihkan.
                  </>
                )}
              </p>

              {deleteTarget.type === 'multiple' && deleteTarget.ids && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto text-xs space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Sesi yang akan dihapus:</span>
                    <span className="font-mono text-rose-600 font-bold">{deleteTarget.ids.length} sesi</span>
                  </div>
                  {counselingRecords
                    .filter((r) => deleteTarget.ids?.includes(r.id))
                    .map((rec, i) => {
                      const st = students.find((s) => s.id === rec.studentId);
                      return (
                        <div
                          key={rec.id}
                          className="flex items-center justify-between text-slate-700 py-1 px-1.5 rounded hover:bg-slate-100 border-b border-slate-100 last:border-b-0"
                        >
                          <span className="font-medium truncate max-w-[200px]">
                            {i + 1}. {st?.name || 'Siswa'} ({rec.serviceType})
                          </span>
                          <span className="text-slate-500 text-[11px] font-mono shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {formatDateIndonesian(rec.date)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>
                    {deleteTarget.type === 'multiple'
                      ? `Ya, Hapus ${deleteTarget.ids?.length} Sesi`
                      : 'Ya, Hapus Sesi Ini'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
