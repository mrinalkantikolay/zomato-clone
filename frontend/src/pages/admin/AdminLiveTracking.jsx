import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import adminAPI from '../../api/admin.api';

// Leaflet CSS is already loaded by OrderTracking page
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom markers
const createEmojiIcon = (emoji, size = 30) =>
  L.divIcon({
    html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">${emoji}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const restaurantIcon = createEmojiIcon('🏪', 28);
const deliveryIcon = createEmojiIcon('🛵', 28);
const customerIcon = createEmojiIcon('📍', 24);

const STATUS_COLORS = {
  confirmed: '#3b82f6',
  preparing: '#f59e0b',
  out_for_delivery: '#8b5cf6',
};

// Demo Kolkata coordinates for simulation
const KOLKATA_CENTER = [22.5726, 88.3639];
const randomCoord = () => [
  22.5 + Math.random() * 0.15,
  88.3 + Math.random() * 0.15,
];

const AdminLiveTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const intervalRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const { data } = await adminAPI.getActiveOrders();
      const enriched = (data.data || []).map((order) => ({
        ...order,
        // Add simulated coordinates for demo
        restaurantCoord: randomCoord(),
        deliveryCoord: randomCoord(),
        customerCoord: randomCoord(),
      }));
      setOrders(enriched);
    } catch (err) {
      console.error('Failed to fetch active orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll every 10 seconds for live updates
    intervalRef.current = setInterval(fetchOrders, 10000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const activeCount = orders.filter((o) => o.status === 'out_for_delivery').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#fafafa', fontSize: '24px', fontWeight: 700, margin: 0 }}>Live Tracking</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: '#141414', border: '1px solid #262626', borderRadius: '10px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{ color: '#a3a3a3', fontSize: '13px' }}>{orders.length} active</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Stats sidebar */}
        <div style={{
          width: '280px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          {/* Status counts */}
          <div style={{ background: '#141414', border: '1px solid #262626', borderRadius: '14px', padding: '16px' }}>
            <div style={{ color: '#737373', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>Status Summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Confirmed', count: confirmedCount, color: '#3b82f6' },
                { label: 'Preparing', count: preparingCount, color: '#f59e0b' },
                { label: 'Out for Delivery', count: activeCount, color: '#8b5cf6' },
              ].map((s) => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                    <span style={{ color: '#a3a3a3', fontSize: '13px' }}>{s.label}</span>
                  </div>
                  <span style={{ color: '#fafafa', fontSize: '15px', fontWeight: 600 }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order list */}
          <div style={{ color: '#737373', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Active Orders</div>
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} style={{ height: '70px', borderRadius: '12px', background: '#1a1a1a', animation: 'pulse 1.5s infinite' }} />
            ))
          ) : orders.length === 0 ? (
            <div style={{
              background: '#141414', border: '1px solid #262626', borderRadius: '14px',
              padding: '32px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📍</div>
              <div style={{ color: '#737373', fontSize: '13px' }}>No active orders</div>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.orderId}
                onClick={() => setSelectedOrder(order)}
                style={{
                  background: selectedOrder?.orderId === order.orderId ? 'rgba(226,55,68,.08)' : '#141414',
                  border: `1px solid ${selectedOrder?.orderId === order.orderId ? 'rgba(226,55,68,.3)' : '#262626'}`,
                  borderRadius: '12px', padding: '12px 14px', cursor: 'pointer',
                  transition: 'all .2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fafafa', fontSize: '13px', fontWeight: 600 }}>
                    #{order.orderId?.toString().slice(-6).toUpperCase()}
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px',
                    background: `${STATUS_COLORS[order.status]}20`,
                    color: STATUS_COLORS[order.status],
                    textTransform: 'capitalize',
                  }}>
                    {order.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div style={{ color: '#737373', fontSize: '12px', marginTop: '4px' }}>
                  {order.customer?.name || 'Customer'} • ₹{order.totalAmount || 0}
                </div>
                <div style={{ color: '#525252', fontSize: '11px', marginTop: '2px' }}>
                  {order.restaurant?.name || 'Restaurant'}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Map */}
        <div style={{
          flex: 1, borderRadius: '16px', overflow: 'hidden',
          border: '1px solid #262626', minHeight: '400px',
        }}>
          <MapContainer
            center={KOLKATA_CENTER}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CartoDB'
            />

            {orders.map((order) => (
              <div key={order.orderId}>
                {/* Restaurant marker */}
                <Marker position={order.restaurantCoord} icon={restaurantIcon}>
                  <Popup>
                    <div style={{ color: '#333', fontSize: '13px' }}>
                      <strong>🏪 {order.restaurant?.name || 'Restaurant'}</strong><br />
                      Order #{order.orderId?.toString().slice(-6).toUpperCase()}<br />
                      Status: {order.status?.replace(/_/g, ' ')}
                    </div>
                  </Popup>
                </Marker>

                {/* Delivery marker (for out_for_delivery) */}
                {order.status === 'out_for_delivery' && (
                  <Marker position={order.deliveryCoord} icon={deliveryIcon}>
                    <Popup>
                      <div style={{ color: '#333', fontSize: '13px' }}>
                        <strong>🛵 Delivery Partner</strong><br />
                        Order #{order.orderId?.toString().slice(-6).toUpperCase()}<br />
                        ₹{order.totalAmount}
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Customer marker */}
                <Marker position={order.customerCoord} icon={customerIcon}>
                  <Popup>
                    <div style={{ color: '#333', fontSize: '13px' }}>
                      <strong>📍 {order.customer?.name || 'Customer'}</strong><br />
                      Order #{order.orderId?.toString().slice(-6).toUpperCase()}
                    </div>
                  </Popup>
                </Marker>
              </div>
            ))}
          </MapContainer>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
};

export default AdminLiveTracking;
