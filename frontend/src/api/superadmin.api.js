import api from './axios';

// ══════════════════════════════════════════════
//  SUPER ADMIN API MODULE
//  All calls hit /superadmin/* (admin-only)
// ══════════════════════════════════════════════

const superadminAPI = {
  // Dashboard (platform-wide stats + commission)
  getDashboardStats: (period = 'all') =>
    api.get(`/superadmin/dashboard?period=${period}`),

  // Restaurants
  getAllRestaurants: () => api.get('/superadmin/restaurants'),

  createRestaurantWithOwner: (data) =>
    api.post('/superadmin/restaurants', data),

  deleteRestaurant: (id) => api.delete(`/superadmin/restaurants/${id}`),
};

export default superadminAPI;
