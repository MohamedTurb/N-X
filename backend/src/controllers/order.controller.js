const { Op } = require("sequelize");
const { Order, OrderItem, Product, User } = require("../models");
const { createOrderFromCart } = require("../services/order.service");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");

const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "canceled", "refunded"];
const SHIPMENT_STATUSES = ["pending", "packed", "shipped", "delivered"];

const orderInclude = [
  {
    model: User,
    as: "user",
    attributes: ["id", "username", "email", "role", "createdAt", "updatedAt"],
  },
  {
    model: OrderItem,
    as: "items",
    include: [{ model: Product, as: "product" }],
  },
];

const formatCurrency = (value) =>
  `EGP ${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(Number(value)) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

const toStartOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const toMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const buildDashboardSummary = (orders, products, users) => {
  const now = new Date();
  const startOfToday = toStartOfDay(now);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  const revenue = orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  const averageOrderValue = orders.length > 0 ? revenue / orders.length : 0;
  const ordersToday = orders.filter((order) => new Date(order.createdAt) >= startOfToday).length;
  const ordersThisWeek = orders.filter((order) => new Date(order.createdAt) >= startOfWeek).length;
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const canceledOrders = orders.filter((order) => order.status === "canceled").length;
  const cancellationRate = orders.length > 0 ? canceledOrders / orders.length : 0;
  const outOfStockProducts = products.filter((product) => product.stock <= 0).length;
  const reorderNeededProducts = products.filter((product) => product.stock > 0 && product.stock <= 5).length;
  const featuredProducts = products.filter((product) => product.featured).length;

  const statusCounts = ORDER_STATUSES.map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));

  const dailySalesMap = new Map();
  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(startOfToday);
    day.setDate(day.getDate() - offset);
    dailySalesMap.set(day.toDateString(), { label: day.toLocaleDateString("en-US", { weekday: "short" }), total: 0 });
  }

  for (const order of orders) {
    const key = new Date(order.createdAt).toDateString();
    if (dailySalesMap.has(key)) {
      dailySalesMap.get(key).total += Number(order.totalPrice || 0);
    }
  }

  const monthlySalesMap = new Map();
  for (let offset = 5; offset >= 0; offset -= 1) {
    const month = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    monthlySalesMap.set(toMonthKey(month), {
      label: month.toLocaleDateString("en-US", { month: "short" }),
      total: 0,
    });
  }

  for (const order of orders) {
    const key = toMonthKey(new Date(order.createdAt));
    if (monthlySalesMap.has(key)) {
      monthlySalesMap.get(key).total += Number(order.totalPrice || 0);
    }
  }

  const productTotals = new Map();
  for (const order of orders) {
    for (const item of order.items || []) {
      const current = productTotals.get(item.productId) || {
        id: item.productId,
        name: item.product?.name || "Unknown product",
        imageUrl: item.product?.imageUrl || "",
        quantity: 0,
        revenue: 0,
        stockLeft: item.product?.stock ?? 0,
        category: item.product?.category || "",
      };

      current.quantity += item.quantity;
      current.revenue += Number(item.price || 0) * item.quantity;
      current.stockLeft = item.product?.stock ?? current.stockLeft;
      current.category = item.product?.category || current.category;
      productTotals.set(item.productId, current);
    }
  }

  const topProducts = Array.from(productTotals.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((product) => ({
      ...product,
      revenue: Number(product.revenue.toFixed(2)),
      revenueLabel: formatCurrency(product.revenue),
    }));

  const customerStats = users
    .filter((user) => user.role !== "admin")
    .map((user) => {
      const userOrders = orders.filter((order) => order.userId === user.id);
      const totalSpent = userOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
      const lastActivityAt = userOrders.reduce((latest, order) => {
        const orderDate = new Date(order.createdAt).getTime();
        return orderDate > latest ? orderDate : latest;
      }, new Date(user.updatedAt || user.createdAt).getTime());

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        orderCount: userOrders.length,
        totalSpent: Number(totalSpent.toFixed(2)),
        totalSpentLabel: formatCurrency(totalSpent),
        lastActivityAt: new Date(lastActivityAt).toISOString(),
      };
    })
    .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))
    .slice(0, 10);

  const topCustomers = [...customerStats].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  const inactiveThreshold = new Date(now);
  inactiveThreshold.setDate(inactiveThreshold.getDate() - 30);
  const inactiveCustomers = customerStats.filter((customer) => new Date(customer.lastActivityAt) < inactiveThreshold).length;

  return {
    overview: {
      revenue: Number(revenue.toFixed(2)),
      revenueLabel: formatCurrency(revenue),
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      averageOrderValueLabel: formatCurrency(averageOrderValue),
      ordersToday,
      ordersThisWeek,
      pendingOrders,
      cancellationRate,
      lowStockItems: reorderNeededProducts,
      outOfStockItems: outOfStockProducts,
      reorderNeededItems: reorderNeededProducts,
      featuredProducts,
      totalOrders: orders.length,
      totalProducts: products.length,
      inactiveCustomers,
    },
    charts: {
      dailySales: Array.from(dailySalesMap.values()),
      monthlySales: Array.from(monthlySalesMap.values()),
      orderStatuses: statusCounts,
      topProducts,
    },
    customers: customerStats,
    topCustomers,
  };
};

const createOrder = asyncHandler(async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    governorate,
    buildingNumber,
    floorNumber,
    landmark,
  } = req.body;

  if (
    !customerName ||
    !customerEmail ||
    !customerPhone ||
    !shippingAddress ||
    !governorate ||
    !buildingNumber ||
    !floorNumber ||
    !landmark
  ) {
    throw new ApiError(
      400,
      "customerName, customerEmail, customerPhone, shippingAddress, governorate, buildingNumber, floorNumber, and landmark are required"
    );
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

const getAllOrders = asyncHandler(async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const status = typeof req.query.status === "string" ? req.query.status.trim() : "";
  const pageParam = Number.parseInt(String(req.query.page || ""), 10);
  const limitParam = Number.parseInt(String(req.query.limit || ""), 10);
  const shouldPaginate = Number.isInteger(pageParam) || Number.isInteger(limitParam) || Boolean(search) || Boolean(status);

  if (!shouldPaginate) {
    const orders = await Order.findAll({
      order: [["createdAt", "DESC"]],
      include: orderInclude,
    });

    return res.status(200).json(orders);
  }

  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const limit = Number.isInteger(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 10;
  const where = {};

  if (search) {
    where[Op.or] = [
      { customerName: { [Op.iLike]: `%${search}%` } },
      { customerEmail: { [Op.iLike]: `%${search}%` } },
      { customerPhone: { [Op.iLike]: `%${search}%` } },
      { shippingAddress: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (status && ORDER_STATUSES.includes(status)) {
    where.status = status;
  }

  const result = await Order.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
    distinct: true,
    include: orderInclude,
  });

  return res.status(200).json({
    data: result.rows,
    pagination: {
      page,
      limit,
      total: result.count,
      totalPages: Math.max(1, Math.ceil(result.count / limit)),
    },
  });
});

const getDashboardSummary = asyncHandler(async (_req, res) => {
  const [orders, products, users] = await Promise.all([
    Order.findAll({ order: [["createdAt", "DESC"]], include: orderInclude }),
    Product.findAll({ order: [["createdAt", "DESC"]] }),
    User.findAll({ attributes: ["id", "username", "email", "role", "createdAt", "updatedAt"] }),
  ]);

  return res.status(200).json(buildDashboardSummary(orders, products, users));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!ORDER_STATUSES.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const order = await Order.findByPk(req.params.id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const updates = { status };

  if (status === "canceled") {
    // _Note_: not setting `canceledAt` because the production DB may not have this column.
  } else if (status === "refunded") {
    // _Note_: not setting `refundedAt` because the production DB may not have this column.
  }

  await order.update(updates);
  return res.status(200).json(order);
});

const updateOrderShipping = asyncHandler(async (req, res) => {
  const trackingNumber = typeof req.body.trackingNumber === "string" ? req.body.trackingNumber.trim() : "";
  const shipmentStatus = typeof req.body.shipmentStatus === "string" ? req.body.shipmentStatus.trim() : "";

  if (shipmentStatus && !SHIPMENT_STATUSES.includes(shipmentStatus)) {
    throw new ApiError(400, "Invalid shipmentStatus");
  }

  const order = await Order.findByPk(req.params.id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const updates = {};

  if (req.body.trackingNumber !== undefined) {
    updates.trackingNumber = trackingNumber || null;
  }

  // Do not update `shipmentStatus` here because the production DB may not
  // contain the corresponding column/type. Only tracking number is updated.

  await order.update(updates);
  return res.status(200).json(order);
});

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  getDashboardSummary,
  updateOrderStatus,
  updateOrderShipping,
};
