<p align="center">
  <img src="https://img.shields.io/badge/status-production%20live-22c55e?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/node-24.14-339933?style=for-the-badge&logo=node.js" alt="Node">
  <img src="https://img.shields.io/badge/typescript-5.6-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/express-4.21-000?style=for-the-badge&logo=express" alt="Express">
  <img src="https://img.shields.io/badge/prisma-5.22-2D3748?style=for-the-badge&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/postgresql-16-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/tests-17%20passing-22c55e?style=for-the-badge&logo=vitest" alt="Tests">
</p>

<h1 align="center">🍪 Box-Inteligente API</h1>
<p align="center"><strong>REST API — Inventory Management System</strong></p>
<p align="center">
  <a href="https://box-inteligente-api-rf.onrender.com/health">🌐 Live API</a> &nbsp;|&nbsp;
  <a href="https://github.com/RFernandes10/box-inteligente-web">📦 Frontend</a>
</p>

---

## 📋 Overview

Fully-featured REST API for a cookie store inventory management system — product catalog, stock movements with **concurrency-safe stock control**, role-based access, audit trail, and PDF/Excel/CSV reports. Built with a **modular architecture** in **TypeScript**, tested with **Vitest**, and deployed on free-tier infrastructure with zero monthly cost.

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
| **JWT Access + Refresh Tokens** | Stateless auth; refresh tokens are **single-use with rotation** |
| **Role-based Access Control** | 3 roles: Admin / Manager / Stockist |
| **Password Hashing** | bcrypt with 12 salt rounds |
| **Login Brute-force Protection** | Rate limiter keyed by e-mail + IP (5 attempts/min) |

### Stock Engine
| Feature | Detail |
|---------|--------|
| **Pessimistic Row Locking** | Stock is read/validated/updated atomically (`SELECT ... FOR UPDATE`) — **no overselling** under concurrent requests |
| **Full Audit Trail** | Every movement stores previous/new stock, user, and hashed IP |
| **Entry / Exit Validation** | Insufficient-stock and negative-quantity requests are rejected |

### Business Logic
| Feature | Detail |
|---------|--------|
| **Products CRUD** | Search, barcode, image upload with **magic-byte validation** |
| **Dashboard Analytics** | Low-stock alerts, top products, expiration tracking |
| **Reports** | PDF (PDFKit), Excel (xlsx), CSV export |
| **Soft Delete** | All entities support logical deletion |

### Security
- **Pessimistic stock locking** to prevent overselling
- **CSV formula-injection protection** on report export
- **Magic-byte validation** on uploaded images
- Helmet HTTP headers + CORS whitelist
- Rate limiting (100 req / 15 min global + stricter login limiter)
- Input validation via Zod schemas
- Hashed request IPs stored in audit logs

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
| **Tests** | Vitest | Unit tests for core services |

---

## 📡 API Endpoints

All routes (except `/health`) are prefixed with `/api`.

### Public
```
POST  /api/auth/login       Login with email + password (rate-limited)
POST  /api/auth/refresh     Rotate an expired access token
POST  /api/auth/logout      Revoke refresh token
GET   /health               Health check (no prefix)
```

### Users (Admin only)
```
GET    /api/users                List users
POST   /api/users                Create user
PUT    /api/users/:id            Update user
PATCH  /api/users/:id/status     Activate / deactivate user
DELETE /api/users/:id            Soft delete user
```

### Brands / Categories / Suppliers
```
GET    /api/brands        GET    /api/categories        GET    /api/suppliers
GET    /api/brands/all    GET    /api/categories/all    GET    /api/suppliers/all
POST   /api/brands        POST   /api/categories        POST   /api/suppliers        (Admin/Manager)
PUT    /api/brands/:id    PUT    /api/categories/:id    PUT    /api/suppliers/:id    (Admin/Manager)
DELETE /api/brands/:id    DELETE /api/categories/:id    DELETE /api/suppliers/:id    (Admin)
```

### Products
```
GET    /api/products                  List (paginated, searchable)
GET    /api/products/search           Search by code/name
GET    /api/products/:id              Get by id
POST   /api/products                  Create (Admin/Manager, optional image)
PUT    /api/products/:id              Update (Admin/Manager, optional image)
PATCH  /api/products/:id/image        Upload image
DELETE /api/products/:id              Delete (Admin)
```

### Stock Movements
```
POST  /api/stock-movements/entry           Register stock entry
POST  /api/stock-movements/exit            Register stock exit
GET   /api/stock-movements                 List with filters (Admin/Manager)
GET   /api/stock-movements/product/:id     History by product (Admin/Manager)
```

### Dashboard & Reports (Admin/Manager)
```
GET  /api/dashboard/summary            Summary metrics
GET  /api/dashboard/movements-chart    Movement chart data
GET  /api/dashboard/low-stock          Low-stock products
GET  /api/dashboard/top-products       Top-selling products
GET  /api/dashboard/expiring-soon      Products expiring soon
GET  /api/reports/movements            Movement report (PDF/Excel/CSV)
GET  /api/reports/products             Product report (PDF/Excel/CSV)
GET  /api/reports/low-stock            Low-stock report (PDF/Excel/CSV)
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

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_SECRET` | — | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | — | Secret for the auth/refresh flow |
| `JWT_EXPIRES_IN` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime (days) |
| `PORT` | `3333` | Server port |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin |
| `UPLOAD_PATH` | `./uploads` | Product image storage path |
| `MAX_FILE_SIZE` | `5242880` | Max upload size in bytes (5MB) |

---

## 🧪 Quality Gates

```bash
npm run lint       # ESLint (zero warnings)
npm run build      # TypeScript compile
npm test           # Vitest unit tests
```

Every change is validated against these three gates before commit.

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
├── config/           # Env validation (Zod), database connection
├── modules/          # Feature modules (self-contained per domain)
│   ├── auth/         # Login, refresh (rotation), logout
│   ├── users/        # User management (Admin only)
│   ├── brands/       # Brands CRUD
│   ├── categories/   # Categories CRUD
│   ├── suppliers/    # Suppliers CRUD
│   ├── products/     # Products CRUD + image upload
│   ├── stock-movements/  # Entry/exit engine with pessimistic locking
│   ├── dashboard/    # Metrics & charts
│   └── reports/      # PDF, Excel, CSV export
├── shared/
│   ├── errors/       # AppError + error middleware
│   ├── middlewares/  # Auth, permission, upload, error handling
│   ├── services/     # Audit log service
│   ├── utils/        # Logger, response helpers, IP hashing
│   └── validators/   # Zod validation adapter
├── tests/            # Vitest unit tests
└── server.ts         # Entry point
```

---

## 📄 License

MIT &mdash; feel free to use as a reference or portfolio project.
