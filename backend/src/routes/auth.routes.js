const express = require("express");
const { register, login, refresh, logout } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, (req, res) => {
	res.status(200).json({ user: req.user });
});

module.exports = router;
