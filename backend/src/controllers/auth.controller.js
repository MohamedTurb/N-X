const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Cart } = require("../models");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");
const { generateAccessToken, generateRefreshToken } = require("../services/auth.service");

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/auth",
  maxAge: Number(process.env.JWT_REFRESH_COOKIE_MAX_AGE_MS || 30 * 24 * 60 * 60 * 1000),
};

const normalizeRole = (role) => (role === "customer" ? "user" : role);

const serializeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: normalizeRole(user.role),
  createdAt: user.createdAt,
});

const issueSession = (res, user, statusCode, message) => {
  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("nox_refresh_token", refreshToken, refreshCookieOptions);

  return res.status(statusCode).json({
    message,
    token,
    user: serializeUser(user),
  });
};

const register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "username, email, and password are required");
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, "Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role: role === "admin" ? "admin" : "user",
  });

  await Cart.create({ userId: user.id });

  return issueSession(res, user, 201, "User registered successfully");
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  return issueSession(res, user, 200, "Login successful");
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.nox_refresh_token || req.body?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let payload;

  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  } catch (_error) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findByPk(payload.id);

  if (!user) {
    throw new ApiError(401, "Invalid refresh token user");
  }

  const token = generateAccessToken(user);
  const nextRefreshToken = generateRefreshToken(user);

  res.cookie("nox_refresh_token", nextRefreshToken, refreshCookieOptions);

  return res.status(200).json({
    message: "Session refreshed",
    token,
    user: serializeUser(user),
  });
});

const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("nox_refresh_token", {
    ...refreshCookieOptions,
    maxAge: undefined,
  });

  return res.status(200).json({ message: "Logged out successfully" });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
};
