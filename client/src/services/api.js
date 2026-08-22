import axios from 'axios';
import { encryptPayload, decryptPayload } from './encryption';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage and encrypt payload on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('provexa_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Encrypt request body if present and not a file upload (FormData)
  if (config.data && !(config.data instanceof FormData)) {
    config.data = { encryptedData: encryptPayload(config.data) };
  }

  return config;
});

// Handle global decryption and 401 redirect globally
api.interceptors.response.use(
  (res) => {
    // Decrypt response body if encrypted
    if (res.data && res.data.encryptedData) {
      res.data = decryptPayload(res.data.encryptedData);
    }
    return res;
  },
  (err) => {
    // Decrypt error payload if present
    if (err.response?.data && err.response.data.encryptedData) {
      err.response.data = decryptPayload(err.response.data.encryptedData);
    }
    if (err.response?.status === 401) {
      const isAuthRoute = ['login', 'register', 'totp', 'verify-otp', 'setup-totp'].some(p => err.config?.url?.includes(p));
      if (!isAuthRoute) {
        localStorage.removeItem('provexa_token');
        localStorage.removeItem('provexa_user');
        localStorage.removeItem('provexa_role');
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
