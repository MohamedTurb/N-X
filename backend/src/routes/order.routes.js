const express = require("express");
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);
router.post("/", createOrder);
router.get("/", getUserOrders);
router.get("/all", adminOnly, getAllOrders);
router.put("/:id/status", adminOnly, updateOrderStatus);

module.exports = router;
