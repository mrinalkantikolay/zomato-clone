import api from './axios';

export const cartAPI = {
  getCart: () =>
    api.get('/cart'),

  addToCart: (data) =>
    api.post('/cart', data),

  removeItem: (menuId) =>
    api.delete(`/cart/${menuId}`),
};
