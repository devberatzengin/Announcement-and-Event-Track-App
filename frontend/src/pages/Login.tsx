import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { inputCls, labelCls, btnPrimaryCls, SparklesIcon, SunIcon, MoonIcon } from '../components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi({ email, password });
      login(res.data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 relative overflow-hidden">
      {/* Decorative blobs */}
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
          <p className="text-gray-500 dark:text-gray-400 mt-2">Hesabınıza giriş yapın</p>
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

          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label className={labelCls}>Şifre</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className={`${btnPrimaryCls} w-full`}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
