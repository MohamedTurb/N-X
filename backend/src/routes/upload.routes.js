const express = require("express");
const { protect, adminOnly } = require("../middleware/auth.middleware");
const { uploadImage } = require("../middleware/upload.middleware");
const { uploadProductImage } = require("../controllers/upload.controller");

const router = express.Router();

router.post("/product-image", protect, adminOnly, uploadImage.single("image"), uploadProductImage);

module.exports = router;