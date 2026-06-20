// ── Premium SVG Icon Set ──────────────────────────────────────
type IconProps = { className?: string; size?: number };

const s = (props: IconProps) => props.size || 24;
const cls = (props: IconProps) => props.className || '';

// ── Navigation ────────────────────────────────────────────────
export const IconHome = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
  </svg>
);

export const IconMovies = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <rect x="2" y="2" width="20" height="20" rx="2.5"/>
    <path d="M7 2v20M17 2v20M2 7h20M2 12h20M2 17h20" opacity="0.4"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

export const IconCourses = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20"/>
    <path d="M8 7h6M8 11h8M8 15h4" opacity="0.5"/>
  </svg>
);

export const IconBooks = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20"/>
    <path d="M12 6v7M9 9l3-3 3 3" opacity="0.5"/>
  </svg>
);

export const IconApps = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    <path d="M5 10v2a2 2 0 002 2h2" opacity="0.3"/>
    <path d="M19 10v2a2 2 0 01-2 2h-2" opacity="0.3"/>
  </svg>
);

export const IconTelegram = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.4"/>
    <path d="M11 16l-4-4 4-4M13 8l4 4-4 4"/>
  </svg>
);

export const IconServices = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
    <path d="M8 12h8M8 16h6" opacity="0.5"/>
  </svg>
);

export const IconAcademy = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" opacity="0.5"/>
  </svg>
);

export const IconAffiliate = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" opacity="0.5"/>
  </svg>
);

export const IconChat = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    <path d="M8 9h8M8 13h6" opacity="0.5"/>
  </svg>
);

// ── Features ──────────────────────────────────────────────────
export const IconLightning = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

export const IconStar = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

export const IconShield = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4" opacity="0.7"/>
  </svg>
);

export const IconGlobe = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" opacity="0.5"/>
  </svg>
);

// ── Admin / UI ────────────────────────────────────────────────
export const IconUsers = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" opacity="0.5"/>
  </svg>
);

export const IconCog = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" opacity="0.5"/>
  </svg>
);

export const IconPhoto = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="M21 15l-5-5L5 21" opacity="0.5"/>
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <circle cx="12" cy="12" r="10" opacity="0.3"/>
    <path d="M12 8v8M8 12h8"/>
  </svg>
);

export const IconTrash = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
    <path d="M10 11v6M14 11v6" opacity="0.5"/>
  </svg>
);

export const IconPencil = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

export const IconSearch = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
);

export const IconBell = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0" opacity="0.5"/>
  </svg>
);

export const IconMenu = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M3 12h18M3 6h18M3 18h18"/>
  </svg>
);

export const IconClose = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

export const IconLogout = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export const IconArrowRight = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

export const IconRefresh = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
  </svg>
);

export const IconSend = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

export const IconEye = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const IconEyeOff = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M14.12 14.12a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export const IconChevronDown = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export const IconChevronRight = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

export const IconCheck = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export const IconPackage = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
  </svg>
);

export const IconCopy = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
  </svg>
);

export const IconCheckCircle = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="8 12 11 15 16 9"/>
  </svg>
);

export const IconDiamond = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M12 2l6 8-6 12-6-12z"/>
    <path d="M6 10h12" opacity="0.3"/>
  </svg>
);

export const IconUserAdd = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <path d="M20 8v6M23 11h-6" opacity="0.5"/>
  </svg>
);

export const IconChart = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M4 20h16"/>
    <path d="M6 16l4-6 4 3 4-7"/>
  </svg>
);

export const IconMoon = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

export const IconSun = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

export const IconExternalLink = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

export const IconGrid = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

export const IconCrown = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M2 20h20M4 20l3-15 5 7 5-7 3 15"/>
  </svg>
);

export const IconAi = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M12 2a10 10 0 1010 10M12 2v10l6 6" opacity="0.5"/>
    <path d="M12 2a10 10 0 00-10 10h10V2z"/>
  </svg>
);

// ── Landing Page Section Icons (larger) ──────────────────────
export const SectionStreaming = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <circle cx="20" cy="20" r="16"/>
    <polygon points="17 14 26 20 17 26 17 14" fill="currentColor" stroke="none"/>
    <path d="M4 20h3M33 20h3M20 4v3M20 33v3" opacity="0.3"/>
  </svg>
);

export const SectionBooks = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M8 32V10a4 4 0 014-4h22v26H12a4 4 0 010-8h22"/>
    <path d="M20 10v12M15 14l5-5 5 5" opacity="0.5"/>
  </svg>
);

export const SectionApps = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <rect x="6" y="6" width="12" height="12" rx="2"/>
    <rect x="22" y="6" width="12" height="12" rx="2"/>
    <rect x="6" y="22" width="12" height="12" rx="2"/>
    <rect x="22" y="22" width="12" height="12" rx="2"/>
  </svg>
);

export const SectionTelegram = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <circle cx="20" cy="20" r="16" opacity="0.4"/>
    <path d="M18 26l-6-6 6-6M22 14l6 6-6 6"/>
  </svg>
);

export const SectionServices = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <rect x="6" y="12" width="28" height="22" rx="3"/>
    <path d="M26 12V8a3 3 0 00-3-3h-6a3 3 0 00-3 3v4"/>
    <path d="M14 20h12M14 26h10" opacity="0.5"/>
  </svg>
);

export const SectionAcademy = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M36 16v10M4 16l16-8 16 8-16 8z"/>
    <path d="M10 20v8c0 2.7 4.5 5 10 5s10-2.3 10-5v-8" opacity="0.5"/>
  </svg>
);

export const SectionAffiliate = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M18 21a8 8 0 0012.06.86l4.8-4.8a8 8 0 00-11.31-11.31l-2.75 2.74"/>
    <path d="M22 19a8 8 0 00-12.06-.86l-4.8 4.8a8 8 0 0011.31 11.31l2.75-2.74" opacity="0.5"/>
  </svg>
);

// ── Play Icon ──────────────────────────────────────────────────
export const IconPlay = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="currentColor" className={cls(p)}>
    <path d="M8 5.14v14l11-7-11-7z" />
  </svg>
);

// ── Education ──────────────────────────────────────────────────
export const IconEducation = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c0 2 3 4 6 4s6-2 6-4v-5" opacity="0.5"/>
  </svg>
);

// ── Tools ──────────────────────────────────────────────────────
export const IconTools = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94L6.3 20.7a1 1 0 01-1.4 0l-1.6-1.6a1 1 0 010-1.4l7.23-7.23a6 6 0 017.94-7.94l-3.77 3.77z" opacity="0.6"/>
    <path d="M4 20l3-3"/>
  </svg>
);

// ── Robot ──────────────────────────────────────────────────────
export const IconRobot = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <rect x="3" y="7" width="18" height="13" rx="2"/>
    <circle cx="9" cy="13" r="1.5"/>
    <circle cx="15" cy="13" r="1.5"/>
    <path d="M9 17h6"/>
    <path d="M12 7V4M8 4h8" opacity="0.5"/>
  </svg>
);

// ── Video ──────────────────────────────────────────────────────
export const IconVideo = (p: IconProps) => (
  <svg width={s(p)} height={s(p)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls(p)}>
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

// ── Map for dynamic lookup ────────────────────────────────────
export const navIconMap: Record<string, React.FC<IconProps>> = {
  home: IconHome, movies: IconMovies, courses: IconCourses, books: IconBooks,
  apps: IconApps, telegram: IconTelegram, services: IconServices,
  academy: IconAcademy, affiliate: IconAffiliate, chat: IconChat,
};

export const featureIconMap: Record<string, React.FC<IconProps>> = {
  lightning: IconLightning, star: IconStar, shield: IconShield, globe: IconGlobe,
};

export const sectionIconMap: Record<string, React.FC<IconProps>> = {
  movies: SectionStreaming, courses: IconCourses, books: SectionBooks,
  apps: SectionApps, telegram: SectionTelegram, services: SectionServices,
  academy: SectionAcademy, affiliate: SectionAffiliate,
};
