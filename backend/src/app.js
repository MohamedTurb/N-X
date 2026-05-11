const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");
const { corsOptions } = require("./config/cors");

const app = express();

app.set("trust proxy", 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    limit: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 180),
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "2mb" }));
app.use(express.urlencoded({ extended: true, limit: process.env.URLENCODED_BODY_LIMIT || "2mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    message: "NOX API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
