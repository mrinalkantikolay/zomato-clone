/**
 * PAYMENT DTO
 * -----------
 * Formats payment data for API responses
 * Hides sensitive payment details
 */

class PaymentDTO {
  constructor(payment) {
    this.id = payment._id || payment.id;
    this.userId = payment.userId;
    this.orderId = payment.orderId;
    this.amount = payment.amount;
    this.method = payment.method;
    this.status = payment.status;
    // Only show last 4 digits of payment ID for security
    this.razorpayOrderId = payment.razorpayOrderId;
    this.createdAt = payment.createdAt;
    this.updatedAt = payment.updatedAt;
  }

  // Convert single payment
  static toDTO(payment) {
    if (!payment) return null;
    return new PaymentDTO(payment);
  }

  // Convert array of payments
  static toDTOArray(payments) {
    if (!Array.isArray(payments)) return [];
    return payments.map(payment => new PaymentDTO(payment));
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

  // With user and order details (for admin)
  static toAdminDTO(payment) {
    const dto = new PaymentDTO(payment);

    if (payment.userId && typeof payment.userId === 'object') {
      dto.user = {
        id: payment.userId._id,
        name: payment.userId.name,
        email: payment.userId.email
      };
    }

    if (payment.orderId && typeof payment.orderId === 'object') {
      dto.order = {
        id: payment.orderId._id,
        totalAmount: payment.orderId.totalAmount,
        status: payment.orderId.status
      };
    }

    return dto;
  }
}

module.exports = PaymentDTO;
