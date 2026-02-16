import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  MapPin,
  Phone,
  Clock,
  Package,
  ChefHat,
  Bike,
  Home,
  ArrowRight,
  Star,
  ShoppingBag,
} from 'lucide-react';

/* ─── Dummy Delivery Partner Data ─── */
const DELIVERY_PARTNERS = [
  { name: 'Rajesh Kumar', phone: '+91 98765 43210', rating: 4.8, trips: 1247, avatar: '🧑' },
  { name: 'Amit Sharma', phone: '+91 87654 32109', rating: 4.9, trips: 2103, avatar: '👨' },
  { name: 'Priya Singh', phone: '+91 76543 21098', rating: 4.7, trips: 891, avatar: '👩' },
  { name: 'Suresh Patel', phone: '+91 65432 10987', rating: 4.6, trips: 1534, avatar: '🧔' },
];

/* ─── Tracking Steps ─── */
const TRACKING_STEPS = [
  { id: 1, label: 'Order Confirmed', icon: Package, time: 'Just now' },
  { id: 2, label: 'Restaurant Preparing', icon: ChefHat, time: '~5 min' },
  { id: 3, label: 'Out for Delivery', icon: Bike, time: '~20 min' },
  { id: 4, label: 'Delivered', icon: Home, time: '~35 min' },
];

/* ═══════════════════════════════════════════════
   ORDER CONFIRMATION PAGE
   ═══════════════════════════════════════════════ */
const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { totalAmount, orderItems, address, paymentMethod } =
    location.state || {};

  // Pick a random delivery partner
  const [partner] = useState(
    () => DELIVERY_PARTNERS[Math.floor(Math.random() * DELIVERY_PARTNERS.length)]
  );

  // Animated tracking progress
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    // Simulate order progress every 8 seconds
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= 4) {
          clearInterval(interval);
          return 4;
        }
        return prev + 1;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Estimated delivery time
  const estimatedMinutes = 35 + Math.floor(Math.random() * 10);

  return (
    <main className="container-custom py-10 animate-fade-in">
      {/* ── Success Header ── */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6 animate-scale-in">
          <CheckCircle2 size={44} className="text-green-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Order Confirmed! 🎉</h1>
        <p className="text-text-secondary max-w-md mx-auto">
          Your order has been placed successfully. Sit back and relax while we prepare your meal.
        </p>
        <p className="text-xs text-text-muted mt-3 font-mono">
          Order ID: {orderId || 'N/A'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left Column ── */}
        <div className="lg:col-span-8 space-y-8">

          {/* ── Live Tracking Progress ── */}
          <section className="bg-surface border border-border rounded-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Live Tracking</h2>
              <div className="flex items-center gap-2 text-primary">
                <Clock size={16} />
                <span className="text-sm font-bold">ETA: {estimatedMinutes} min</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-8">
              {/* Background Line */}
              <div className="absolute top-6 left-6 right-6 h-1 bg-border rounded-full" />
              {/* Active Line */}
              <div
                className="absolute top-6 left-6 h-1 bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${((activeStep - 1) / 3) * (100 - 8)}%` }}
              />

              {/* Steps */}
              <div className="relative flex justify-between">
                {TRACKING_STEPS.map((step) => {
                  const Icon = step.icon;
                  const isActive = step.id <= activeStep;
                  const isCurrent = step.id === activeStep;

                  return (
                    <div key={step.id} className="flex flex-col items-center gap-2 z-10">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isActive
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-surface border-2 border-border text-text-muted'
                        } ${isCurrent ? 'scale-110 ring-4 ring-primary/20' : ''}`}
                      >
                        {isActive && step.id < activeStep ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Icon size={20} />
                        )}
                      </div>
                      <div className="text-center">
                        <p className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                          {step.label}
                        </p>
                        <p className="text-[10px] text-text-muted">{step.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Animated Map Placeholder */}
            <div className="relative h-48 md:h-64 bg-background rounded-xl overflow-hidden border border-border">
              {/* Animated gradient to simulate map */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />

              {/* Grid lines to simulate map */}
              <div className="absolute inset-0 opacity-10">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute w-full h-px bg-text-secondary"
                    style={{ top: `${(i + 1) * 12.5}%` }}
                  />
                ))}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute h-full w-px bg-text-secondary"
                    style={{ left: `${(i + 1) * 8.33}%` }}
                  />
                ))}
              </div>

              {/* Restaurant Pin */}
              <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/40">
                  <ChefHat size={18} />
                </div>
                <span className="text-[10px] font-bold text-primary mt-1 bg-surface px-2 rounded">Restaurant</span>
              </div>

              {/* Moving Delivery Bike */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-[8000ms] ease-linear flex flex-col items-center"
                style={{
                  top: `${25 + ((activeStep - 1) / 3) * 50}%`,
                  left: `${25 + ((activeStep - 1) / 3) * 50}%`,
                }}
              >
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-yellow-500/40 animate-pulse">
                  <Bike size={18} />
                </div>
                <span className="text-[10px] font-bold text-yellow-500 mt-1 bg-surface px-2 rounded">
                  {partner.name.split(' ')[0]}
                </span>
              </div>

              {/* Your Location Pin */}
              <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 flex flex-col items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/40">
                  <Home size={18} />
                </div>
                <span className="text-[10px] font-bold text-green-500 mt-1 bg-surface px-2 rounded">You</span>
              </div>

              {/* Dashed Path */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d="M25,25 Q50,30 50,50 Q50,70 75,75"
                  fill="none"
                  stroke="var(--color-primary, #ef4444)"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                  opacity="0.5"
                />
              </svg>
            </div>
          </section>

          {/* ── Order Items Summary ── */}
          {orderItems && orderItems.length > 0 && (
            <section className="bg-surface border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBag size={22} className="text-primary" />
                <h2 className="text-xl font-bold">Order Items</h2>
              </div>
              <div className="divide-y divide-border">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-text-secondary">
                        Qty: {item.quantity || 1} × ₹{item.price}
                      </p>
                    </div>
                    <span className="font-bold">₹{item.price * (item.quantity || 1)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Right Sidebar ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* ── Delivery Partner Card ── */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
              Delivery Partner
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-3xl">
                {partner.avatar}
              </div>
              <div>
                <p className="font-bold text-lg">{partner.name}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{partner.rating}</span>
                  <span className="text-text-muted">• {partner.trips} trips</span>
                </div>
              </div>
            </div>
            <a
              href={`tel:${partner.phone}`}
              className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary font-semibold py-3 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Phone size={16} />
              {partner.phone}
            </a>
          </div>

          {/* ── Order Summary ── */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
              Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-text-secondary text-sm">
                <span>Payment Method</span>
                <span className="font-medium text-text-primary">{paymentMethod || 'Online'}</span>
              </div>
              <div className="flex justify-between text-text-secondary text-sm">
                <span>Estimated Delivery</span>
                <span className="font-medium text-text-primary">{estimatedMinutes} min</span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between">
                <span className="font-bold">Total Paid</span>
                <span className="text-xl font-bold text-primary">₹{totalAmount || 0}</span>
              </div>
            </div>
          </div>

          {/* ── Delivery Address ── */}
          {address && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
                Delivery Address
              </h3>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{address.label || 'Home'}</p>
                  <p className="text-sm text-text-secondary">
                    {address.street}, {address.city} {address.pincode}
                  </p>
                  {address.instructions && (
                    <p className="text-xs text-text-muted mt-1 italic">Note: {address.instructions}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all group"
          >
            Back to Home
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmation;
