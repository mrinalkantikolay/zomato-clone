import api from './axios';

export const orderAPI = {
  placeOrder: (data) =>
    api.post('/orders', data),

  getUserOrders: (page = 1, limit = 10) =>
    api.get('/orders', { params: { page, limit } }),
};
