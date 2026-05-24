import { create } from 'zustand';
import { authAPI } from '../api/auth.api';

/**
 * Auth Store (Zustand)
 * Handles login/signup/logout + session state
 */
const useAuthStore = create((set, get) => ({
  // ======================
  // STATE
  // ======================
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,

  // ======================
  // CLEAR ERROR
  // ======================
  clearError: () => set({ error: null }),

  // ======================
  // LOGIN
  // ======================
  login: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const res = await authAPI.login(data);

      const user = res.data.data.user;
      const accessToken = res.data.data.accessToken;

      localStorage.setItem('accessToken', accessToken);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';

      set({
        error: message,
        isLoading: false,
        isAuthenticated: false,
      });

      return { success: false };
    }
  },

  // ======================
  // SIGNUP
  // ======================
  signup: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const res = await authAPI.signup(data);

      const user = res.data.data.user;
      const accessToken = res.data.data.accessToken;

      localStorage.setItem('accessToken', accessToken);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed';

      set({
        error: message,
        isLoading: false,
        isAuthenticated: false,
      });

      return { success: false };
    }
  },

  // ======================
  // LOGOUT
  // ======================
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // ignore backend errors
    }

    localStorage.removeItem('accessToken');

    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // ======================
  // CHECK AUTH (REFRESH SESSION FIXED)
  // ======================
  checkAuth: async () => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        // No token at all — user is not logged in, skip refresh to avoid 401
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
        });
        return;
      }

      // STEP 1: Try normal session if token exists
      try {
        const res = await authAPI.getMe();

        set({
          user: res.data.data.user,
          isAuthenticated: true,
          isInitialized: true,
        });

        return;
      } catch (meErr) {
        // getMe failed (likely expired token) — try refresh
        if (meErr.response?.status !== 401) throw meErr;
      }

      // STEP 2: Token expired → try refresh (cookie-based)
      const refreshRes = await authAPI.refresh();

      const newToken = refreshRes.data.data.accessToken;
      localStorage.setItem('accessToken', newToken);

      // STEP 3: Fetch user again after refresh
      const res = await authAPI.getMe();

      set({
        user: res.data.data.user,
        isAuthenticated: true,
        isInitialized: true,
      });

    } catch (err) {
      // STEP 4: Total failure → logout state
      localStorage.removeItem('accessToken');

      set({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  },
}));

export default useAuthStore;
