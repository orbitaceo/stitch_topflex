import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // envia cookies (refreshToken HttpOnly)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Request-Source': 'lavastore-web',
  },
  timeout: 15000,
});

// ── Request interceptor: injecta o access token ────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: lazy refresh (silent refresh) ───────────
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as any;

    // Se é 401 e ainda não tentamos refresh nessa requisição
    if (
      error.response?.status === 401 &&
      !original?._retry &&
      original?.url !== '/v1/auth/login'
    ) {
      if (isRefreshing) {
        // Enfileirar enquanto já estamos renovando
        return new Promise((resolve, _reject) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/v1/auth/refresh');
        const newToken: string = data.accessToken;

        useAuthStore.getState().updateAccessToken(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;

        // Resolver todos na fila
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];

        isRefreshing = false;
        return api(original);
      } catch {
        // Refresh falhou — limpar sessão e redirecionar para login
        useAuthStore.getState().clearAuth();
        refreshQueue = [];
        isRefreshing = false;

        if (typeof window !== 'undefined') {
          window.location.href = '/login?expired=1';
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

// ── Auth endpoints ─────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    api.post('/v1/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post('/v1/auth/login', data).then((r) => r.data),

  refresh: () =>
    api.post('/v1/auth/refresh').then((r) => r.data),

  logout: (refreshToken?: string) =>
    api.post('/v1/auth/logout', { refreshToken }).then((r) => r.data),

  me: () =>
    api.get('/v1/auth/me').then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post('/v1/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    api.post('/v1/auth/reset-password', { token, password }).then((r) => r.data),
};

// ── Products endpoints ─────────────────────────────────────────────

export const productsApi = {
  list: (params?: { page?: number; limit?: number; brand?: string; voltage?: string; sort?: string }) =>
    api.get('/v1/products', { params }).then((r) => r.data),

  get: (slug: string) =>
    api.get(`/v1/products/${slug}`).then((r) => r.data),
};

// ── Orders endpoints ───────────────────────────────────────────────

export const ordersApi = {
  create: (data: unknown) =>
    api.post('/v1/orders', data).then((r) => r.data),

  list: () =>
    api.get('/v1/orders').then((r) => r.data),

  get: (id: string) =>
    api.get(`/v1/orders/${id}`).then((r) => r.data),
};
