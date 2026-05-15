import { requestJson } from "./api";
import type { BackendProduct } from "./product-api";
import { mapProduct } from "./product-api";
import { DEFAULT_PRODUCT_COLOR, type ProductColor } from "../lib/product-colors";

export type BackendOrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  color?: ProductColor;
  price: number | string;
  product: BackendProduct;
};

type BackendOrderUser = {
  id: number;
  username: string;
  email: string;
};

export type BackendOrder = {
  id: number;
  userId: number;
  totalPrice: number | string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  shippingAddress?: string | null;
  governorate?: string | null;
  buildingNumber?: string | null;
  floorNumber?: string | null;
  landmark?: string | null;
  status: "pending" | "paid" | "shipped" | "delivered" | "canceled" | "refunded";
  shipmentStatus?: "pending" | "packed" | "shipped" | "delivered";
  trackingNumber?: string | null;
  canceledAt?: string | null;
  refundedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: BackendOrderUser;
  items?: BackendOrderItem[];
};

export type CreateOrderPayload = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  governorate: string;
  buildingNumber: string;
  floorNumber: string;
  landmark: string;
};

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  color: ProductColor;
  priceValue: number;
  priceLabel: string;
  imageUrl: string;
};

export type Order = {
  id: number;
  userId: number;
  totalPrice: number;
  totalPriceLabel: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  governorate: string;
  buildingNumber: string;
  floorNumber: string;
  landmark: string;
  userName: string;
  userEmail: string;
  status: BackendOrder["status"];
  shipmentStatus: NonNullable<BackendOrder["shipmentStatus"]>;
  trackingNumber: string | null;
  canceledAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  items: OrderItem[];
};

export type AdminOrderPage = {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminDashboardSummary = {
  overview: {
    revenue: number;
    revenueLabel: string;
    averageOrderValue: number;
    averageOrderValueLabel: string;
    ordersToday: number;
    ordersThisWeek: number;
    pendingOrders: number;
    cancellationRate: number;
    lowStockItems: number;
    outOfStockItems: number;
    reorderNeededItems: number;
    featuredProducts: number;
    totalOrders: number;
    totalProducts: number;
    inactiveCustomers: number;
  };
  charts: {
    dailySales: Array<{ label: string; total: number }>;
    monthlySales: Array<{ label: string; total: number }>;
    orderStatuses: Array<{ status: Order["status"]; count: number }>;
    topProducts: Array<{
      id: number;
      name: string;
      imageUrl: string;
      quantity: number;
      revenue: number;
      revenueLabel: string;
      stockLeft: number;
      category: string;
    }>;
  };
  customers: Array<{
    id: number;
    username: string;
    email: string;
    orderCount: number;
    totalSpent: number;
    totalSpentLabel: string;
    lastActivityAt: string;
  }>;
  topCustomers: Array<{
    id: number;
    username: string;
    email: string;
    orderCount: number;
    totalSpent: number;
    totalSpentLabel: string;
    lastActivityAt: string;
  }>;
};

function formatCurrency(value: number) {
  return `EGP ${value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function normalizeOrder(order: BackendOrder): Order {
  const totalPrice = typeof order.totalPrice === "number" ? order.totalPrice : Number.parseFloat(order.totalPrice);

  return {
    id: order.id,
    userId: order.userId,
    totalPrice,
    totalPriceLabel: formatCurrency(totalPrice),
    customerName: order.customerName ?? order.user?.username ?? "",
    customerEmail: order.customerEmail ?? order.user?.email ?? "",
    customerPhone: order.customerPhone ?? "",
    shippingAddress: order.shippingAddress ?? "",
    governorate: order.governorate ?? "",
    buildingNumber: order.buildingNumber ?? "",
    floorNumber: order.floorNumber ?? "",
    landmark: order.landmark ?? "",
    userName: order.user?.username ?? "",
    userEmail: order.user?.email ?? "",
    status: order.status,
    shipmentStatus: order.shipmentStatus ?? "pending",
    trackingNumber: order.trackingNumber ?? null,
    canceledAt: order.canceledAt ?? null,
    refundedAt: order.refundedAt ?? null,
    createdAt: order.createdAt,
    items: (order.items ?? []).map((item) => {
      const priceValue = typeof item.price === "number" ? item.price : Number.parseFloat(item.price);

      return {
        id: item.id,
        productId: item.productId,
        productName: mapProduct(item.product).name,
        quantity: item.quantity,
        color: item.color ?? DEFAULT_PRODUCT_COLOR,
        priceValue,
        priceLabel: formatCurrency(priceValue),
        imageUrl: mapProduct(item.product).imageUrl,
      };
    }),
  };
}

export const orderApi = {
  createOrder: async (token: string, payload: CreateOrderPayload) =>
    normalizeOrder(await requestJson<BackendOrder>("/orders", { method: "POST", token, body: payload })),
  getMyOrders: async (token: string) => (await requestJson<BackendOrder[]>("/orders", { token })).map(normalizeOrder),
  getAllOrders: async (token: string) => (await requestJson<BackendOrder[]>("/orders/all", { token })).map(normalizeOrder),
  getAdminOrdersPage: async (token: string, options: { page?: number; limit?: number; status?: Order["status"] | "all"; search?: string } = {}) => {
    const searchParams = new URLSearchParams();

    if (options.page) searchParams.set("page", String(options.page));
    if (options.limit) searchParams.set("limit", String(options.limit));
    if (options.status && options.status !== "all") searchParams.set("status", options.status);
    if (options.search) searchParams.set("search", options.search);

    const query = searchParams.toString();
    const payload = await requestJson<BackendOrder[] | { data: BackendOrder[]; pagination: AdminOrderPage["pagination"] }>(
      query ? `/orders/all?${query}` : "/orders/all",
      { token }
    );

    if (Array.isArray(payload)) {
      return {
        data: payload.map(normalizeOrder),
        pagination: {
          page: 1,
          limit: payload.length || options.limit || 10,
          total: payload.length,
          totalPages: 1,
        },
      } satisfies AdminOrderPage;
    }

    return {
      data: payload.data.map(normalizeOrder),
      pagination: payload.pagination,
    } satisfies AdminOrderPage;
  },
  getDashboardSummary: async (token: string) => requestJson<AdminDashboardSummary>("/orders/summary", { token }),
  updateOrderStatus: async (token: string, id: number, status: BackendOrder["status"]) =>
    normalizeOrder(await requestJson<BackendOrder>(`/orders/${id}/status`, { method: "PUT", token, body: { status } })),
  updateOrderShipping: async (
    token: string,
    id: number,
    payload: { trackingNumber?: string | null; shipmentStatus?: NonNullable<BackendOrder["shipmentStatus"]> }
  ) => normalizeOrder(await requestJson<BackendOrder>(`/orders/${id}/shipping`, { method: "PUT", token, body: payload })),
};