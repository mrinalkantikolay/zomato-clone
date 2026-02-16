import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MapPin, UtensilsCrossed, Plus, Check, Tag, ArrowRight, Home, Building2 } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { orderAPI } from '../api/order.api';
import toast from 'react-hot-toast';

const FOOD_IMGS = [
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&h=200&fit=crop',
];

/* ─── Address Helpers ─── */
const STORAGE_KEY = 'zomato_saved_addresses';

const getSavedAddresses = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

const saveAddress = (address) => {
  const list = getSavedAddresses();
  const enriched = { ...address, id: Date.now().toString(), label: address.label || 'Home' };
  list.push(enriched);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return enriched;
};

/* ═══════════════════════════════════════════════
   CHECKOUT PAGE
   ═══════════════════════════════════════════════ */
const Checkout = () => {
  const { items, totalAmount, fetchCart, clearCart } = useCartStore();
  const navigate = useNavigate();

  const [isPlacing, setIsPlacing] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: 'Home',
      street: '',
      city: '',
      state: '',
      pincode: '',
      instructions: '',
    },
  });

  useEffect(() => {
    fetchCart();
    const addresses = getSavedAddresses();
    setSavedAddresses(addresses);
    if (addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
      setShowNewForm(false);
    } else {
      setShowNewForm(true);
    }
  }, [fetchCart]);

  // Redirect to cart if empty (wrapped in useEffect to avoid render side-effect)
  useEffect(() => {
    if (!items || items.length === 0) {
      // wait a tick for cart to load
      const timer = setTimeout(() => {
        const currentItems = useCartStore.getState().items;
        if (currentItems.length === 0 && !useCartStore.getState().isLoading) {
          navigate('/cart', { replace: true });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [items, navigate]);

  const deliveryFee = 40;
  const taxes = Math.round(totalAmount * 0.05);
  const grandTotal = totalAmount + deliveryFee + taxes;
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  /* Save new address and select it */
  const onSaveAddress = (data) => {
    const saved = saveAddress(data);
    const updated = getSavedAddresses();
    setSavedAddresses(updated);
    setSelectedAddressId(saved.id);
    setShowNewForm(false);
    reset();
    toast.success('Address saved!');
  };

  /* Get selected address object */
  const selectedAddress = useMemo(
    () => savedAddresses.find((a) => a.id === selectedAddressId),
    [savedAddresses, selectedAddressId]
  );

  /* Place Order */
  const onPlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select or add a delivery address');
      return;
    }

    setIsPlacing(true);
    try {
      const { data } = await orderAPI.placeOrder({
        address: selectedAddress,
      });
      const order = data.data;
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/payment/${order._id || order.id}`, {
        state: { totalAmount: grandTotal, orderItems: items, address: selectedAddress },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsPlacing(false);
    }
  };

  if (items.length === 0) {
    return null; // useEffect handles redirect
  }

  return (
    <main className="container-custom py-10 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column ── */}
        <div className="lg:col-span-8 space-y-8">

          {/* ── Delivery Address Section ── */}
          <section className="bg-surface border border-border rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MapPin size={22} className="text-primary" />
                <h2 className="text-xl font-semibold">Delivery Address</h2>
              </div>
              {savedAddresses.length > 0 && (
                <button
                  onClick={() => { setShowNewForm(!showNewForm); setSelectedAddressId(showNewForm ? savedAddresses[0]?.id : null); }}
                  className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline"
                >
                  <Plus size={16} />
                  {showNewForm ? 'Use Saved' : 'Add New'}
                </button>
              )}
            </div>

            {/* Saved Addresses */}
            {!showNewForm && savedAddresses.length > 0 && (
              <div className="space-y-3">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`w-full text-left rounded-xl p-4 flex items-start gap-4 transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-2 border-primary bg-primary/5'
                        : 'border border-border bg-background hover:border-text-secondary'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${selectedAddressId === addr.id ? 'bg-primary/20' : 'bg-surface-hover'}`}>
                      {addr.label === 'Work' ? (
                        <Building2 size={20} className={selectedAddressId === addr.id ? 'text-primary' : 'text-text-secondary'} />
                      ) : (
                        <Home size={20} className={selectedAddressId === addr.id ? 'text-primary' : 'text-text-secondary'} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold">{addr.label || 'Home'}</span>
                        {selectedAddressId === addr.id && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">Selected</span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary truncate">{addr.street}, {addr.city} {addr.pincode}</p>
                      {addr.instructions && (
                        <p className="text-xs text-text-muted mt-1 italic">Note: {addr.instructions}</p>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      selectedAddressId === addr.id ? 'border-primary' : 'border-border'
                    }`}>
                      {selectedAddressId === addr.id && <Check size={12} className="text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* New Address Form */}
            {showNewForm && (
              <form onSubmit={handleSubmit(onSaveAddress)} className="space-y-4">
                {/* Address Label */}
                <div className="flex gap-3">
                  {['Home', 'Work', 'Other'].map((label) => (
                    <label key={label} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={label}
                        {...register('label')}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Street Address
                  </label>
                  <input
                    className={`input ${errors.street ? 'border-danger' : ''}`}
                    placeholder="123 Culinary Ave, Suite 400"
                    {...register('street', { required: 'Street address is required' })}
                  />
                  {errors.street && <p className="text-danger text-xs mt-1">{errors.street.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">City</label>
                    <input
                      className={`input ${errors.city ? 'border-danger' : ''}`}
                      placeholder="Kolkata"
                      {...register('city', { required: 'City is required' })}
                    />
                    {errors.city && <p className="text-danger text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">State</label>
                    <input
                      className="input"
                      placeholder="West Bengal"
                      {...register('state')}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Pincode</label>
                    <input
                      className={`input ${errors.pincode ? 'border-danger' : ''}`}
                      placeholder="700001"
                      {...register('pincode', { required: 'Pincode is required' })}
                    />
                    {errors.pincode && <p className="text-danger text-xs mt-1">{errors.pincode.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    className="input resize-none"
                    rows="2"
                    placeholder="Gate code, landmarks, etc."
                    {...register('instructions')}
                  />
                </div>

                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-lg transition-all"
                >
                  Save Address & Use
                </button>
              </form>
            )}
          </section>

          {/* ── Order Items ── */}
          <section className="bg-surface border border-border rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <UtensilsCrossed size={22} className="text-primary" />
              <h2 className="text-xl font-semibold">Order Items ({itemCount})</h2>
            </div>
            <div className="divide-y divide-border">
              {items.map((item, idx) => (
                <div key={item.menuId || idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        src={item.imageUrl || FOOD_IMGS[idx % FOOD_IMGS.length]}
                        alt={item.name}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-text-secondary text-sm">Qty: {item.quantity || 1} × ₹{item.price}</p>
                    </div>
                  </div>
                  <span className="font-medium">₹{item.price * (item.quantity || 1)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Right Column: Sidebar ── */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Payment Summary */}
          <div className="bg-surface border border-border rounded-xl p-8">
            <h2 className="text-xl font-semibold mb-6">Payment Summary</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal ({itemCount} items)</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Taxes (5%)</span>
                <span>₹{taxes.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-border flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold text-primary">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery Address Preview */}
            {selectedAddress && (
              <div className="mb-6 p-3 bg-background rounded-lg border border-border">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Delivering to</p>
                <p className="text-sm font-medium">{selectedAddress.label}</p>
                <p className="text-xs text-text-secondary">{selectedAddress.street}, {selectedAddress.city} {selectedAddress.pincode}</p>
              </div>
            )}

            {/* Place Order */}
            <button
              onClick={onPlaceOrder}
              disabled={isPlacing || !selectedAddress}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPlacing ? 'Placing Order...' : 'Place Order & Pay'}
              {!isPlacing && <ArrowRight size={20} />}
            </button>
            <p className="text-[10px] text-center text-text-secondary uppercase tracking-widest leading-relaxed">
              By placing order, you agree to our{' '}
              <a className="underline hover:text-primary" href="#">Terms of Service</a>{' '}
              and{' '}
              <a className="underline hover:text-primary" href="#">Privacy Policy</a>
            </p>
          </div>

          {/* Promo Banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Tag size={22} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Free delivery on orders above ₹499!</p>
              <p className="text-xs text-text-secondary">Use code: FREEDEL</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
