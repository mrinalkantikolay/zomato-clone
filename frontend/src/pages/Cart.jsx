import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Minus, Plus, ArrowLeft, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import useCartStore from '../store/cartStore';

const FOOD_IMGS = [
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop',
];

/* ─── Cart Item Card ─── */
const CartItem = ({ item, index, onIncrement, onDecrement, onRemove }) => {
  const imgSrc = item.imageUrl || FOOD_IMGS[index % FOOD_IMGS.length];

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 group transition-all hover:border-primary/50">
      <img
        className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
        src={imgSrc}
        alt={item.name}
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg leading-tight truncate">{item.name}</h3>
            <p className="text-sm text-text-secondary">₹{item.price} each</p>
          </div>
          <button
            onClick={() => onRemove(item.menuId, item.name)}
            className="text-text-secondary hover:text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-4">
          {/* Quantity Controls */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => onDecrement(item.menuId)}
              className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center justify-center"
            >
              <Minus size={14} />
            </button>
            <span className="px-4 py-1 text-sm font-bold border-x border-border">
              {item.quantity || 1}
            </span>
            <button
              onClick={() => onIncrement(item.menuId)}
              className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center justify-center"
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="font-bold text-lg">₹{item.price * (item.quantity || 1)}</span>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   CART PAGE
   ═══════════════════════════════════════════════ */
const Cart = () => {
  const { items, totalAmount, isLoading, fetchCart, removeItem, incrementItem, decrementItem } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const deliveryFee = 40;
  const taxes = Math.round(totalAmount * 0.05);
  const grandTotal = totalAmount + deliveryFee + taxes;

  /* Loading */
  if (isLoading) {
    return (
      <main className="container-custom py-10 animate-pulse">
        <div className="h-8 bg-surface-hover rounded w-40 mb-8" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-surface-hover rounded-xl" />
            ))}
          </div>
          <div className="w-full lg:w-96 h-72 bg-surface-hover rounded-xl" />
        </div>
      </main>
    );
  }

  /* Empty Cart */
  if (items.length === 0) {
    return (
      <main className="container-custom py-20 text-center animate-fade-in">
        <ShoppingCart size={64} className="text-text-muted mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
        <p className="text-text-secondary mb-8">Browse restaurants and add items to get started</p>
        <Link to="/restaurants" className="btn-primary">
          Browse Restaurants
        </Link>
      </main>
    );
  }

  return (
    <main className="container-custom py-10 animate-fade-in">
      {/* Page Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
        <p className="text-text-secondary">({itemCount} item{itemCount > 1 ? 's' : ''} in your basket)</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Left: Cart Items ── */}
        <div className="flex-1 space-y-4">
          {items.map((item, index) => (
            <CartItem
              key={item.menuId || index}
              item={item}
              index={index}
              onIncrement={incrementItem}
              onDecrement={decrementItem}
              onRemove={removeItem}
            />
          ))}

          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline mt-4 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Add more items
          </Link>
        </div>

        {/* ── Right: Order Summary Sidebar ── */}
        <div className="w-full lg:w-96">
          <div className="bg-surface border border-border rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            {/* Promo Code */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">
                Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  className="input !py-2 flex-1"
                  placeholder="Enter code"
                  type="text"
                />
                <button className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors">
                  Apply
                </button>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Taxes & Charges</span>
                <span>₹{taxes}</span>
              </div>
              <div className="pt-4 border-t border-border flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-xl font-bold">₹{grandTotal}</span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={20} />
            </button>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3 text-text-secondary">
                <ShieldCheck size={16} />
                <span className="text-xs">Secure checkout powered by Razorpay</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary mt-2">
                <Clock size={16} />
                <span className="text-xs">Estimated delivery: 35-45 mins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
