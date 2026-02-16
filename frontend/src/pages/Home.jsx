import { Link } from 'react-router-dom';
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
} from 'lucide-react';

/**
 * CUISINE CATEGORIES
 */
const categories = [
  { name: 'Indian', icon: Flame, color: 'from-orange-500/20 to-red-500/20' },
  { name: 'Pizza', icon: Pizza, color: 'from-yellow-500/20 to-orange-500/20' },
  { name: 'Chinese', icon: Soup, color: 'from-red-500/20 to-pink-500/20' },
  { name: 'Burgers', icon: Sandwich, color: 'from-amber-500/20 to-yellow-500/20' },
  { name: 'Desserts', icon: IceCreamCone, color: 'from-pink-500/20 to-purple-500/20' },
  { name: 'Cafe', icon: Coffee, color: 'from-emerald-500/20 to-teal-500/20' },
];

/**
 * FEATURED RESTAURANTS (static demo data)
 */
const featuredRestaurants = [
  {
    id: 1,
    name: 'The Spice Kitchen',
    cuisine: 'Indian • North Indian • Biryani',
    rating: 4.5,
    deliveryTime: '25-30 min',
    priceRange: '$$',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop',
  },
  {
    id: 2,
    name: 'Pizza Paradise',
    cuisine: 'Italian • Pizza • Pasta',
    rating: 4.3,
    deliveryTime: '20-25 min',
    priceRange: '$$',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop',
  },
  {
    id: 3,
    name: 'Dragon Wok',
    cuisine: 'Chinese • Asian • Noodles',
    rating: 4.1,
    deliveryTime: '30-35 min',
    priceRange: '$',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=400&fit=crop',
  },
  {
    id: 4,
    name: 'Burger Barn',
    cuisine: 'American • Burgers • Shakes',
    rating: 4.6,
    deliveryTime: '15-20 min',
    priceRange: '$$',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',
  },
  {
    id: 5,
    name: 'Sushi Master',
    cuisine: 'Japanese • Sushi • Asian',
    rating: 4.8,
    deliveryTime: '35-40 min',
    priceRange: '$$$',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop',
  },
  {
    id: 6,
    name: 'Taco Fiesta',
    cuisine: 'Mexican • Tacos • Burritos',
    rating: 4.2,
    deliveryTime: '20-25 min',
    priceRange: '$',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop',
  },
];

const Home = () => {
  return (
    <div className="overflow-hidden">
      {/* ============================================
          HERO SECTION
          ============================================ */}
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
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6 animate-fade-in">
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

            <p className="text-lg md:text-xl text-text-secondary max-w-xl mx-auto mb-8 leading-relaxed animate-slide-up">
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
              <Link
                to="/restaurants"
                className="btn-primary py-4 px-8 text-base shadow-2xl shadow-primary/30"
              >
                <Search size={18} />
                Find Food
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-5 mt-14 animate-fade-in">
              {[
                {
                  value: '500+',
                  label: 'Restaurants',
                  sub: 'Partner restaurants',
                  icon: Utensils,
                  gradient: 'from-orange-500 to-red-500',
                },
                {
                  value: '<30',
                  label: 'Min Delivery',
                  sub: 'Average delivery time',
                  icon: Clock,
                  gradient: 'from-blue-500 to-cyan-400',
                },
                {
                  value: '4.8',
                  label: 'Avg Rating',
                  sub: 'Customer satisfaction',
                  icon: Star,
                  gradient: 'from-yellow-500 to-amber-400',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="relative group flex items-center gap-4 bg-surface/60 backdrop-blur-md border border-border hover:border-primary/40 rounded-2xl px-6 py-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 min-w-[200px]"
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon size={22} className="text-white" />
                  </div>
                  {/* Text */}
                  <div className="text-left">
                    <p className="text-2xl font-bold text-text-primary leading-none">
                      {stat.value}
                    </p>
                    <p className="text-xs text-text-muted mt-1">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CUISINE CATEGORIES
          ============================================ */}
      <section className="py-20">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold">Explore Cuisines</h2>
              <p className="text-text-secondary mt-2">
                What are you craving today?
              </p>
            </div>
            <Link
              to="/restaurants"
              className="btn-ghost text-primary hidden sm:flex"
            >
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
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
                >
                  <cat.icon size={24} className="text-text-primary" />
                </div>
                <p className="text-sm font-medium">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURED RESTAURANTS
          ============================================ */}
      <section className="py-20 bg-surface/30">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold">Featured Restaurants</h2>
              <p className="text-text-secondary mt-2">
                Top picks curated just for you
              </p>
            </div>
            <Link
              to="/restaurants"
              className="btn-outline btn-sm hidden sm:flex"
            >
              See All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRestaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/restaurants/${restaurant.id}`}
                className="card-hover overflow-hidden group"
              >
                {/* Image */}
                <div className="h-48 bg-gradient-to-br from-surface-hover to-surface relative overflow-hidden">
                  {restaurant.image ? (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Utensils
                        size={40}
                        className="text-text-muted/30 group-hover:scale-110 transition-transform"
                      />
                    </div>
                  )}
                  {/* Delivery Time Badge */}
                  <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1">
                    <Clock size={12} className="text-text-secondary" />
                    <span className="text-xs font-medium">
                      {restaurant.deliveryTime}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-md">
                      <Star size={12} className="text-success fill-success" />
                      <span className="text-xs font-semibold text-success">
                        {restaurant.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">
                    {restaurant.cuisine}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">
                      {restaurant.priceRange}
                    </span>
                    <span className="text-xs text-primary font-medium flex items-center gap-1">
                      Order Now <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS
          ============================================ */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-text-secondary mt-2">
              Three simple steps to get your food
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Choose Restaurant',
                desc: 'Browse from hundreds of restaurants and menus near you.',
                icon: Search,
              },
              {
                step: '02',
                title: 'Place Order',
                desc: 'Add items to your cart and checkout with secure payment.',
                icon: Utensils,
              },
              {
                step: '03',
                title: 'Fast Delivery',
                desc: 'Track your order in real-time and enjoy your meal!',
                icon: Clock,
              },
            ].map((item) => (
              <div key={item.step} className="card p-8 text-center relative">
                <span className="absolute top-4 right-4 text-6xl font-black text-primary/5">
                  {item.step}
                </span>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <item.icon size={28} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="py-20">
        <div className="container-custom">
          <div className="card relative overflow-hidden p-12 md:p-16 text-center">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-[80px]" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to order?
              </h2>
              <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
                Download the app or order directly from the web.
                Your next meal is just a click away.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/restaurants" className="btn-primary btn-lg">
                  Explore Restaurants <ArrowRight size={20} />
                </Link>
                <Link to="/signup" className="btn-outline btn-lg">
                  Create Account
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
