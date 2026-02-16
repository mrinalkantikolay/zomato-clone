import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useLenis from './hooks/useLenis';
import useAuth from './hooks/useAuth';
import Loader from './components/common/Loader';

// Layouts
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages — Auth (no layout)
import Login from './pages/Login';
import Signup from './pages/Signup';

// Pages — Public
import Home from './pages/Home';
import Restaurants from './pages/Restaurants';
import RestaurantDetail from './pages/RestaurantDetail';

// Pages — Protected
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderConfirmation from './pages/OrderConfirmation';

function App() {
  useLenis();
  const { checkAuth, isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  // Show loader until auth check completes (prevents flash of login page)
  if (!isInitialized) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#141414',
            color: '#fafafa',
            border: '1px solid #262626',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#fafafa' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fafafa' },
          },
        }}
      />

      <Routes>
        {/* ============================================
            AUTH ROUTES — No Navbar/Footer
            ============================================ */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
        />

        {/* ============================================
            PUBLIC ROUTES — With MainLayout
            ============================================ */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* ============================================
            PROTECTED ROUTES — Requires login
            ============================================ */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurants/:id" element={<RestaurantDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment/:orderId" element={<Payment />} />
            <Route path="/orders/:orderId/confirm" element={<OrderConfirmation />} />
            {/* Phase 3:
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orders/:id/track" element={<OrderTracking />} />
            <Route path="/profile" element={<Profile />} />
            */}
          </Route>
        </Route>

        {/* ============================================
            ADMIN ROUTES — Requires admin role
            ============================================ */}
        <Route element={<ProtectedRoute role="admin" />}>
          {/* Phase 4: Admin layout + pages */}
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
