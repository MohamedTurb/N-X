# NOX Production Architecture

## Target platform

- Frontend: Next.js 16 on Vercel
- Backend: Express.js + Sequelize on Render
- Database: Supabase PostgreSQL or Render PostgreSQL
- Images: Cloudinary
- Auth: JWT access tokens + httpOnly refresh cookies

## Recommended runtime flow

1. User opens the storefront on Vercel.
2. Next.js fetches product data from the Render API over HTTPS.
3. Auth issues a short-lived access token and an httpOnly refresh cookie.
4. Product images are uploaded to Cloudinary and stored as URLs plus public IDs in PostgreSQL.
5. Admin actions are protected by role-based middleware on both frontend and backend.

## Production folder structure

```text
backend/
  src/
    config/
      cloudinary.js
      cors.js
      database.js
      env.js
    controllers/
      auth.controller.js
      product.controller.js
      upload.controller.js
    middleware/
      auth.middleware.js
      upload.middleware.js
    models/
      product.model.js
      user.model.js
    routes/
      auth.routes.js
      product.routes.js
      upload.routes.js
    services/
      auth.service.js
      cloudinary.service.js
    server.js
```

```text
src/
  app/
    cart/
    checkout/
    login/
    orders/
    shop/
    size-chart/
  components/
    auth-provider.tsx
    cart-provider.tsx
    require-admin.tsx
    site-nav.tsx
    toast-provider.tsx
  services/
    api.ts
    auth-api.ts
    cart-api.ts
    order-api.ts
    product-api.ts
```

## Environment variables

```bash
NODE_ENV=production
PORT=10000
DB_NAME=nox
DB_USER=...
DB_PASSWORD=...
DB_HOST=...
DB_PORT=5432
DB_SSL=true

JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

FRONTEND_URL=https://nox.vercel.app
CORS_ORIGINS=https://nox.vercel.app,https://www.nox.vercel.app

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=nox/products
```

## Backend production configuration

- Use `NODE_ENV=production` on Render.
- Set database `ssl` on for Supabase and Render PostgreSQL.
- Use connection pools to avoid spikes.
- Keep `sequelize.sync()` out of production and apply migrations instead.
- Add `helmet`, `compression`, `rate-limit`, `cookie-parser`, and strict CORS.
- Set `app.set("trust proxy", 1)` on Render.

## Cloudinary image flow

### Upload

1. Admin selects an image in the dashboard.
2. Frontend posts `multipart/form-data` with field `image` to `/api/uploads/product-image`.
3. Backend validates file type and size with Multer.
4. Backend uploads the buffer to Cloudinary.
5. Backend returns the secure URL, `publicId`, and responsive variants.
6. Product create/update stores `imageUrl`, `imagePublicId`, and `imageVariants`.

### Update and delete

- On update, if a new image is uploaded, the previous Cloudinary asset is deleted using its `publicId`.
- On delete, the product image is removed from Cloudinary before the product row is destroyed.

## API examples

### Upload image

```http
POST /api/uploads/product-image
Authorization: Bearer <admin-access-token>
Content-Type: multipart/form-data
```

Response:

```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "nox/products/shadow-tee",
  "width": 1600,
  "height": 2000,
  "format": "webp",
  "variants": [
    { "width": 480, "url": "https://res.cloudinary.com/..." },
    { "width": 960, "url": "https://res.cloudinary.com/..." }
  ]
}
```

### Create product

```http
POST /api/products
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

```json
{
  "name": "Shadow Graphic Tee",
  "description": "Oversized cotton t-shirt with reflective print.",
  "price": 39.99,
  "stock": 80,
  "category": "t-shirts",
  "imageUrl": "https://res.cloudinary.com/...",
  "imagePublicId": "nox/products/shadow-tee",
  "imageVariants": []
}
```

## Database recommendations

- Keep PostgreSQL as the only relational store.
- Add indexes on `products.category`, `products.createdAt`, `orders.status`, and `orders.userId`.
- Use JSONB for image variants and future flexible metadata.
- Keep `imagePublicId` nullable for legacy records.

## Security checklist

- JWT access tokens expire quickly.
- Refresh tokens live in httpOnly cookies.
- Passwords are hashed with bcrypt.
- Admin routes require `protect` + `adminOnly`.
- Multer rejects non-image uploads.
- Render and Vercel origins are explicitly allowlisted.
- Rate limiting protects public endpoints.
- Helmet hardens headers.

## Deployment steps

### Supabase PostgreSQL

1. Create a new Supabase project.
2. Copy the connection string into Render backend env vars.
3. Enable SSL and keep the password secret.
4. Run migrations before first production deploy.

### Render backend

1. Connect the GitHub repository.
2. Set `backend` as the root directory.
3. Add env vars from `.env.example`.
4. Set the start command to `npm run start:prod`.
5. Use a Web Service, not a background worker.

### Vercel frontend

1. Set `NEXT_PUBLIC_API_BASE_URL` to the Render API base URL.
2. Add the same backend URL to `CORS_ORIGINS`.
3. Build and deploy through the Vercel Git integration.

## Frontend upload example

```tsx
async function uploadProductImage(token: string, file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/product-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  return response.json();
}
```

## Frontend architecture recommendations

- Keep API calls in `src/services/*` and avoid calling `fetch` from components directly.
- Preserve the current auth provider pattern, but source session refresh from the httpOnly cookie.
- Use route-level protected wrappers for admin routes and keep role checks server-side as the source of truth.
- Keep image-heavy product pages on the App Router and use dynamic imports for dashboard-only modules.
- Prefer Cloudinary URLs in product records, not local files under `public/products`.

## Admin dashboard shape

- Product CRUD: create, edit, delete, and image replacement.
- Order management: status updates and customer context.
- Search and filters: catalog search, order status filters, and stock awareness.
- Analytics cards: revenue, pending orders, and low-stock items.
- Responsive layout: a desktop-first grid that collapses cleanly to stacked cards on mobile.
- Security: keep the dashboard behind both frontend route guards and backend role checks.

## Brand direction

- Visual tone: dark monochrome, premium, cinematic, minimal.
- Typography: strong display type for headlines, restrained body copy.
- Layout: oversized spacing, sharp borders, low-noise surfaces, and deliberate hierarchy.
- Motion: use short, purposeful reveals and avoid generic micro-animations.
- Photography: prioritize high-contrast product shots with generous negative space.

## Performance recommendations

- Use Cloudinary delivery transformations for WebP and AVIF.
- Cache product lists on the client only when the catalog changes rarely.
- Add pagination and search endpoints before the catalog exceeds a few hundred items.
- Keep queries scoped with indexed filters on category, status, and createdAt.
- Compress API responses and set a sane JSON limit.

## GitHub workflow suggestions

- Run backend lint and a smoke-start job on every pull request.
- Run frontend lint and build on every pull request.
- Require successful deploy previews before merging into main.
- Keep Render and Cloudinary secrets in environment-scoped GitHub Actions secrets only.