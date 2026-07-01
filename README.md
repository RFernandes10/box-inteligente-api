# Box-Inteligente 🍪

> Sistema profissional de controle de estoque para a **Casa do Biscoito**

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-000?logo=vercel)](https://box-inteligente-web.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://box-inteligente-api-rf.onrender.com/health)
[![Database](https://img.shields.io/badge/Database-Neon-00E59B?logo=postgresql)](https://neon.tech)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## 🚀 Deploy ao Vivo

| Camada | URL | Stack |
|--------|-----|-------|
| **Frontend** | [box-inteligente-web.vercel.app](https://box-inteligente-web.vercel.app) | React + Vite + TailwindCSS |
| **Backend** | [box-inteligente-api-rf.onrender.com](https://box-inteligente-api-rf.onrender.com/health) | Express + TypeScript + Prisma |
| **Banco** | Neon (PostgreSQL) | PostgreSQL 16 |

> **Login:** admin@casadobiscoito.com.br / Admin@123

---

## Stack Tecnológico

### Backend
| Categoria | Tecnologia |
|-----------|-----------|
| Runtime | Node.js + TypeScript |
| Framework | Express 4 |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Auth | JWT + Refresh Token (bcrypt) |
| Validação | Zod |
| Upload | Multer |
| Relatórios | PDFKit, xlsx, csv-writer |
| Segurança | Helmet, CORS, rate-limit |

### Frontend
| Categoria | Tecnologia |
|-----------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Roteamento | React Router v6 |
| Estado | Zustand + TanStack Query |
| UI | TailwindCSS + Radix UI + shadcn/ui |
| Formulários | React Hook Form + Zod |
| Gráficos | Chart.js + react-chartjs-2 |
| Ícones | Lucide React |
| Notificações | react-toastify |

---

## Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| 🔐 **Autenticação** | JWT com refresh token e roles (Admin/Gerente/Estoquista) |
| 📦 **Produtos** | CRUD completo com busca, barcode, código interno, imagem |
| 🏷️ **Marcas** | Gerenciamento de marcas |
| 📂 **Categorias** | Gerenciamento de categorias |
| 🤝 **Fornecedores** | Cadastro com CNPJ, endereço, responsável |
| 📊 **Dashboard** | Gráficos de movimentação, estoque baixo, top produtos |
| 📋 **Relatórios** | Exportação em PDF, Excel e CSV |
| 🔄 **Movimentações** | Controle de entrada e saída com histórico completo |
| ⚠️ **Alertas** | Estoque baixo e produtos próximos da validade |
| 🗑️ **Soft Delete** | Todas as entidades com exclusão lógica |
| 🌙 **Tema** | Modo claro/escuro integrado |

### Permissões

| Funcionalidade | Admin | Gerente | Estoquista |
|---|:---:|:---:|:---:|
| Cadastrar/Editar produto | ✅ | ✅ | ❌ |
| Excluir produto | ✅ | ❌ | ❌ |
| Movimentar estoque | ✅ | ✅ | ✅ |
| Relatórios | ✅ | ✅ | ❌ |
| Gerenciar usuários | ✅ | ❌ | ❌ |

---

## Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd box-inteligente-api
npm install
cp .env.example .env
# Edite DATABASE_URL no .env com sua connection string
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

### Frontend

```bash
cd box-inteligente-web
npm install
npm run dev
```

O frontend roda em `http://localhost:5173` com proxy para API em `http://localhost:3333`.

---

## Deploy (Free Tier)

Este projeto está deployado usando serviços gratuitos:

| Serviço | Função | Tier |
|---------|--------|------|
| [Vercel](https://vercel.com) | Frontend (React/Vite) | Hobby (grátis) |
| [Render](https://render.com) | Backend (Express/Node) | Free (dorme após 15min) |
| [Neon](https://neon.tech) | PostgreSQL | Free (0.5GB, sempre ativo) |

> O backend gratuito do Render **dorme após 15 minutos de inatividade**. A primeira requisição pode levar ~30s enquanto ele acorda.

---

## Repositórios

- [box-inteligente-api](https://github.com/RFernandes10/box-inteligente-api) — Backend Express + Prisma
- [box-inteligente-web](https://github.com/RFernandes10/box-inteligente-web) — Frontend React + Vite
