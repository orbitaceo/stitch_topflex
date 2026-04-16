import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Timeout generoso para cobrir cold starts do Render Free (pode levar até ~60s)
const REQUEST_TIMEOUT_MS = 65_000;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // envia cookies (refreshToken HttpOnly)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Request-Source': 'lavastore-web',
  },
  timeout: REQUEST_TIMEOUT_MS,
});

// ── Request interceptor: injecta o access token ────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Retry interceptor: tenta novamente em caso de timeout (cold start) ─
// O Render Free pode demorar até ~60s para responder após dormência.
// Com uma única tentativa extra cobre a maioria dos cold starts.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as (typeof error.config & { _retried?: boolean }) | undefined;
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');

    if (isTimeout && config && !config._retried) {
      config._retried = true;
      // Aguarda 2s antes de tentar novamente
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return api(config);
    }

    return Promise.reject(error);
  },
);

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
