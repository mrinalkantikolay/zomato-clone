import { create } from 'zustand';
import { authAPI } from '../api/auth';

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

      // Save token
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
  // CHECK AUTH (REFRESH SESSION)
  // ======================
  checkAuth: async () => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        set({ isInitialized: true });
        return;
      }

      const res = await authAPI.getMe();

      set({
        user: res.data.data.user,
        isAuthenticated: true,
        isInitialized: true,
      });
    } catch (err) {
      // Try refresh if access token expired
      try {
        const res = await authAPI.refresh();

        const newToken = res.data.data.accessToken;
        localStorage.setItem('accessToken', newToken);

        set({
          user: res.data.data.user,
          isAuthenticated: true,
          isInitialized: true,
        });
      } catch (refreshErr) {
        localStorage.removeItem('accessToken');

        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    }
  },
}));

export default useAuthStore;
