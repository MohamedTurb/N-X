const jwt = require("jsonwebtoken");
const { User } = require("../models");

const normalizeRole = (role) => (role === "customer" ? "user" : role);

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
};

const protect = async (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: normalizeRole(user.role),
    };

    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: admin access required" });
  }

  return next();
};

module.exports = {
  protect,
  adminOnly,
};
