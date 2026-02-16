import api from './axios';

export const restaurantAPI = {
  getAll: (page = 1, limit = 12) =>
    api.get('/restaurants', { params: { page, limit } }),

  getById: (id) =>
    api.get(`/restaurants/${id}`),
};
