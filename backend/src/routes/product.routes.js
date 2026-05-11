const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");
const { uploadImage } = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, adminOnly, uploadImage.single("image"), createProduct);
router.put("/:id", protect, adminOnly, uploadImage.single("image"), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
