export type Gender = 'L' | 'P';

export interface Student {
  id: string;
  nisn?: string;
  name: string;
  className: string;
  gender: Gender;
  phone: string;
  parentName: string;
  parentPhone: string;
  address: string;
  guardianName?: string;
  homeroomTeacher: string;
  notes?: string;
  isWatchlist?: boolean;
}

export type AttendanceStatus =
  | 'Hadir'
  | 'Sakit'
  | 'Izin'
  | 'Terlambat'
  | 'Alpa'
  | 'Bolos_KBM';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  className?: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  arrivalTime?: string;
  subjectOrPeriod?: string; // e.g. "Jam Ke-1 s.d 4" atau "Pagi"
  reason?: string;
  sanctionOrNote?: string;
  reportedBy?: string;
}

export type GuidanceDomain = 'Pribadi' | 'Sosial' | 'Belajar' | 'Karir';

export type ProblemSeverity = 'Ringan' | 'Sedang' | 'Berat';

export type ProblemStatus =
  | 'Menunggu'
  | 'Proses Bimbingan'
  | 'Terselesaikan'
  | 'Alih Tangan / Referal';

export interface ProblemRecord {
  id: string;
  studentId: string;
  title: string;
  incidentDate: string; // YYYY-MM-DD
  reportDate: string;
  reportedBy:
    | 'Wali Kelas'
    | 'Guru Mapel'
    | 'Guru Piket'
    | 'Teman Sebaya'
    | 'Inisiatif Sendiri'
    | 'Orang Tua / Wali'
    | 'Kepala Sekolah';
  reporterName: string;
  guidanceDomain: GuidanceDomain;
  problemCategory: string;
  severity: ProblemSeverity;
  chronologicalDescription: string;
  initialEfforts: string;
  status: ProblemStatus;
  lastFollowUpDate?: string;
  actionLog?: {
    id: string;
    date: string;
    action: string;
    counselor: string;
  }[];
}

export type CounselingServiceType =
  | 'Konseling Individual'
  | 'Konseling Kelompok'
  | 'Konsultasi Guru/Ortu'
  | 'Konferensi Kasus'
  | 'Mediasi Teman Sebaya'
  | 'Kunjungan Rumah (Home Visit)';

export interface CounselingRecord {
  id: string;
  studentId: string;
  sessionNumber: number;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:30 - 10:15 WIB"
  serviceType: CounselingServiceType;
  problemSummary: string;
  dynamicsAndEtiology: string; // analisis psikologis & penyebab
  techniqueUsed: string; // e.g., Cognitive Restructuring, Kontrak Perilaku, WDEP
  studentCommitment: string; // Kesepakatan / komitmen perilaku siswa
  followUpPlan: string; // RTL (Rencana Tindak Lanjut)
  evaluation:
    | 'Sangat Berkembang'
    | 'Mulai Terarah'
    | 'Perlu Pendampingan Lanjutan'
    | 'Butuh Penanganan Khusus';
  nextSessionDate?: string;
  confidentialityNote?: string;
  counselorName: string;
}

export type PermissionLetterType =
  | 'BK-SPK' // Surat Perizinan Mengikuti Kegiatan
  | 'BK-SIK' // Surat Izin Meninggalkan KBM
  | 'BK-SLS' // Surat Izin Keperluan Di Luar Sekolah
  | 'BK-SLB' // Surat Perizinan Layanan BK
  | 'BK-SPKS' // Surat Pernyataan dan Komitmen Siswa (Pelanggaran Kegiatan)
  | 'BK-SPO' // Surat Panggilan Orang Tua
  | 'BK-SDO' // Surat Izin Dispensasi Kegiatan Organisasi (Surat Dispen Organisasi)
  | 'Izin_Keluar_Sekolah'
  | 'Izin_Masuk_Kelas'
  | 'Dispensasi_Kegiatan'
  | 'Dispensasi_Organisasi'
  | 'Panggilan_Orang_Tua';

export interface SubjectTeacherItem {
  no: number;
  subject: string;
  teacherName: string;
}

export interface PermissionLetter {
  id: string;
  letterNumber: string;
  isManualLetterNumber?: boolean;
  type: PermissionLetterType;
  studentId: string; // ID siswa utama (kompatibilitas backward)
  studentIds?: string[]; // Daftar ID seluruh siswa terpilih (multi-siswa)
  date: string; // YYYY-MM-DD
  departureTime?: string;
  returnTime?: string;
  isReturningToSchool?: boolean;
  reason: string;
  destinationOrActivity: string;
  eventOrganizerOrTeacher?: string;
  parentAppointmentDate?: string;
  parentAppointmentTime?: string;
  parentAppointmentRoom?: string;
  status: 'Disetujui' | 'Menunggu' | 'Selesai' | 'Dibatalkan';
  counselorSignatureName: string;
  counselorNIP: string;
  schoolPicketTeacher?: string;
  homeroomTeacher?: string;
  headmasterName?: string;
  headmasterNIP?: string;
  wakaKesiswaanName?: string;
  coachName?: string;
  coachRole?: string;
  advisorName?: string;
  advisorRole?: string;
  serviceTypeChoice?: string;
  otherServiceText?: string;
  incidentPlace?: string;
  incidentDescription?: string;
  subjectTeachers?: SubjectTeacherItem[];
  notes?: string;

  // Khusus Surat Izin Dispen Organisasi (BK-SDO)
  organizationName?: string; // Nama Organisasi Pengirim / Penyelenggara
  organizationLetterNumber?: string; // Nomor Surat Permohonan dari Organisasi
  organizationLetterDate?: string; // Tanggal Surat Masuk dari Organisasi
  studentRoleInOrg?: string; // Jabatan / Penugasan Siswa di Organisasi
  orgLeaderName?: string; // Nama Ketua Organisasi / Ketua Panitia
  orgLeaderRole?: string; // Jabatan Ketua Organisasi
  orgAdvisorName?: string; // Pembina Organisasi
  activityDuration?: string; // Durasi / Jam Pelajaran Dispensasi
  participantList?: string; // Rincian Anggota / Delegasi Tambahan
}

export interface SchoolProfile {
  foundationName?: string;
  schoolCategory?: string;
  schoolName: string;
  accreditation?: string;
  nss?: string;
  npsn?: string;
  unitName?: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolWebsite: string;
  principalName: string;
  principalNIP: string;
  leadCounselorName: string;
  leadCounselorNIP: string;
  counselingRoomName: string;
  academicYear: string;
  currentSemester: 'Ganjil' | 'Genap';
  regencyCity: string;
  logoUrl?: string;
  kopFormat?: 'lengkap' | 'blanko' | 'gambar';
  letterheadImageUrl?: string;
  letterheadImageHeight?: number;
}

export type AlumniStatus =
  | 'Kuliah'
  | 'Bekerja'
  | 'Wirausaha'
  | 'Pelatihan_Kursus'
  | 'Gap_Year'
  | 'Lainnya';

export type HigherEducationType =
  | 'PTN'
  | 'PTS'
  | 'Kedinasan'
  | 'Luar_Negeri';

export type AdmissionTrack =
  | 'SNBP'
  | 'SNBT'
  | 'Mandiri'
  | 'SPAN-PTKIN'
  | 'Beasiswa'
  | 'Lainnya';

export interface Alumni {
  id: string;
  nisn: string;
  name: string;
  gender: Gender;
  graduationYear: number;
  lastClass: string;
  phone: string;
  email?: string;
  status: AlumniStatus;
  
  // Detail Kuliah / Perguruan Tinggi
  universityType?: HigherEducationType;
  universityName?: string;
  faculty?: string;
  major?: string;
  admissionTrack?: AdmissionTrack;
  hasScholarship?: boolean;
  scholarshipName?: string;
  
  // Detail Bekerja
  companyName?: string;
  industrySector?: string;
  jobTitle?: string;
  workCity?: string;
  employmentType?: 'Tetap' | 'Kontrak' | 'Freelance' | 'Magang';

  // Detail Wirausaha
  businessName?: string;
  businessField?: string;
  
  // Pelatihan / Gap Year
  trainingInstitute?: string;
  
  notes?: string;
  updatedAt?: string;
}
