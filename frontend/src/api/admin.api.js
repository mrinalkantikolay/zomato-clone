import api from './axios';

// ══════════════════════════════════════════════
//  OWNER API MODULE
//  All calls hit /owner/* (owner-scoped endpoints)
// ══════════════════════════════════════════════

const adminAPI = {
  // Dashboard (supports period: today, month, year, all)
  getDashboardStats: (period = 'all') =>
    api.get(`/owner/dashboard?period=${period}`),

  // Restaurants (read + edit only — no create/delete)
  getRestaurants: (page = 1, limit = 20) =>
    api.get(`/owner/restaurants?page=${page}&limit=${limit}`),
  updateRestaurant: (id, data) => api.put(`/owner/restaurants/${id}`, data),

  // Menu CRUD
  getMenu: (restaurantId, page = 1, limit = 50) =>
    api.get(`/owner/restaurants/${restaurantId}/menu?page=${page}&limit=${limit}`),
  createMenuItem: (restaurantId, data) =>
    api.post(`/owner/restaurants/${restaurantId}/menu`, data),
  updateMenuItem: (menuId, data) => api.put(`/owner/menu/${menuId}`, data),
  deleteMenuItem: (menuId) => api.delete(`/owner/menu/${menuId}`),

  // Orders
  getOrders: (page = 1, limit = 10, status = '') =>
    api.get(`/owner/orders?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`),
  updateOrderStatus: (orderId, status) =>
    api.put(`/owner/orders/${orderId}/status`, { status }),

  // Live Tracking
  getActiveOrders: () => api.get('/owner/tracking/active-orders'),
};

export default adminAPI;

