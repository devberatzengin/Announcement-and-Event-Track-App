import { useEffect, useState, type FormEvent } from 'react';
import { getMe, updateUser, changePassword } from '../api/users';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/Toast';
import type { UserResponse } from '../types';
import {
  Badge, cardCls, inputCls, labelCls, btnPrimaryCls,
  ClockIcon,
} from '../components/ui';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Profile() {
  const { refreshUser } = useAuth();
  const [me, setMe] = useState<UserResponse | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '' });
  const [saving, setSaving] = useState(false);

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    getMe().then((r) => {
      setMe(r.data);
      setForm({
        firstName: r.data.firstName || '',
        lastName: r.data.lastName || '',
        phoneNumber: r.data.phoneNumber || '',
      });
    });
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!me) return;
    setSaving(true);
    try {
      const r = await updateUser(me.id, form);
      setMe(r.data);
      toast.success('Profil bilgileriniz güncellendi.');
      refreshUser(); // sidebar'daki isim de tazelensin
    } catch {
      // global toast gösteriyor
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirm) {
      toast.error('Yeni şifreler eşleşmiyor.');
      return;
    }
    setPwdSaving(true);
    try {
      await changePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      toast.success('Şifreniz değiştirildi.');
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
    } catch {
      // global toast gösteriyor (endpoint henüz yoksa 404 mesajı düşer)
    } finally {
      setPwdSaving(false);
    }
  };

  if (!me) {
    return <p className="text-sm text-gray-400 dark:text-gray-500">Yükleniyor...</p>;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profilim</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Hesap bilgilerinizi görüntüleyin ve düzenleyin</p>
      </div>

      {/* Özet kart */}
      <div className={`${cardCls} p-6 mb-6`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/25">
            <span className="text-2xl font-bold text-white">
              {me.userName?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{me.userName}</h2>
              <Badge tone={me.type === 'Admin' ? 'purple' : 'blue'}>
                {me.type === 'Admin' ? 'Yönetici' : 'Kullanıcı'}
              </Badge>
              <Badge tone={me.isActive ? 'green' : 'red'}>{me.isActive ? 'Aktif' : 'Pasif'}</Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {me.email}
              {me.phoneNumber && <span className="text-gray-400 dark:text-gray-500"> · {me.phoneNumber}</span>}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
              <ClockIcon className="w-3 h-3" /> Üyelik: {formatDate(me.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Kişisel bilgiler */}
      <form onSubmit={handleSave} className={`${cardCls} p-6 mb-6`}>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Kişisel Bilgiler</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Ad</label>
            <input
              required
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Soyad</label>
            <input
              required
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Telefon</label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
              className={inputCls}
              placeholder="+905xxxxxxxxx"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">10-15 haneli, istersen + ile başlayabilir</p>
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <button type="submit" disabled={saving} className={btnPrimaryCls}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>

      {/* Şifre değiştir */}
      <form onSubmit={handlePassword} className={`${cardCls} p-6`}>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Şifre Değiştir</h3>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Mevcut Şifre</label>
            <input
              type="password"
              required
              value={pwd.currentPassword}
              onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Yeni Şifre</label>
              <input
                type="password"
                required
                minLength={8}
                value={pwd.newPassword}
                onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Yeni Şifre (Tekrar)</label>
              <input
                type="password"
                required
                minLength={8}
                value={pwd.confirm}
                onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <button type="submit" disabled={pwdSaving} className={btnPrimaryCls}>
            {pwdSaving ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
          </button>
        </div>
      </form>
    </div>
  );
}
