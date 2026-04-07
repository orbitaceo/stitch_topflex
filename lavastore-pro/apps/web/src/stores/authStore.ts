'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
  profile: { firstName: string; lastName: string } | null;
}

interface AuthState {
  user: UserState | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: UserState, accessToken: string) => void;
  clearAuth: () => void;
  updateAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),

      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),

      updateAccessToken: (token) =>
        set({ accessToken: token }),
    }),
    {
      name: 'lavastore-auth',
      // Usa sessionStorage para o accessToken (não persiste ao fechar aba)
      // O refreshToken fica em cookie HttpOnly (gerenciado pelo servidor)
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        // Não persistimos o accessToken (é de curta duração, 15min)
        // É renovado automaticamente pelo axios interceptor
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Selector helpers
export const selectUser = (s: AuthState) => s.user;
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated;
export const selectIsAdmin = (s: AuthState) =>
  s.user?.role === 'ADMIN' || s.user?.role === 'SUPER_ADMIN';
