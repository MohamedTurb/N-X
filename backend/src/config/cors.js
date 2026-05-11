const { corsOrigins, isProduction } = require("./env");

function corsOptions(reqOrigin, callback) {
  if (!reqOrigin) {
    return callback(null, true);
  }

  if (!isProduction && corsOrigins.length === 0) {
    return callback(null, true);
  }

  if (corsOrigins.includes(reqOrigin)) {
    return callback(null, true);
  }

  return callback(new Error(`CORS blocked for origin: ${reqOrigin}`));
}

module.exports = {
  corsOptions,
};