const { Product } = require("../models");
const { Op } = require("sequelize");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");
const { buildResponsiveVariants, destroyImage, uploadBuffer } = require("../services/cloudinary.service");

const allowedUpdateFields = ["name", "description", "price", "stock", "category", "featured"];

const readJsonValue = (value, fallback = []) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (_error) {
      return fallback;
    }
  }

  return fallback;
};

const uploadImageFromRequest = async (req) => {
  if (!req.file) {
    return null;
  }

  const result = await uploadBuffer(req.file.buffer, {
    folder: process.env.CLOUDINARY_FOLDER || "nox/products",
  });

  return {
    imageUrl: result.secure_url,
    imagePublicId: result.public_id,
    imageVariants: buildResponsiveVariants(result.public_id),
  };
};

const getProducts = asyncHandler(async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
  const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy.trim() : "createdAt";
  const sortDirection = typeof req.query.sortDirection === "string" && req.query.sortDirection.toLowerCase() === "asc" ? "ASC" : "DESC";
  const pageParam = Number.parseInt(String(req.query.page || ""), 10);
  const limitParam = Number.parseInt(String(req.query.limit || ""), 10);
  const shouldPaginate = Number.isInteger(pageParam) || Number.isInteger(limitParam) || Boolean(search) || Boolean(category);
  const orderBy = [[sortBy === "price" ? "price" : sortBy === "stock" ? "stock" : sortBy === "name" ? "name" : "createdAt", sortDirection]];

  if (!shouldPaginate) {
    const products = await Product.findAll({ order: orderBy });
    return res.status(200).json(products);
  }

  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const limit = Number.isInteger(limitParam) && limitParam > 0 ? Math.min(limitParam, 48) : 12;
  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
      { category: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (category) {
    where.category = category;
  }

  const result = await Product.findAndCountAll({
    where,
    order: orderBy,
    limit,
    offset: (page - 1) * limit,
  });

  return res.status(200).json({
    data: result.rows,
    pagination: {
      page,
      limit,
      total: result.count,
      totalPages: Math.max(1, Math.ceil(result.count / limit)),
    },
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res.status(200).json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category, imageUrl, imagePublicId, imageVariants, featured } = req.body;

  if (!name || !description || price === undefined || stock === undefined || !category || (!imageUrl && !req.file)) {
    throw new ApiError(400, "All product fields are required");
  }

  const uploadedImage = await uploadImageFromRequest(req);
  const nextImage = uploadedImage || {
    imageUrl,
    imagePublicId: imagePublicId || null,
    imageVariants: readJsonValue(imageVariants),
  };

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category,
    featured: featured === true || featured === "true" || featured === 1 || featured === "1",
    ...nextImage,
  });

  return res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const updates = {};

  for (const field of allowedUpdateFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const uploadedImage = await uploadImageFromRequest(req);

  if (uploadedImage) {
    if (product.imagePublicId) {
      await destroyImage(product.imagePublicId);
    }

    updates.imageUrl = uploadedImage.imageUrl;
    updates.imagePublicId = uploadedImage.imagePublicId;
    updates.imageVariants = uploadedImage.imageVariants;
  } else {
    if (req.body.imageUrl !== undefined) {
      updates.imageUrl = req.body.imageUrl;
    }

    if (req.body.imagePublicId !== undefined) {
      updates.imagePublicId = req.body.imagePublicId || null;
    }

    if (req.body.imageVariants !== undefined) {
      updates.imageVariants = readJsonValue(req.body.imageVariants, product.imageVariants || []);
    }
  }

  if (req.body.featured !== undefined) {
    updates.featured = req.body.featured === true || req.body.featured === "true" || req.body.featured === 1 || req.body.featured === "1";
  }

  // `variants` column removed from schema — ignore incoming variants payload

  await product.update(updates);
  return res.status(200).json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.imagePublicId) {
    await destroyImage(product.imagePublicId);
  }

  await product.destroy();
  return res.status(200).json({ message: "Product deleted" });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
