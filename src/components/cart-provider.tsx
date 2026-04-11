"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "../lib/products-api";

export type ProductColor = "Black" | "White";

export type CartItem = {
  product: Product;
  quantity: number;
  color: ProductColor;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, color?: ProductColor) => void;
  removeItem: (slug: string, color: ProductColor) => void;
  updateQuantity: (slug: string, color: ProductColor, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
};

const STORAGE_KEY = "nox-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as CartItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (product: Product, quantity = 1, color: ProductColor = "Black") => {
      setItems((prev) => {
        const existing = prev.find(
          (item) => item.product.slug === product.slug && item.color === color
        );

        if (existing) {
          return prev.map((item) =>
            item.product.slug === product.slug && item.color === color
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }

        return [...prev, { product, quantity, color }];
      });
    };

    const removeItem = (slug: string, color: ProductColor) => {
      setItems((prev) => prev.filter((item) => !(item.product.slug === slug && item.color === color)));
    };

    const updateQuantity = (slug: string, color: ProductColor, quantity: number) => {
      if (quantity <= 0) {
        removeItem(slug, color);
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.product.slug === slug && item.color === color ? { ...item, quantity } : item
        )
      );
    };

    const clearCart = () => {
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
      totalCount,
      totalPrice,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
