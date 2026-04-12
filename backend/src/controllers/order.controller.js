const { Order, OrderItem, Product, User } = require("../models");
const { createOrderFromCart } = require("../services/order.service");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");

const createOrder = asyncHandler(async (req, res) => {
  const { customerName, customerEmail, customerPhone, shippingAddress } = req.body;

  if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
    throw new ApiError(400, "customerName, customerEmail, customerPhone, and shippingAddress are required");
  }

  if (!customerEmail.includes("@")) {
    throw new ApiError(400, "Invalid customerEmail");
  }

  const order = await createOrderFromCart(req.user.id, req.body);
  return res.status(201).json(order);
});

const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: OrderItem,
        as: "items",
        include: [{ model: Product, as: "product" }],
      },
    ],
  });

  return res.status(200).json(orders);
});

const getAllOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "username", "email"],
      },
      {
        model: OrderItem,
        as: "items",
        include: [{ model: Product, as: "product" }],
      },
    ],
  });

  return res.status(200).json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["pending", "paid", "shipped", "delivered"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const order = await Order.findByPk(req.params.id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  await order.update({ status });
  return res.status(200).json(order);
});

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
};
