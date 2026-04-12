# NOX Streetwear Monorepo

Full-stack streetwear e-commerce project with:
- Next.js frontend (App Router, TypeScript, Tailwind)
- Express backend API (Node.js, Sequelize, PostgreSQL, JWT auth)

## Project Overview

This repository is split into two apps:
- Frontend at project root
- Backend in backend folder

Main features:
- Authentication (register, login, JWT)
- Product catalog and product details
- Cart management
- Checkout and order creation
- User order history
- Admin order dashboard
- Admin order status updates
- Admin product management (create, edit, delete)
- Admin filters and quick search in dashboard

## Tech Stack

Frontend:
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion

Backend:
- Express 4
- Sequelize 6
- PostgreSQL
- JWT
- bcryptjs

## Repository Structure

```text
.
├─ src/                     # Frontend app code
│  ├─ app/                  # Next.js routes/pages
│  ├─ components/           # UI and providers
│  ├─ services/             # Frontend API clients
│  └─ lib/                  # Data helpers
├─ public/                  # Static assets
├─ backend/                 # Express API
│  ├─ src/
│  │  ├─ config/
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ seeders/
│  │  └─ utils/
│  └─ README.md             # Backend-focused documentation
└─ package.json             # Frontend scripts
```

## Prerequisites

- Node.js 18+ (recommended 20+)
- npm 9+
- PostgreSQL running locally on port 5432 (or matching your env)

## Environment Variables

### Frontend (root)

Frontend reads API base URL from:
- NEXT_PUBLIC_API_BASE_URL

If not set, frontend defaults to:
- http://localhost:5000/api

Optional root .env.local example:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### Backend (backend/.env)

Create backend/.env based on backend/.env.example:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nox_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

## Installation

### 1) Install frontend dependencies

From project root:

```bash
npm install
```

### 2) Install backend dependencies

```bash
cd backend
npm install
cd ..
```

## Run the Project

### Run backend only

```bash
cd backend
npm run dev
```

Backend base URL:
- http://localhost:5000/api

### Run frontend only

From project root:

```bash
npm run dev
```

Frontend URL:
- http://localhost:3000

### Seed backend database (optional)

```bash
cd backend
npm run seed
```

## Useful Scripts

Frontend (root package.json):
- npm run dev
- npm run build
- npm run start
- npm run lint
- npm run smoke

Backend (backend/package.json):
- npm run dev
- npm run start
- npm run seed

## API Summary

Auth:
- POST /api/auth/register
- POST /api/auth/login

Products:
- GET /api/products
- GET /api/products/:id
- POST /api/products (admin)
- PUT /api/products/:id (admin)
- DELETE /api/products/:id (admin)

Cart (auth required):
- GET /api/cart
- POST /api/cart/add
- PUT /api/cart/update
- DELETE /api/cart/remove

Orders:
- POST /api/orders
- GET /api/orders
- GET /api/orders/all (admin)
- PUT /api/orders/:id/status (admin)

## Admin Area

Admin page path:
- /orders/all

Available admin capabilities:
- View all orders
- Update order status
- Filter orders by status
- View catalog
- Create product
- Edit product
- Delete product
- Quick search products by name or category

## Troubleshooting

### Backend fails with SequelizeConnectionRefusedError / ECONNREFUSED

Cause:
- PostgreSQL is not running, wrong DB credentials, or wrong host/port.

Checklist:
1. Confirm backend/.env exists.
2. Verify DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD.
3. Ensure PostgreSQL service is running.
4. Ensure database (DB_NAME) exists.
5. Retry:

```bash
cd backend
npm run dev
```

### Frontend works but data actions fail

Cause:
- Backend not running or NEXT_PUBLIC_API_BASE_URL mismatch.

Fix:
1. Start backend first.
2. Validate frontend API base URL.

## Deployment Notes

- Current backend uses sequelize.sync() for schema creation.
- For production, prefer migrations and stricter validation.
- Use a strong JWT_SECRET and secure environment management.

## Additional Docs

- Backend-focused documentation: backend/README.md

## License

No license file is currently defined in this repository.
