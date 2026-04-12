import { requestJson } from "./api";
import type { BackendProduct } from "./product-api";
import { mapProduct } from "./product-api";

export type BackendOrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number | string;
  product: BackendProduct;
};

export type BackendOrder = {
  id: number;
  userId: number;
  totalPrice: number | string;
  status: "pending" | "paid" | "shipped" | "delivered";
  createdAt: string;
  updatedAt: string;
  items?: BackendOrderItem[];
};

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  priceValue: number;
  priceLabel: string;
  imageUrl: string;
};

export type Order = {
  id: number;
  userId: number;
  totalPrice: number;
  totalPriceLabel: string;
  status: BackendOrder["status"];
  createdAt: string;
  items: OrderItem[];
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
    status: order.status,
    createdAt: order.createdAt,
    items: (order.items ?? []).map((item) => {
      const priceValue = typeof item.price === "number" ? item.price : Number.parseFloat(item.price);

      return {
        id: item.id,
        productId: item.productId,
        productName: mapProduct(item.product).name,
        quantity: item.quantity,
        priceValue,
        priceLabel: formatCurrency(priceValue),
        imageUrl: mapProduct(item.product).imageUrl,
      };
    }),
  };
}

export const orderApi = {
  createOrder: async (token: string) => normalizeOrder(await requestJson<BackendOrder>("/orders", { method: "POST", token })),
  getMyOrders: async (token: string) => (await requestJson<BackendOrder[]>("/orders", { token })).map(normalizeOrder),
  getAllOrders: async (token: string) => (await requestJson<BackendOrder[]>("/orders/all", { token })).map(normalizeOrder),
  updateOrderStatus: async (token: string, id: number, status: BackendOrder["status"]) =>
    normalizeOrder(await requestJson<BackendOrder>(`/orders/${id}/status`, { method: "PUT", token, body: { status } })),
};