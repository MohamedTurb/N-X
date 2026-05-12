const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");
const { corsOptions } = require("./config/cors");
const { hasCloudinaryConfig } = require("./services/cloudinary.service");

const app = express();

app.set("trust proxy", 1);

// Security middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

// CORS
app.use(cors(corsOptions));

// Parsers
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Rate limit
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    limit: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 180),
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    message: "NOX API is running",
    environment: process.env.NODE_ENV || "development",
    uploadsReady: hasCloudinaryConfig(),
  });
});

// Routes
app.use("/api", routes);

// Errors
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;