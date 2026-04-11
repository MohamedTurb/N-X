"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "../lib/products-api";

export type ProductColor = "Black" | "White";
export type ProductSize = "XS" | "S" | "M" | "L" | "XL";

export type CartItem = {
  product: Product;
  quantity: number;
  color: ProductColor;
  size: ProductSize;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, color?: ProductColor, size?: ProductSize) => void;
  removeItem: (slug: string, color: ProductColor, size: ProductSize) => void;
  updateQuantity: (slug: string, color: ProductColor, size: ProductSize, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
};

const STORAGE_KEY = "nox-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

function parsePriceFromLabel(priceLabel: string): number | null {
  const digits = priceLabel.replace(/[^0-9]/g, "");
  if (!digits) {
    return null;
  }

  return Number.parseInt(digits, 10);
}

function normalizeProductPrice(product: Product): Product {
  const parsed = parsePriceFromLabel(product.priceLabel);

  if (!parsed || parsed === product.priceValue) {
    return product;
  }

  return { ...product, priceValue: parsed };
}

function normalizeStoredItem(item: Partial<CartItem>): CartItem | null {
  if (!item.product || !item.color || typeof item.quantity !== "number") {
    return null;
  }

  return {
    product: normalizeProductPrice(item.product),
    color: item.color,
    quantity: item.quantity,
    size: item.size ?? "M",
  };
}

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
      const parsed = JSON.parse(raw) as Partial<CartItem>[];
      return parsed.map(normalizeStoredItem).filter((item): item is CartItem => item !== null);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (
      product: Product,
      quantity = 1,
      color: ProductColor = "Black",
      size: ProductSize = "M"
    ) => {
      setItems((prev) => {
        const existing = prev.find(
          (item) => item.product.slug === product.slug && item.color === color && item.size === size
        );

        if (existing) {
          return prev.map((item) =>
            item.product.slug === product.slug && item.color === color && item.size === size
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }

        return [...prev, { product: normalizeProductPrice(product), quantity, color, size }];
      });
    };

    const removeItem = (slug: string, color: ProductColor, size: ProductSize) => {
      setItems((prev) =>
        prev.filter((item) => !(item.product.slug === slug && item.color === color && item.size === size))
      );
    };

    const updateQuantity = (slug: string, color: ProductColor, size: ProductSize, quantity: number) => {
      if (quantity <= 0) {
        removeItem(slug, color, size);
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.product.slug === slug && item.color === color && item.size === size
            ? { ...item, quantity }
            : item
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
