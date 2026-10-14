/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Student,
  AttendanceRecord,
  ProblemRecord,
  CounselingRecord,
  PermissionLetter,
  SchoolProfile,
  Alumni,
} from './types';
import {
  getStoredStudents,
  saveStudents,
  getStoredAttendance,
  saveAttendance,
  getStoredProblems,
  saveProblems,
  getStoredCounseling,
  saveCounseling,
  getStoredLetters,
  saveLetters,
  getStoredProfile,
  saveProfile,
  getStoredAlumni,
  saveAlumni,
  resetAllData,
  generateLetterNumber,
} from './utils/storage';
import { Header, NavTab } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { AttendanceView } from './views/AttendanceView';
import { ProblemReportView } from './views/ProblemReportView';
import { CounselingView } from './views/CounselingView';
import { PermissionLetterView } from './views/PermissionLetterView';
import { StudentDirectoryView } from './views/StudentDirectoryView';
import { AlumniView } from './views/AlumniView';
import { ReportsView } from './views/ReportsView';
import { PrintLetterModal } from './components/PrintLetterModal';
import { PrintCounselingModal } from './components/PrintCounselingModal';
import { SchoolProfileModal } from './components/SchoolProfileModal';
import { StudentProfileModal } from './components/StudentProfileModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Main Domain State
  const [profile, setProfile] = useState<SchoolProfile>(getStoredProfile);
  const [students, setStudents] = useState<Student[]>(getStoredStudents);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(getStoredAttendance);
  const [problems, setProblems] = useState<ProblemRecord[]>(getStoredProblems);
  const [counseling, setCounseling] = useState<CounselingRecord[]>(getStoredCounseling);
  const [letters, setLetters] = useState<PermissionLetter[]>(getStoredLetters);
  const [alumni, setAlumni] = useState<Alumni[]>(getStoredAlumni);

  // Modal states
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [selectedLetterForPrint, setSelectedLetterForPrint] = useState<PermissionLetter | null>(null);
  const [selectedCounselingForPrint, setSelectedCounselingForPrint] = useState<CounselingRecord | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Quick Action state for 1-click jump from StudentDirectoryView
  const [quickActionState, setQuickActionState] = useState<{
    targetTab: 'counseling' | 'letters' | 'attendance' | null;
    studentId: string | null;
  }>({ targetTab: null, studentId: null });

  const handleQuickCounseling = (student: Student) => {
    setSelectedStudentForProfile(null);
    setQuickActionState({ targetTab: 'counseling', studentId: student.id });
    setCurrentTab('counseling');
  };

  const handleQuickLetter = (student: Student) => {
    setSelectedStudentForProfile(null);
    setQuickActionState({ targetTab: 'letters', studentId: student.id });
    setCurrentTab('letters');
  };

  const handleQuickAttendance = (student: Student) => {
    setSelectedStudentForProfile(null);
    setQuickActionState({ targetTab: 'attendance', studentId: student.id });
    setCurrentTab('attendance');
  };

  const handleClearQuickAction = () => {
    setQuickActionState({ targetTab: null, studentId: null });
  };

  // Sync to localStorage
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    saveAttendance(attendance);
  }, [attendance]);

  useEffect(() => {
    saveProblems(problems);
  }, [problems]);

  useEffect(() => {
    saveCounseling(counseling);
  }, [counseling]);

  useEffect(() => {
    saveLetters(letters);
  }, [letters]);

  useEffect(() => {
    saveAlumni(alumni);
  }, [alumni]);

  // Handlers for Students
  const handleAddStudent = (newStudent: Omit<Student, 'id'>) => {
    const student: Student = {
      ...newStudent,
      id: 'std-' + Date.now(),
    };
    setStudents((prev) => [student, ...prev]);
  };

  const handleUpdateStudent = (id: string, updated: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleWatchlist = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isWatchlist: !s.isWatchlist } : s))
    );
  };

  // Handlers for Attendance
  const handleAddAttendance = (newRecord: Omit<AttendanceRecord, 'id'>) => {
    const record: AttendanceRecord = {
      ...newRecord,
      id: 'att-' + Date.now(),
    };
    setAttendance((prev) => [record, ...prev]);
  };

  const handleUpdateAttendance = (id: string, updated: Partial<AttendanceRecord>) => {
    setAttendance((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
  };

  const handleDeleteAttendance = (id: string) => {
    setAttendance((prev) => prev.filter((a) => a.id !== id));
  };

  // Handlers for Problems
  const handleAddProblem = (newProb: Omit<ProblemRecord, 'id'>) => {
    const prob: ProblemRecord = {
      ...newProb,
      id: 'prob-' + Date.now(),
    };
    setProblems((prev) => [prob, ...prev]);
  };

  const handleUpdateProblem = (id: string, updated: Partial<ProblemRecord>) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const handleDeleteProblem = (id: string) => {
    setProblems((prev) => prev.filter((p) => p.id !== id));
  };

  // Handlers for Counseling
  const handleAddCounseling = (newRec: Omit<CounselingRecord, 'id'>) => {
    const rec: CounselingRecord = {
      ...newRec,
      id: 'csl-' + Date.now(),
    };
    setCounseling((prev) => [rec, ...prev]);
  };

  const handleDeleteCounseling = (id: string) => {
    setCounseling((prev) => prev.filter((c) => c.id !== id));
  };

  // Handlers for Letters
  const handleAddLetter = (newLetter: Omit<PermissionLetter, 'id'>) => {
    const letter: PermissionLetter = {
      ...newLetter,
      id: 'let-' + Date.now(),
    };
    setLetters((prev) => [letter, ...prev]);
  };

  const handleDeleteLetter = (id: string) => {
    setLetters((prev) => prev.filter((l) => l.id !== id));
  };

  const handleUpdateLetter = (id: string, updated: Partial<PermissionLetter>) => {
    setLetters((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updated } : l))
    );
    setSelectedLetterForPrint((prev) =>
      prev && prev.id === id ? { ...prev, ...updated } : prev
    );
  };

  // Cross-Navigation & Quick Action Handlers
  const handleStartCounselingForStudent = (student: Student) => {
    setSelectedStudentForProfile(null);
    setCurrentTab('counseling');
    // Counseling view will let user create or view
  };

  const handleIssueLetterForStudent = (student: Student) => {
    setSelectedStudentForProfile(null);
    setCurrentTab('letters');
  };

  const handleIssueParentSummons = (student: Student, problemTitle: string) => {
    const todayDateStr = new Date().toISOString().slice(0, 10);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);
    const appointmentDateStr = nextDate.toISOString().slice(0, 10);
    const letterNumber = generateLetterNumber('BK-SPO', letters, todayDateStr);

    const letter: PermissionLetter = {
      id: 'let-' + Date.now(),
      letterNumber,
      type: 'BK-SPO',
      studentId: student.id,
      date: todayDateStr,
      parentAppointmentDate: appointmentDateStr,
      parentAppointmentTime: '09:00 WIB',
      parentAppointmentRoom: profile.counselingRoomName,
      reason: `Koordinasi pembinaan peserta didik terkait permasalahan: ${problemTitle}`,
      destinationOrActivity: 'Ruang Layanan Bimbingan & Konseling (BK)',
      status: 'Disetujui',
      counselorSignatureName: 'Muhammad Burhanudin Muzaqi, M.Psi.',
      counselorNIP: '-',
      wakaKesiswaanName: 'Ilmi Muhadiatil Izza S.Pd',
      homeroomTeacher: student.homeroomTeacher,
      headmasterName: profile.principalName,
      headmasterNIP: profile.principalNIP,
    };

    setLetters((prev) => [letter, ...prev]);
    setSelectedLetterForPrint(letter);
  };

  // Handlers for Alumni
  const handleAddAlumni = (newAlumni: Omit<Alumni, 'id'>) => {
    const item: Alumni = {
      ...newAlumni,
      id: 'alm-' + Date.now(),
    };
    setAlumni((prev) => [item, ...prev]);
  };

  const handleUpdateAlumni = (id: string, updated: Partial<Alumni>) => {
    setAlumni((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
  };

  const handleDeleteAlumni = (id: string) => {
    setAlumni((prev) => prev.filter((a) => a.id !== id));
  };

  const handleResetData = () => {
    resetAllData();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewLetter={() => setCurrentTab('letters')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        profile={profile}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            students={students}
            attendance={attendance}
            problems={problems}
            counseling={counseling}
            letters={letters}
            alumni={alumni}
            profile={profile}
            onNavigate={setCurrentTab}
            onSelectStudent={(st) => setSelectedStudentForProfile(st)}
            onNewProblem={() => setCurrentTab('problems')}
            onNewAttendance={() => setCurrentTab('attendance')}
            onNewCounseling={() => setCurrentTab('counseling')}
            onNewLetter={() => setCurrentTab('letters')}
          />
        )}

        {currentTab === 'attendance' && (
          <AttendanceView
            attendance={attendance}
            students={students}
            profile={profile}
            onAddAttendance={handleAddAttendance}
            onUpdateAttendance={handleUpdateAttendance}
            onDeleteAttendance={handleDeleteAttendance}
            onStartCounselingForStudent={handleStartCounselingForStudent}
            onIssueLetterForStudent={handleIssueLetterForStudent}
            initialStudentId={
              quickActionState.targetTab === 'attendance'
                ? quickActionState.studentId || undefined
                : undefined
            }
            autoOpenCreate={
              quickActionState.targetTab === 'attendance' && !!quickActionState.studentId
            }
            onClearInitialState={handleClearQuickAction}
          />
        )}

        {currentTab === 'problems' && (
          <ProblemReportView
            problems={problems}
            students={students}
            onAddProblem={handleAddProblem}
            onUpdateProblem={handleUpdateProblem}
            onDeleteProblem={handleDeleteProblem}
            onStartCounselingForStudent={handleStartCounselingForStudent}
            onIssueParentSummons={handleIssueParentSummons}
          />
        )}

        {currentTab === 'counseling' && (
          <CounselingView
            counselingRecords={counseling}
            students={students}
            profile={profile}
            onAddCounseling={handleAddCounseling}
            onDeleteCounseling={handleDeleteCounseling}
            onPrintCounseling={(rec) => setSelectedCounselingForPrint(rec)}
            initialStudentId={
              quickActionState.targetTab === 'counseling'
                ? quickActionState.studentId || undefined
                : undefined
            }
            autoOpenCreate={
              quickActionState.targetTab === 'counseling' && !!quickActionState.studentId
            }
            onClearInitialState={handleClearQuickAction}
          />
        )}

        {currentTab === 'letters' && (
          <PermissionLetterView
            letters={letters}
            students={students}
            profile={profile}
            onAddLetter={handleAddLetter}
            onUpdateLetter={handleUpdateLetter}
            onDeleteLetter={handleDeleteLetter}
            onPrintLetter={(letItem) => setSelectedLetterForPrint(letItem)}
            initialStudentId={
              quickActionState.targetTab === 'letters'
                ? quickActionState.studentId || undefined
                : undefined
            }
            autoOpenCreate={
              quickActionState.targetTab === 'letters' && !!quickActionState.studentId
            }
            onClearInitialState={handleClearQuickAction}
          />
        )}

        {currentTab === 'students' && (
          <StudentDirectoryView
            students={students}
            onSelectStudent={(st) => setSelectedStudentForProfile(st)}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onToggleWatchlist={handleToggleWatchlist}
            onQuickCounseling={handleQuickCounseling}
            onQuickLetter={handleQuickLetter}
            onQuickAttendance={handleQuickAttendance}
          />
        )}

        {currentTab === 'alumni' && (
          <AlumniView
            alumniList={alumni}
            profile={profile}
            onAddAlumni={handleAddAlumni}
            onUpdateAlumni={handleUpdateAlumni}
            onDeleteAlumni={handleDeleteAlumni}
            onUpdateProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            students={students}
            problems={problems}
            counseling={counseling}
            attendance={attendance}
            letters={letters}
            profile={profile}
            onSelectStudent={(st) => setSelectedStudentForProfile(st)}
            onUpdateProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
      </main>

      {/* Global Modals */}

      {/* 1. Student 360 Profile Modal */}
      {selectedStudentForProfile && (
        <StudentProfileModal
          student={selectedStudentForProfile}
          isOpen={true}
          onClose={() => setSelectedStudentForProfile(null)}
          attendance={attendance}
          problems={problems}
          counselingRecords={counseling}
          letters={letters}
          profile={profile}
          onToggleWatchlist={handleToggleWatchlist}
          onNewProblemForStudent={() => setCurrentTab('problems')}
          onNewCounselingForStudent={() => setCurrentTab('counseling')}
          onNewLetterForStudent={() => setCurrentTab('letters')}
          onPrintLetter={(l) => setSelectedLetterForPrint(l)}
          onPrintCounseling={(c) => setSelectedCounselingForPrint(c)}
          onDeleteStudent={handleDeleteStudent}
        />
      )}

      {/* 2. Official Letter Print Modal */}
      {selectedLetterForPrint && (
        <PrintLetterModal
          letter={selectedLetterForPrint}
          student={students.find((s) => s.id === selectedLetterForPrint.studentId)}
          students={students}
          profile={profile}
          isOpen={true}
          onClose={() => setSelectedLetterForPrint(null)}
          onUpdateProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onUpdateLetterNumber={(id: string, num: string) =>
            handleUpdateLetter(id, { letterNumber: num, isManualLetterNumber: true })
          }
        />
      )}

      {/* 3. Official Counseling Report Print Modal */}
      {selectedCounselingForPrint && (
        <PrintCounselingModal
          record={selectedCounselingForPrint}
          student={students.find((s) => s.id === selectedCounselingForPrint.studentId)}
          profile={profile}
          isOpen={true}
          onClose={() => setSelectedCounselingForPrint(null)}
          onUpdateProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* 4. School Profile & Backup Settings Modal */}
      <SchoolProfileModal
        profile={profile}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(updated) => setProfile(updated)}
        onResetData={handleResetData}
      />

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-800">SIM BK Pro</span> · Sistem Informasi Bimbingan dan Konseling {profile.schoolName}
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Koordinator BK: {profile.leadCounselorName}</span>
            <span>·</span>
            <span>Tahun Ajaran {profile.academicYear}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
