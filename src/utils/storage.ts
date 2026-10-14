import {
  Student,
  AttendanceRecord,
  ProblemRecord,
  CounselingRecord,
  PermissionLetter,
  SchoolProfile,
  Alumni,
} from '../types';
import {
  initialStudents,
  initialAttendance,
  initialProblems,
  initialCounselingRecords,
  initialPermissionLetters,
  initialSchoolProfile,
  initialAlumni,
} from '../data/mockData';

const KEYS = {
  STUDENTS: 'simbk_sb_students_v2',
  ATTENDANCE: 'simbk_sb_attendance_v2',
  PROBLEMS: 'simbk_sb_problems_v2',
  COUNSELING: 'simbk_sb_counseling_v2',
  LETTERS: 'simbk_sb_letters_v2',
  PROFILE: 'simbk_sb_profile_v2',
  ALUMNI: 'simbk_sb_alumni_v2',
};

export const STANDARD_CLASSES = ['X', 'XI IPA', 'XI IPS', 'XII IPA', 'XII IPS'] as const;

export const normalizeStudentClass = (rawClass?: string): string => {
  if (!rawClass) return 'X';
  const trimmed = rawClass.trim();
  const c = trimmed.toUpperCase();
  if (c.includes('XI') && (c.includes('IPA') || c.includes('MIPA'))) return 'XI IPA';
  if (c.includes('XI') && c.includes('IPS')) return 'XI IPS';
  if (c.includes('XII') && (c.includes('IPA') || c.includes('MIPA'))) return 'XII IPA';
  if (c.includes('XII') && c.includes('IPS')) return 'XII IPS';
  if (c.startsWith('X-') || c === 'X' || c.startsWith('X ')) return 'X';
  return trimmed;
};

export const getStoredStudents = (): Student[] => {
  try {
    const raw = localStorage.getItem(KEYS.STUDENTS);
    const parsed: Student[] = raw ? JSON.parse(raw) : initialStudents;
    return parsed.map((s) => ({
      ...s,
      className: normalizeStudentClass(s.className),
    }));
  } catch {
    return initialStudents;
  }
};

export const saveStudents = (students: Student[]): void => {
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
};

export const getStoredAttendance = (): AttendanceRecord[] => {
  try {
    const raw = localStorage.getItem(KEYS.ATTENDANCE);
    const parsed: AttendanceRecord[] = raw ? JSON.parse(raw) : initialAttendance;
    return parsed.map((a) => ({
      ...a,
      className: normalizeStudentClass(a.className),
    }));
  } catch {
    return initialAttendance;
  }
};

export const saveAttendance = (records: AttendanceRecord[]): void => {
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
};

export const getStoredProblems = (): ProblemRecord[] => {
  try {
    const raw = localStorage.getItem(KEYS.PROBLEMS);
    return raw ? JSON.parse(raw) : initialProblems;
  } catch {
    return initialProblems;
  }
};

export const saveProblems = (problems: ProblemRecord[]): void => {
  localStorage.setItem(KEYS.PROBLEMS, JSON.stringify(problems));
};

export const getStoredCounseling = (): CounselingRecord[] => {
  try {
    const raw = localStorage.getItem(KEYS.COUNSELING);
    return raw ? JSON.parse(raw) : initialCounselingRecords;
  } catch {
    return initialCounselingRecords;
  }
};

export const saveCounseling = (records: CounselingRecord[]): void => {
  localStorage.setItem(KEYS.COUNSELING, JSON.stringify(records));
};

export const getStoredLetters = (): PermissionLetter[] => {
  try {
    const raw = localStorage.getItem(KEYS.LETTERS);
    if (!raw) return initialPermissionLetters;
    const parsed: PermissionLetter[] = JSON.parse(raw);
    const hasBksdo = parsed.some((l) => l.type === 'BK-SDO');
    if (!hasBksdo && initialPermissionLetters.length > 0) {
      const sampleSdo = initialPermissionLetters.find((l) => l.type === 'BK-SDO');
      if (sampleSdo && !parsed.some((l) => l.id === sampleSdo.id)) {
        return [sampleSdo, ...parsed];
      }
    }
    return parsed;
  } catch {
    return initialPermissionLetters;
  }
};

export const saveLetters = (letters: PermissionLetter[]): void => {
  localStorage.setItem(KEYS.LETTERS, JSON.stringify(letters));
};

export const getStoredProfile = (): SchoolProfile => {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    if (!raw) return initialSchoolProfile;
    const parsed = JSON.parse(raw);
    const profile: SchoolProfile = { ...initialSchoolProfile, ...parsed };
    // Always ensure valid kopFormat and default to 'gambar' per user request
    if (!parsed.kopFormat || parsed.kopFormat === 'lengkap') {
      profile.kopFormat = 'gambar';
    }
    if (!profile.letterheadImageUrl) {
      profile.letterheadImageUrl = initialSchoolProfile.letterheadImageUrl;
    }
    if (!profile.letterheadImageHeight) {
      profile.letterheadImageHeight = 140;
    }
    return profile;
  } catch {
    return initialSchoolProfile;
  }
};

export const saveProfile = (profile: SchoolProfile): void => {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
};

export const getStoredAlumni = (): Alumni[] => {
  try {
    const raw = localStorage.getItem(KEYS.ALUMNI);
    return raw ? JSON.parse(raw) : initialAlumni;
  } catch {
    return initialAlumni;
  }
};

export const saveAlumni = (alumni: Alumni[]): void => {
  localStorage.setItem(KEYS.ALUMNI, JSON.stringify(alumni));
};

export const resetAllData = (): void => {
  localStorage.removeItem(KEYS.STUDENTS);
  localStorage.removeItem(KEYS.ATTENDANCE);
  localStorage.removeItem(KEYS.PROBLEMS);
  localStorage.removeItem(KEYS.COUNSELING);
  localStorage.removeItem(KEYS.LETTERS);
  localStorage.removeItem(KEYS.PROFILE);
  localStorage.removeItem(KEYS.ALUMNI);
};

export const exportAllDataJSON = (): string => {
  const payload = {
    schoolProfile: getStoredProfile(),
    students: getStoredStudents(),
    attendance: getStoredAttendance(),
    problems: getStoredProblems(),
    counseling: getStoredCounseling(),
    letters: getStoredLetters(),
    alumni: getStoredAlumni(),
    exportedAt: new Date().toISOString(),
    version: '2.0',
  };
  return JSON.stringify(payload, null, 2);
};

export const importAllDataJSON = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.students && Array.isArray(parsed.students)) {
      saveStudents(parsed.students);
    }
    if (parsed.attendance && Array.isArray(parsed.attendance)) {
      saveAttendance(parsed.attendance);
    }
    if (parsed.problems && Array.isArray(parsed.problems)) {
      saveProblems(parsed.problems);
    }
    if (parsed.counseling && Array.isArray(parsed.counseling)) {
      saveCounseling(parsed.counseling);
    }
    if (parsed.letters && Array.isArray(parsed.letters)) {
      saveLetters(parsed.letters);
    }
    if (parsed.alumni && Array.isArray(parsed.alumni)) {
      saveAlumni(parsed.alumni);
    }
    if (parsed.schoolProfile && typeof parsed.schoolProfile === 'object') {
      saveProfile(parsed.schoolProfile);
    }
    return true;
  } catch (err) {
    console.error('Failed to import JSON data:', err);
    return false;
  }
};

export const ROMAN_MONTHS = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
];

export const getStandardLetterCode = (
  type: PermissionLetter['type'] | string
): string => {
  if (type === 'BK-SDO' || type === 'Dispensasi_Organisasi') return 'BK-SDO';
  if (type === 'BK-SPK' || type === 'Dispensasi_Kegiatan') return 'BK-SPK';
  if (type === 'BK-SIK' || type === 'Izin_Masuk_Kelas') return 'BK-SIK';
  if (type === 'BK-SLS' || type === 'Izin_Keluar_Sekolah') return 'BK-SLS';
  if (type === 'BK-SLB') return 'BK-SLB';
  if (type === 'BK-SPKS') return 'BK-SPKS';
  if (type === 'BK-SPO' || type === 'Panggilan_Orang_Tua') return 'BK-SPO';
  return 'BK-SIK';
};

/**
 * Mendapatkan angka romawi dari bulan dibuatnya surat (1 -> I, 9 -> IX, dst.)
 * Dilengkapi pengurai timezone-safe untuk format ISO / YYYY-MM-DD.
 */
export const getMonthRoman = (dateInput?: string | Date): string => {
  if (!dateInput) {
    return ROMAN_MONTHS[new Date().getMonth()];
  }
  if (typeof dateInput === 'string') {
    // Format YYYY-MM-DD
    const match = dateInput.match(/^(\d{4})-(\d{1,2})/);
    if (match) {
      const monthNum = parseInt(match[2], 10); // 1 - 12
      if (monthNum >= 1 && monthNum <= 12) {
        return ROMAN_MONTHS[monthNum - 1];
      }
    }
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      return ROMAN_MONTHS[d.getMonth()] || 'I';
    }
  } else if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return ROMAN_MONTHS[dateInput.getMonth()] || 'I';
  }
  return ROMAN_MONTHS[new Date().getMonth()] || 'I';
};

/**
 * Mendapatkan tahun terbit surat (YYYY) dari tanggal yang diinputkan.
 */
export const getLetterYear = (dateInput?: string | Date): number => {
  if (!dateInput) return new Date().getFullYear();
  if (typeof dateInput === 'string') {
    const match = dateInput.match(/^(\d{4})/);
    if (match) {
      const yr = parseInt(match[1], 10);
      if (!isNaN(yr)) return yr;
    }
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) return d.getFullYear();
  } else if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput.getFullYear();
  }
  return new Date().getFullYear();
};

/**
 * Menghasilkan Nomor Surat Resmi: [NOMOR_URUT]/[KODE]/[BULAN_ROMAWI]/[TAHUN]
 * - Nomor urut disesuaikan secara berkesinambungan KHUSUS untuk KODE YANG SAMA (BK-SPK, BK-SIK, dll.)
 * - Angka Romawi disesuaikan dengan BULAN DIBUATNYA surat (tanggal surat)
 */
export const generateLetterNumber = (
  type: PermissionLetter['type'] | string,
  existingLettersOrCount: PermissionLetter[] | number,
  letterDate?: string | Date,
): string => {
  const code = getStandardLetterCode(type);
  const monthRoman = getMonthRoman(letterDate);
  const year = getLetterYear(letterDate);

  let nextSequence = 1;

  if (Array.isArray(existingLettersOrCount)) {
    // 1. Filter surat yang memiliki kode klasifikasi yang sama persis
    const sameCodeLetters = existingLettersOrCount.filter((l) => {
      const matchCode = getStandardLetterCode(l.type) === code;
      const lYear = getLetterYear(l.date || l.letterNumber);
      return matchCode && lYear === year;
    });

    // 2. Hitung nomor urut tertinggi pada surat berkode yang sama di tahun terkait
    let maxNum = 0;
    sameCodeLetters.forEach((l) => {
      // Ambil angka awalan pada format "001/BK-SPK/..."
      const match = (l.letterNumber || '').match(/^(\d+)\//);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    // Lanjutkan dari nomor urut tertinggi, atau total surat berkode sama + 1
    nextSequence = maxNum > 0 ? maxNum + 1 : sameCodeLetters.length + 1;
  } else if (typeof existingLettersOrCount === 'number') {
    nextSequence = existingLettersOrCount + 1;
  }

  const seq = String(nextSequence).padStart(3, '0');
  return `${seq}/${code}/${monthRoman}/${year}`;
};

export const formatDateIndonesian = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatDateWithDayIndonesian = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};
