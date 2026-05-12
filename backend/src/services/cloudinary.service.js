const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/api-error");

const REQUIRED_CLOUDINARY_VARS = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];

const getMissingCloudinaryVars = () =>
  REQUIRED_CLOUDINARY_VARS.filter((key) => !process.env[key] || String(process.env[key]).trim().length === 0);

const hasCloudinaryConfig = () => getMissingCloudinaryVars().length === 0;

const assertCloudinaryConfigured = () => {
  if (!hasCloudinaryConfig()) {
    const missing = getMissingCloudinaryVars();
    throw new ApiError(
      503,
      `Cloudinary is not configured. Missing: ${missing.join(", ")}. Set these in Render environment variables.`
    );
  }
};

const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    try {
      assertCloudinaryConfigured();
    } catch (error) {
      reject(error);
      return;
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || "nox/products",
        resource_type: "image",
        transformation: [{ quality: "auto:best", fetch_format: "auto" }],
        ...options,
      },
      (error, result) => {
        if (error) {
          const message = error.message || "Upload failed to Cloudinary";
          reject(new ApiError(400, `Image upload error: ${message}`));
          return;
        }

        resolve(result);
      }
    );

    stream.on("error", (error) => {
      const message = error.message || "Upload stream error";
      reject(new ApiError(400, `Image upload stream error: ${message}`));
    });

    stream.end(buffer);
  });

const destroyImage = async (publicId) => {
  if (!publicId) {
    return null;
  }

  if (!hasCloudinaryConfig()) {
    return null;
  }

  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

const buildResponsiveVariants = (publicId) => {
  const sizes = [480, 960, 1440];

  return sizes.map((width) => ({
    width,
    url: cloudinary.url(publicId, {
      secure: true,
      resource_type: "image",
      transformation: [
        { width, crop: "fill", gravity: "auto" },
        { quality: "auto:best", fetch_format: "auto" },
      ],
    }),
  }));
};

module.exports = {
  uploadBuffer,
  destroyImage,
  buildResponsiveVariants,
  hasCloudinaryConfig,
};