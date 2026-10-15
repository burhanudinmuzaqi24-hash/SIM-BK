import React from 'react';
import { SchoolProfile } from '../types';

interface OfficialLetterheadProps {
  profile: SchoolProfile;
  /**
   * If true, suppresses the letterhead graphics and leaves an appropriate blank margin
   * so the document can be printed on pre-printed school stationery (kertas berkop fisik).
   */
  isPreprintedStationery?: boolean;
  formatOverride?: 'lengkap' | 'blanko' | 'gambar';
  paperSize?: 'A4' | 'A5';
  className?: string;
}

export const OfficialLetterhead: React.FC<OfficialLetterheadProps> = ({
  profile,
  isPreprintedStationery = false,
  formatOverride,
  paperSize = 'A4',
  className = '',
}) => {
  const isA5 = paperSize === 'A5';
  const currentFormat = formatOverride || profile.kopFormat || 'gambar';
  const effectiveBlanko = isPreprintedStationery || currentFormat === 'blanko';

  if (effectiveBlanko) {
    return (
      <div className={`${isA5 ? 'mb-3' : 'mb-6'} ${className}`}>
        {/* On screen, display an informative banner for the user */}
        <div className="no-print border border-dashed border-amber-300 bg-amber-50 rounded-lg p-2.5 text-center text-xs text-amber-800">
          <p className="font-semibold">Mode Kertas Berkop Aktif ({paperSize})</p>
          <p className="text-[11px] text-amber-700">
            Kop surat digital disembunyikan. Area kosong dialokasikan agar hasil cetak pas dengan kertas berkop fisik dari sekolah.
          </p>
        </div>
        {/* Physical blank spacer for printer */}
        <div className={isA5 ? 'h-16 sm:h-20' : 'h-28 sm:h-32'} aria-hidden="true" />
      </div>
    );
  }

  // JIKA MODE GAMBAR / BANNER AKTIF:
  if (currentFormat === 'gambar' && profile.letterheadImageUrl) {
    const defaultHeight = isA5 ? 90 : 155;
    const maxHeight = profile.letterheadImageHeight
      ? isA5
        ? `${Math.min(profile.letterheadImageHeight, 95)}px`
        : `${profile.letterheadImageHeight}px`
      : `${defaultHeight}px`;

    return (
      <div className={`official-kop-surat ${isA5 ? 'mb-2.5' : 'mb-5'} w-full ${className}`}>
        <img
          src={profile.letterheadImageUrl}
          alt="Kop Surat Resmi SMA Surya Buana Malang"
          className="w-full object-contain mx-auto block letterhead-image"
          style={{ maxHeight }}
        />
      </div>
    );
  }

  // School profile defaults with Surya Buana Malang specifics
  const foundation = profile.foundationName || 'YAYASAN BAHANA CITA PERSADA MALANG';
  const schoolName = profile.schoolName || 'SMA SURYA BUANA MALANG';
  const category = profile.schoolCategory || 'SEKOLAH ALAM TERPADU';
  const accreditation = profile.accreditation || "TERAKREDITASI 'A'";
  const nss = profile.nss || '302056104148';
  const npsn = profile.npsn || '20577541';
  const unitName = profile.unitName || 'UNIT PELAYANAN BIMBINGAN DAN KONSELING (BK)';
  const address =
    profile.schoolAddress ||
    'Jl. Candi VI D No. 2, Karangbesuki, Kec. Sukun, Kota Malang, Jawa Timur 65149';
  const phone = profile.schoolPhone || '(0341) 5024546 / 573212';
  const email = profile.schoolEmail || 'smasuryabuana@gmail.com';
  const website = profile.schoolWebsite || 'www.smaislamsuryabuana.sch.id';

  return (
    <div className={`official-kop-surat ${isA5 ? 'mb-2' : 'mb-5'} ${className}`}>
      <div className={`flex items-center justify-between ${isA5 ? 'gap-2.5 pb-1' : 'gap-4 pb-2.5'}`}>
        {/* Left: Official Surya Buana Emblem / Logo */}
        <div className="shrink-0 flex items-center justify-center">
          {profile.logoUrl && profile.logoUrl.startsWith('http') ? (
            <img
              src={profile.logoUrl}
              alt="Logo SMA Surya Buana"
              className={`${isA5 ? 'w-14 h-14' : 'w-20 h-20 sm:w-24 sm:h-24'} object-contain`}
            />
          ) : (
            <div className={`${isA5 ? 'w-14 h-14' : 'w-20 h-20 sm:w-24 sm:h-24'} flex items-center justify-center`}>
              {/* Authentic Emblem Vector for SMA Surya Buana */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-xs"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer Ring & Laurel Garland */}
                <circle cx="50" cy="50" r="47" fill="#065f46" stroke="#fbbf24" strokeWidth="2.5" />
                <circle cx="50" cy="50" r="42" fill="#047857" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 2" />

                {/* Inner Sunburst Rays (Surya) */}
                <g stroke="#fef08a" strokeWidth="1.5" opacity="0.85">
                  <line x1="50" y1="12" x2="50" y2="22" />
                  <line x1="50" y1="78" x2="50" y2="88" />
                  <line x1="12" y1="50" x2="22" y2="50" />
                  <line x1="78" y1="50" x2="88" y2="50" />
                  <line x1="23" y1="23" x2="30" y2="30" />
                  <line x1="70" y1="70" x2="77" y2="77" />
                  <line x1="23" y1="77" x2="30" y2="70" />
                  <line x1="70" y1="30" x2="77" y2="23" />
                </g>

                {/* Golden Sun Core */}
                <circle cx="50" cy="45" r="16" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.5" />

                {/* Open Book / Al-Qur'an (Ilmu & Kebajikan) */}
                <path
                  d="M 32 58 Q 50 63 50 54 Q 50 63 68 58 L 68 68 Q 50 72 50 64 Q 50 72 32 68 Z"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                {/* Book spine & ribbon */}
                <line x1="50" y1="54" x2="50" y2="65" stroke="#047857" strokeWidth="1.5" />

                {/* Globe lines (Buana / Alam Semesta) */}
                <ellipse cx="50" cy="45" rx="14" ry="7" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
                <line x1="50" y1="30" x2="50" y2="60" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />

                {/* Text Banner: SURYA BUANA */}
                <path
                  d="M 20 80 Q 50 86 80 80 L 78 89 Q 50 94 22 89 Z"
                  fill="#fef08a"
                  stroke="#b45309"
                  strokeWidth="0.75"
                />
                <text
                  x="50"
                  y="86.5"
                  textAnchor="middle"
                  fill="#065f46"
                  fontSize="5.2"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  letterSpacing="0.3"
                >
                  SMA SURYA BUANA
                </text>
              </svg>
            </div>
          )}
        </div>

        {/* Center: Official Typography & Accreditation Details */}
        <div className="flex-1 text-center font-serif text-slate-950">
          {/* Baris 1: Yayasan */}
          <h2 className={`${isA5 ? 'text-[10px]' : 'text-xs sm:text-[13px]'} font-bold tracking-wider uppercase text-slate-800`}>
            {foundation}
          </h2>

          {/* Baris 2: Nama Sekolah Utama */}
          <h1 className={`${isA5 ? 'text-sm sm:text-base' : 'text-base sm:text-xl md:text-[22px]'} font-black tracking-tight uppercase text-slate-950 my-0.5 leading-snug`}>
            {schoolName}
          </h1>

          {/* Baris 3: Kategori, Akreditasi & Nomor Pokok */}
          <p className={`${isA5 ? 'text-[8.5px]' : 'text-[10px] sm:text-[11.5px]'} font-bold text-slate-700 tracking-wide font-sans`}>
            {category && <span>{category} · </span>}
            <span className="text-emerald-900 font-extrabold">{accreditation}</span>
            <span className="text-slate-500"> | </span>
            <span className="font-mono">NPSN: {npsn}</span>
            <span className="text-slate-500"> | </span>
            <span className="font-mono">NSS: {nss}</span>
          </p>

          {/* Baris 4: Unit Pelayanan BK */}
          <p className={`${isA5 ? 'text-[9px]' : 'text-[11px] sm:text-xs'} font-black uppercase tracking-widest text-slate-900 font-sans mt-0.5`}>
            {unitName}
          </p>

          {/* Baris 5: Alamat Lengkap */}
          <p className={`${isA5 ? 'text-[8px]' : 'text-[9.5px] sm:text-[11px]'} text-slate-600 font-sans mt-0.5 leading-tight`}>
            {address}
          </p>

          {/* Baris 6: Telepon, Email, Website */}
          <p className={`${isA5 ? 'text-[7.5px]' : 'text-[9px] sm:text-[10.5px]'} text-slate-600 font-sans leading-tight`}>
            Telp: <span className="font-medium text-slate-800">{phone}</span> · Email:{' '}
            <span className="font-medium text-slate-800">{email}</span>
            {website && (
              <>
                {' '}
                · Web: <span className="font-medium text-slate-800">{website}</span>
              </>
            )}
          </p>
        </div>

        {/* Right: National / Counseling Symbol (BK Emblem on Right for Balanced Official Look) */}
        <div className="shrink-0 hidden sm:flex items-center justify-center">
          <div className={`${isA5 ? 'w-12 h-12 p-0.5' : 'w-16 h-16 p-1'} rounded-full border-2 border-slate-900 flex flex-col items-center justify-center bg-slate-50 text-slate-900 font-sans`}>
            <span className={`${isA5 ? 'text-[7.5px]' : 'text-[9px]'} font-black tracking-wider text-emerald-800 uppercase`}>
              ABKIN
            </span>
            <span className={`${isA5 ? 'text-xs' : 'text-base'} font-black leading-none text-slate-950`}>
              BK
            </span>
            <span className={`${isA5 ? 'text-[6.5px]' : 'text-[7.5px]'} font-bold tracking-tight text-slate-600 uppercase`}>
              MALANG
            </span>
          </div>
        </div>
      </div>

      {/* Standar Garis Ganda Resmi Tata Naskah Dinas Sekolah Indonesia */}
      {/* Garis Atas: Tebal 3px | Jarak: 1.5px | Garis Bawah: Tipis 1px */}
      <div className="w-full flex flex-col gap-[2px] mt-1">
        <div className="w-full h-[3px] bg-slate-950" />
        <div className="w-full h-[1px] bg-slate-950" />
      </div>
    </div>
  );
};
