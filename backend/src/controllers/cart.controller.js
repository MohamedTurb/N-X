const { CartItem, Product } = require("../models");
const { getOrCreateCart, getFullCartByUserId } = require("../services/cart.service");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");

const getCart = asyncHandler(async (req, res) => {
  const cart = await getFullCartByUserId(req.user.id);
  return res.status(200).json(cart);
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    throw new ApiError(400, "productId and quantity (>=1) are required");
  }

  const product = await Product.findByPk(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const cart = await getOrCreateCart(req.user.id);

  const existingItem = await CartItem.findOne({
    where: { cartId: cart.id, productId },
  });

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    await existingItem.update({ quantity: newQty });
  } else {
    await CartItem.create({ cartId: cart.id, productId, quantity });
  }

  const updatedCart = await getFullCartByUserId(req.user.id);
  return res.status(200).json(updatedCart);
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    throw new ApiError(400, "productId and quantity (>=1) are required");
  }

  const cart = await getOrCreateCart(req.user.id);
  const item = await CartItem.findOne({ where: { cartId: cart.id, productId } });

  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }

  await item.update({ quantity });
  const updatedCart = await getFullCartByUserId(req.user.id);

  return res.status(200).json(updatedCart);
});

const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new ApiError(400, "productId is required");
  }

  const cart = await getOrCreateCart(req.user.id);
  const deletedRows = await CartItem.destroy({ where: { cartId: cart.id, productId } });

  if (!deletedRows) {
    throw new ApiError(404, "Cart item not found");
  }

  const updatedCart = await getFullCartByUserId(req.user.id);
  return res.status(200).json(updatedCart);
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
