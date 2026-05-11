const { corsOrigins, isProduction } = require("./env");

const normalizeOrigin = (origin) => {
  if (typeof origin !== "string") return null;
  return origin.replace(/\/$/, "");
};

const corsOptions = {
  origin: function (origin, callback) {
    // allow server-to-server (Postman / curl / internal requests)
    if (!origin) {
      return callback(null, true);
    }

    console.log("🔵 RAW ORIGIN TYPE:", typeof origin);
    console.log("🔵 RAW ORIGIN VALUE:", origin);

    // 🛑 guard against invalid origin types (this fixes [object Object])
    if (typeof origin !== "string") {
      console.log("⚠️ Invalid origin blocked:", origin);
      return callback(new Error("Invalid CORS origin format"));
    }

    const requestOrigin = normalizeOrigin(origin);
    const allowed = corsOrigins.map(normalizeOrigin).filter(Boolean);

    // dev mode: allow everything if no config
    if (!isProduction && allowed.length === 0) {
      return callback(null, true);
    }

    if (allowed.includes(requestOrigin)) {
      return callback(null, true);
    }

    console.log("❌ CORS BLOCKED:", requestOrigin);
    console.log("✅ ALLOWED:", allowed);

    return callback(new Error(`CORS blocked for origin: ${requestOrigin}`));
  },

  credentials: true,
};

module.exports = { corsOptions };