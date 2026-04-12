"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "../services/product-api";
import type { ProductColor, ProductSize } from "./cart-provider";
import { useCart } from "./cart-provider";
import { useAuth } from "./auth-provider";
import { ApiError, getErrorMessage } from "../services/api";
import { useToast } from "./toast-provider";

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [color, setColor] = useState<ProductColor>("Black");
  const [size, setSize] = useState<ProductSize>("M");
  const [isBusy, setIsBusy] = useState(false);

  const handleAdd = async () => {
    if (!isAuthenticated) {
      router.push(`/login?next=/shop/${product.slug}`);
      return;
    }

    try {
      setIsBusy(true);
      await addItem(product, 1, color, size);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push(`/login?next=/shop/${product.slug}`);
        return;
      }

      showToast(getErrorMessage(error), "error");
    } finally {
      setIsBusy(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push(`/login?next=/shop/${product.slug}`);
      return;
    }

    try {
      setIsBusy(true);
      await addItem(product, 1, color, size);
      router.push("/checkout");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push(`/login?next=/shop/${product.slug}`);
        return;
      }

      showToast(getErrorMessage(error), "error");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="mt-8 space-y-5">
      <div>
        <p className="font-body text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:text-xs sm:tracking-[0.25em]">Color In Description</p>
        <div className="mt-3 flex items-center gap-3">
          {(["Black", "White"] as ProductColor[]).map((tone) => (
            <button
              key={tone}
              onClick={() => setColor(tone)}
              className={`border px-4 py-2 text-[10px] uppercase tracking-[0.14em] transition sm:text-xs sm:tracking-[0.2em] ${
                color === tone
                  ? "border-white bg-white text-black"
                  : "border-zinc-600 text-zinc-300 hover:border-white hover:text-white"
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-body text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:text-xs sm:tracking-[0.25em]">Size</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(["XS", "S", "M", "L", "XL"] as ProductSize[]).map((item) => (
            <button
              key={item}
              onClick={() => setSize(item)}
              className={`border px-3 py-2 text-[10px] uppercase tracking-[0.14em] transition sm:text-xs sm:tracking-[0.2em] ${
                size === item
                  ? "border-white bg-white text-black"
                  : "border-zinc-600 text-zinc-300 hover:border-white hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
          <a href="#size-chart" className="ml-2 text-[10px] uppercase tracking-[0.16em] text-accent hover:text-white sm:text-xs">
            Size Chart
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleAdd}
          disabled={isBusy}
          className="border border-white px-6 py-3 font-body text-[11px] tracking-[0.15em] transition hover:bg-white hover:text-black sm:text-xs sm:tracking-[0.25em]"
        >
          ADD TO CART
        </button>
        <button
          onClick={handleBuyNow}
          disabled={isBusy}
          className="border border-accent bg-accent px-6 py-3 font-body text-[11px] tracking-[0.15em] text-white transition hover:opacity-90 sm:text-xs sm:tracking-[0.25em]"
        >
          BUY NOW
        </button>
      </div>
    </div>
  );
}
