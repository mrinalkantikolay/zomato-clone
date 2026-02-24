/**
 * MENU DTO
 * --------
 * Formats menu item data for API responses
 */

class MenuDTO {
  constructor(menu) {
    this.id = menu.id;
    this.name = menu.name;
    this.price = menu.price;
    this.description = menu.description;
    this.imageUrl = menu.imageUrl;
    this.isAvailable = menu.isAvailable;
    this.restaurantId = menu.restaurantId;
    this.createdAt = menu.createdAt;
    this.updatedAt = menu.updatedAt;
  }

  // Convert single menu item
  static toDTO(menu) {
    if (!menu) return null;
    return new MenuDTO(menu);
  }

  // Convert array of menu items
  static toDTOArray(menus) {
    if (!Array.isArray(menus)) return [];
    return menus.map(menu => new MenuDTO(menu));
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

module.exports = MenuDTO;
