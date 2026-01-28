/**
 * CART DTO
 * --------
 * Formats cart data for API responses
 */

class CartDTO {
  constructor(cart) {
    this.id = cart._id || cart.id;
    this.userId = cart.userId;
    this.restaurantId = cart.restaurantId;
    this.items = cart.items.map(item => ({
      menuId: item.menuId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }));
    this.totalAmount = cart.totalAmount;
    this.itemCount = cart.items.length;
    this.createdAt = cart.createdAt;
    this.updatedAt = cart.updatedAt;
  }

  // Convert single cart
  static toDTO(cart) {
    if (!cart) return null;
    return new CartDTO(cart);
  }
}

module.exports = CartDTO;
