import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  AlertTriangle,
  HeartHandshake,
  FileText,
  Users,
  Settings,
  Plus,
  FileSpreadsheet,
  GraduationCap,
} from 'lucide-react';
import { SchoolProfile } from '../types';

export type NavTab =
  | 'dashboard'
  | 'attendance'
  | 'problems'
  | 'counseling'
  | 'letters'
  | 'students'
  | 'alumni'
  | 'reports';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewLetter: () => void;
  onOpenSettings: () => void;
  profile: SchoolProfile;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewLetter,
  onOpenSettings,
  profile,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Nav Links) - Zone 3 (Actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-xs shrink-0">
            BK
          </div>
          <button
            onClick={() => onSelectTab('dashboard')}
            className="text-left cursor-pointer group"
          >
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors">
              SIM BK Pro
            </span>
            <span className="block text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
              {profile.schoolName}
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'dashboard'
                ? 'bg-slate-100 text-emerald-900 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>

          <button
            onClick={() => onSelectTab('attendance')}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'attendance'
                ? 'bg-slate-100 text-emerald-900 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CalendarCheck2 className="w-3.5 h-3.5" />
            Absensi Siswa
          </button>

          <button
            onClick={() => onSelectTab('problems')}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'problems'
                ? 'bg-slate-100 text-emerald-900 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Laporan Masalah
          </button>

          <button
            onClick={() => onSelectTab('counseling')}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'counseling'
                ? 'bg-slate-100 text-emerald-900 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            Jurnal Konseling
          </button>

          <button
            onClick={() => onSelectTab('letters')}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'letters'
                ? 'bg-slate-100 text-emerald-900 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Surat Perizinan
          </button>

          <button
            onClick={() => onSelectTab('students')}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'students'
                ? 'bg-slate-100 text-emerald-900 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Direktori Siswa
          </button>

          <button
            onClick={() => onSelectTab('alumni')}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'alumni'
                ? 'bg-slate-100 text-emerald-900 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Rekap Alumni
          </button>

          <button
            onClick={() => onSelectTab('reports')}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'reports'
                ? 'bg-slate-100 text-emerald-900 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Rekap & Laporan
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewLetter}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Terbitkan Surat</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
            title="Pengaturan Kop Surat & Identitas Sekolah SMA Surya Buana Malang"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Kop & Profil</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar for narrow screens */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs gap-1 scrollbar-none">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-2.5 py-1.5 rounded whitespace-nowrap font-medium ${
            currentTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('attendance')}
          className={`px-2.5 py-1.5 rounded whitespace-nowrap font-medium ${
            currentTab === 'attendance' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Absensi
        </button>
        <button
          onClick={() => onSelectTab('problems')}
          className={`px-2.5 py-1.5 rounded whitespace-nowrap font-medium ${
            currentTab === 'problems' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Laporan Masalah
        </button>
        <button
          onClick={() => onSelectTab('counseling')}
          className={`px-2.5 py-1.5 rounded whitespace-nowrap font-medium ${
            currentTab === 'counseling' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Konseling
        </button>
        <button
          onClick={() => onSelectTab('letters')}
          className={`px-2.5 py-1.5 rounded whitespace-nowrap font-medium ${
            currentTab === 'letters' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Surat Izin
        </button>
        <button
          onClick={() => onSelectTab('students')}
          className={`px-2.5 py-1.5 rounded whitespace-nowrap font-medium ${
            currentTab === 'students' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Data Siswa
        </button>
        <button
          onClick={() => onSelectTab('alumni')}
          className={`px-2.5 py-1.5 rounded whitespace-nowrap font-medium ${
            currentTab === 'alumni' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Alumni
        </button>
        <button
          onClick={() => onSelectTab('reports')}
          className={`px-2.5 py-1.5 rounded whitespace-nowrap font-medium ${
            currentTab === 'reports' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Rekap Laporan
        </button>
      </div>
    </header>
  );
};
