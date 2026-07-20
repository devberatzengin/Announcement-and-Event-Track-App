import type { ReactNode, SVGProps } from 'react';
import type { ContentStatus } from '../types';

/* ---------- Shared style tokens ---------- */

export const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-colors';

export const labelCls =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

export const btnPrimaryCls =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-600/20';

export const btnGhostCls =
  'inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors';

export const cardCls =
  'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800';

/* ---------- Badge ---------- */

const badgeTones = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
  gray: 'bg-gray-100 text-gray-600 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
  purple: 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20',
  orange: 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20',
} as const;

export type BadgeTone = keyof typeof badgeTones;

export const contentStatusMeta: Record<ContentStatus, { label: string; tone: BadgeTone }> = {
  Draft: { label: 'Taslak', tone: 'amber' },
  Published: { label: 'Yayında', tone: 'green' },
  Passive: { label: 'Pasif', tone: 'gray' },
  Archived: { label: 'Arşiv', tone: 'red' },
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  const meta = contentStatusMeta[status] ?? { label: status, tone: 'gray' as BadgeTone };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function Badge({ tone = 'gray', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ring-1 ring-inset ${badgeTones[tone]}`}>
      {children}
    </span>
  );
}

/* ---------- Modal ---------- */

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg animate-modal-in">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Kapat"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Empty state ---------- */

export function EmptyState({ icon, message, actionLabel, onAction }: {
  icon: ReactNode;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className={`${cardCls} p-14 text-center`}>
      <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-4">
        {icon}
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ---------- Icons (inline SVG, stroke style) ---------- */

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  ...props,
});

export const HomeIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></svg>
);
export const CalendarIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>
);
export const MegaphoneIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 11v3a1 1 0 0 0 1 1h2l3.5 4.5a1 1 0 0 0 1.8-.6V6.1a1 1 0 0 0-1.8-.6L6 10H4a1 1 0 0 0-1 1z" /><path d="M15 9.5a4 4 0 0 1 0 6" /><path d="M17.5 7a7.5 7.5 0 0 1 0 11" /></svg>
);
export const TagIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" /></svg>
);
export const UserIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.9-3.4 3.7-5.2 7-5.2s6.1 1.8 7 5.2" /></svg>
);
export const UsersIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" /><path d="M16 5.5a3 3 0 0 1 0 5.7" /><path d="M18.5 15.2c1.7.7 2.7 2 3 4.3" /></svg>
);
export const SunIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
export const MoonIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
);
export const LogoutIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
);
export const PlusIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const XIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const PencilIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 20h4L20.5 7.5a2.1 2.1 0 0 0-3-3L5 17v3z" /><path d="M13.5 6.5l3 3" /></svg>
);
export const TrashIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /><path d="M10 11v5M14 11v5" /></svg>
);
export const EyeIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const EyeOffIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 3l18 18" /><path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6A16.6 16.6 0 0 0 2 12s3.5 7 10 7c1.5 0 2.9-.4 4.1-1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
);
export const MapPinIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
);
export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const ArchiveIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" /><path d="M10 12h4" /></svg>
);
export const SparklesIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 4l1.8 4.2L18 10l-4.2 1.8L12 16l-1.8-4.2L6 10l4.2-1.8L12 4z" /><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" /></svg>
);
export const ArrowRightIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
);
export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
);
export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 12.5 9.5 18 20 6.5" /></svg>
);
