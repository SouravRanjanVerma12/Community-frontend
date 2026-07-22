import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue  = [];

function processQueue(error, token = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    
    if (error.response?.status === 403 && error.response?.data?.code === 'LINKEDIN_IMPORT_REQUIRED') {
      window.dispatchEvent(new CustomEvent('LINKEDIN_IMPORT_REQUIRED'));
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing    = true;

    const { refreshToken, logout } = useAuthStore.getState();

    try {
      const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
      useAuthStore.setState({ accessToken: data.accessToken });
      processQueue(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (err) {
      processQueue(err, null);
      logout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
