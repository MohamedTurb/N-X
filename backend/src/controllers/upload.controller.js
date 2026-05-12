const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");
const { uploadBuffer, buildResponsiveVariants } = require("../services/cloudinary.service");

const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required");
  }

  try {
    const result = await uploadBuffer(req.file.buffer, {
      folder: process.env.CLOUDINARY_FOLDER || "nox/products",
    });

    return res.status(201).json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      variants: buildResponsiveVariants(result.public_id),
    });
  } catch (error) {
    // Re-throw to be caught by asyncHandler and converted to proper API response
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Image upload failed");
  }
});

module.exports = {
  uploadProductImage,
};