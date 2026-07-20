import axios from 'axios';
import { toast } from '../components/Toast';

const api = axios.create({
  baseURL: '/api',
});

function extractErrorMessage(data: any): string {
  if (data?.message) return data.message;
  if (data?.errors) return Object.values(data.errors as Record<string, string[]>).flat().join(' ');
  if (data?.detail) return data.detail;
  return 'Bir hata oluştu. Lütfen tekrar deneyin.';
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(err);
    }

    // Login/Register kendi inline hatasını gösteriyor, onlar hariç global toast
    const url: string = err.config?.url ?? '';
    if (!url.includes('/Auth/') && !err.config?.suppressToast) {
      if (err.response) {
        toast.error(extractErrorMessage(err.response.data));
      } else {
        toast.error('Sunucuya ulaşılamıyor. Backend çalışıyor mu?');
      }
    }
    return Promise.reject(err);
  }
);

export default api;
