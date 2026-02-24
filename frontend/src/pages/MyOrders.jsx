import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ChefHat,
  Bike,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import useOrderStore from '../store/orderStore';

/* ─── Status Config ─── */
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-500/10 text-yellow-500',
    dot: 'bg-yellow-500',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-500/10 text-blue-500',
    dot: 'bg-blue-500',
    icon: CheckCircle2,
  },
  preparing: {
    label: 'Preparing',
    color: 'bg-orange-500/10 text-orange-500',
    dot: 'bg-orange-500',
    icon: ChefHat,
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'bg-purple-500/10 text-purple-500',
    dot: 'bg-purple-500',
    icon: Bike,
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-500/10 text-green-500',
    dot: 'bg-green-500',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-500/10 text-red-500',
    dot: 'bg-red-500',
    icon: XCircle,
  },
};

/* ─── Skeleton Card ─── */
const SkeletonCard = () => (
  <div className="bg-surface border border-border rounded-xl p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="skeleton h-5 w-32 rounded-lg" />
      <div className="skeleton h-6 w-24 rounded-full" />
    </div>
    <div className="space-y-3 mb-4">
      <div className="skeleton h-4 w-48 rounded-lg" />
      <div className="skeleton h-4 w-36 rounded-lg" />
    </div>
    <div className="flex items-center justify-between">
      <div className="skeleton h-6 w-20 rounded-lg" />
      <div className="skeleton h-10 w-28 rounded-lg" />
    </div>
  </div>
);

/* ─── Order Card ─── */
const OrderCard = ({ order }) => {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const isActive = !['delivered', 'cancelled'].includes(order.status);
  const itemCount = order.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 group">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${status.color}`}>
            <StatusIcon size={18} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-mono">
              #{(order._id || order.id || '').slice(-8).toUpperCase()}
            </p>
            <p className="text-xs text-text-secondary">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Items */}
      <div className="px-6 py-4">
        <div className="space-y-2 mb-4">
          {order.items?.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                {item.quantity || 1}× {item.name}
              </span>
              <span className="font-medium">₹{item.price * (item.quantity || 1)}</span>
            </div>
          ))}
          {(order.items?.length || 0) > 3 && (
            <p className="text-xs text-text-muted">
              +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider">Total</p>
            <p className="text-lg font-bold text-primary">₹{order.totalAmount?.toFixed(2)}</p>
            <p className="text-xs text-text-muted">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
          </div>

          {isActive ? (
            <Link
              to={`/orders/${order._id || order.id}/track`}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-5 rounded-xl transition-all text-sm shadow-lg shadow-primary/20 group-hover:shadow-primary/30"
            >
              <MapPin size={16} />
              Track Order
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <Link
              to="/restaurants"
              className="flex items-center gap-2 border border-border hover:border-primary text-text-secondary hover:text-primary font-medium py-2.5 px-5 rounded-xl transition-all text-sm"
            >
              Reorder
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Pagination ─── */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg border border-border hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
            page === currentPage
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'border border-border hover:border-primary hover:text-primary'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg border border-border hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MY ORDERS PAGE
   ═══════════════════════════════════════════════ */
const MyOrders = () => {
  const { orders, pagination, isLoading, error, fetchOrders } = useOrderStore();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders(1, 10);
  }, [fetchOrders]);

  const handlePageChange = (page) => {
    fetchOrders(page, pagination.limit);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  // Client-side filter (production: query param)
  const filteredOrders =
    filter === 'all'
      ? orders
      : filter === 'active'
        ? orders.filter((o) => !['delivered', 'cancelled'].includes(o.status))
        : orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  /* ── Error State ── */
  if (error && orders.length === 0) {
    return (
      <main className="container-custom py-16 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-danger/10 rounded-full mb-4">
          <AlertCircle size={32} className="text-danger" />
        </div>
        <h2 className="text-xl font-bold mb-2">Failed to load orders</h2>
        <p className="text-text-secondary mb-6">{error}</p>
        <button onClick={() => fetchOrders(1)} className="btn-primary">
          Try Again
        </button>
      </main>
    );
  }

  return (
    <main className="container-custom py-10 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-text-secondary mt-1">
            {pagination.total} order{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-surface border border-border rounded-xl p-1 gap-1">
          {['all', 'active', 'past'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                filter === f
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading ── */}
      {isLoading && orders.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && filteredOrders.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-surface-hover rounded-full mb-6">
            <ShoppingBag size={36} className="text-text-muted" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
          </h2>
          <p className="text-text-secondary mb-6 max-w-sm mx-auto">
            {filter === 'all'
              ? "Looks like you haven't ordered anything yet. Browse our restaurants and place your first order!"
              : `You don't have any ${filter} orders right now.`}
          </p>
          <Link to="/restaurants" className="btn-primary">
            Browse Restaurants
            <ArrowRight size={18} />
          </Link>
        </div>
      )}

      {/* ── Order Grid ── */}
      {filteredOrders.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard key={order._id || order.id} order={order} />
            ))}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </main>
  );
};

export default MyOrders;
