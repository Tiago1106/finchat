import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// ============================================================
// Auth Store — Estado global de autenticação (Zustand)
// ============================================================

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsBiometric: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  clearBiometric: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  needsBiometric: false,

  setAuth: async (user, accessToken, refreshToken) => {
    await SecureStore.setItemAsync('access_token', accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    // Login fresco não precisa de biometria (acabou de digitar senha)
    set({ user, accessToken, refreshToken, isAuthenticated: true, needsBiometric: false });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('user');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      needsBiometric: false,
    });
  },

  loadStoredAuth: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('access_token');
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      const userStr = await SecureStore.getItemAsync('user');

      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr) as User;
        // Sessão restaurada do storage → precisa de biometria para desbloquear
        set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false, needsBiometric: true });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  clearBiometric: () => {
    set({ needsBiometric: false });
  },
}));
