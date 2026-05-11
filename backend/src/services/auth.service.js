const jwt = require("jsonwebtoken");

const buildTokenPayload = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
});

const generateAccessToken = (user) =>
  jwt.sign(buildTokenPayload(user), process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "15m" });

const generateRefreshToken = (user) =>
  jwt.sign(buildTokenPayload(user), process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });

const generateToken = (user) => generateAccessToken(user);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateToken,
};
