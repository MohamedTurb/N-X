const express = require("express");
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  getDashboardSummary,
  updateOrderStatus,
  updateOrderShipping,
} = require("../controllers/order.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);
router.post("/", createOrder);
router.get("/", getUserOrders);
router.get("/all", adminOnly, getAllOrders);
router.get("/summary", adminOnly, getDashboardSummary);
router.put("/:id/status", adminOnly, updateOrderStatus);
router.put("/:id/shipping", adminOnly, updateOrderShipping);

module.exports = router;
