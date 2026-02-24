import api from './axios';

export const trackingAPI = {
  /**
   * Get full tracking info for an order
   * Includes status history, delivery partner, live location
   */
  getOrderTracking: (orderId) =>
    api.get(`/orders/${orderId}/track`),
};
