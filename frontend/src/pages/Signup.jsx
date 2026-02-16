import { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ChefHat } from 'lucide-react';
import useAuth from '../hooks/useAuth';

/**
 * Password strength calculator
 * Returns { score: 0-5, label, color }
 */
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;

  const levels = [
    { label: '', color: '' },
    { label: 'Very Weak', color: 'bg-red-500' },
    { label: 'Weak', color: 'bg-orange-500' },
    { label: 'Fair', color: 'bg-yellow-500' },
    { label: 'Strong', color: 'bg-green-400' },
    { label: 'Very Strong', color: 'bg-green-500' },
  ];

  return { score, ...levels[score] };
};

/** Shared input class string — single source of truth */
const INPUT_CLASS =
  'w-full bg-background border border-border rounded-lg px-4 py-3 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted/40 hover:border-border/80';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { signup, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const strength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

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
      const result = await signup(formData);
      if (result?.success) {
        navigate('/');
      }
    },
    [formData, isLoading, signup, navigate]
  );

  const isSubmitDisabled = isLoading || strength.score < 3;

  return (
    <>
      {/* SEO — page title */}
      <title>Sign Up | FoodieHub</title>
      <meta name="description" content="Create your FoodieHub account and start ordering delicious meals from the best local restaurants." />

      <div className="flex min-h-screen">
        {/* ==============================
            LEFT PANEL — Branding & Image
            ============================== */}
        <div
          className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center overflow-hidden bg-background border-r border-border"
          aria-hidden="true"
        >
          {/* Background food image — full visibility with overlay gradients for readability */}
          <div className="absolute inset-0">
            <img
              alt=""
              className="object-cover w-full h-full transition-all duration-700"
              src="/screen.jpg"
              loading="eager"
              decoding="async"
            />
            {/* Multi-layer overlay for depth & text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
          </div>

          {/* Center content overlay with entrance animation */}
          <div className="relative z-10 p-12 max-w-lg text-center animate-fade-in">
            <div className="flex items-center justify-center mb-8">
              <ChefHat size={48} className="text-primary mr-2 drop-shadow-lg" />
              <span className="text-4xl font-bold tracking-tighter drop-shadow-lg">
                Foodie<span className="text-primary">Hub</span>
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-4 drop-shadow-md">Join the foodie community</h1>
            <p className="text-white/70 text-lg drop-shadow-sm">
              Discover the best culinary experiences delivered right to your
              doorstep. From local hidden gems to world-class dining.
            </p>
          </div>

          {/* Floating testimonial card — glassmorphism */}
          <div className="absolute bottom-10 left-10 p-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center gap-4 max-w-xs shadow-2xl animate-slide-up">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/20 shrink-0 flex items-center justify-center ring-2 ring-primary/30">
              <span className="text-2xl" aria-hidden="true">👤</span>
            </div>
            <figure>
              <blockquote>
                <p className="text-sm font-medium text-white/90">
                  &ldquo;Best food delivery app I&apos;ve used in years!&rdquo;
                </p>
              </blockquote>
              <figcaption className="text-xs text-white/50 mt-0.5">— Alex Rivera</figcaption>
            </figure>
          </div>
        </div>

        {/* ==============================
            RIGHT PANEL — Signup Form
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
              <h2 className="text-3xl font-bold mb-2">Create Account</h2>
              <p className="text-text-muted">
                Start your culinary journey with us today.
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
              {/* Full Name */}
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium mb-1.5 text-text-muted">
                  Full Name
                </label>
                <input
                  type="text"
                  id="signup-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  autoComplete="name"
                  className={INPUT_CLASS}
                />
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium mb-1.5 text-text-muted">
                  Email Address
                </label>
                <input
                  type="email"
                  id="signup-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  autoComplete="email"
                  className={INPUT_CLASS}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium mb-1.5 text-text-muted">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="signup-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    aria-describedby={formData.password ? 'password-strength' : undefined}
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

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="animate-fade-in" id="password-strength">
                    <div className="mt-3 flex gap-2" role="meter" aria-valuenow={strength.score} aria-valuemin={0} aria-valuemax={5} aria-label={`Password strength: ${strength.label}`}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-sm transition-all duration-300 ${
                            level <= strength.score
                              ? strength.color
                              : 'bg-background border border-border'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] mt-1.5 text-text-muted/60 uppercase tracking-widest font-semibold">
                      Security: {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Signup Button */}
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-primary/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-primary/30"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    Creating Account...
                  </span>
                ) : (
                  'Sign Up'
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
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {/* Login Redirect */}
            <p className="mt-8 text-center text-text-muted text-sm">
              Already have an account?
              <Link to="/login" className="text-primary font-semibold hover:underline ml-1">
                Login
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

export default Signup;
