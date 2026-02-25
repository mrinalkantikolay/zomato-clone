import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Search,
  ArrowRight,
  Utensils,
  Clock,
  Star,
  MapPin,
  ChevronRight,
  Flame,
  Pizza,
  Soup,
  Sandwich,
  IceCreamCone,
  Coffee,
  TrendingUp,
} from 'lucide-react';
import { restaurantAPI } from '../api/restaurant.api';

/* ─── CUISINE CATEGORIES ─────────────────────── */
const categories = [
  { name: 'Indian',   icon: Flame,       color: 'from-orange-500/20 to-red-500/20' },
  { name: 'Pizza',    icon: Pizza,       color: 'from-yellow-500/20 to-orange-500/20' },
  { name: 'Chinese',  icon: Soup,        color: 'from-red-500/20 to-pink-500/20' },
  { name: 'Burgers',  icon: Sandwich,    color: 'from-amber-500/20 to-yellow-500/20' },
  { name: 'Desserts', icon: IceCreamCone,color: 'from-pink-500/20 to-purple-500/20' },
  { name: 'Cafe',     icon: Coffee,      color: 'from-emerald-500/20 to-teal-500/20' },
];

/* ─── SKELETON CARD ─────────────────────────── */
const SkeletonCard = ({ index }) => (
  <div
    className="rounded-2xl overflow-hidden bg-surface border border-border"
    style={{ animationDelay: `${index * 120}ms` }}
  >
    <div className="h-52 bg-surface-hover animate-pulse" />
    <div className="p-5 space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-5 w-36 bg-surface-hover rounded-lg animate-pulse" />
        <div className="h-5 w-12 bg-surface-hover rounded-lg animate-pulse" />
      </div>
      <div className="h-4 w-48 bg-surface-hover rounded-lg animate-pulse" />
      <div className="h-4 w-24 bg-surface-hover rounded-lg animate-pulse" />
    </div>
  </div>
);

/* ─── RESTAURANT CARD ──────────────────────── */
const RestaurantCard = ({ restaurant, index }) => {
  const [imgError, setImgError] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 100);
    return () => clearTimeout(t);
  }, [index]);

  const cuisineText = restaurant.cuisine
    ? (Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(' • ') : restaurant.cuisine)
    : 'Multi Cuisine';

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="group block"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.5s ease ${index * 80}ms, transform 0.5s ease ${index * 80}ms`,
      }}
    >
      <div className="relative rounded-2xl overflow-hidden border border-border bg-surface
                      transition-all duration-400
                      hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/15
                      hover:border-primary/30">

        {/* ── Image ── */}
        <div className="relative h-52 overflow-hidden bg-surface-hover">
          {restaurant.imageUrl && !imgError ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2
                            bg-gradient-to-br from-surface-hover to-surface">
              <Utensils size={36} className="text-text-muted/40" />
              <span className="text-xs text-text-muted/50 font-medium">{restaurant.name}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

          {/* Delivery time badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5
                          bg-black/70 backdrop-blur-md rounded-xl px-2.5 py-1.5 border border-white/10">
            <Clock size={11} className="text-white/80" />
            <span className="text-xs font-medium text-white">
              {restaurant.deliveryTime || '30-40 min'}
            </span>
          </div>

          {/* Trending badge */}
          {index < 3 && (
            <div className="absolute top-3 right-3 flex items-center gap-1
                            bg-primary/90 backdrop-blur-md rounded-xl px-2.5 py-1.5">
              <TrendingUp size={11} className="text-white" />
              <span className="text-xs font-bold text-white">Popular</span>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-[16px] leading-snug group-hover:text-primary
                           transition-colors duration-200 line-clamp-1 flex-1 mr-3">
              {restaurant.name}
            </h3>
            {restaurant.rating && (
              <div className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/20
                              px-2 py-0.5 rounded-lg shrink-0">
                <Star size={11} className="text-emerald-400 fill-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">
                  {Number(restaurant.rating).toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-text-secondary mb-4 line-clamp-1">{cuisineText}</p>

          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">
              {restaurant.priceRange || '$'}
            </span>
            <span className="text-xs font-semibold text-primary flex items-center gap-1
                             group-hover:gap-2 transition-all duration-200">
              Order Now <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* Bottom glow on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5
                        bg-gradient-to-r from-transparent via-primary to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      </div>
    </Link>
  );
};

/* ═══════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════ */
const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await restaurantAPI.getAll(1, 6);
        const data = res.data?.data || res.data?.restaurants || res.data || [];
        setRestaurants(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (err) {
        console.error('Failed to load restaurants:', err);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <div className="overflow-hidden">

      {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20
                            rounded-full px-4 py-1.5 mb-6 animate-fade-in">
              <Flame size={14} className="text-primary" />
              <span className="text-sm text-primary font-medium">
                Free delivery on your first order
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 animate-slide-up">
              Delicious Food,
              <br />
              <span className="text-gradient">Delivered Fast</span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary max-w-xl mx-auto mb-8
                          leading-relaxed animate-slide-up">
              Discover the best restaurants near you. Order your favorite meals
              and get them delivered to your doorstep.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto animate-slide-up">
              <div className="relative flex-1">
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Enter your delivery address..."
                  className="input pl-11 py-4 text-base bg-surface border-border"
                />
              </div>
              <Link to="/restaurants" className="btn-primary py-4 px-8 text-base shadow-2xl shadow-primary/30">
                <Search size={18} />
                Find Food
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-5 mt-14 animate-fade-in">
              {[
                { value: '10+',  label: 'Restaurants',   sub: 'Partner restaurants',      icon: Utensils, gradient: 'from-orange-500 to-red-500' },
                { value: '<30',  label: 'Min Delivery',  sub: 'Average delivery time',    icon: Clock,    gradient: 'from-blue-500 to-cyan-400' },
                { value: '4.8',  label: 'Avg Rating',    sub: 'Customer satisfaction',    icon: Star,     gradient: 'from-yellow-500 to-amber-400' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="relative group flex items-center gap-4 bg-surface/60 backdrop-blur-md
                             border border-border hover:border-primary/40 rounded-2xl px-6 py-5
                             transition-all duration-300 hover:-translate-y-1
                             hover:shadow-lg hover:shadow-primary/5 min-w-[200px]"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient}
                                  flex items-center justify-center shrink-0 shadow-lg
                                  group-hover:scale-110 transition-transform`}>
                    <stat.icon size={22} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-text-primary leading-none">{stat.value}</p>
                    <p className="text-xs text-text-muted mt-1">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CUISINE CATEGORIES
      ══════════════════════════════════════ */}
      <section className="py-20">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold">Explore Cuisines</h2>
              <p className="text-text-secondary mt-2">What are you craving today?</p>
            </div>
            <Link to="/restaurants" className="btn-ghost text-primary hidden sm:flex">
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/restaurants?cuisine=${cat.name}`}
                className="card-hover p-6 text-center group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color}
                                flex items-center justify-center mx-auto mb-3
                                group-hover:scale-110 transition-transform`}>
                  <cat.icon size={24} className="text-text-primary" />
                </div>
                <p className="text-sm font-medium">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURED RESTAURANTS (live from DB)
      ══════════════════════════════════════ */}
      <section className="py-20 bg-surface/30">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold">Featured Restaurants</h2>
              <p className="text-text-secondary mt-2">Top picks curated just for you</p>
            </div>
            <Link to="/restaurants" className="btn-outline btn-sm hidden sm:flex">
              See All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} index={i} />)
              : restaurants.length > 0
                ? restaurants.map((r, i) => (
                    <RestaurantCard key={r.id} restaurant={r} index={i} />
                  ))
                : (
                  <div className="col-span-3 text-center py-20">
                    <Utensils size={48} className="mx-auto text-text-muted/30 mb-4" />
                    <p className="text-text-secondary">No restaurants found</p>
                    <Link to="/restaurants" className="btn-primary mt-4 inline-flex">
                      Browse All
                    </Link>
                  </div>
                )
            }
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-text-secondary mt-2">Three simple steps to get your food</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Choose Restaurant', desc: 'Browse from restaurants and menus near you.', icon: Search },
              { step: '02', title: 'Place Order',        desc: 'Add items to your cart and checkout securely.', icon: Utensils },
              { step: '03', title: 'Fast Delivery',      desc: 'Track your order in real-time and enjoy!', icon: Clock },
            ].map((item) => (
              <div key={item.step} className="card p-8 text-center relative">
                <span className="absolute top-4 right-4 text-6xl font-black text-primary/5">
                  {item.step}
                </span>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <item.icon size={28} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════ */}
      <section className="py-20">
        <div className="container-custom">
          <div className="card relative overflow-hidden p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-[80px]" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to order?</h2>
              <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
                Order directly from the web. Your next meal is just a click away.
              </p>
              <div className="flex justify-center">
                <Link to="/restaurants" className="btn-primary btn-lg">
                  Explore Restaurants <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
