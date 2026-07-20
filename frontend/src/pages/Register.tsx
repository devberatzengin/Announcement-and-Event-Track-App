import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { inputCls, labelCls, btnPrimaryCls, SparklesIcon, SunIcon, MoonIcon } from '../components/ui';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerApi(form);
      login(res.data);
      navigate('/');
    } catch (err: any) {
      const data = err.response?.data;
      const validationErrors = data?.errors
        ? Object.values(data.errors as Record<string, string[]>).flat().join(' ')
        : null;
      setError(data?.message || validationErrors || data?.detail || 'Kayıt başarısız. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-300/30 dark:bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-300/30 dark:bg-violet-600/10 blur-3xl pointer-events-none" />

      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
        title={theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
      >
        {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-4">
            <SparklesIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Tracker</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Yeni hesap oluşturun</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 border border-gray-200 dark:border-gray-800 p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm border border-red-100 dark:border-red-500/20">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Ad</label>
              <input type="text" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Soyad</label>
              <input type="text" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Kullanıcı Adı</label>
            <input type="text" required value={form.username} onChange={(e) => set('username', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Email</label>
            <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Telefon</label>
            <input type="tel" value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Şifre</label>
            <input type="password" required value={form.password} onChange={(e) => set('password', e.target.value)} className={inputCls} />
          </div>

          <button type="submit" disabled={loading} className={`${btnPrimaryCls} w-full`}>
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Giriş Yap
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
