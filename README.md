<p align="center">
  <img src="https://img.shields.io/badge/status-production%20live-22c55e?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/node-24.14-339933?style=for-the-badge&logo=node.js" alt="Node">
  <img src="https://img.shields.io/badge/typescript-5.6-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/express-4.21-000?style=for-the-badge&logo=express" alt="Express">
  <img src="https://img.shields.io/badge/prisma-5.22-2D3748?style=for-the-badge&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/postgresql-16-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
</p>

<h1 align="center">🍪 Box-Inteligente API</h1>
<p align="center"><strong>REST API — Inventory Management System</strong></p>
<p align="center">
  <a href="https://box-inteligente-api-rf.onrender.com/health">🌐 Live API</a> &nbsp;|&nbsp;
  <a href="https://github.com/RFernandes10/box-inteligente-web">📦 Frontend</a>
</p>

---

## 📋 Overview

Fully-featured REST API for a cookie store inventory management system. Built with **clean architecture**, **modular design**, and **TypeScript** — deployed on a free-tier infrastructure with zero monthly cost.

### Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────┐
│  Frontend   │────▶│   Express API    │────▶│PostgreSQL│
│ (React/Vite)│     │ (TypeScript)     │     │ (Neon)   │
│  Vercel     │     │  Render          │     │ Serverless│
└─────────────┘     └──────────────────┘     └──────────┘
                           │
                    ┌──────┴──────┐
                    │   Prisma    │
                    │    ORM      │
                    └─────────────┘
```

---

## ⚡ Key Features

### Authentication & Authorization
| Feature | Detail |
|---------|--------|
| **JWT Access + Refresh Tokens** | Secure stateless auth with rotation |
| **Role-based Access Control** | 3 roles: Admin / Manager / Stockist |
| **Password Hashing** | bcrypt with 12 salt rounds |

### Business Logic
| Feature | Detail |
|---------|--------|
| **Products CRUD** | Full lifecycle with search, image upload, barcode |
| **Stock Movements** | Entry/exit engine with audit trail (IP, user, timestamps) |
| **Dashboard Analytics** | Charts, low-stock alerts, top products, expiration tracking |
| **Reports** | PDF (PDFKit), Excel (xlsx), CSV export |
| **Soft Delete** | All entities support logical deletion with restore |

### Security
- Helmet HTTP headers
- CORS whitelist
- Rate limiting (100 req / 15 min)
- Input validation (Zod schemas)
- XSS protection
- Request IP logging

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 24 + TypeScript 5.6 | Type-safe execution |
| **Framework** | Express 4.21 | HTTP server & routing |
| **ORM** | Prisma 5.22 | Database access & migrations |
| **Database** | PostgreSQL 16 (Neon) | Relational data storage |
| **Auth** | jsonwebtoken + bcrypt | JWT tokens & password hashing |
| **Validation** | Zod 3.23 | Request schema validation |
| **File Upload** | Multer | Product image uploads |
| **Logging** | Winston 3 | Structured JSON logging |
| **Security** | helmet, cors, express-rate-limit | HTTP hardening |

---

## 📡 API Endpoints

### Public
```
POST /auth/login     Login with email + password
POST /auth/refresh   Refresh expired access token
```

### Authenticated
```
POST   /auth/logout           Revoke refresh token
GET    /users                 List users (Admin)
POST   /users                 Create user (Admin)
GET    /brands                List brands
POST   /brands                Create brand (Admin/Manager)
PUT    /brands/:id            Update brand
DELETE /brands/:id            Delete brand (Admin)
GET    /categories            List categories
POST   /categories            Create category (Admin/Manager)
GET    /suppliers             List suppliers
POST   /suppliers             Create supplier (Admin/Manager)
GET    /products              List products (paginated, searchable)
POST   /products              Create product (Admin/Manager)
PUT    /products/:id          Update product
PATCH  /products/:id/image    Upload product image
POST   /stock-movements       Register movement
GET    /dashboard/summary     Dashboard metrics
GET    /reports/movements     Export movement report
GET    /health                Health check
```

---

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/RFernandes10/box-inteligente-api.git
cd box-inteligente-api

# Install
npm install

# Configure
cp .env.example .env
# Edit DATABASE_URL with your PostgreSQL connection string

# Database
npx prisma generate
npx prisma migrate dev
npm run prisma:seed      # Creates admin user + initial data

# Run
npm run dev               # http://localhost:3333
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `PORT` | Server port (default: 3333) |
| `FRONTEND_URL` | Frontend origin for CORS |

---

## 🧪 Testing

```bash
npm test          # Run tests
npm run test:watch   # Watch mode
```

---

## 📦 Deployment

| Service | Tier | URL |
|---------|------|-----|
| **API Host** | Render (Free) | [box-inteligente-api-rf.onrender.com](https://box-inteligente-api-rf.onrender.com/health) |
| **Database** | Neon (Free) | PostgreSQL 16, 0.5GB |
| **CI/CD** | Auto-deploy on git push | GitHub → Render |

> **Note:** Free Render instances spin down after 15 min of inactivity. First request after idle takes ~30s.

---

## 📁 Project Structure

```
src/
├── config/           # Env validation, database connection
├── modules/
│   ├── auth/         # Login, refresh, logout
│   ├── users/        # User management (Admin only)
│   ├── brands/       # Brands CRUD
│   ├── categories/   # Categories CRUD
│   ├── suppliers/    # Suppliers CRUD
│   ├── products/     # Products CRUD + image upload
│   ├── stock-movements/  # Entry/exit engine
│   ├── dashboard/    # Metrics & charts
│   └── reports/      # PDF, Excel, CSV export
├── shared/
│   ├── errors/       # Custom error class
│   ├── middlewares/   # Auth, validation, error handling
│   └── utils/        # Logger, response helpers
└── server.ts         # Entry point
```

---

## 📄 License

MIT &mdash; feel free to use as a reference or portfolio project.
