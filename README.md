# MERN Turf Booking & Admin Management Hub

A complete, production-ready, highly aesthetic Turf Booking Web Application. It contains a highly secure JWT administration console featuring dual role-based authorization scopes (Super Admin and Standard Admin), dynamic timed slot calculation systems, walkthrough receipt QR code makers, financial Razorpay checking gates with mock sandboxes, Excel exports, and visual Recharts stats analytics.

---

## 🚀 Quick Execution Guide

Follow these quick commands to spin up the MongoDB database, Express API server, and Vite React user interface:

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (running locally on `mongodb://127.0.0.1:27017` or configured via `.env` MONGO_URI)

---

### 2. Backend Execution

```bash
# Navigate to the backend directory
cd backend

# Install node dependencies
npm install

# Run backend development server (pre-configured with nodemon)
npm run dev
```

*The backend boots on **`http://localhost:5000`**. On first boot, it automatically connects to MongoDB and seeds the following:*
1. **Initial Super Admin**: Pre-filled using `ADMIN_EMAIL=learn.microx@gmail.com` and `ADMIN_PASSWORD=MicroX@01`
2. **3 Premium Turf Arenas**: Camp Nou Football Arena, Lords Cricket Nets, Wimbledon Clay Courts
3. **2 Active Promotional Coupons**: `WELCOME200` (Fixed ₹200 discount) and `PROMO15` (15% percentage discount)

---

### 3. Frontend Development App

```bash
# Navigate to the frontend directory
cd frontend

# Install client packages
npm install

# Run Vite local development app
npm run dev
```

*The application compiles and mounts on:
- **User Booking Portal**: `http://localhost:5173/`
- **Admin Management Panel**: `http://localhost:5173/admin`

---

## 🔐 Credentials Checklist

Use these secure credentials at `http://localhost:5173/admin/login` to login and explore administrative dashboard tabs:

- **Email**: `learn.microx@gmail.com`
- **Password**: `MicroX@01`
- *Password Show/Hide toggle handles validation feedback banners.*

---

## 🏛 Architecture Layout

The application has been engineered with separation of concerns:

```
├── backend/
│   ├── src/
│   │   ├── config/          # Mongoose DB connection scripts
│   │   ├── controllers/     # Controller logic (Admin, Bookings, Coupons, Payments, Stats)
│   │   ├── middlewares/     # JWT Auth, Role barriers, input validation, global errors
│   │   ├── models/          # MongoDB Schemas (Admin, Turf, Booking, Coupon, Payment)
│   │   ├── routes/          # Express API route endpoints mapping
│   │   └── server.js        # Main Express server and auto-seeding routines
│   ├── package.json
│   └── .env                 # Server PORT, MONGO_URI, JWT_SECRET, and Razorpay parameters
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI templates (ProtectedLayout sidebars, profile headers)
│   │   ├── context/         # AuthContext (Persistent session loads, login/logout, loadings)
│   │   ├── pages/           # Pages (Dashboard stats, Bookings walk-ins, Payments, Coupons, Admins)
│   │   ├── utils/           # Custom Axios Client with 401 automatic logout interceptors
│   │   ├── App.jsx          # Route nodes mapping
│   │   ├── index.css        # Premium custom scrollbar variables and responsive glassmorphisms
│   │   └── main.jsx         # Bootstrapping React virtual DOMs
│   ├── vite.config.js
│   └── package.json
```

---

## 🛡 Security Specifications

1. **Secure Session Loading**: Checks validity of JWT tokens on startup and refresh via `/api/admin/me` endpoints.
2. **Cookie & Header Flexibility**: Support cookie credentials as well as `Bearer` Authorization headers.
3. **Double Booking Guard**: Evaluates slot reservation timestamps on database layers prior to confirming bookings to prevent concurrent bookings.
4. **Super Admin Scope Restriction**: Restricts CRUD commands (deleting/editing/adding other admins) strictly to Super Admin role credentials. Standard Admins have view-only permissions.
5. **No Plain-Text Passwords**: Utilizes 10-rounds `bcrypt` salts pre-save inside mongoose schemas.
6. **XSS protection**: Standardizes request policies with `helmet` headers, CORS credentials bounds, and Express rate limiting.
"# Turf-Booking" 
