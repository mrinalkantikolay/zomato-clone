# Zomato Clone - Backend API

A comprehensive, production-ready food delivery platform backend built with Node.js, Express, MongoDB, MySQL, and Redis.

## 🚀 Features

- ✅ **Dual Database Architecture** - MongoDB for user data, MySQL for restaurant/menu data
- ✅ **JWT Authentication** - Secure user authentication with role-based access control
- ✅ **Redis Caching** - High-performance caching for frequently accessed data
- ✅ **Input Validation** - Comprehensive validation using express-validator
- ✅ **Error Handling** - Centralized error handling with custom error classes
- ✅ **Database Transactions** - ACID compliance for critical operations
- ✅ **API Documentation** - Interactive Swagger/OpenAPI documentation
- ✅ **Security** - Helmet, CORS, rate limiting, and input sanitization
- ✅ **DTOs** - Data Transfer Objects for response sanitization
- ✅ **Database Indexing** - Optimized queries with strategic indexes
- ✅ **Pagination** - Efficient data retrieval with pagination support

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🛠 Tech Stack

### Core
- **Node.js** (v18+) - JavaScript runtime
- **Express.js** (v5.2) - Web framework
- **MongoDB** (v6+) - NoSQL database for user data
- **MySQL** (v8+) - SQL database for restaurant/menu data
- **Redis** (v7+) - In-memory caching

### Libraries & Tools
- **Mongoose** - MongoDB ODM
- **Sequelize** - MySQL ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation
- **Swagger** - API documentation
- **Helmet** - Security headers
- **Morgan** - HTTP logging
- **Multer** - File uploads

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** >= 6.0
- **MySQL** >= 8.0
- **Redis** >= 7.0

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/zomato-backend.git
cd zomato-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up databases

**MongoDB:**
```bash
# Start MongoDB
mongod

# Create database (MongoDB creates automatically on first use)
```

**MySQL:**
```bash
# Start MySQL
mysql.server start

# Create database
mysql -u root -p
CREATE DATABASE zomato;
EXIT;
```

**Redis:**
```bash
# Start Redis
redis-server
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Environment Variables](#environment-variables))

### 5. Run database migrations

```bash
# MySQL tables will be created automatically on first run
npm start
```

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/zomato

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=zomato

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRES_IN=7d

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Redis Configuration
REDIS_URL=redis://127.0.0.1:6379
```

### Generating JWT Secret

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Server will start on `http://localhost:3001`

### Production Mode

```bash
npm start
```

### Verify Installation

```bash
# Health check
curl http://localhost:3001/api/health

# Expected response:
{
  "success": true,
  "message": "Backend server is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📚 API Documentation

Interactive API documentation is available via Swagger UI:

**Local:** [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

The documentation includes:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Example requests
- Try-it-out functionality

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── mongo.js      # MongoDB connection
│   │   ├── mysql.js      # MySQL connection
│   │   ├── redis.js      # Redis connection
│   │   └── swagger.js    # Swagger configuration
│   ├── controllers/      # Route controllers
│   │   ├── auth.controller.js
│   │   ├── restaurant.controller.js
│   │   ├── menu.controller.js
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   ├── payment.controller.js
│   │   └── admin.controller.js
│   ├── dtos/            # Data Transfer Objects
│   │   ├── user.dto.js
│   │   ├── restaurant.dto.js
│   │   ├── menu.dto.js
│   │   ├── cart.dto.js
│   │   ├── order.dto.js
│   │   └── payment.dto.js
│   ├── middlewares/     # Custom middleware
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── error.middleware.js
│   │   ├── validation.middlewares.js
│   │   └── cache.middleware.js
│   ├── models/          # Database models
│   │   ├── user.model.js         # MongoDB
│   │   ├── cart.model.js         # MongoDB
│   │   ├── order.model.js        # MongoDB
│   │   ├── payment.model.js      # MongoDB
│   │   ├── restaurant.model.js   # MySQL
│   │   └── menu.model.js         # MySQL
│   ├── routes/          # API routes
│   │   ├── auth.routes.js
│   │   ├── restaurant.routes.js
│   │   ├── menu.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── payment.routes.js
│   │   └── admin.routes.js
│   ├── services/        # Business logic
│   │   ├── auth.service.js
│   │   ├── restaurant.service.js
│   │   ├── menu.service.js
│   │   ├── cart.service.js
│   │   ├── order.service.js
│   │   ├── payment.service.js
│   │   └── admin.service.js
│   ├── utils/           # Utility functions
│   │   ├── ApiError.js
│   │   ├── asyncHandler.js
│   │   └── paginate.js
│   ├── validations/     # Input validation schemas
│   │   ├── auth.validation.js
│   │   ├── restaurant.validation.js
│   │   ├── menu.validation.js
│   │   ├── cart.validation.js
│   │   ├── order.validation.js
│   │   └── payment.validation.js
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── .env                 # Environment variables
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies
└── README.md           # This file
```

## 🗄 Database Schema

### MongoDB Collections

#### Users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  createdAt: Date,
  updatedAt: Date
}
```

#### Carts
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  restaurantId: Number,
  items: [{
    menuId: Number,
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Orders
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  restaurantId: Number (indexed),
  items: Array,
  totalAmount: Number,
  status: String (enum, indexed),
  createdAt: Date (indexed),
  updatedAt: Date
}
```

### MySQL Tables

#### Restaurants
```sql
CREATE TABLE restaurants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  description TEXT,
  imageUrl VARCHAR(255),
  isOpen BOOLEAN DEFAULT true,
  createdAt DATETIME,
  updatedAt DATETIME,
  INDEX idx_name (name),
  INDEX idx_isOpen (isOpen)
);
```

#### Menu
```sql
CREATE TABLE menu (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  price FLOAT NOT NULL,
  description TEXT,
  imageUrl VARCHAR(255),
  isAvailable BOOLEAN DEFAULT true,
  restaurantId INT,
  createdAt DATETIME,
  updatedAt DATETIME,
  INDEX idx_restaurant (restaurantId),
  INDEX idx_available (isAvailable),
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id)
);
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login to existing account

### Restaurants (Public)
- `GET /api/restaurants` - Get all restaurants (paginated, cached)
- `GET /api/restaurants/:id` - Get restaurant by ID (cached)

### Restaurants (Admin)
- `POST /api/restaurants` - Create restaurant
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant

### Menu (Public)
- `GET /api/menu/restaurant/:restaurantId` - Get menu by restaurant (cached)

### Menu (Admin)
- `POST /api/menu/restaurant/:restaurantId` - Create menu item
- `PUT /api/menu/:menuId` - Update menu item
- `DELETE /api/menu/:menuId` - Delete menu item

### Cart (Protected)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/:menuId` - Remove item from cart

### Orders (Protected)
- `POST /api/orders` - Place order (with transaction)
- `GET /api/orders` - Get user's order history (paginated)

### Payments (Protected)
- `POST /api/payments` - Create payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments` - Get user's payment history (paginated)

### Admin (Admin Only)
- `GET /api/admin/orders` - Get all orders (paginated)
- `PUT /api/admin/orders/:orderId` - Update order status
- `GET /api/admin/payments` - Get all payments (paginated)
- `GET /api/admin/dashboard` - Get dashboard statistics

## 🧪 Testing

### Manual Testing with cURL

```bash
# Signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password@123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password@123"}'

# Get restaurants (with token)
curl http://localhost:3001/api/restaurants \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Testing with Postman

1. Import the Swagger JSON from `/api-docs`
2. Set up environment variables
3. Use the collection runner

## 🚢 Deployment

### Prerequisites
- Node.js hosting (Heroku, AWS, DigitalOcean)
- MongoDB Atlas or self-hosted MongoDB
- MySQL database (AWS RDS, PlanetScale)
- Redis instance (Redis Cloud, AWS ElastiCache)

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production database URLs
4. Set up SSL/TLS certificates
5. Configure CORS for production domain

### Deployment Steps

```bash
# Build (if needed)
npm install --production

# Start server
npm start
```

### Recommended Services
- **Hosting:** AWS EC2, Heroku, DigitalOcean
- **MongoDB:** MongoDB Atlas
- **MySQL:** AWS RDS, PlanetScale
- **Redis:** Redis Cloud, AWS ElastiCache
- **CDN:** Cloudflare, AWS CloudFront

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ Rate limiting (100 req/15min)
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (Sequelize)
- ✅ NoSQL injection prevention (Mongoose)
- ✅ XSS protection
- ✅ Request size limiting (10MB)

## ⚡ Performance Optimizations

- ✅ Redis caching (5-10min TTL)
- ✅ Database indexing (13 indexes)
- ✅ Pagination (all list endpoints)
- ✅ Database transactions (order placement)
- ✅ Connection pooling
- ✅ Async/await error handling

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version
ps aux | grep mongod

# Start MongoDB
mongod
```

### MySQL Connection Error
```bash
# Check MySQL status
mysql.server status

# Start MySQL
mysql.server start
```

### Redis Connection Error
```bash
# Check Redis
redis-cli ping

# Start Redis
redis-server
```

### Port Already in Use
```bash
# Find process using port 3001
lsof -ti:3001

# Kill process
kill -9 $(lsof -ti:3001)
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



## 🙏 Acknowledgments

- Express.js team for the amazing framework
- MongoDB and MySQL communities
- All open-source contributors

---

**Built with ❤️ using Node.js, Express, MongoDB, MySQL, and Redis**
