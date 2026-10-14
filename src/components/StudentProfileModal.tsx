import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  FileCheck,
  Clock,
  ShieldAlert,
  Plus,
  Printer,
  HeartHandshake,
  Trash2,
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

interface StudentProfileModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  attendance: AttendanceRecord[];
  problems: ProblemRecord[];
  counselingRecords: CounselingRecord[];
  letters: PermissionLetter[];
  profile: SchoolProfile;
  onToggleWatchlist: (studentId: string) => void;
  onNewProblemForStudent: (student: Student) => void;
  onNewCounselingForStudent: (student: Student) => void;
  onNewLetterForStudent: (student: Student) => void;
  onPrintLetter: (letter: PermissionLetter) => void;
  onPrintCounseling: (record: CounselingRecord) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  isOpen,
  onClose,
  attendance,
  problems,
  counselingRecords,
  letters,
  profile,
  onToggleWatchlist,
  onNewProblemForStudent,
  onNewCounselingForStudent,
  onNewLetterForStudent,
  onPrintLetter,
  onPrintCounseling,
  onDeleteStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'permasalahan' | 'konseling' | 'absensi' | 'perizinan'>('permasalahan');

  if (!isOpen) return null;

  const studentAttendance = attendance.filter((a) => a.studentId === student.id);
  const studentProblems = problems.filter((p) => p.studentId === student.id);
  const studentCounseling = counselingRecords.filter((c) => c.studentId === student.id);
  const studentLetters = letters.filter((l) => l.studentId === student.id);

  // Statistics calculation for this student
  const totalLate = studentAttendance.filter((a) => a.status === 'Terlambat').length;
  const totalAlpa = studentAttendance.filter((a) => a.status === 'Alpa' || a.status === 'Bolos_KBM').length;
  const totalSick = studentAttendance.filter((a) => a.status === 'Sakit').length;
  const totalPermission = studentAttendance.filter((a) => a.status === 'Izin').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              {student.gender === 'L' ? 'LK' : 'PR'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{student.name}</h3>
                {student.isWatchlist && (
                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Perhatian Khusus
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono tabular-nums">
                NISN: {student.nisn} · Kelas {student.className} · Wali: {student.homeroomTeacher}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWatchlist(student.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                student.isWatchlist
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {student.isWatchlist ? 'Hapus dari Pantauan Khusus' : '+ Tandai Pantauan Khusus'}
            </button>
            {onDeleteStudent && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Hapus profil data siswa "${student.name}" (NISN: ${student.nisn})? Tindakan ini untuk koreksi data.`
                    )
                  ) {
                    onDeleteStudent(student.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                title="Hapus Siswa untuk Koreksi Data"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Siswa</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span>Kontak Siswa: <strong>{student.phone}</strong></span>
            <span>Orang Tua: <strong>{student.parentName} ({student.parentPhone})</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onClose();
                onNewProblemForStudent(student);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-rose-700 text-white rounded hover:bg-rose-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Catat Masalah
            </button>

            <button
              onClick={() => {
                onClose();
                onNewCounselingForStudent(student);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-emerald-700 text-white rounded hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Beri Konseling
            </button>

            <button
              onClick={() => {
                onClose();
                onNewLetterForStudent(student);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-indigo-700 text-white rounded hover:bg-indigo-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Buat Surat Izin
            </button>
          </div>
        </div>

        {/* Content Area with Tabs */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Total Masalah Terdata</span>
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                {studentProblems.length}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Sesi Konseling Terlaksana</span>
              <span className="text-xl font-bold font-mono tabular-nums text-emerald-700">
                {studentCounseling.length}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Total Keterlambatan</span>
              <span className="text-xl font-bold font-mono tabular-nums text-amber-700">
                {totalLate}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Alpa / Bolos KBM</span>
              <span className="text-xl font-bold font-mono tabular-nums text-rose-700">
                {totalAlpa}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('permasalahan')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'permasalahan'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Laporan Permasalahan ({studentProblems.length})
            </button>
            <button
              onClick={() => setActiveTab('konseling')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'konseling'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Jurnal Konseling ({studentCounseling.length})
            </button>
            <button
              onClick={() => setActiveTab('perizinan')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'perizinan'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Surat Perizinan ({studentLetters.length})
            </button>
            <button
              onClick={() => setActiveTab('absensi')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'absensi'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Riwayat Presensi ({studentAttendance.length})
            </button>
          </div>

          {/* Tab 1: Permasalahan Per Anak */}
          {activeTab === 'permasalahan' && (
            <div className="space-y-3">
              {studentProblems.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-500">Tidak ada catatan permasalahan tercatat untuk ananda ini.</p>
                </div>
              ) : (
                studentProblems.map((p) => (
                  <div key={p.id} className="p-4 border border-slate-200 rounded-lg space-y-2 bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{formatDateIndonesian(p.incidentDate)}</span>
                          <span>·</span>
                          <span>Bidang: {p.guidanceDomain}</span>
                          <span>·</span>
                          <span>Tingkat: {p.severity}</span>
                          <span>·</span>
                          <span>Pelapor: {p.reportedBy} ({p.reporterName})</span>
                        </div>
                      </div>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        p.status === 'Terselesaikan'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : p.status === 'Proses Bimbingan'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed text-justify bg-slate-50 p-2.5 rounded">
                      {p.chronologicalDescription}
                    </p>

                    {p.actionLog && p.actionLog.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-600 block mb-1">Riwayat Tindakan BK:</span>
                        <ul className="text-xs text-slate-600 space-y-1 pl-3 list-disc">
                          {p.actionLog.map((log) => (
                            <li key={log.id}>
                              <span className="font-mono tabular-nums text-slate-500">{formatDateIndonesian(log.date)}:</span>{' '}
                              {log.action} <span className="text-slate-400">({log.counselor})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Jurnal Konseling */}
          {activeTab === 'konseling' && (
            <div className="space-y-3">
              {studentCounseling.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-500">Belum ada sesi konseling terdata.</p>
                </div>
              ) : (
                studentCounseling.map((c) => (
                  <div key={c.id} className="p-4 border border-slate-200 rounded-lg space-y-3 bg-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {c.serviceType} (Sesi {c.sessionNumber})
                          </h4>
                          <span className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-medium border border-emerald-200">
                            {c.evaluation}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatDateIndonesian(c.date)} ({c.time}) · Konselor: {c.counselorName}
                        </p>
                      </div>

                      <button
                        onClick={() => onPrintCounseling(c)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                        title="Cetak Berita Acara Konseling"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Cetak Laporan
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                        <span className="font-semibold text-slate-800 block mb-0.5">Ringkasan Masalah:</span>
                        <p className="text-slate-600">{c.problemSummary}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                        <span className="font-semibold text-slate-800 block mb-0.5">Teknik & Pendekatan:</span>
                        <p className="text-slate-600">{c.techniqueUsed}</p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-50/50 border border-emerald-200/60 rounded text-xs">
                      <span className="font-semibold text-emerald-950 block mb-0.5">Komitmen Konseli:</span>
                      <p className="text-emerald-900 italic">"{c.studentCommitment}"</p>
                    </div>

                    <div className="text-xs text-slate-600 flex justify-between items-center pt-1 border-t border-slate-100">
                      <span>RTL: {c.followUpPlan}</span>
                      {c.nextSessionDate && (
                        <span className="text-slate-500 font-mono tabular-nums">
                          Sesi Berikutnya: {formatDateIndonesian(c.nextSessionDate)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Surat Perizinan */}
          {activeTab === 'perizinan' && (
            <div className="space-y-3">
              {studentLetters.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-500">Belum ada surat perizinan yang diterbitkan.</p>
                </div>
              ) : (
                studentLetters.map((l) => (
                  <div key={l.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between gap-4 bg-white">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">
                          {l.type.replace(/_/g, ' ')}
                        </h4>
                        <span className="text-[11px] font-mono tabular-nums text-slate-500">
                          {l.letterNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Keperluan: {l.reason} ({l.destinationOrActivity})
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>Tanggal: {formatDateIndonesian(l.date)}</span>
                        {l.departureTime && <span>· Pukul {l.departureTime}</span>}
                        <span>· Status: {l.status}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onPrintLetter(l)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Cetak Surat
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Presensi */}
          {activeTab === 'absensi' && (
            <div className="space-y-3">
              {studentAttendance.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-500">Tidak ada catatan ketidakhadiran/keterlambatan khusus.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Waktu/Jam</th>
                        <th className="py-2.5 px-3">Alasan / Keterangan</th>
                        <th className="py-2.5 px-3">Tindakan / Pelapor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentAttendance.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-mono tabular-nums">{formatDateIndonesian(a.date)}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              a.status === 'Terlambat'
                                ? 'bg-amber-100 text-amber-800'
                                : a.status === 'Alpa' || a.status === 'Bolos_KBM'
                                ? 'bg-rose-100 text-rose-800'
                                : a.status === 'Sakit'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {a.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono tabular-nums">{a.arrivalTime || a.subjectOrPeriod || '-'}</td>
                          <td className="py-2.5 px-3 text-slate-700">{a.reason || '-'}</td>
                          <td className="py-2.5 px-3 text-slate-600">{a.sanctionOrNote || a.reportedBy || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
