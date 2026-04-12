const { Product } = require("../models");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");

const getProducts = asyncHandler(async (_req, res) => {
  const products = await Product.findAll({ order: [["createdAt", "DESC"]] });
  return res.status(200).json(products);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res.status(200).json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category, imageUrl } = req.body;

  if (!name || !description || price === undefined || stock === undefined || !category || !imageUrl) {
    throw new ApiError(400, "All product fields are required");
  }

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category,
    imageUrl,
  });

  return res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  await product.update(req.body);
  return res.status(200).json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
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
