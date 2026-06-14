function assertEnv() {
  const required = ["JWT_SECRET"];

  if (!process.env.DATABASE_URL) {
    required.push("DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST");
  }

  const missing = required.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      if (!url.hostname) {
        throw new Error();
      }
      const invalidHost =
        url.hostname !== "localhost" &&
        url.hostname !== "127.0.0.1" &&
        url.hostname !== "::1" &&
        !url.hostname.includes(".");
      if (invalidHost) {
        throw new Error();
      }
    } catch (error) {
      throw new Error(
        "DATABASE_URL is invalid. Provide a full Postgres connection URL like postgres://user:pass@host:port/dbname."
      );
    }
  } else {
    const host = process.env.DB_HOST;
    const invalidHost =
      host &&
      host !== "localhost" &&
      host !== "127.0.0.1" &&
      host !== "::1" &&
      !host.includes(".");

    if (invalidHost) {
      throw new Error(
        `DB_HOST appears invalid. Provide a full DNS hostname or accessible address, for example: dpg-d812mfhj2pic73bgfmng-a.<region>.render.com. Received: ${host}`
      );
    }
  }
}

function parseBoolean(value, fallback = false) {
  if (value === undefined) return fallback;

  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 5000);

// 🔥 FIX: robust parsing
const rawOrigins =
  process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "";

const corsOrigins = rawOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean)
  .map((o) => o.replace(/\/$/, "")); // remove trailing slash

module.exports = {
  assertEnv,
  parseBoolean,
  isProduction,
  port,
  corsOrigins,
};