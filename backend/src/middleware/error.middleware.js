const notFoundHandler = (_req, res) => {
  res.status(404).json({ message: "Route not found" });
};

const errorHandler = (err, _req, res, _next) => {
  if (err?.name === "MulterError") {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Image file is too large" : err.message || "Upload failed";
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;

    return res.status(status).json({ message });
  }

  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({ message });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
