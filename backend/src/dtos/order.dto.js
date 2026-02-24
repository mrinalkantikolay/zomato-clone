/**
 * ORDER DTO
 * ---------
 * Formats order data for API responses
 */

class OrderDTO {
  constructor(order) {
    this.id = order._id || order.id;
    this.userId = order.userId;
    this.restaurantId = order.restaurantId;
    this.items = order.items.map(item => ({
      menuId: item.menuId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }));
    this.totalAmount = order.totalAmount;
    this.status = order.status;
    this.itemCount = order.items.length;
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
  }

  // Convert single order
  static toDTO(order) {
    if (!order) return null;
    return new OrderDTO(order);
  }

  // Convert array of orders
  static toDTOArray(orders) {
    if (!Array.isArray(orders)) return [];
    return orders.map(order => new OrderDTO(order));
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

  // With user details (for admin)
  static toAdminDTO(order) {
    const dto = new OrderDTO(order);
    if (order.userId && typeof order.userId === 'object') {
      dto.user = {
        id: order.userId._id,
        name: order.userId.name,
        email: order.userId.email
      };
    }
    return dto;
  }
}

module.exports = OrderDTO;
