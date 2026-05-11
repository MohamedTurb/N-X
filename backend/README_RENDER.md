# Deploying the backend to Render

This file lists the Render-specific environment variables and a short deploy checklist for the NOX backend service.

## Required environment variables (Render service / new secret keys)
- `DATABASE_URL` (recommended): full Postgres connection URL. If not provided, set the following instead:
  - `DB_NAME`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_HOST`
  - `DB_PORT` (optional, defaults to 5432)
- `JWT_SECRET` (required)
- `JWT_REFRESH_SECRET` (recommended)
- `FRONTEND_URL` (for CORS)
- `CORS_ORIGINS` (comma-separated allowed origins)
- `CORS_ALLOW_VERCEL_PREVIEWS` (optional: set `true` to allow `*.vercel.app` preview URLs)
- Cloudinary credentials (if using uploads):
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

Optional tuning env vars (defaults are safe):
- `DB_POOL_MAX` (default 10)
- `DB_CONN_RETRIES` (default 5) — how many times to retry DB connect on startup
- `DB_CONN_RETRY_DELAY_MS` (default 5000)

## Minimal deploy checklist
1. Connect GitHub repo to Render and add a Web Service with root directory `backend`.
2. Add the environment variables listed above to the Render service (prefer `DATABASE_URL`).
3. Set the start command to `npm run start:prod` (or `node src/server.js`).
4. Ensure `NODE_ENV=production` and port is set (Render provides `PORT`).
5. (Optional) Add a Render deploy hook URL to GitHub Actions as `RENDER_DEPLOY_HOOK_URL` for CI-driven deploys.
6. On Vercel, set `NEXT_PUBLIC_API_BASE_URL` to your Render backend API URL (for example: `https://your-service.onrender.com/api`).

## Local testing
Install dependencies and run locally (requires DB access):
```bash
cd backend
npm install
# set environment variables (or use .env)
npm run start:dev
```

## Notes
- The server retries DB authentication on startup by default; tune `DB_CONN_RETRIES` / `DB_CONN_RETRY_DELAY_MS` as needed.
- Prefer `DATABASE_URL` for managed Postgres (Supabase/Render DB). If using individual `DB_*` vars, ensure `DB_HOST` is reachable from Render.
