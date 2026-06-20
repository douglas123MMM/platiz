import axios from 'axios';

/*
 * JWT tokens are stored in httpOnly cookies to prevent XSS-based token theft.
 * The Authorization header is kept as a fallback for backward compatibility.
 */

const csrfToken = crypto.randomUUID();
sessionStorage.setItem('csrf_token', csrfToken);

const api = axios.create({ baseURL: '/api', withCredentials: true });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-CSRF-Token'] = csrfToken;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      const publicPaths = ['/', '/login', '/register', '/landing', '/catalogo', '/presentacion', '/asesoria', '/vsl', '/franquicia'];
      const isPublicPath = publicPaths.some(p => window.location.pathname === p || window.location.pathname.startsWith(p + '/'));
      if (!isPublicPath) window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
