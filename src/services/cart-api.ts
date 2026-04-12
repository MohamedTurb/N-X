import { requestJson } from "./api";
import type { BackendProduct, Product } from "./product-api";
import { mapProduct } from "./product-api";

export type BackendCartItem = {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  color?: "Black" | "White";
  product: BackendProduct;
};

export type BackendCart = {
  id: number;
  userId: number;
  items?: BackendCartItem[];
};

export type CartItem = {
  product: Product;
  quantity: number;
  color: "Black" | "White";
  size: "XS" | "S" | "M" | "L" | "XL";
};

export type CartSnapshot = {
  id: number;
  userId: number;
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
};

function normalizeItem(item: BackendCartItem): CartItem {
  return {
    product: mapProduct(item.product),
    quantity: item.quantity,
    color: item.color ?? "Black",
    size: "M",
  };
}

function toSnapshot(cart: BackendCart | null | undefined): CartSnapshot {
  const items = (cart?.items ?? []).map(normalizeItem);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.priceValue * item.quantity, 0);

  return {
    id: cart?.id ?? 0,
    userId: cart?.userId ?? 0,
    items,
    totalCount,
    totalPrice,
  };
}

export const cartApi = {
  getCart: async (token: string) => toSnapshot(await requestJson<BackendCart>("/cart", { token })),
  addItem: async (token: string, productId: number, quantity = 1, color: "Black" | "White" = "Black") =>
    toSnapshot(await requestJson<BackendCart>("/cart/add", { method: "POST", token, body: { productId, quantity, color } })),
  updateItem: async (token: string, productId: number, quantity: number, color: "Black" | "White" = "Black") =>
    toSnapshot(
      await requestJson<BackendCart>("/cart/update", { method: "PUT", token, body: { productId, quantity, color } })
    ),
  removeItem: async (token: string, productId: number, color: "Black" | "White" = "Black") =>
    toSnapshot(await requestJson<BackendCart>("/cart/remove", { method: "DELETE", token, body: { productId, color } })),
  clearCart: async (token: string) => {
    const cart = await requestJson<BackendCart>("/cart", { token });
    const itemsToRemove = (cart.items ?? []).map((item) => ({ productId: item.productId, color: item.color ?? "Black" }));

    for (const item of itemsToRemove) {
      await requestJson<BackendCart>("/cart/remove", {
        method: "DELETE",
        token,
        body: { productId: item.productId, color: item.color },
      });
    }

    return toSnapshot({ ...cart, items: [] });
  },
};