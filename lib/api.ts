import axios from 'axios';

// Настраиваем axios instance для отправки cookies
const axiosInstance = axios.create({
  withCredentials: true, // Важно: отправляет cookies при всех запросах
});

// Interceptor для обработки ошибок авторизации
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если получили 401, очищаем локальное хранилище и редиректим на логин
    if (error.response?.status === 401) {
      // Очищаем localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        // Редиректим на главную страницу (которая должна показать логин)
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

function normalizePath(path: string): string {
  if (!path) return '';
  return path.replace(/^\/+/, '').replace(/\/+$/, '');
}

function buildProxyUrl(endpoint: string, backend: 'main' | 'exam'): string {
  const clean = normalizePath(endpoint);
  const params = new URLSearchParams({ backend });
  return `/api/proxy/${clean}?${params.toString()}`;
}

// Client-side API calls - все идут через Next.js API routes
const API_BASE = '/api';

export const api = {
  // Auth
  async login(login: string, password: string) {
    const response = await axiosInstance.post(`${API_BASE}/auth`, { login, password });
    return response.data;
  },

  async logout() {
    const response = await axiosInstance.delete(`${API_BASE}/auth`);
    return response.data;
  },

  async checkSession() {
    const response = await axiosInstance.get(`${API_BASE}/auth`);
    return response.data;
  },

  // Main backend - через proxy
  async request(path: string, options: RequestInit = {}) {
    const url = buildProxyUrl(path, 'main');
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Важно: отправляет cookies при всех запросах
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response.json();
  },

  // Exam backend - через proxy
  async examRequest(path: string, options: RequestInit = {}) {
    const url = buildProxyUrl(path, 'exam');
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Важно: отправляет cookies при всех запросах
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response.json();
  },

  // Axios wrapper для сохранения совместимости
  async get(endpoint: string) {
    const url = buildProxyUrl(endpoint, 'main');
    const response = await axiosInstance.get(url);
    return response;
  },

  async post(endpoint: string, data: any) {
    const url = buildProxyUrl(endpoint, 'main');
    const response = await axiosInstance.post(url, data);
    return response;
  },

  async put(endpoint: string, data: any) {
    const url = buildProxyUrl(endpoint, 'main');
    const response = await axiosInstance.put(url, data);
    return response;
  },

  async delete(endpoint: string) {
    const url = buildProxyUrl(endpoint, 'main');
    const response = await axiosInstance.delete(url);
    return response;
  },

  // Exam методы
  async examGet(endpoint: string) {
    const url = buildProxyUrl(endpoint, 'exam');
    const response = await axiosInstance.get(url);
    return response;
  },

  async examPost(endpoint: string, data: any) {
    const url = buildProxyUrl(endpoint, 'exam');
    const response = await axiosInstance.post(url, data);
    return response;
  },

  async examPut(endpoint: string, data: any) {
    const url = buildProxyUrl(endpoint, 'exam');
    const response = await axiosInstance.put(url, data);
    return response;
  },

  async examDelete(endpoint: string) {
    const url = buildProxyUrl(endpoint, 'exam');
    const response = await axiosInstance.delete(url);
    return response;
  },
};

