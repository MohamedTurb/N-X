const cloudinary = require("../config/cloudinary");

const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
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