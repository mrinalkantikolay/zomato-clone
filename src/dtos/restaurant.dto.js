/**
 * RESTAURANT DTO
 * --------------
 * Formats restaurant data for API responses
 */

class RestaurantDTO {
  constructor(restaurant) {
    this.id = restaurant.id;
    this.name = restaurant.name;
    this.address = restaurant.address;
    this.description = restaurant.description;
    this.imageUrl = restaurant.imageUrl;
    this.createdAt = restaurant.createdAt;
    this.updatedAt = restaurant.updatedAt;
  }

  // Convert single restaurant
  static toDTO(restaurant) {
    if (!restaurant) return null;
    return new RestaurantDTO(restaurant);
  }

  // Convert array of restaurants
  static toDTOArray(restaurants) {
    if (!Array.isArray(restaurants)) return [];
    return restaurants.map(restaurant => new RestaurantDTO(restaurant));
  }

  // For paginated responses
  static toPaginatedDTO(data) {
    return {
      total: data.total,
      page: data.page,
      limit: data.limit,
      data: this.toDTOArray(data.data)
    };
  }
}

module.exports = RestaurantDTO;
