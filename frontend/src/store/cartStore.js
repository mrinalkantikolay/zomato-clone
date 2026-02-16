import { create } from 'zustand';
import { cartAPI } from '../api/cart.api';
import toast from 'react-hot-toast';

const useCartStore = create((set, get) => ({
  // State
  cart: null,
  items: [],
  totalAmount: 0,
  restaurantId: null,
  isLoading: false,
  error: null,

  // Computed
  get itemCount() {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Fetch cart from server
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await cartAPI.getCart();
      const cart = data.data;
      set({
        cart,
        items: cart?.items || [],
        totalAmount: cart?.totalAmount || 0,
        restaurantId: cart?.restaurantId || null,
        isLoading: false,
      });
    } catch (error) {
      // 404 = empty cart (not an error)
      if (error.response?.status === 404) {
        set({ cart: null, items: [], totalAmount: 0, restaurantId: null, isLoading: false });
      } else {
        set({ error: error.response?.data?.message || 'Failed to load cart', isLoading: false });
      }
    }
  },

  // Add item to cart (or increment quantity)
  addToCart: async ({ restaurantId, menuId, name, price, quantity = 1 }) => {
    try {
      const { data } = await cartAPI.addToCart({ restaurantId, menuId, name, price, quantity });
      const cart = data.data;
      set({
        cart,
        items: cart?.items || [],
        totalAmount: cart?.totalAmount || 0,
        restaurantId: cart?.restaurantId || null,
      });
      toast.success(`${name} added to cart`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item';
      toast.error(message);
      throw error;
    }
  },

  // Increment quantity by 1
  incrementItem: async (menuId) => {
    const { items, restaurantId } = get();
    const item = items.find((i) => String(i.menuId) === String(menuId));
    if (!item) return;

    try {
      const { data } = await cartAPI.addToCart({
        restaurantId,
        menuId: item.menuId,
        name: item.name,
        price: item.price,
        quantity: 1,
      });
      const cart = data.data;
      set({
        cart,
        items: cart?.items || [],
        totalAmount: cart?.totalAmount || 0,
        restaurantId: cart?.restaurantId || null,
      });
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  },

  // Decrement quantity by 1 (remove if qty becomes 0)
  decrementItem: async (menuId) => {
    const { items } = get();
    const item = items.find((i) => String(i.menuId) === String(menuId));
    if (!item) return;

    if ((item.quantity || 1) <= 1) {
      // Remove item
      await get().removeItem(menuId, item.name);
    } else {
      // Optimistic update then sync
      const updatedItems = items.map((i) =>
        String(i.menuId) === String(menuId)
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
      const newTotal = updatedItems.reduce((s, i) => s + i.price * i.quantity, 0);
      set({ items: updatedItems, totalAmount: newTotal });

      try {
        // Backend addToCart with quantity -1 will decrement
        const { data } = await cartAPI.addToCart({
          restaurantId: get().restaurantId,
          menuId: item.menuId,
          name: item.name,
          price: item.price,
          quantity: -1,
        });
        const cart = data.data;
        set({
          cart,
          items: cart?.items || [],
          totalAmount: cart?.totalAmount || 0,
          restaurantId: cart?.restaurantId || null,
        });
      } catch (error) {
        // Revert optimistic update
        get().fetchCart();
        toast.error('Failed to update quantity');
      }
    }
  },

  // Remove item from cart
  removeItem: async (menuId, itemName) => {
    try {
      const { data } = await cartAPI.removeItem(menuId);
      const cart = data.data;
      set({
        cart,
        items: cart?.items || [],
        totalAmount: cart?.totalAmount || 0,
        restaurantId: cart?.restaurantId || null,
      });
      toast.success(`${itemName || 'Item'} removed`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
    }
  },

  // Clear local cart state (after order placed)
  clearCart: () => {
    set({ cart: null, items: [], totalAmount: 0, restaurantId: null });
  },
}));

export default useCartStore;
