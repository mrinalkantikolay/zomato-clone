<div align="center">

# 🍔 Zomato Clone

### A Production-Grade Full-Stack Food Delivery Platform

<br/>

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-v5-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Sequelize-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

<br/>

> **Real-time order tracking · Multi-role dashboards · Cloudinary uploads · Simulated payments**

<br/>

[🚀 Quick Start](#-quick-start) &nbsp;•&nbsp;
[📖 API Reference](#-api-reference) &nbsp;•&nbsp;
[🗂️ Project Structure](#️-project-structure) &nbsp;•&nbsp;
[⚙️ Environment Variables](#️-environment-variables) &nbsp;•&nbsp;
[🚢 Deployment](#-deployment)

</div>

---

## ✨ Features

<table>
  <tr>
    <td width="50%">

**🛍️ Customer Experience**

- Browse restaurants with live data from DB
- Add to cart, checkout & place orders
- Simulated Razorpay payment flow
- Real-time delivery tracking on a live map
- Order history & profile management

    </td>
    <td width="50%">

**🏪 Restaurant Owner**

- Admin panel — manage restaurants & menus
- View and update incoming orders
- Live delivery partner tracking dashboard
- Order analytics overview

    </td>
  </tr>
  <tr>
    <td width="50%">

**👑 Super Admin**

- Platform-wide restaurant management
- Approve / reject restaurant listings
- View all orders across the platform

    </td>
    <td width="50%">

**⚡ Platform**

- JWT auth with refresh token rotation
- Role-based access control (4 roles)
- Smooth scroll (Lenis) + animated UI
- Swagger API docs at `/api-docs`
- Redis-backed caching & rate limiting

      </td>

    </tr>
  </table>

---

## 🛠️ Tech Stack

### Frontend

| Technology      | Version | Purpose                   |
| --------------- | ------- | ------------------------- |
| React + Vite    | 18      | UI framework & build tool |
| React Router    | v6      | Client-side routing       |
| Zustand         | Latest  | Global state management   |
| Lenis           | Latest  | Smooth scroll             |
| React Hot Toast | Latest  | Toast notifications       |
| Vanilla CSS     | —       | Styling                   |

### Backend

| Technology         | Version    | Purpose                    |
| ------------------ | ---------- | -------------------------- |
| Node.js            | 18+        | Runtime                    |
| Express            | v5         | Web framework              |
| MongoDB + Mongoose | 9.x        | User & order data          |
| MySQL + Sequelize  | 6.x        | Restaurant & menu data     |
| Redis              | 5.x client | Caching + rate-limit store |
| Socket.IO          | 4.x        | Real-time order tracking   |
| Cloudinary         | 2.x        | Image & video storage      |
| Swagger UI         | 5.x        | Interactive API docs       |

---

## 🗂️ Project Structure

```
zomato-clone/
│
├── 📁 backend/
│   ├── src/
│   │   ├── app.js              ← Express app · middleware · routes
│   │   ├── server.js           ← Entry point · DB init · Socket.IO
│   │   ├── config/             ← DB, Redis, Cloudinary, Swagger configs
│   │   ├── controllers/        ← Route handlers
│   │   ├── services/           ← Business logic
│   │   ├── models/             ← Mongoose & Sequelize models
│   │   ├── routes/             ← Versioned API routes (/api/v1/*)
│   │   ├── middlewares/        ← Auth · error · rate-limit · requestId
│   │   ├── validations/        ← express-validator schemas
│   │   ├── dtos/               ← Response shape transformers
│   │   ├── utils/              ← Helpers & utilities
│   │   └── seeds/              ← DB seed scripts
│   └── package.json
│
├── 📁 frontend/
│   ├── src/
│   │   ├── App.jsx             ← Router + layout composition
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Restaurants.jsx / RestaurantDetail.jsx
│   │   │   ├── Cart.jsx · Checkout.jsx · Payment.jsx
│   │   │   ├── OrderTracking.jsx · MyOrders.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── admin/          ← Owner & Super Admin dashboards
│   │   ├── components/         ← Navbar · Footer · Loader · ProtectedRoute
│   │   ├── api/                ← Axios clients (per resource)
│   │   ├── store/              ← Zustand stores
│   │   └── hooks/              ← useAuth · useLenis
│   └── package.json
│
├── requirements.txt            ← Informational Node.js dependency list
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version         |
| ----------- | --------------- |
| Node.js     | >= 18           |
| npm         | >= 9            |
| MongoDB     | Any recent      |
| MySQL       | 8.x recommended |
| Redis       | 7.x recommended |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/<your-github>/zomato-clone.git
cd zomato-clone
```

---

### Step 2 — Set Up the Backend

```bash
cd backend
npm install
```

> **About `requirements.txt`**
> A `requirements.txt` file lives at the project root as a **human-readable reference** of all backend Node.js packages and their pinned versions. It is informational only — `npm install` (which reads `package.json`) is always the canonical install method.
>
> _Alternative install from `requirements.txt`:_
>
> ```bash
> # Windows PowerShell
> Get-Content ..\requirements.txt | Where-Object { $_ -notmatch '^(#|\s*$)' } | ForEach-Object { npm install $_ }
>
> # macOS / Linux
> grep -vE '^(#|\s*$)' ../requirements.txt | xargs npm install
> ```

Copy and configure your environment file:

```bash
cp .env.example .env
# Edit .env with your DB URIs, secrets, and Cloudinary keys
```

Start the dev server:

```bash
npm run dev
```

| Endpoint     | URL                                   |
| ------------ | ------------------------------------- |
| Backend API  | `http://localhost:4005`               |
| Swagger Docs | `http://localhost:4005/api-docs`      |
| Health Check | `http://localhost:4005/api/v1/health` |

---

### Step 3 — Set Up the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **`http://localhost:5173`**

---

### Step 4 — Seed the Database _(Optional)_

```bash
cd backend
node src/seeds/seedRestaurants.js
```

---

## ⚙️ Environment Variables

Create `backend/.env` from the template below:

```env
# ── Server ──────────────────────────────────────
PORT=4005
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# ── MongoDB ─────────────────────────────────────
MONGO_URI=mongodb://localhost:27017/zomato

# ── MySQL ────────────────────────────────────────
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DB=zomato

# ── Redis ────────────────────────────────────────
REDIS_URL=redis://127.0.0.1:6379

# ── JWT ──────────────────────────────────────────
JWT_SECRET=your_super_secret_key_64_chars_minimum
JWT_REFRESH_SECRET=your_refresh_secret_key

# ── Cloudinary ───────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Note:** Razorpay is simulated — no real Razorpay SDK is installed. Replace dummy methods in `src/services/payment.service.js` to integrate the real SDK.

---

## 📖 API Reference

All routes are versioned under `/api/v1`. Full interactive docs at `http://localhost:4005/api-docs`.

| Resource          | Base Path                   | Description                             |
| ----------------- | --------------------------- | --------------------------------------- |
| Auth              | `/api/v1/auth`              | Signup · login · logout · refresh token |
| Restaurants       | `/api/v1/restaurants`       | Browse & search restaurants             |
| Menu              | `/api/v1/menu`              | Browse menu items                       |
| Cart              | `/api/v1/cart`              | Cart management                         |
| Orders            | `/api/v1/orders`            | Place and view orders                   |
| Order Tracking    | `/api/v1/orders/:id/track`  | Real-time tracking endpoints            |
| Payments          | `/api/v1/payments`          | Initiate & confirm payments             |
| Admin             | `/api/v1/admin`             | Restaurant owner management             |
| Super Admin       | `/api/v1/superadmin`        | Platform-wide management                |
| Owner             | `/api/v1/owner`             | Owner dashboard operations              |
| Delivery Partners | `/api/v1/delivery-partners` | Partner management & simulation         |
| Upload            | `/api/v1/upload`            | Cloudinary file upload                  |

---

## 👥 User Roles

| Role                    | Access Level                                |
| ----------------------- | ------------------------------------------- |
| `user`                  | Browse · order · track · manage profile     |
| `restaurant_owner`      | Admin panel — menu · orders · live tracking |
| `admin` _(Super Admin)_ | Platform-wide restaurant & user control     |
| `delivery_partner`      | Location update endpoints via Socket.IO     |

Role-based routing is enforced in **both** the React frontend (`ProtectedRoute`) and the backend (auth middleware).

---

## 📡 Real-Time Order Tracking

Socket.IO powers live delivery partner location updates:

```js
const socket = io("http://localhost:4005", {
  auth: {
    token: "YOUR_JWT_TOKEN",
    role: "user", // 'delivery_partner' | 'admin' | 'restaurant_owner'
  },
});

// Subscribe to an order's tracking room
socket.emit("join:order", orderId);

// Receive live location updates
socket.on("delivery:locationUpdate", (data) => {
  console.log("Live location:", data.location);
  // Update your map marker here
});
```

---

## 🔒 Security

| Feature           | Implementation                                               |
| ----------------- | ------------------------------------------------------------ |
| Authentication    | JWT (access + refresh tokens) · `bcryptjs` hashing           |
| Role-Based Access | Middleware-enforced on all protected routes                  |
| Security Headers  | `helmet`                                                     |
| XSS Protection    | `xss-clean`                                                  |
| CORS              | Credentials-enabled · origin-restricted                      |
| Rate Limiting     | 100 req / 2 min per IP · Redis-backed via `rate-limit-redis` |
| Input Validation  | `express-validator` on all write endpoints                   |
| SQL Injection     | Prevented by Sequelize parameterized queries                 |
| NoSQL Injection   | Prevented by Mongoose schema enforcement                     |
| Request Size      | Capped at 10 MB                                              |

---

## ⚡ Performance

| Optimization       | Detail                                          |
| ------------------ | ----------------------------------------------- |
| Redis Caching      | Restaurant/menu data cached with TTL (5–10 min) |
| Database Indexing  | Indexes on high-frequency query fields          |
| Pagination         | All list endpoints support `page` & `limit`     |
| Connection Pooling | MongoDB & MySQL connection pools                |
| DTO Pattern        | Lean, minimal response payloads                 |
| Async/Await        | Consistent non-blocking I/O throughout          |

---

## 🚢 Deployment

### Recommended Services

| Layer   | Options                                       |
| ------- | --------------------------------------------- |
| Hosting | AWS EC2 · Railway · Render · DigitalOcean     |
| MongoDB | MongoDB Atlas _(free tier available)_         |
| MySQL   | AWS RDS · PlanetScale _(free tier available)_ |
| Redis   | Redis Cloud · AWS ElastiCache                 |
| Images  | Cloudinary _(already integrated)_             |

### PM2 Process Manager

```bash
npm install -g pm2

cd backend
pm2 start src/server.js --name zomato-backend

pm2 monit                       # Dashboard
pm2 logs zomato-backend         # Logs
pm2 restart zomato-backend      # Restart
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong `JWT_SECRET` (64+ characters)
- [ ] Configure production DB & Redis URLs
- [ ] Set `FRONTEND_URL` to your production domain
- [ ] Enable SSL / TLS on your host
- [ ] Set up Nginx as a reverse proxy

---

## 🧪 Testing

### cURL Quick Tests

```bash
# Sign up
curl -X POST http://localhost:4005/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password@123"}'

# Login
curl -X POST http://localhost:4005/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password@123"}'

# Get restaurants (authenticated)
curl http://localhost:4005/api/v1/restaurants \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Simulate Delivery Tracking

```bash
curl -X POST http://localhost:4005/api/v1/delivery-partners/simulate-location \
  -H "Content-Type: application/json" \
  -d '{"partnerId":"PARTNER_ID","orderId":"ORDER_ID","duration":60}'
```

---

## 🐛 Troubleshooting

<details>
<summary><strong>MongoDB connection fails</strong></summary>

```bash
mongod --version    # Verify installation
mongod              # Start MongoDB
```

</details>

<details>
<summary><strong>MySQL connection fails</strong></summary>

```bash
mysql.server status     # macOS / Linux
mysql.server start
# Windows: Open Services → MySQL → Start
```

</details>

<details>
<summary><strong>Redis connection fails</strong></summary>

```bash
redis-cli ping      # Should return PONG
redis-server        # Start Redis
```

</details>

<details>
<summary><strong>Port 4005 already in use</strong></summary>

```bash
# macOS / Linux
kill -9 $(lsof -ti:4005)

# Windows PowerShell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 4005).OwningProcess -Force
```

</details>

<details>
<summary><strong>CORS errors in browser</strong></summary>

Ensure `FRONTEND_URL` in `backend/.env` exactly matches your frontend URL including port (e.g. `http://localhost:5173`).

</details>

## 📄 License

This project is licensed under the **[MIT License](LICENSE)**.

---

<div align="center">

**Built with Node.js · Express · React · MongoDB · MySQL · Redis · Socket.IO**

<br/>

⭐ If you found this project useful, consider giving it a star!

</div>
