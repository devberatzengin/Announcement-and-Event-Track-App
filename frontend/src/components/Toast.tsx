import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

type Listener = (t: ToastItem) => void;
let listener: Listener | null = null;
let nextId = 1;

function push(type: ToastType, message: string) {
  listener?.({ id: nextId++, type, message });
}

/** Uygulamanın her yerinden çağrılabilir: toast.success('Kaydedildi') */
export const toast = {
  success: (m: string) => push('success', m),
  error: (m: string) => push('error', m),
  info: (m: string) => push('info', m),
};

const meta: Record<ToastType, { icon: string; iconCls: string }> = {
  success: {
    icon: 'M4 12.5 9.5 18 20 6.5',
    iconCls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  },
  error: {
    icon: 'M18 6 6 18M6 6l12 12',
    iconCls: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400',
  },
  info: {
    icon: 'M12 8h.01M12 12v4',
    iconCls: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
  },
};

const TOAST_DURATION = 4000;

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    listener = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, TOAST_DURATION);
    };
    return () => {
      listener = null;
    };
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((x) => x.id !== id));

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-80 max-w-[calc(100vw-2.5rem)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toast-in flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-black/40"
        >
          <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center ${meta[t.type].iconCls}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d={meta[t.type].icon} />
              {t.type === 'info' && <circle cx="12" cy="12" r="9" strokeWidth={1.8} />}
            </svg>
          </div>
          <p className="flex-1 text-sm text-gray-800 dark:text-gray-200 leading-snug pt-0.5">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Kapat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-3.5 h-3.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
