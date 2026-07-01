# Box-Inteligente API 🍪

> API REST do sistema de controle de estoque Casa do Biscoito

[![Status](https://img.shields.io/badge/status-live-46E3B7)](https://box-inteligente-api-rf.onrender.com/health)
[![Node](https://img.shields.io/badge/node-24.14-339933?logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/express-4.21-000?logo=express)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/prisma-5.22-2D3748?logo=prisma)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/postgres-16-4169E1?logo=postgresql)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.6-3178C6?logo=typescript)](https://typescriptlang.org)

**Frontend:** [box-inteligente-web](https://github.com/RFernandes10/box-inteligente-web)

---

## Endpoints

| Prefixo | Descrição | Auth |
|---------|-----------|------|
| `POST /auth/login` | Login | ❌ |
| `POST /auth/refresh` | Renovar token | ❌ |
| `POST /auth/logout` | Logout | ✅ |
| `GET /users` | Listar usuários | Admin |
| `POST /users` | Criar usuário | Admin |
| `GET/POST /brands` | Marcas | ✅ |
| `GET/POST /categories` | Categorias | ✅ |
| `GET/POST /suppliers` | Fornecedores | ✅ |
| `GET/POST /products` | Produtos | ✅ |
| `POST /stock-movements` | Movimentações | ✅ |
| `GET /dashboard/*` | Dashboard | ✅ |
| `GET /reports/*` | Relatórios | Admin/Gerente |
| `GET /health` | Health Check | ❌ |

## Tecnologias

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 4
- **ORM:** Prisma 5 + PostgreSQL 16
- **Auth:** JWT + Refresh Token com bcrypt
- **Validação:** Zod
- **Upload:** Multer
- **Relatórios:** PDFKit, xlsx, csv-writer
- **Logs:** Winston

## Como Rodar

```bash
npm install
cp .env.example .env
# Configure DATABASE_URL no .env
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

## Deploy

[🌐 API Live](https://box-inteligente-api-rf.onrender.com/health) — hospedado no Render (free tier).
