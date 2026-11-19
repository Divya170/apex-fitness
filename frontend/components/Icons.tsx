import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size: number, sw: number) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: sw, 'aria-hidden': true, focusable: false,
} as const);

export const Arrow = ({ size = 18, ...p }: P) => <svg {...base(size, 2.4)} {...p}><path d="M4 12h15M13 5l7 7-7 7" /></svg>;
export const ChevronLeft = ({ size = 22, ...p }: P) => <svg {...base(size, 2.4)} {...p}><path d="M15 5l-7 7 7 7" /></svg>;
export const ChevronRight = ({ size = 22, ...p }: P) => <svg {...base(size, 2.4)} {...p}><path d="M9 5l7 7-7 7" /></svg>;
export const Close = ({ size = 22, ...p }: P) => <svg {...base(size, 2.4)} {...p}><path d="M5 5l14 14M19 5 5 19" /></svg>;
export const Menu = ({ size = 24, ...p }: P) => <svg {...base(size, 2.4)} {...p}><path d="M3 7h18M3 12h18M9 17h12" /></svg>;
export const Alert = ({ size = 18, ...p }: P) => <svg {...base(size, 2.2)} {...p}><circle cx="12" cy="12" r="10" /><path d="M12 7v6M12 16.5v.5" /></svg>;
export const Check = ({ size = 30, ...p }: P) => <svg {...base(size, 3)} {...p}><path d="M4 12l5 5L20 6" /></svg>;
export const Expand = ({ size = 22, ...p }: P) => <svg {...base(size, 2.2)} {...p}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>;
export const Calendar = ({ size = 40, ...p }: P) => <svg {...base(size, 1.8)} {...p}><rect x="3" y="5" width="18" height="16" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>;
export const Play = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z" /></svg>;
export const Pause = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="4" width="5" height="16" /><rect x="14" y="4" width="5" height="16" /></svg>;

const BENEFIT_PATHS: Record<string, string> = {
  access: 'M2 12h3M19 12h3M5 8v8M19 8v8M8 6v12M16 6v12M8 12h8',
  group: 'M6 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM1 20c0-3.3 2.2-6 5-6s5 2.7 5 6M13 20c0-2.5 1.5-4.5 4-4.5s4 2 4 4.5',
  clock: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l3 2M9 2h6',
  coach: 'M9 3h6v4H9zM6 5h3M15 5h3v16H6V5M9 12l2 2 4-4',
};
export const BenefitIcon = ({ name, size = 40 }: { name: string; size?: number }) => (
  <svg {...base(size, 1.8)}><path d={BENEFIT_PATHS[name] ?? BENEFIT_PATHS.access} /></svg>
);

export const Logo = ({ size = 44 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
    <path d="M0 0h34l10 10v34H0z" fill="#B7F23D" />
    <path d="M9 33 22 11l13 22" fill="none" stroke="#111312" strokeWidth="5" />
    <path d="M15 26h14" stroke="#111312" strokeWidth="4" />
  </svg>
);
export const Plus = ({ size = 18, ...p }: P) => <svg {...base(size, 2.4)} {...p}><path d="M12 5v14M5 12h14" /></svg>;
export const Search = ({ size = 20, ...p }: P) => <svg {...base(size, 2.2)} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
