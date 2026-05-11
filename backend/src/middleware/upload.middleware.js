const multer = require("multer");
const ApiError = require("../utils/api-error");

const maxUploadSize = Number(process.env.MAX_UPLOAD_SIZE_MB || 8) * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (_req, file, callback) => {
  if (!file.mimetype.startsWith("image/")) {
    callback(new ApiError(400, "Only image uploads are allowed"));
    return;
  }

  callback(null, true);
};

const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxUploadSize,
  },
});

module.exports = {
  uploadImage,
};