import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  User,
  Mail,
  Phone,
  Edit3,
  Save,
  X,
  LogOut,
  Package,
  MapPin,
  Calendar,
  Shield,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useOrderStore from '../store/orderStore';

/* ═══════════════════════════════════════════════
   PROFILE PAGE
   ═══════════════════════════════════════════════ */
const Profile = () => {
  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const { orders, pagination, fetchOrders } = useOrderStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  // Fetch orders for stats
  useEffect(() => {
    fetchOrders(1, 5);
  }, [fetchOrders]);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset({ name: user.name, phone: user.phone || '' });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } else {
      toast.error(result.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    reset({ name: user?.name || '', phone: user?.phone || '' });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  // Read saved addresses from localStorage (safe parse)
  const savedAddresses = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('savedAddresses') || '[]');
    } catch {
      return [];
    }
  }, []);

  if (!user) {
    return (
      <main className="container-custom py-16 text-center animate-fade-in">
        <AlertCircle size={48} className="text-text-muted mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Not logged in</h2>
        <p className="text-text-secondary mb-6">Please log in to view your profile.</p>
        <Link to="/login" className="btn-primary">
          Go to Login
        </Link>
      </main>
    );
  }

  return (
    <main className="container-custom py-10 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* ── Profile Header ── */}
        <section className="bg-surface border border-border rounded-2xl overflow-hidden mb-8">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-primary via-primary/80 to-accent relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2EpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
          </div>

          {/* Avatar + Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12">
              {/* Avatar */}
              <div className="w-24 h-24 bg-surface border-4 border-surface rounded-full flex items-center justify-center text-4xl shadow-xl relative z-10">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="bg-primary/10 text-primary w-full h-full rounded-full flex items-center justify-center font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>

              <div className="flex-1 pt-2">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-text-secondary text-sm flex items-center gap-2 mt-1">
                  <Calendar size={14} />
                  Member since {memberSince}
                </p>
              </div>

              {/* Edit / Logout */}
              <div className="flex items-center gap-3">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 border border-border hover:border-primary text-text-secondary hover:text-primary px-4 py-2 rounded-lg transition-all text-sm font-semibold"
                  >
                    <Edit3 size={16} />
                    Edit Profile
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 border border-red-500/20 text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all text-sm font-semibold"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Column: Profile Info ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Details */}
            <section className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <User size={20} className="text-primary" />
                Account Details
              </h2>

              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Full Name
                    </label>
                    <input
                      {...register('name', {
                        required: 'Name is required',
                        minLength: { value: 2, message: 'Min 2 characters' },
                      })}
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="Your full name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Phone Number
                    </label>
                    <input
                      {...register('phone', {
                        pattern: {
                          value: /^[+]?[\d\s-]{7,15}$/,
                          message: 'Enter a valid phone number',
                        },
                      })}
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="+91 98765 43210"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Email
                    </label>
                    <div className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-text-muted flex items-center gap-2">
                      <Mail size={16} />
                      {user.email}
                      <span className="ml-auto text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-6 rounded-lg transition-all disabled:opacity-60"
                    >
                      <Save size={16} />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center gap-2 border border-border hover:border-red-500 text-text-secondary hover:text-red-500 font-medium py-2.5 px-6 rounded-lg transition-all"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {[
                    { icon: User, label: 'Name', value: user.name },
                    { icon: Mail, label: 'Email', value: user.email },
                    { icon: Phone, label: 'Phone', value: user.phone || 'Not set' },
                    { icon: Shield, label: 'Role', value: user.role || 'user' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-4 py-3 border-b border-border last:border-0"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
                        <p className="font-medium capitalize">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Saved Addresses */}
            <section className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-primary" />
                Saved Addresses
              </h2>
              {savedAddresses.length === 0 ? (
                <p className="text-text-secondary text-sm py-4">
                  No saved addresses yet. Add one during checkout!
                </p>
              ) : (
                <div className="space-y-3">
                  {savedAddresses.slice(0, 5).map((addr, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 py-3 border-b border-border last:border-0"
                    >
                      <MapPin size={16} className="text-text-muted mt-1 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium">{addr.label || `Address ${idx + 1}`}</p>
                        <p className="text-text-secondary">
                          {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Right Column: Stats + Quick Links ── */}
          <div className="space-y-6">
            {/* Order Stats */}
            <section className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
                Order Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl">
                  <div>
                    <p className="text-2xl font-bold text-primary">{pagination.total || 0}</p>
                    <p className="text-xs text-text-muted">Total Orders</p>
                  </div>
                  <Package size={28} className="text-primary/40" />
                </div>

                {orders.length > 0 && (
                  <div className="p-4 bg-surface-hover rounded-xl">
                    <p className="text-xs text-text-muted mb-1">Last Order</p>
                    <p className="font-semibold text-sm">
                      {new Date(orders[0]?.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      ₹{orders[0]?.totalAmount?.toFixed(2)} •{' '}
                      {orders[0]?.items?.length || 0} items
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Links */}
            <section className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
                Quick Links
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'My Orders', to: '/orders', icon: Package },
                  { label: 'Browse Restaurants', to: '/restaurants', icon: MapPin },
                ].map(({ label, to, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors group"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <span className="font-medium text-sm flex-1">{label}</span>
                    <ChevronRight size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </section>

            {/* Account Security */}
            <section className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield size={16} />
                Account Security
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Your account is secured with JWT refresh token rotation.
              </p>
              <button
                disabled
                className="w-full text-sm border border-border text-text-muted px-4 py-2.5 rounded-lg cursor-not-allowed"
              >
                Change Password (Coming Soon)
              </button>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
