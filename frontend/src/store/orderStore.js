import { create } from 'zustand';
import { orderAPI } from '../api/order.api';
import { trackingAPI } from '../api/tracking.api';

/**
 * Order Store (Zustand)
 *
 * Manages:
 * - Order history list with pagination
 * - Current order tracking data
 * - Loading and error states
 */
const useOrderStore = create((set, get) => ({
  // ── State ──
  orders: [],
  pagination: { total: 0, page: 1, limit: 10 },
  trackingData: null,
  isLoading: false,
  isTrackingLoading: false,
  error: null,

  // ── Fetch paginated order history ──
  fetchOrders: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await orderAPI.getUserOrders(page, limit);
      set({
        orders: data.data || [],
        pagination: {
          total: data.total || 0,
          page: data.page || page,
          limit: data.limit || limit,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to load orders',
        isLoading: false,
      });
    }
  },

  // ── Fetch tracking data for a specific order ──
  fetchTracking: async (orderId) => {
    set({ isTrackingLoading: true, error: null });
    try {
      const { data } = await trackingAPI.getOrderTracking(orderId);
      set({
        trackingData: data.data,
        isTrackingLoading: false,
      });
      return data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to load tracking info',
        isTrackingLoading: false,
      });
      return null;
    }
  },

  // ── Update tracking data from Socket.IO events ──
  updateTrackingStatus: (statusData) => {
    const current = get().trackingData;
    if (!current) return;

    set({
      trackingData: {
        ...current,
        status: statusData.status,
        estimatedDeliveryTime: statusData.estimatedDeliveryTime || current.estimatedDeliveryTime,
        deliveryPartner: statusData.deliveryPartner || current.deliveryPartner,
      },
    });
  },

  updateDeliveryLocation: (locationData) => {
    const current = get().trackingData;
    if (!current) return;

    set({
      trackingData: {
        ...current,
        deliveryLocation: {
          latitude: locationData.location.latitude,
          longitude: locationData.location.longitude,
          updatedAt: locationData.timestamp,
        },
      },
    });
  },

  // ── Clear tracking data ──
  clearTracking: () => set({ trackingData: null }),
}));

export default useOrderStore;
