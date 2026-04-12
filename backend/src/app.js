const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ message: "NOX API is running" });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
