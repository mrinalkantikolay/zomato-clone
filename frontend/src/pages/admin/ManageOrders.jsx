import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminAPI from '../../api/admin.api';

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
const STATUS_COLORS = {
  pending: { bg: 'rgba(107,114,128,.15)', color: '#9ca3af' },
  confirmed: { bg: 'rgba(59,130,246,.15)', color: '#3b82f6' },
  preparing: { bg: 'rgba(245,158,11,.15)', color: '#f59e0b' },
  out_for_delivery: { bg: 'rgba(139,92,246,.15)', color: '#8b5cf6' },
  delivered: { bg: 'rgba(34,197,94,.15)', color: '#22c55e' },
  cancelled: { bg: 'rgba(239,68,68,.15)', color: '#ef4444' },
};

const TABS = [
  { key: '', label: 'All Orders' },
  { key: 'pending', label: '🔔 New Orders' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [tab, setTab] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const limit = 10;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getOrders(page, limit, tab);
      setOrders(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, tab]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      toast.success(`Order → ${newStatus.replace(/_/g, ' ')}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const totalPages = Math.ceil(total / limit);

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
      ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <h1 style={{ color: '#fafafa', fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Manage Orders</h1>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1); }}
            style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
              border: 'none', cursor: 'pointer', fontWeight: tab === t.key ? 600 : 400,
              background: tab === t.key ? 'rgba(226,55,68,.15)' : '#1a1a1a',
              color: tab === t.key ? '#e23744' : '#a3a3a3',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: '90px', borderRadius: '12px', background: '#1a1a1a', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          background: '#141414', borderRadius: '16px', border: '1px solid #262626',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
          <div style={{ color: '#a3a3a3' }}>No orders found{tab ? ` with status "${tab.replace(/_/g, ' ')}"` : ''}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {orders.map((order) => {
            const s = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            const nextStatus = getNextStatus(order.status);

            return (
              <div
                key={order._id}
                style={{
                  background: '#141414', border: '1px solid #262626',
                  borderRadius: '14px', padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Order info */}
                <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <div style={{ color: '#fafafa', fontSize: '15px', fontWeight: 600 }}>
                    #{order._id?.slice(-6).toUpperCase()}
                  </div>
                  <div style={{ color: '#737373', fontSize: '13px', marginTop: '2px' }}>
                    {order.userId?.name || 'Unknown'} • {order.userId?.email || ''}
                  </div>
                  <div style={{ color: '#525252', fontSize: '12px', marginTop: '2px' }}>
                    {formatDate(order.createdAt)}
                  </div>
                </div>

                {/* Items summary */}
                <div style={{ flex: '0 0 auto', color: '#a3a3a3', fontSize: '13px' }}>
                  {order.items?.length || 0} items
                </div>

                {/* Amount */}
                <div style={{ flex: '0 0 auto', color: '#fafafa', fontWeight: 600, fontSize: '15px' }}>
                  ₹{order.totalAmount?.toLocaleString('en-IN') || 0}
                </div>

                {/* Status badge */}
                <div style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                  fontWeight: 600, background: s.bg, color: s.color,
                  textTransform: 'capitalize',
                }}>
                  {order.status?.replace(/_/g, ' ')}
                </div>

                {/* Action button */}
                {nextStatus && order.status !== 'cancelled' && (
                  <button
                    onClick={() => handleStatusUpdate(order._id, nextStatus)}
                    disabled={updatingId === order._id}
                    style={{
                      background: order.status === 'pending'
                        ? 'linear-gradient(135deg, #22c55e, #4ade80)'
                        : 'linear-gradient(135deg, #e23744, #ff6b6b)',
                      color: '#fff', border: 'none', padding: '8px 14px',
                      borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
                      fontWeight: 600, whiteSpace: 'nowrap',
                      opacity: updatingId === order._id ? 0.5 : 1,
                    }}
                  >
                    {updatingId === order._id
                      ? '...'
                      : order.status === 'pending'
                        ? '✅ Confirm Order'
                        : `→ ${nextStatus.replace(/_/g, ' ')}`
                    }
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 14px', borderRadius: '8px', border: 'none',
              background: '#262626', color: page === 1 ? '#525252' : '#fafafa',
              cursor: page === 1 ? 'default' : 'pointer', fontSize: '13px',
            }}
          >
            ← Prev
          </button>
          <div style={{ display: 'flex', alignItems: 'center', color: '#a3a3a3', fontSize: '13px', padding: '0 8px' }}>
            {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: '8px 14px', borderRadius: '8px', border: 'none',
              background: '#262626', color: page === totalPages ? '#525252' : '#fafafa',
              cursor: page === totalPages ? 'default' : 'pointer', fontSize: '13px',
            }}
          >
            Next →
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
};

export default ManageOrders;
