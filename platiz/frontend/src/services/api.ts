import axios from 'axios';

/*
 * SECURITY WARNING: JWT tokens stored in localStorage are vulnerable to XSS attacks.
 * Any JavaScript running on the page can read localStorage, meaning a successful
 * XSS injection can exfiltrate the JWT and impersonate the user. Consider using
 * httpOnly cookies for JWT storage in production, or implement a token refresh
 * mechanism with short-lived access tokens stored in memory.
 */

const csrfToken = crypto.randomUUID();
sessionStorage.setItem('csrf_token', csrfToken);

const api = axios.create({ baseURL: '/api' });

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
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
