"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "../services/product-api";
import { ApiError, getErrorMessage } from "../services/api";
import { cartApi, type CartItem } from "../services/cart-api";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast-provider";

export type ProductColor = "Black" | "White";
export type ProductSize = "XS" | "S" | "M" | "L" | "XL";

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, color?: ProductColor, size?: ProductSize) => Promise<void>;
  removeItem: (slug: string, color: ProductColor, size: ProductSize) => Promise<void>;
  updateQuantity: (slug: string, color: ProductColor, size: ProductSize, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  totalCount: number;
  totalPrice: number;
  isLoading: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, status: authStatus, logout } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading">("loading");

  const refreshCart = useCallback(async () => {
    if (!token) {
      setItems([]);
      setSyncStatus("idle");
      return;
    }

    setSyncStatus("loading");

    try {
      const snapshot = await cartApi.getCart(token);
      setItems(snapshot.items);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
      } else {
        showToast(getErrorMessage(error), "error");
      }

      setItems([]);
    } finally {
      setSyncStatus("idle");
    }
  }, [logout, showToast, token]);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = async (
      product: Product,
      quantity = 1,
      _color: ProductColor = "Black",
      _size: ProductSize = "M"
    ) => {
      if (!token) {
        throw new ApiError("Please sign in to use the cart", 401);
      }

      try {
        const snapshot = await cartApi.addItem(token, product.id, quantity);
        setItems(snapshot.items);
        showToast("Added to cart", "success");
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
        }

        throw error;
      }
    };

    const removeItem = async (slug: string, _color: ProductColor, _size: ProductSize) => {
      if (!token) {
        throw new ApiError("Please sign in to use the cart", 401);
      }

      const item = items.find((entry) => entry.product.slug === slug);
      if (!item) {
        return;
      }

      try {
        const snapshot = await cartApi.removeItem(token, item.product.id);
        setItems(snapshot.items);
        showToast("Removed from cart", "info");
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
        }

        throw error;
      }
    };

    const updateQuantity = async (slug: string, _color: ProductColor, _size: ProductSize, quantity: number) => {
      if (!token) {
        throw new ApiError("Please sign in to use the cart", 401);
      }

      const item = items.find((entry) => entry.product.slug === slug);
      if (!item) {
        return;
      }

      if (quantity <= 0) {
        await removeItem(slug, "Black", "M");
        return;
      }

      try {
        const snapshot = await cartApi.updateItem(token, item.product.id, quantity);
        setItems(snapshot.items);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
        }

        throw error;
      }
    };

    const clearCart = async () => {
      if (!token) {
        setItems([]);
        return;
      }

      await cartApi.clearCart(token);
      setItems([]);
    };

    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.product.priceValue * item.quantity, 0);

    return {
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      refreshCart,
      totalCount,
      totalPrice,
      isLoading: authStatus === "loading" || syncStatus === "loading",
    };
  }, [authStatus, items, refreshCart, showToast, syncStatus, token]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
