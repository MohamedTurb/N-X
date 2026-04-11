"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "../lib/products-api";
import type { ProductColor } from "./cart-provider";
import { useCart } from "./cart-provider";

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [color, setColor] = useState<ProductColor>("Black");

  const handleAdd = () => {
    addItem(product, 1, color);
  };

  const handleBuyNow = () => {
    addItem(product, 1, color);
    router.push("/checkout");
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleAdd}
          className="border border-white px-6 py-3 font-body text-[11px] tracking-[0.15em] transition hover:bg-white hover:text-black sm:text-xs sm:tracking-[0.25em]"
        >
          ADD TO CART
        </button>
        <button
          onClick={handleBuyNow}
          className="border border-accent bg-accent px-6 py-3 font-body text-[11px] tracking-[0.15em] text-white transition hover:opacity-90 sm:text-xs sm:tracking-[0.25em]"
        >
          BUY NOW
        </button>
      </div>
    </div>
  );
}
