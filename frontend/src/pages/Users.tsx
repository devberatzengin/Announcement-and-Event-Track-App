import { useEffect, useState } from 'react';
import { getUsers, deactivateUser, activateUser, deleteUser } from '../api/users';
import { toast } from '../components/Toast';
import type { UserResponse } from '../types';
import {
  Badge, EmptyState, cardCls,
  UsersIcon, TrashIcon, EyeIcon, EyeOffIcon,
  type BadgeTone,
} from '../components/ui';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

const typeTones: Record<string, BadgeTone> = {
  Admin: 'purple',
  User: 'blue',
  Unknown: 'gray',
};

const avatarColors = [
  'from-indigo-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-sky-500 to-blue-600',
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function Users() {
  const [users, setUsers] = useState<UserResponse[]>([]);

  const load = () => {
    getUsers().then((r) => setUsers(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (user: UserResponse) => {
    if (user.isActive) {
      await deactivateUser(user.id);
      toast.info('Kullanıcı deaktif edildi.');
    } else {
      await activateUser(user.id);
      toast.success('Kullanıcı aktif edildi.');
    }
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    await deleteUser(id);
    toast.success('Kullanıcı silindi.');
    load();
  };

  const adminCount = users.filter((u) => u.type === 'Admin').length;
  const inactiveCount = users.filter((u) => !u.isActive).length;

  // Aktifler üstte, pasifler altta
  const sortedUsers = [...users].sort((a, b) => Number(b.isActive) - Number(a.isActive));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kullanıcılar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {users.length} kullanıcı · {adminCount} yönetici{inactiveCount > 0 ? ` · ${inactiveCount} pasif` : ''}
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState icon={<UsersIcon className="w-6 h-6" />} message="Kullanıcı bulunamadı" />
      ) : (
        <div className={`${cardCls} overflow-hidden`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kullanıcı</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rol</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Durum</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kayıt Tarihi</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-50 dark:border-gray-800/60 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${
                    !user.isActive ? 'opacity-50 grayscale' : ''
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(user.userName || '?')} flex items-center justify-center shrink-0`}>
                        <span className="text-sm font-semibold text-white">
                          {user.userName?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.userName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.firstName} {user.lastName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                  <td className="px-5 py-4">
                    <Badge tone={typeTones[user.type] || 'gray'}>{user.type === 'Admin' ? 'Yönetici' : user.type === 'User' ? 'Kullanıcı' : user.type}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={user.isActive ? 'green' : 'red'}>{user.isActive ? 'Aktif' : 'Pasif'}</Badge>
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleActive(user)}
                        title={user.isActive ? 'Deaktif Et' : 'Aktif Et'}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isActive
                            ? 'text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                            : 'text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                        }`}
                      >
                        {user.isActive ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        title="Sil"
                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
