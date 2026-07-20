import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEvents } from '../api/events';
import { getAnnouncements } from '../api/announcements';
import { getCategories } from '../api/categories';
import type { EventResponse, AnnouncementResponse, CategoryResponse } from '../types';
import {
  Badge, StatusBadge, cardCls, CalendarIcon, MegaphoneIcon, TagIcon,
  MapPinIcon, ClockIcon, ArrowRightIcon,
} from '../components/ui';

const statStyles = {
  indigo: {
    iconBg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    bar: 'from-indigo-500 to-violet-500',
  },
  emerald: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    bar: 'from-emerald-500 to-teal-500',
  },
  amber: {
    iconBg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    bar: 'from-amber-500 to-orange-500',
  },
} as const;

function StatCard({ label, sub, value, color, to, icon }: {
  label: string;
  sub: string;
  value: number;
  color: keyof typeof statStyles;
  to: string;
  icon: ReactNode;
}) {
  const s = statStyles[color];
  return (
    <Link
      to={to}
      className={`${cardCls} group relative overflow-hidden p-5 hover:shadow-lg hover:shadow-gray-200/60 dark:hover:shadow-black/30 hover:-translate-y-0.5 transition-all`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${s.bar}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold mt-1.5 text-gray-900 dark:text-white tabular-nums">{value}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.iconBg}`}>
          {icon}
        </div>
      </div>
      <span className="absolute bottom-4 right-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
        <ArrowRightIcon className="w-4 h-4" />
      </span>
    </Link>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function relativeDay(d: string) {
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  if (diff <= 0) return 'Bugün';
  if (diff === 1) return 'Yarın';
  return `${diff} gün sonra`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  useEffect(() => {
    getEvents().then((r) => setEvents(r.data));
    getAnnouncements().then((r) => setAnnouncements(r.data));
    getCategories().then((r) => setCategories(r.data));
  }, []);

  const upcomingEvents = events
    .filter((e) => new Date(e.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  const recentAnnouncements = [...announcements]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const activeEvents = events.filter((e) => e.status === 'Published').length;
  const activeAnnouncements = announcements.filter((a) => a.status === 'Published').length;
  const activeCategories = categories.filter((c) => c.isActive).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {greeting}{user?.userName ? `, ${user.userName}` : ''} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Genel bakış ve son aktiviteler</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Etkinlikler" value={events.length} sub={`${activeEvents} aktif`}
          color="indigo" to="/events" icon={<CalendarIcon className="w-5 h-5" />}
        />
        <StatCard
          label="Duyurular" value={announcements.length} sub={`${activeAnnouncements} aktif`}
          color="emerald" to="/announcements" icon={<MegaphoneIcon className="w-5 h-5" />}
        />
        <StatCard
          label="Kategoriler" value={categories.length} sub={`${activeCategories} aktif`}
          color="amber" to="/categories" icon={<TagIcon className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming events */}
        <div className={`${cardCls} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Yaklaşan Etkinlikler</h2>
            <Link to="/events" className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Tümü <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm py-6 text-center">Yaklaşan etkinlik yok</p>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  to="/events"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                >
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-medium text-indigo-500 dark:text-indigo-400 uppercase leading-none">
                      {new Date(event.startDate).toLocaleDateString('tr-TR', { month: 'short' })}
                    </span>
                    <span className="text-base font-bold text-indigo-700 dark:text-indigo-300 leading-tight">
                      {new Date(event.startDate).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{event.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      {event.location || 'Konum belirtilmemiş'}
                    </p>
                  </div>
                  <Badge tone="indigo">{relativeDay(event.startDate)}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent announcements */}
        <div className={`${cardCls} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Son Duyurular</h2>
            <Link to="/announcements" className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Tümü <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentAnnouncements.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm py-6 text-center">Henüz duyuru yok</p>
          ) : (
            <div className="space-y-2">
              {recentAnnouncements.map((a) => (
                <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <MegaphoneIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <span>{a.createdByName}</span>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <span>{a.categoryName}</span>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <span className="inline-flex items-center gap-0.5"><ClockIcon className="w-3 h-3" />{formatDate(a.createdAt)}</span>
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
