import api from './axios';

export const menuAPI = {
  getByRestaurant: (restaurantId, page = 1, limit = 50) =>
    api.get(`/menu/restaurant/${restaurantId}`, { params: { page, limit } }),
};
