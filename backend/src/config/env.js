function assertEnv() {
  const required = ["JWT_SECRET"];

  // If DATABASE_URL isn't provided, require explicit DB parts for local or Render setups
  if (!process.env.DATABASE_URL) {
    required.push("DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST");
  }

  const missing = required.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

function parseBoolean(value, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 5000);
const corsOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

module.exports = {
  assertEnv,
  parseBoolean,
  isProduction,
  port,
  corsOrigins,
};