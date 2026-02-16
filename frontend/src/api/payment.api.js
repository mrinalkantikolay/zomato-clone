import api from './axios';

export const paymentAPI = {
  createPayment: (orderId) =>
    api.post('/payments', { orderId }),

  verifyPayment: (data) =>
    api.post('/payments/verify', data),

  getUserPayments: (page = 1, limit = 10) =>
    api.get('/payments', { params: { page, limit } }),
};
