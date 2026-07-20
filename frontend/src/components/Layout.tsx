import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  HomeIcon, CalendarIcon, MegaphoneIcon, TagIcon, UsersIcon, UserIcon,
  SunIcon, MoonIcon, LogoutIcon, SparklesIcon,
} from './ui';

const navItems = [
  { to: '/', label: 'Dashboard', Icon: HomeIcon },
  { to: '/events', label: 'Etkinlikler', Icon: CalendarIcon },
  { to: '/announcements', label: 'Duyurular', Icon: MegaphoneIcon },
  { to: '/categories', label: 'Kategoriler', Icon: TagIcon },
  { to: '/profile', label: 'Profilim', Icon: UserIcon },
];

const adminItems = [
  { to: '/users', label: 'Kullanıcılar', Icon: UsersIcon },
];

function NavItem({ to, label, Icon, end }: { to: string; label: string; Icon: typeof HomeIcon; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
        }`
      }
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      {label}
    </NavLink>
  );
}

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-600/25">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">Event Tracker</h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Duyuru & Etkinlik Yönetimi</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Menü</p>
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} end={item.to === '/'} />
          ))}

          {isAdmin && (
            <>
              <p className="px-3 pt-5 pb-1.5 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Yönetim</p>
              {adminItems.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </>
          )}
        </nav>

        {/* Theme toggle */}
        <div className="px-3 pb-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {theme === 'dark' ? <SunIcon className="w-[18px] h-[18px]" /> : <MoonIcon className="w-[18px] h-[18px]" />}
            {theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
          </button>
        </div>

        {/* User */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => navigate('/profile')}
            title="Profilim"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-white">
                {(user?.userName || user?.email)?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.userName || user?.email}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{user?.type === 'Admin' ? 'Yönetici' : 'Kullanıcı'}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleLogout(); }}
              title="Çıkış Yap"
              className="p-2 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogoutIcon className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
