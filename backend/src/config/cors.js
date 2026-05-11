const { corsOrigins, isProduction } = require("./env");

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (typeof origin !== "string") {
      return callback(new Error("Invalid CORS origin"));
    }

    const allowed = corsOrigins;

    if (!isProduction && allowed.length === 0) {
      return callback(null, true);
    }

    if (allowed.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },

  credentials: true,
};

module.exports = { corsOptions };