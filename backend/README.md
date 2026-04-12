# NOX Backend (Express + PostgreSQL + Sequelize)

Complete backend API for the NOX streetwear e-commerce platform.

## Folder Structure

```text
backend/
  .env.example
  package.json
  src/
    app.js
    server.js
    config/
      database.js
    controllers/
      auth.controller.js
      product.controller.js
      cart.controller.js
      order.controller.js
    middleware/
      auth.middleware.js
      error.middleware.js
    models/
      user.model.js
      product.model.js
      order.model.js
      order-item.model.js
      cart.model.js
      cart-item.model.js
      index.js
    routes/
      auth.routes.js
      product.routes.js
      cart.routes.js
      order.routes.js
      index.js
    services/
      auth.service.js
      cart.service.js
      order.service.js
    seeders/
      seed.js
    utils/
      api-error.js
      async-handler.js
```

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT authentication
- bcrypt password hashing

## Setup

1. Go to backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` from `.env.example` and update DB + JWT values.

4. Make sure PostgreSQL database exists (`DB_NAME`).

5. Run seed (optional, but recommended):

```bash
npm run seed
```

6. Start API server:

```bash
npm run dev
```

API base URL: `http://localhost:5000/api`

## Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

### Cart (auth required)

- `GET /api/cart`
- `POST /api/cart/add`
- `PUT /api/cart/update`
- `DELETE /api/cart/remove`

### Orders

- `POST /api/orders` (create from cart)
- `GET /api/orders` (current user)
- `GET /api/orders/all` (admin)
- `PUT /api/orders/:id/status` (admin)

## Business Logic Included

- Automatic total price calculation from cart items
- Stock validation before order creation
- Stock deduction after successful order
- Cart cleared after order placement
- Role-based access control for admin operations

## Notes

- `sequelize.sync()` is used for simplicity in this version.
- For production, prefer Sequelize migrations and stricter validation layers.
