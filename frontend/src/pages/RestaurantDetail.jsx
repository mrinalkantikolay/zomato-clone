import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Clock, Heart, Share2, Plus, Minus, Trash2, ArrowRight, UtensilsCrossed, AlertCircle } from 'lucide-react';
import { restaurantAPI } from '../api/restaurant.api';
import { menuAPI } from '../api/menu.api';
import useCartStore from '../store/cartStore';

const PLACEHOLDER_HERO =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=500&fit=crop';

const FOOD_IMGS = [
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1574484284002-952d92456975?w=200&h=200&fit=crop',
];

/* ─── Skeleton ─── */
const SkeletonDetail = () => (
  <div className="animate-pulse">
    <div className="h-[350px] bg-surface-hover w-full" />
    <div className="container-custom py-8 flex gap-8">
      <div className="w-64 hidden md:block space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-surface-hover rounded-lg" />
        ))}
      </div>
      <div className="flex-grow space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-surface-hover rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

/* ─── Menu Item Card ─── */
const MenuItemCard = ({ item, index, onAdd, onIncrement, onDecrement, onRemove, cartItems }) => {
  const imgSrc = item.imageUrl || FOOD_IMGS[index % FOOD_IMGS.length];
  const isVeg = item.isVeg !== false;
  const cartItem = cartItems.find((ci) => String(ci.menuId) === String(item.id));
  const cartQty = cartItem?.quantity || 0;

  return (
    <div className="group bg-surface border border-border p-4 rounded-xl flex items-center justify-between hover:border-primary/50 transition-all">
      <div className="flex gap-4 flex-1 min-w-0">
        {/* Thumbnail */}
        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
          <img
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            src={imgSrc}
            loading="lazy"
          />
        </div>
        {/* Details */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Veg / Non-Veg indicator */}
            <span className={`w-3 h-3 border flex items-center justify-center p-[1px] ${isVeg ? 'border-green-600' : 'border-primary'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-primary'}`} />
            </span>
            <h4 className="font-semibold text-lg truncate">{item.name}</h4>
          </div>
          <p className="text-text-secondary text-sm max-w-md line-clamp-2">
            {item.description || 'Delicious dish prepared with premium ingredients'}
          </p>
          <span className="mt-2 font-bold text-lg">₹{item.price}</span>
        </div>
      </div>

      {/* Add / Quantity control */}
      <div className="flex-shrink-0 ml-4">
        {cartQty > 0 ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => onDecrement(item.id)}
                className="w-8 h-10 bg-surface text-text-secondary hover:text-primary transition-colors flex items-center justify-center"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center font-bold text-sm">{cartQty}</span>
              <button
                onClick={() => onIncrement(item.id)}
                className="w-8 h-10 bg-surface text-text-secondary hover:text-primary transition-colors flex items-center justify-center"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={() => onRemove(item.id, item.name)}
              className="bg-primary/20 text-primary p-2.5 rounded-lg hover:bg-primary/30 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={() =>
              onAdd({
                restaurantId: item.restaurantId,
                menuId: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
              })
            }
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={16} />
            Add
          </button>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   RESTAURANT DETAIL PAGE
   ═══════════════════════════════════════════════ */
const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('');
  const sectionRefs = useRef({});

  const { items: cartItems, addToCart, incrementItem, decrementItem, removeItem, totalAmount, fetchCart } = useCartStore();

  /* Fetch restaurant + menu */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [restRes, menuRes] = await Promise.all([
          restaurantAPI.getById(id),
          menuAPI.getByRestaurant(id),
        ]);
        setRestaurant(restRes.data.data);
        setMenuItems(menuRes.data.data || []);
        fetchCart();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load restaurant');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, fetchCart]);

  /* Group menu items by category */
  const groupedMenu = useMemo(() => {
    const groups = {};
    menuItems.forEach((item) => {
      const cat = item.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [menuItems]);

  const categories = Object.keys(groupedMenu);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  /* Scroll to category */
  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    sectionRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (isLoading) return <SkeletonDetail />;

  if (error) {
    return (
      <div className="container-custom py-20 text-center">
        <AlertCircle size={48} className="text-danger mx-auto mb-4" />
        <p className="text-text-secondary mb-4">{error}</p>
        <Link to="/restaurants" className="btn-primary btn-sm">
          Back to Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* ── Hero Header ── */}
      <header className="relative h-[350px] w-full overflow-hidden">
        <img
          alt={restaurant?.name}
          className="w-full h-full object-cover"
          src={restaurant?.imageUrl || PLACEHOLDER_HERO}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
          <div className="container-custom flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                  restaurant?.isOpen !== false
                    ? 'bg-green-600/20 text-green-500 border-green-600/30'
                    : 'bg-red-600/20 text-red-400 border-red-600/30'
                }`}>
                  {restaurant?.isOpen !== false ? 'Open Now' : 'Closed'}
                </span>
                <span className="text-text-secondary text-sm flex items-center gap-1">
                  <MapPin size={12} />
                  {restaurant?.address || 'Downtown District'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{restaurant?.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                <span className="text-text-secondary">
                  {restaurant?.description || 'Multi-cuisine • Fast delivery'}
                </span>
                <span className="w-1 h-1 bg-text-secondary rounded-full" />
                <span className="flex items-center gap-1 text-yellow-500">
                  4.5 <Star size={14} className="fill-yellow-500" />
                  <span className="text-text-secondary font-normal">(500+ Reviews)</span>
                </span>
                <span className="w-1 h-1 bg-text-secondary rounded-full" />
                <span className="text-text-secondary flex items-center gap-1">
                  <Clock size={14} /> 25-30 min
                </span>
                <span className="w-1 h-1 bg-text-secondary rounded-full" />
                <span className="text-text-secondary">$$</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="bg-surface border border-border p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Heart size={20} className="text-primary" />
              </button>
              <button className="bg-surface border border-border p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="container-custom py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest px-4 mb-4">
                Categories
              </h3>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(cat)}
                  className={`w-full text-left flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-primary/10 text-primary border-r-2 border-primary'
                      : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}

              {categories.length === 0 && !isLoading && (
                <p className="text-text-muted text-sm px-4">No menu items available</p>
              )}
            </div>
          </aside>

          {/* Menu List */}
          <div className="flex-grow">
            {categories.map((cat) => (
              <section
                key={cat}
                className="mb-12"
                id={cat.toLowerCase().replace(/\s+/g, '-')}
                ref={(el) => (sectionRefs.current[cat] = el)}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  {cat}
                  <span className="text-sm font-normal text-text-secondary bg-surface px-2 py-0.5 rounded border border-border">
                    {groupedMenu[cat].length} Items
                  </span>
                </h2>
                <div className="grid gap-4">
                  {groupedMenu[cat].map((item, idx) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      index={idx}
                      onAdd={addToCart}
                      onIncrement={incrementItem}
                      onDecrement={decrementItem}
                      onRemove={removeItem}
                      cartItems={cartItems}
                    />
                  ))}
                </div>
              </section>
            ))}

            {categories.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <UtensilsCrossed size={48} className="text-text-muted mx-auto mb-4" />
                <p className="text-lg text-text-secondary">No menu items available</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Floating Cart Summary ── */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-8 right-8 z-[60] animate-slide-up">
          <div className="bg-surface border border-border p-4 rounded-xl shadow-2xl flex flex-col gap-4 min-w-[300px] border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">Your Order</h4>
                <p className="text-xs text-text-secondary">
                  {cartItemCount} Item{cartItemCount > 1 ? 's' : ''} in cart
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-secondary">Total amount</p>
                <p className="text-lg font-bold text-primary">₹{totalAmount.toFixed(2)}</p>
              </div>
            </div>
            <div className="h-px bg-border w-full" />
            <Link
              to="/cart"
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all group"
            >
              View Cart & Checkout
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
