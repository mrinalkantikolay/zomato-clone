import { useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ChefHat, Users } from 'lucide-react';
import useAuth from '../hooks/useAuth';

/** Shared input class string — single source of truth */
const INPUT_CLASS =
  'w-full bg-background border border-border rounded-lg px-4 py-3 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted/40 hover:border-border/80';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';

  const handleChange = useCallback(
    (e) => {
      clearError();
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    [clearError]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isLoading) return; // Prevent double-submit
      const result = await login(formData);
      if (result?.success) {
        // Redirect admin/owner to admin panel, regular users to returnTo
        const role = result.user?.role;
        if (role === 'admin' || role === 'restaurant_owner') {
          navigate('/admin');
        } else {
          navigate(decodeURIComponent(returnTo));
        }
      }
    },
    [formData, isLoading, login, navigate, returnTo]
  );

  return (
    <>
      {/* SEO — page title */}
      <title>Login | FoodieHub</title>
      <meta name="description" content="Log in to your FoodieHub account to order delicious food from the best local restaurants." />

      <div className="flex min-h-screen">
        {/* ==============================
            LEFT PANEL — Branding & Image
            ============================== */}
        <div
          className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center overflow-hidden bg-background border-r border-border"
          aria-hidden="true"
        >
          {/* Background food image — full visibility with overlay gradients */}
          <div className="absolute inset-0">
            <img
              alt=""
              className="object-cover w-full h-full transition-all duration-700"
              src="/login.jpg"
              loading="eager"
              decoding="async"
            />
            {/* Multi-layer overlay for depth & text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
          </div>

          {/* Center content overlay */}
          <div className="relative z-10 p-12 max-w-lg text-center animate-fade-in">
            <div className="flex items-center justify-center mb-8">
              <ChefHat size={48} className="text-primary mr-2 drop-shadow-lg" />
              <span className="text-4xl font-bold tracking-tighter drop-shadow-lg">
                Foodie<span className="text-primary">Hub</span>
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-4 drop-shadow-md">Welcome back!</h1>
            <p className="text-white/70 text-lg drop-shadow-sm">
              Join thousands of food lovers and get the best meals delivered from
              your favorite local restaurants in minutes.
            </p>
          </div>

          {/* Floating trusted-by card — glassmorphism */}
          <div className="absolute bottom-10 left-10 p-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center gap-4 max-w-xs shadow-2xl animate-slide-up">
            {/* Avatar stack */}
            <div className="flex -space-x-2.5">
              {['🧑‍🍳', '👩‍🦰', '👨‍💼'].map((avatar, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full bg-surface border-2 border-white/20 flex items-center justify-center text-lg"
                >
                  <span aria-hidden="true">{avatar}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-white/50" aria-hidden="true" />
              <span className="text-xs font-semibold text-white/70 tracking-widest uppercase">
                Trusted by 10k+ users
              </span>
            </div>
          </div>
        </div>

        {/* ==============================
            RIGHT PANEL — Login Form
            ============================== */}
        <main className="w-full lg:w-1/2 flex items-center justify-center bg-surface p-8 sm:p-12 md:p-16 lg:p-24 overflow-y-auto">
          <div className="w-full max-w-md animate-fade-in">
            {/* Mobile Logo (visible only on small screens) */}
            <div className="flex items-center justify-center mb-8 lg:hidden">
              <ChefHat size={32} className="text-primary mr-2" />
              <span className="text-2xl font-bold tracking-tighter">
                Foodie<span className="text-primary">Hub</span>
              </span>
            </div>

            {/* Heading */}
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold mb-2">Login</h2>
              <p className="text-text-muted">
                Enter your credentials to access your account
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg px-4 py-3 mb-5 animate-slide-down"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium mb-1.5 text-text-muted">
                  Email Address
                </label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. name@email.com"
                  required
                  autoComplete="email"
                  className={INPUT_CLASS}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="login-password" className="block text-sm font-medium text-text-muted">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:text-primary-hover font-medium hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className={`${INPUT_CLASS} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-[18px] h-[18px] rounded border border-border bg-background peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-text-muted group-hover:text-text-primary transition-colors">
                  Remember me
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-primary/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-primary/30 uppercase tracking-wide"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    Logging in...
                  </span>
                ) : (
                  'LOGIN'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8" role="separator">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-surface text-text-muted uppercase tracking-wider text-xs font-semibold">
                  Or
                </span>
              </div>
            </div>

            {/* Social Login — Google */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border border-border bg-background/50 hover:bg-border/50 text-text-primary py-3 rounded-lg transition-all font-medium hover:border-border/80"
              aria-label="Continue with Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Signup link */}
            <p className="mt-8 text-center text-text-muted text-sm">
              Don&apos;t have an account?
              <Link to="/signup" className="text-primary font-semibold hover:underline ml-1">
                Sign Up
              </Link>
            </p>

            {/* Footer Links */}
            <div className="mt-12 flex justify-center gap-6 text-[10px] text-text-muted/40 uppercase tracking-widest font-bold">
              <a href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Login;
