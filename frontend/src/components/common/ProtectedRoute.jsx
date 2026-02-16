import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loader from './Loader';

/**
 * ProtectedRoute — Guards authenticated routes
 *
 * When unauthenticated, redirects to /login?returnTo=<current_path>
 * so Login can redirect back after success.
 */
const ProtectedRoute = ({ role, redirectTo = '/login' }) => {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const location = useLocation();

  // Wait until auth check completes before redirecting
  if (!isInitialized) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    // Pass current path so Login can redirect back after success
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${redirectTo}?returnTo=${returnTo}`} replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
