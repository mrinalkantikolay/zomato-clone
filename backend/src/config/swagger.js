const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zomato Clone API',
      version: '1.0.0',
      description: 'A comprehensive food delivery platform API with authentication, restaurant management, menu operations, cart, orders, and payment integration.',
      contact: {
        name: 'API Support',
        email: 'support@zomato.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.zomato.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Restaurant: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Pizza Palace' },
            address: { type: 'string', example: '123 Main St, New York' },
            description: { type: 'string', example: 'Best pizza in town' },
            imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
            isOpen: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Menu: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Margherita Pizza' },
            price: { type: 'number', example: 12.99 },
            description: { type: 'string', example: 'Classic pizza with tomato and cheese' },
            imageUrl: { type: 'string', example: 'https://example.com/pizza.jpg' },
            isAvailable: { type: 'boolean', example: true },
            restaurantId: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            restaurantId: { type: 'integer', example: 1 },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  menuId: { type: 'integer', example: 1 },
                  name: { type: 'string', example: 'Pizza' },
                  price: { type: 'number', example: 12.99 },
                  quantity: { type: 'integer', example: 2 },
                  subtotal: { type: 'number', example: 25.98 }
                }
              }
            },
            totalAmount: { type: 'number', example: 25.98 },
            itemCount: { type: 'integer', example: 1 }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            restaurantId: { type: 'integer', example: 1 },
            items: { type: 'array', items: { type: 'object' } },
            totalAmount: { type: 'number', example: 25.98 },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
              example: 'pending'
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        DeliveryPartner: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Rahul Sharma' },
            phone: { type: 'string', example: '9876543210' },
            email: { type: 'string', example: 'rahul@delivery.com' },
            vehicleType: { type: 'string', enum: ['bike', 'scooter', 'bicycle', 'car'], example: 'bike' },
            vehicleNumber: { type: 'string', example: 'DL01AB1234' },
            currentLocation: {
              type: 'object',
              properties: {
                latitude: { type: 'number', example: 28.6139 },
                longitude: { type: 'number', example: 77.2090 },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            },
            isAvailable: { type: 'boolean', example: true },
            rating: { type: 'number', example: 4.5 },
            totalDeliveries: { type: 'integer', example: 150 }
          }
        },
        OrderTracking: {
          type: 'object',
          properties: {
            orderId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            status: { type: 'string', example: 'out_for_delivery' },
            deliveryPartner: { $ref: '#/components/schemas/DeliveryPartner' },
            deliveryLocation: {
              type: 'object',
              properties: {
                latitude: { type: 'number', example: 28.6139 },
                longitude: { type: 'number', example: 77.2090 },
                timestamp: { type: 'string', format: 'date-time' }
              }
            },
            estimatedDeliveryTime: { type: 'string', format: 'date-time' },
            statusHistory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  timestamp: { type: 'string', format: 'date-time' },
                  updatedBy: { type: 'string' }
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Restaurants', description: 'Restaurant management' },
      { name: 'Menu', description: 'Menu item operations' },
      { name: 'Cart', description: 'Shopping cart operations' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Order Tracking', description: 'Real-time order tracking and delivery updates' },
      { name: 'Delivery Partners', description: 'Delivery partner management and simulation' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Admin', description: 'Admin-only endpoints' },
      { name: 'Admin Tracking', description: 'Admin live tracking dashboard' }
    ]
  },
  apis: ['./src/routes/*.js'] // Path to API routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
