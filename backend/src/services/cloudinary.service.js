const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/api-error");

const hasCloudinaryConfig = () =>
  Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

const assertCloudinaryConfigured = () => {
  if (!hasCloudinaryConfig()) {
    throw new ApiError(
      503,
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
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
          reject(error);
          return;
        }

        resolve(result);
      }
    );

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
};