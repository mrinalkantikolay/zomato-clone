import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Package,
  ChefHat,
  Bike,
  Home,
  CheckCircle2,
  Clock,
  Phone,
  Star,
  ArrowLeft,
  AlertCircle,
  Navigation,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useOrderStore from '../store/orderStore';
import useSocket from '../hooks/useSocket';

/* ─── Fix Leaflet default marker icons (Vite/Webpack issue) ─── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ─── Custom Marker Icons ─── */
const createIcon = (emoji, bgColor) =>
  L.divIcon({
    html: `<div style="
      background: ${bgColor};
      width: 40px; height: 40px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 12px ${bgColor}66;
      border: 3px solid white;
    ">${emoji}</div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -42],
  });

const restaurantIcon = createIcon('🍽️', '#ef4444');
const deliveryIcon = createIcon('🛵', '#f59e0b');
const customerIcon = createIcon('🏠', '#22c55e');

/* ─── Kolkata demo coordinates ─── */
const RESTAURANT_COORDS = [22.5726, 88.3639]; // Park Street area
const CUSTOMER_COORDS = [22.5626, 88.3839]; // Salt Lake area

/* ─── Interpolate path for simulation ─── */
const generatePath = (start, end, steps = 20) => {
  const path = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    path.push([
      start[0] + (end[0] - start[0]) * t + (Math.random() - 0.5) * 0.003,
      start[1] + (end[1] - start[1]) * t + (Math.random() - 0.5) * 0.003,
    ]);
  }
  return path;
};

/* ─── Status Steps Config ─── */
const TRACKING_STEPS = [
  { id: 'confirmed', label: 'Order Confirmed', icon: Package, time: 'Just now' },
  { id: 'preparing', label: 'Preparing Food', icon: ChefHat, time: '~10 min' },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: Bike, time: '~25 min' },
  { id: 'delivered', label: 'Delivered', icon: Home, time: '~40 min' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

/* ─── Map Auto-fit Component ─── */
const FitBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, bounds]);
  return null;
};

/* ─── Delivery Partner Card ─── */
const DUMMY_PARTNERS = [
  { name: 'Rajesh Kumar', phone: '+91 98765 43210', rating: 4.8, trips: 1247, avatar: '🧑' },
  { name: 'Amit Sharma', phone: '+91 87654 32109', rating: 4.9, trips: 2103, avatar: '👨' },
  { name: 'Priya Singh', phone: '+91 76543 21098', rating: 4.7, trips: 891, avatar: '👩' },
];

/* ─── Skeleton ─── */
const SkeletonTracking = () => (
  <main className="container-custom py-10 animate-fade-in">
    <div className="skeleton h-8 w-48 rounded-lg mb-8" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="skeleton h-[400px] rounded-xl" />
        <div className="skeleton h-48 rounded-xl" />
      </div>
      <div className="lg:col-span-4 space-y-6">
        <div className="skeleton h-40 rounded-xl" />
        <div className="skeleton h-48 rounded-xl" />
      </div>
    </div>
  </main>
);

/* ═══════════════════════════════════════════════
   ORDER TRACKING PAGE
   ═══════════════════════════════════════════════ */
const OrderTracking = () => {
  const { id: orderId } = useParams();
  const {
    trackingData,
    isTrackingLoading,
    error,
    fetchTracking,
    updateTrackingStatus,
    updateDeliveryLocation,
    clearTracking,
  } = useOrderStore();
  const { joinOrder, leaveOrder, onStatusUpdate, onLocationUpdate, onDelivered } = useSocket();

  // Simulated delivery position
  const [deliveryPos, setDeliveryPos] = useState(RESTAURANT_COORDS);
  const [simulatedStatus, setSimulatedStatus] = useState('confirmed');
  const pathRef = useRef(generatePath(RESTAURANT_COORDS, CUSTOMER_COORDS));
  const stepRef = useRef(0);

  // Random delivery partner
  const [partner] = useState(
    () => DUMMY_PARTNERS[Math.floor(Math.random() * DUMMY_PARTNERS.length)]
  );

  // Fetch tracking data on mount
  useEffect(() => {
    if (orderId) {
      fetchTracking(orderId);
    }
    return () => clearTracking();
  }, [orderId, fetchTracking, clearTracking]);

  // Socket.IO — join order room and listen for events
  useEffect(() => {
    if (!orderId) return;

    joinOrder(orderId);

    const cleanupStatus = onStatusUpdate((data) => {
      updateTrackingStatus(data);
      setSimulatedStatus(data.status);
    });

    const cleanupLocation = onLocationUpdate((data) => {
      updateDeliveryLocation(data);
      setDeliveryPos([data.location.latitude, data.location.longitude]);
    });

    const cleanupDelivered = onDelivered(() => {
      setSimulatedStatus('delivered');
      setDeliveryPos(CUSTOMER_COORDS);
    });

    return () => {
      leaveOrder(orderId);
      cleanupStatus();
      cleanupLocation();
      cleanupDelivered();
    };
  }, [orderId, joinOrder, leaveOrder, onStatusUpdate, onLocationUpdate, onDelivered, updateTrackingStatus, updateDeliveryLocation]);

  // Simulate delivery movement (demo only — in production, Socket.IO pushes real GPS)
  useEffect(() => {
    if (simulatedStatus === 'delivered' || simulatedStatus === 'cancelled') return;

    const path = pathRef.current;
    const interval = setInterval(() => {
      stepRef.current += 1;

      if (stepRef.current >= path.length) {
        setSimulatedStatus('delivered');
        setDeliveryPos(CUSTOMER_COORDS);
        clearInterval(interval);
        return;
      }

      setDeliveryPos(path[stepRef.current]);

      // Progress status based on journey progress
      const progress = stepRef.current / path.length;
      if (progress > 0.15 && progress <= 0.4) {
        setSimulatedStatus('preparing');
      } else if (progress > 0.4) {
        setSimulatedStatus('out_for_delivery');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [simulatedStatus]);

  // Current status from backend or simulation
  const currentStatus = trackingData?.status || simulatedStatus;
  const currentStatusIdx = STATUS_ORDER.indexOf(currentStatus);

  // Estimated delivery time
  const eta = useMemo(() => {
    if (trackingData?.estimatedDeliveryTime) {
      const diff = new Date(trackingData.estimatedDeliveryTime) - Date.now();
      return Math.max(0, Math.round(diff / 60000));
    }
    const step = stepRef.current;
    const total = pathRef.current.length;
    return Math.max(0, Math.round(((total - step) / total) * 40));
  }, [trackingData, deliveryPos]);

  // Map bounds
  const bounds = useMemo(
    () => [RESTAURANT_COORDS, deliveryPos, CUSTOMER_COORDS],
    [deliveryPos]
  );

  if (isTrackingLoading) return <SkeletonTracking />;

  if (error) {
    return (
      <main className="container-custom py-16 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-danger/10 rounded-full mb-4">
          <AlertCircle size={32} className="text-danger" />
        </div>
        <h2 className="text-xl font-bold mb-2">Tracking unavailable</h2>
        <p className="text-text-secondary mb-6">{error}</p>
        <Link to="/orders" className="btn-primary">
          Back to Orders
        </Link>
      </main>
    );
  }

  return (
    <main className="container-custom py-10 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/orders"
          className="p-2 rounded-lg border border-border hover:border-primary hover:text-primary transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Order Tracking</h1>
          <p className="text-text-secondary text-sm font-mono">
            #{(orderId || '').slice(-8).toUpperCase()}
          </p>
        </div>
        {currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
          <div className="ml-auto flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl">
            <Clock size={16} className="animate-pulse" />
            <span className="font-bold text-sm">ETA: {eta} min</span>
          </div>
        )}
        {currentStatus === 'delivered' && (
          <div className="ml-auto flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-xl">
            <CheckCircle2 size={16} />
            <span className="font-bold text-sm">Delivered!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left: Map + Timeline ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Map */}
          <section className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="h-[400px] md:h-[480px]">
              <MapContainer
                center={[22.5676, 88.3739]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds bounds={bounds} />

                {/* Restaurant Marker */}
                <Marker position={RESTAURANT_COORDS} icon={restaurantIcon}>
                  <Popup>
                    <strong>Restaurant</strong>
                    <br />
                    Preparing your order
                  </Popup>
                </Marker>

                {/* Delivery Partner Marker */}
                {currentStatus !== 'delivered' && (
                  <Marker position={deliveryPos} icon={deliveryIcon}>
                    <Popup>
                      <strong>{partner.name}</strong>
                      <br />
                      Your delivery partner
                    </Popup>
                  </Marker>
                )}

                {/* Customer Marker */}
                <Marker position={CUSTOMER_COORDS} icon={customerIcon}>
                  <Popup>
                    <strong>Your Location</strong>
                    <br />
                    Delivery destination
                  </Popup>
                </Marker>

                {/* Route Line */}
                <Polyline
                  positions={[RESTAURANT_COORDS, deliveryPos, CUSTOMER_COORDS]}
                  pathOptions={{
                    color: '#ef4444',
                    weight: 3,
                    opacity: 0.7,
                    dashArray: '10, 10',
                  }}
                />
              </MapContainer>
            </div>
          </section>

          {/* Status Timeline */}
          <section className="bg-surface border border-border rounded-xl p-8">
            <h2 className="text-xl font-bold mb-6">Order Status</h2>

            <div className="relative">
              {/* Background Line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border" />

              <div className="space-y-8">
                {TRACKING_STEPS.map((step, idx) => {
                  const stepIdx = STATUS_ORDER.indexOf(step.id);
                  const isComplete = currentStatusIdx > stepIdx;
                  const isCurrent = currentStatusIdx === stepIdx;
                  const Icon = step.icon;

                  return (
                    <div key={step.id} className="relative flex items-start gap-5">
                      {/* Icon */}
                      <div
                        className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                          isComplete
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                            : isCurrent
                              ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20 animate-pulse'
                              : 'bg-surface border-2 border-border text-text-muted'
                        }`}
                      >
                        {isComplete ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                      </div>

                      {/* Text */}
                      <div className="pt-2">
                        <p
                          className={`font-bold ${
                            isComplete || isCurrent ? 'text-text-primary' : 'text-text-muted'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">{step.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 self-start">
          {/* Delivery Partner */}
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

          {/* Live Location */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
              Live Location
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Navigation size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {deliveryPos[0].toFixed(4)}, {deliveryPos[1].toFixed(4)}
                </p>
                <p className="text-xs text-text-muted">
                  {currentStatus === 'delivered' ? 'Delivered' : 'Updating every 5s'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          {trackingData && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
                Order Summary
              </h3>
              <div className="space-y-2 mb-4">
                {trackingData.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">
                      {item.quantity || 1}× {item.name}
                    </span>
                    <span className="font-medium">₹{item.price * (item.quantity || 1)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-border flex justify-between">
                <span className="font-bold">Total</span>
                <span className="text-lg font-bold text-primary">
                  ₹{trackingData.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <Link
            to="/orders"
            className="w-full flex items-center justify-center gap-2 border border-border hover:border-primary text-text-secondary hover:text-primary font-medium py-3 rounded-xl transition-all"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>
        </div>
      </div>
    </main>
  );
};

export default OrderTracking;
