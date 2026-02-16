import { create } from 'zustand';
import { authAPI } from '../api/auth.api';

/**
 * Auth Store (Zustand)
 *
 * Manages user authentication state:
 * - user object (id, name, email, role)
 * - accessToken in localStorage
 * - login/signup/logout actions
 * - loading/error states
 */
const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false, // True after first checkAuth completes
  error: null,

  // ============================================
  // SIGNUP
  // ============================================
  signup: async ({ name, email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.signup({ name, email, password });
      const { user, accessToken } = data.data;

      localStorage.setItem('accessToken', accessToken);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  // ============================================
  // LOGIN
  // ============================================
  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      const { user, accessToken } = data.data;

      localStorage.setItem('accessToken', accessToken);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  // ============================================
  // LOGOUT
  // ============================================
  logout: async () => {
    try {
      await authAPI.logout();
    } catch {
      // Proceed even if server call fails
    } finally {
      localStorage.removeItem('accessToken');
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  // ============================================
  // CHECK AUTH (on app load / page refresh)
  // ============================================
  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isAuthenticated: false, user: null, isInitialized: true });
      return;
    }

    try {
      // Fast path: use /auth/me (no token rotation, just verify)
      const { data } = await authAPI.getMe();
      set({
        user: data.data.user,
        isAuthenticated: true,
        isInitialized: true,
      });
    } catch {
      // Access token expired — try refreshing via /auth/refresh
      try {
        const { data } = await authAPI.refresh();
        const { user, accessToken } = data.data;

        localStorage.setItem('accessToken', accessToken);
        set({
          user,
          isAuthenticated: true,
          isInitialized: true,
        });
      } catch {
        // Both failed — user is logged out
        localStorage.removeItem('accessToken');
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    }
  },

  // ============================================
  // CLEAR ERROR
  // ============================================
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
