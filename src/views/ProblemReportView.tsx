import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Trash2,
  Eye,
  HeartHandshake,
  FileText,
  User,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldAlert,
  CheckSquare,
} from 'lucide-react';
import {
  ProblemRecord,
  Student,
  GuidanceDomain,
  ProblemSeverity,
  ProblemStatus,
} from '../types';
import { formatDateIndonesian } from '../utils/storage';

interface ProblemReportViewProps {
  problems: ProblemRecord[];
  students: Student[];
  onAddProblem: (record: Omit<ProblemRecord, 'id'>) => void;
  onUpdateProblem: (id: string, updated: Partial<ProblemRecord>) => void;
  onDeleteProblem: (id: string) => void;
  onDeleteMultipleProblems?: (ids: string[]) => void;
  onStartCounselingForStudent: (student: Student) => void;
  onIssueParentSummons: (student: Student, problemTitle: string) => void;
}

export const ProblemReportView: React.FC<ProblemReportViewProps> = ({
  problems,
  students,
  onAddProblem,
  onUpdateProblem,
  onDeleteProblem,
  onDeleteMultipleProblems,
  onStartCounselingForStudent,
  onIssueParentSummons,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProblemDetail, setSelectedProblemDetail] = useState<ProblemRecord | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    incidentDate: new Date().toISOString().slice(0, 10),
    reportDate: new Date().toISOString().slice(0, 10),
    reportedBy: 'Wali Kelas' as ProblemRecord['reportedBy'],
    reporterName: '',
    guidanceDomain: 'Pribadi' as GuidanceDomain,
    problemCategory: 'Kedisiplinan & Tata Tertib',
    severity: 'Sedang' as ProblemSeverity,
    chronologicalDescription: '',
    initialEfforts: '',
    status: 'Proses Bimbingan' as ProblemStatus,
  });

  // Action log form input
  const [newActionText, setNewActionText] = useState('');

  const filteredProblems = useMemo(() => {
    return problems.filter((prob) => {
      const student = students.find((s) => s.id === prob.studentId);
      const studentName = (student?.name || '').toLowerCase();
      const titleLower = prob.title.toLowerCase();
      const descLower = prob.chronologicalDescription.toLowerCase();
      const searchLower = searchQuery.toLowerCase();

      const matchSearch =
        studentName.includes(searchLower) ||
        titleLower.includes(searchLower) ||
        descLower.includes(searchLower);

      const matchDomain = domainFilter === 'all' || prob.guidanceDomain === domainFilter;
      const matchSeverity = severityFilter === 'all' || prob.severity === severityFilter;
      const matchStatus = statusFilter === 'all' || prob.status === statusFilter;

      return matchSearch && matchDomain && matchSeverity && matchStatus;
    });
  }, [problems, students, searchQuery, domainFilter, severityFilter, statusFilter]);

  // Multi-select & Batch Delete States
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'single' | 'multiple';
    problem?: ProblemRecord;
    count?: number;
    ids?: string[];
  } | null>(null);

  const isAllFilteredSelected =
    filteredProblems.length > 0 &&
    filteredProblems.every((p) => selectedProblemIds.includes(p.id));

  const handleToggleSelect = (id: string) => {
    setSelectedProblemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      const filteredIdSet = new Set(filteredProblems.map((p) => p.id));
      setSelectedProblemIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      const merged = Array.from(
        new Set([...selectedProblemIds, ...filteredProblems.map((p) => p.id)])
      );
      setSelectedProblemIds(merged);
    }
  };

  const handleClearSelection = () => {
    setSelectedProblemIds([]);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'single' && deleteTarget.problem) {
      const targetId = deleteTarget.problem.id;
      onDeleteProblem(targetId);
      setSelectedProblemIds((prev) => prev.filter((id) => id !== targetId));
      if (selectedProblemDetail?.id === targetId) {
        setSelectedProblemDetail(null);
      }
    } else if (deleteTarget.type === 'multiple' && deleteTarget.ids) {
      if (onDeleteMultipleProblems) {
        onDeleteMultipleProblems(deleteTarget.ids);
      } else {
        deleteTarget.ids.forEach((id) => onDeleteProblem(id));
      }
      setSelectedProblemIds([]);
      if (selectedProblemDetail && deleteTarget.ids.includes(selectedProblemDetail.id)) {
        setSelectedProblemDetail(null);
      }
    }

    setDeleteTarget(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) {
      alert('Pilih siswa yang bersangkutan!');
      return;
    }

    onAddProblem({
      studentId: formData.studentId,
      title: formData.title,
      incidentDate: formData.incidentDate,
      reportDate: formData.reportDate,
      reportedBy: formData.reportedBy,
      reporterName: formData.reporterName || 'Wali Kelas',
      guidanceDomain: formData.guidanceDomain,
      problemCategory: formData.problemCategory,
      severity: formData.severity,
      chronologicalDescription: formData.chronologicalDescription,
      initialEfforts: formData.initialEfforts,
      status: formData.status,
      lastFollowUpDate: new Date().toISOString().slice(0, 10),
      actionLog: [
        {
          id: 'act-' + Date.now(),
          date: new Date().toISOString().slice(0, 10),
          action: 'Penerimaan laporan dan registrasi kasus di sistem BK.',
          counselor: 'Guru BK',
        },
      ],
    });

    setShowAddModal(false);
    setFormData({
      studentId: '',
      title: '',
      incidentDate: new Date().toISOString().slice(0, 10),
      reportDate: new Date().toISOString().slice(0, 10),
      reportedBy: 'Wali Kelas',
      reporterName: '',
      guidanceDomain: 'Pribadi',
      problemCategory: 'Kedisiplinan & Tata Tertib',
      severity: 'Sedang',
      chronologicalDescription: '',
      initialEfforts: '',
      status: 'Proses Bimbingan',
    });
  };

  const handleAddActionLog = (problem: ProblemRecord) => {
    if (!newActionText.trim()) return;

    const newLogItem = {
      id: 'act-' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      action: newActionText.trim(),
      counselor: 'Guru BK',
    };

    const updatedLogs = [...(problem.actionLog || []), newLogItem];
    onUpdateProblem(problem.id, {
      actionLog: updatedLogs,
      lastFollowUpDate: new Date().toISOString().slice(0, 10),
    });

    setSelectedProblemDetail({
      ...problem,
      actionLog: updatedLogs,
      lastFollowUpDate: new Date().toISOString().slice(0, 10),
    });
    setNewActionText('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Laporan Permasalahan Per Anak (Buku Catatan Kasus Siswa)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi komprehensif kasus individual siswa: latar belakang, kronologi kejadian, penanganan awal, dan pemantauan tindak lanjut.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Permasalahan Siswa</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama anak, judul kasus, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-rose-700"
            />
          </div>

          {/* Domain Filter */}
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="all">Semua Bidang Bimbingan</option>
            <option value="Pribadi">Bidang Pribadi</option>
            <option value="Sosial">Bidang Sosial</option>
            <option value="Belajar">Bidang Belajar</option>
            <option value="Karir">Bidang Karir</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="all">Semua Tingkat Kasus</option>
            <option value="Ringan">Tingkat Ringan</option>
            <option value="Sedang">Tingkat Sedang</option>
            <option value="Berat">Tingkat Berat</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Proses Bimbingan">Proses Bimbingan</option>
            <option value="Terselesaikan">Terselesaikan</option>
            <option value="Alih Tangan / Referal">Alih Tangan / Referal</option>
          </select>

          <button
            type="button"
            onClick={handleToggleSelectAllFiltered}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer select-none ${
              isAllFilteredSelected
                ? 'bg-rose-100 border-rose-300 text-rose-900 font-bold'
                : selectedProblemIds.length > 0
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
            title="Pilih atau batalkan pilihan semua kasus"
          >
            <CheckSquare className="w-3.5 h-3.5 text-rose-700" />
            <span>
              {isAllFilteredSelected
                ? 'Batal Pilih Semua'
                : selectedProblemIds.length > 0
                ? `${selectedProblemIds.length} Kasus Terpilih`
                : 'Pilih Semua Kasus'}
            </span>
          </button>
        </div>

        <div className="text-slate-500 text-xs font-mono tabular-nums">
          Ditemukan: <strong>{filteredProblems.length}</strong> kasus
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Banner */}
      {selectedProblemIds.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-3.5 px-5 rounded-xl shadow-lg border border-rose-800/40 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-600/30 border border-rose-500/40 text-rose-300 shrink-0">
              <CheckSquare className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-bold flex items-center gap-2">
                <span className="text-sm text-white font-extrabold">{selectedProblemIds.length} Kasus Terpilih</span>
                <span className="text-[11px] font-medium text-rose-300 bg-rose-900/80 px-2 py-0.5 rounded-full border border-rose-700/60">
                  {selectedProblemIds.length === problems.length
                    ? 'Seluruh arsip kasus'
                    : `${selectedProblemIds.length} dari ${problems.length} kasus`}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Centang/hapus centang kasus untuk memilih data yang ingin dihapus sekaligus.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!isAllFilteredSelected && (
              <button
                type="button"
                onClick={handleToggleSelectAllFiltered}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-900/80 hover:bg-rose-800 text-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-700/50"
              >
                Pilih Semua {filteredProblems.length} Hasil Filter
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
                  count: selectedProblemIds.length,
                  ids: selectedProblemIds,
                });
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus {selectedProblemIds.length} Kasus Sekaligus</span>
            </button>
          </div>
        </div>
      )}

      {/* Problem Cards List */}
      <div className="space-y-3">
        {filteredProblems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
            Tidak ada laporan permasalahan siswa yang sesuai dengan filter pencarian.
          </div>
        ) : (
          filteredProblems.map((prob) => {
            const student = students.find((s) => s.id === prob.studentId);
            const isSelected = selectedProblemIds.includes(prob.id);
            return (
              <div
                key={prob.id}
                className={`bg-white border rounded-xl p-5 shadow-xs transition-all space-y-3 ${
                  isSelected
                    ? 'border-rose-400 ring-2 ring-rose-400/40 bg-rose-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(prob.id)}
                        className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer mr-0.5"
                        title="Pilih kasus ini"
                      />
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        prob.severity === 'Berat'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : prob.severity === 'Sedang'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        Kasus {prob.severity}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {student?.name || 'Siswa'} (Kelas {student?.className || '-'})
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

                    <h3 className="text-sm font-bold text-slate-900 mt-1 pl-6">
                      {prob.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      prob.status === 'Terselesaikan'
                        ? 'bg-emerald-100 text-emerald-800'
                        : prob.status === 'Proses Bimbingan'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {prob.status}
                    </span>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 border-t border-slate-100 pt-2">
                  <span>Tanggal Kejadian: <strong>{formatDateIndonesian(prob.incidentDate)}</strong></span>
                  <span>·</span>
                  <span>Bidang: <strong>{prob.guidanceDomain}</strong></span>
                  <span>·</span>
                  <span>Kategori: <strong>{prob.problemCategory}</strong></span>
                  <span>·</span>
                  <span>Pelapor: <strong>{prob.reportedBy} ({prob.reporterName})</strong></span>
                </div>

                {/* Chronology Text */}
                <p className="text-xs text-slate-700 leading-relaxed text-justify bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {prob.chronologicalDescription}
                </p>

                {/* Footer Controls & Quick Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="text-slate-500 text-[11px]">
                    {prob.actionLog?.length || 0} catatan tindakan BK terarsip · Update terakhir: {formatDateIndonesian(prob.lastFollowUpDate)}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProblemDetail(prob)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail & Tindak Lanjut
                    </button>

                    {student && (
                      <>
                        <button
                          onClick={() => onStartCounselingForStudent(student)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                          title="Buka Jurnal Konseling untuk kasus ini"
                        >
                          <HeartHandshake className="w-3.5 h-3.5 text-emerald-700" />
                          Konseling
                        </button>

                        <button
                          onClick={() => onIssueParentSummons(student, prob.title)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                          title="Terbitkan Surat Panggilan Orang Tua"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-700" />
                          Panggil Ortu
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setDeleteTarget({ type: 'single', problem: prob })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Hapus Kasus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Detail & Tindak Lanjut */}
      {selectedProblemDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <h3 className="text-base font-bold text-slate-900">
                Detail & Catatan Tindak Lanjut Kasus
              </h3>
              <button
                onClick={() => setSelectedProblemDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Judul Permasalahan:</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedProblemDetail.title}
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tingkat Urgensi</span>
                  <span className="font-bold text-slate-800">{selectedProblemDetail.severity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Bidang BK</span>
                  <span className="font-bold text-slate-800">{selectedProblemDetail.guidanceDomain}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tanggal Kejadian</span>
                  <span className="font-mono tabular-nums text-slate-800">{formatDateIndonesian(selectedProblemDetail.incidentDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status Kasus</span>
                  <select
                    value={selectedProblemDetail.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as ProblemStatus;
                      onUpdateProblem(selectedProblemDetail.id, { status: newStatus });
                      setSelectedProblemDetail({ ...selectedProblemDetail, status: newStatus });
                    }}
                    className="font-bold text-slate-900 bg-white border border-slate-300 rounded px-1 py-0.5 text-xs"
                  >
                    <option value="Menunggu">Menunggu</option>
                    <option value="Proses Bimbingan">Proses Bimbingan</option>
                    <option value="Terselesaikan">Terselesaikan</option>
                    <option value="Alih Tangan / Referal">Alih Tangan / Referal</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="text-slate-700 font-bold block mb-1">Kronologi Permasalahan:</span>
                <p className="text-slate-700 leading-relaxed text-justify bg-slate-50 p-3 rounded border border-slate-200">
                  {selectedProblemDetail.chronologicalDescription}
                </p>
              </div>

              {selectedProblemDetail.initialEfforts && (
                <div>
                  <span className="text-slate-700 font-bold block mb-1">Upaya Awal Yang Telah Dilakukan:</span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                    {selectedProblemDetail.initialEfforts}
                  </p>
                </div>
              )}

              {/* Action Log History */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-800 font-bold block mb-2">
                  Riwayat Tindakan Penanganan BK:
                </span>
                <div className="space-y-2 mb-3">
                  {(selectedProblemDetail.actionLog || []).map((log) => (
                    <div key={log.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-mono tabular-nums">{formatDateIndonesian(log.date)}</span>
                        <span className="font-medium text-slate-600">{log.counselor}</span>
                      </div>
                      <p className="text-slate-800">{log.action}</p>
                    </div>
                  ))}
                </div>

                {/* Add new action log */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tulis tindakan penanganan baru (misal: Selesai koordinasi dengan orang tua)..."
                    value={newActionText}
                    onChange={(e) => setNewActionText(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddActionLog(selectedProblemDetail)}
                    className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Tambah Tindakan
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer with Delete / Correction Action */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setDeleteTarget({ type: 'single', problem: selectedProblemDetail })}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                title="Hapus laporan kasus untuk koreksi data"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus / Batalkan Kasus Ini</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs">Ubah Status:</span>
                <select
                  value={selectedProblemDetail.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as ProblemStatus;
                    onUpdateProblem(selectedProblemDetail.id, { status: newStatus });
                    setSelectedProblemDetail((prev) =>
                      prev ? { ...prev, status: newStatus } : null
                    );
                  }}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                >
                  <option value="Menunggu">Menunggu</option>
                  <option value="Proses Bimbingan">Proses Bimbingan</option>
                  <option value="Terselesaikan">Terselesaikan</option>
                  <option value="Alih Tangan / Referal">Alih Tangan / Referal</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSelectedProblemDetail(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Catat Masalah Siswa Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Catat Permasalahan Siswa Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Pilih Siswa Terkait *
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-700 bg-white"
                >
                  <option value="">-- Pilih Siswa Binaan --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} - Kelas {st.className} (Wali: {st.homeroomTeacher})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Judul Pokok Kasus / Permasalahan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Indikasi Merokok di Lingkungan Sekolah / Penurunan Motivasi Belajar"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Bidang Layanan BK *
                  </label>
                  <select
                    value={formData.guidanceDomain}
                    onChange={(e) => setFormData({ ...formData, guidanceDomain: e.target.value as GuidanceDomain })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-700 bg-white"
                  >
                    <option value="Pribadi">Bidang Pribadi</option>
                    <option value="Sosial">Bidang Sosial</option>
                    <option value="Belajar">Bidang Belajar</option>
                    <option value="Karir">Bidang Karir</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tingkat Masalah *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as ProblemSeverity })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-700 bg-white font-medium"
                  >
                    <option value="Ringan">Ringan (Pembinaan biasa)</option>
                    <option value="Sedang">Sedang (Perlu konseling rutin)</option>
                    <option value="Berat">Berat (Panggilan ortu / Konferensi kasus)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Kategori Masalah
                  </label>
                  <select
                    value={formData.problemCategory}
                    onChange={(e) => setFormData({ ...formData, problemCategory: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-700 bg-white"
                  >
                    <option value="Kedisiplinan & Tata Tertib">Kedisiplinan & Tata Tertib</option>
                    <option value="Kedisiplinan & Keterlambatan">Kedisiplinan & Keterlambatan</option>
                    <option value="Bolos / Meninggalkan KBM">Bolos / Meninggalkan KBM</option>
                    <option value="Kesulitan Belajar & Penurunan Nilai">Kesulitan Belajar & Nilai Turun</option>
                    <option value="Perundungan / Bullying / Cyberbullying">Perundungan / Bullying</option>
                    <option value="Konflik Teman Sebaya & Perkelahian">Konflik Teman Sebaya</option>
                    <option value="Kecanduan Gadget / Game Online">Kecanduan Gadget / Game</option>
                    <option value="Masalah Keluarga & Broken Home">Masalah Keluarga / Home</option>
                    <option value="Kecemasan, Stres & Emosi Tidak Stabil">Kecemasan & Stres Emosional</option>
                    <option value="Merokok / Vape / Napza">Merokok / Vape / Napza</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tanggal Kejadian *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Sumber Laporan
                  </label>
                  <select
                    value={formData.reportedBy}
                    onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value as ProblemRecord['reportedBy'] })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-700 bg-white"
                  >
                    <option value="Wali Kelas">Wali Kelas</option>
                    <option value="Guru Mapel">Guru Mata Pelajaran</option>
                    <option value="Guru Piket">Guru Piket</option>
                    <option value="Teman Sebaya">Teman Sebaya</option>
                    <option value="Inisiatif Sendiri">Inisiatif Siswa Sendiri</option>
                    <option value="Orang Tua / Wali">Orang Tua / Wali</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Nama Pelapor
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pak Budi Santoso / Siswa Ybs"
                    value={formData.reporterName}
                    onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Deskripsi Kronologis Permasalahan *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ceritakan runtutan kejadian secara objektif, fakta yang ditemukan, saksi, dan kondisi anak..."
                  value={formData.chronologicalDescription}
                  onChange={(e) => setFormData({ ...formData, chronologicalDescription: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-700"
                ></textarea>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Upaya Awal yang Sudah Dilakukan
                </label>
                <input
                  type="text"
                  placeholder="Misal: Ditegur wali kelas, barang bukti diamankan, ditenangkan di ruang BK..."
                  value={formData.initialEfforts}
                  onChange={(e) => setFormData({ ...formData, initialEfforts: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-700"
                />
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
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Laporan Kasus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Kasus / Permasalahan Siswa (Single atau Bulk) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-slate-900 text-center">
                {deleteTarget.type === 'single'
                  ? `Hapus Laporan Kasus "${deleteTarget.problem?.title}"?`
                  : `Hapus ${deleteTarget.ids?.length || 0} Laporan Kasus Sekaligus?`}
              </h3>

              <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
                {deleteTarget.type === 'single' ? (
                  <>
                    Laporan permasalahan siswa ini akan dihapus permanen dari arsip buku catatan BK.
                  </>
                ) : (
                  <>
                    Anda akan menghapus sebanyak <strong className="text-rose-600 font-bold">{deleteTarget.ids?.length} laporan kasus</strong> sekaligus. Data yang dihapus tidak dapat dipulihkan.
                  </>
                )}
              </p>

              {deleteTarget.type === 'multiple' && deleteTarget.ids && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto text-xs space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Kasus yang akan dihapus:</span>
                    <span className="font-mono text-rose-600 font-bold">{deleteTarget.ids.length} kasus</span>
                  </div>
                  {problems
                    .filter((p) => deleteTarget.ids?.includes(p.id))
                    .map((prob, i) => {
                      const st = students.find((s) => s.id === prob.studentId);
                      return (
                        <div
                          key={prob.id}
                          className="flex items-center justify-between text-slate-700 py-1 px-1.5 rounded hover:bg-slate-100 border-b border-slate-100 last:border-b-0"
                        >
                          <span className="font-medium truncate max-w-[200px]">
                            {i + 1}. {prob.title}
                          </span>
                          <span className="text-slate-500 text-[11px] font-mono shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {st?.name || 'Siswa'}
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
                      ? `Ya, Hapus ${deleteTarget.ids?.length} Kasus`
                      : 'Ya, Hapus Kasus Ini'}
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
