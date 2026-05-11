const { corsOrigins, isProduction } = require("./env");

function isAllowedVercelPreview(origin) {
  if (process.env.CORS_ALLOW_VERCEL_PREVIEWS !== "true") {
    return false;
  }

  try {
    const parsed = new URL(origin);
    return parsed.hostname.endsWith(".vercel.app");
  } catch (_error) {
    return false;
  }
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (typeof origin !== "string") {
      return callback(new Error("Invalid CORS origin"));
    }

    const normalizedOrigin = origin.replace(/\/$/, "");
    const allowed = corsOrigins;

    if (!isProduction && allowed.length === 0) {
      return callback(null, true);
    }

    if (allowed.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    if (isAllowedVercelPreview(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${normalizedOrigin}`));
  },

  credentials: true,
};

module.exports = { corsOptions };