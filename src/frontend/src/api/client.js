import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('mb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute = err.config?.url?.includes('/api/auth/');
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('mb_token');
      localStorage.removeItem('mb_user');
      window.location.href = '/login';
    }
    if (err.response?.status === 403) {
      window.dispatchEvent(new Event('verification-required'));
    }
    return Promise.reject(err);
  }
);

export default client;
