import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Clock, ChevronLeft, ChevronRight, AlertCircle, UtensilsCrossed } from 'lucide-react';
import { restaurantAPI } from '../api/restaurant.api';

const CUISINES = ['All', 'Indian', 'Chinese', 'Italian', 'Mexican', 'Fast Food', 'Japanese'];

const PLACEHOLDER_IMGS = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&h=400&fit=crop',
];

/* ─── Skeleton ─── */
const SkeletonCard = () => (
  <div className="animate-pulse bg-surface border border-border rounded-xl overflow-hidden">
    <div className="h-48 bg-surface-hover" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-surface-hover rounded w-3/4" />
      <div className="h-4 bg-surface-hover rounded w-1/2" />
      <div className="h-px bg-surface-hover" />
      <div className="flex justify-between">
        <div className="h-4 bg-surface-hover rounded w-20" />
        <div className="h-4 bg-surface-hover rounded w-16" />
      </div>
    </div>
  </div>
);

/* ─── Restaurant Card ─── */
const RestaurantCard = ({ restaurant, index }) => {
  const imgSrc = restaurant.imageUrl || PLACEHOLDER_IMGS[index % PLACEHOLDER_IMGS.length];
  const rating = (4 + Math.random()).toFixed(1);
  const isOpen = restaurant.isOpen !== false;

  return (
    <Link to={`/restaurants/${restaurant._id || restaurant.id}`} className="block group">
      <div className="bg-surface border border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            src={imgSrc}
            loading="lazy"
          />
          <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold">{rating}</span>
          </div>
          {!isOpen && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="bg-danger/90 text-white text-xs font-bold uppercase px-3 py-1 rounded">
                Closed
              </span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
              {restaurant.name}
            </h3>
            <span className="text-primary font-semibold text-sm">$$</span>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            {restaurant.description || 'Multi-cuisine • Premium Dining'}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Clock size={14} />
              <span className="text-xs font-medium">20-30 min</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
              Order Now
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ─── Pagination ─── */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-border hover:bg-surface-hover disabled:opacity-30 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
            page === currentPage
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'border border-border hover:bg-surface-hover'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-border hover:bg-surface-hover disabled:opacity-30 transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   RESTAURANTS LISTING PAGE
   ═══════════════════════════════════════════════ */
const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCuisine, setActiveCuisine] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        const { data } = await restaurantAPI.getAll(currentPage, 9);
        setRestaurants(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load restaurants');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurants();
  }, [currentPage]);

  /* Client-side filter (cuisine + search) */
  const filtered = restaurants.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCuisine =
      activeCuisine === 'All' ||
      r.cuisine?.toLowerCase() === activeCuisine.toLowerCase() ||
      r.description?.toLowerCase().includes(activeCuisine.toLowerCase());

    return matchesSearch && matchesCuisine;
  });

  return (
    <main className="container-custom py-8 animate-fade-in">
      {/* Header & Filters */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-6">All Restaurants</h1>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Cuisine Chips */}
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
            {CUISINES.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setActiveCuisine(cuisine)}
                className={`px-5 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  activeCuisine === cuisine
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border hover:border-primary/50'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative min-w-[260px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 py-2.5 text-sm"
            />
          </div>
        </div>
      </header>

      {/* Error State */}
      {error && (
        <div className="text-center py-20">
          <AlertCircle size={48} className="text-danger mx-auto mb-4" />
          <p className="text-text-secondary mb-4">{error}</p>
          <button onClick={() => setCurrentPage(1)} className="btn-primary btn-sm">
            Try Again
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Restaurant Grid */}
      {!isLoading && !error && (
        <>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filtered.map((restaurant, index) => (
                <RestaurantCard
                  key={restaurant._id || restaurant.id || index}
                  restaurant={restaurant}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <UtensilsCrossed size={48} className="text-text-muted mx-auto mb-4" />
              <p className="text-lg text-text-secondary">No restaurants found</p>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-primary mt-2 hover:underline">
                  Clear search
                </button>
              )}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </main>
  );
};

export default Restaurants;
