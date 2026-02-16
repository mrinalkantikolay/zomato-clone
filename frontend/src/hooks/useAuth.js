import useAuthStore from '../store/authStore';

/**
 * Custom hook to access auth state and actions
 * Provides a clean interface for components
 */
const useAuth = () => {
  const store = useAuthStore();

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isInitialized: store.isInitialized,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    signup: store.signup,
    logout: store.logout,
    checkAuth: store.checkAuth,
    clearError: store.clearError,
  };
};

export default useAuth;
