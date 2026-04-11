"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category, Product } from "../lib/products-api";
import { useCart } from "./cart-provider";

type ShopGridProps = {
  products: Product[];
};

export function ShopGrid({ products }: ShopGridProps) {
  const [filter, setFilter] = useState<Category>("All");
  const { addItem } = useCart();

  const shopProducts = useMemo(() => {
    if (filter === "All") {
      return products;
    }

    return products.filter((item) => item.category === filter);
  }, [filter, products]);

  return (
    <>
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-4xl tracking-[0.08em] sm:text-6xl">SHOP</h1>
        <div className="overflow-x-auto">
          <div className="flex min-w-max items-center gap-2 rounded-full border border-zinc-700 p-1">
            {(["All", "Hoodies", "Tees"] as Category[]).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`whitespace-nowrap px-4 py-2 text-[10px] uppercase tracking-[0.16em] transition sm:text-xs sm:tracking-[0.2em] ${
                  filter === item ? "bg-white text-black" : "text-zinc-300 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {shopProducts.map((product) => (
          <article
            key={product.slug}
            className="group relative overflow-hidden border border-zinc-800 bg-night"
          >
            <Link href={`/shop/${product.slug}`} className="block">
              <div className="relative h-64 overflow-hidden bg-zinc-950 sm:h-72">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
            </Link>

            <div className="space-y-3 p-5">
              <h2 className="font-display text-2xl leading-none tracking-[0.06em]">{product.name}</h2>
              <p className="font-body text-xs uppercase tracking-[0.16em] text-zinc-400">
                {product.description}
              </p>
              <div className="flex items-center justify-between text-sm text-zinc-300">
                <span>{product.priceLabel}</span>
                <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">{product.category}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Link
                  href={`/shop/${product.slug}`}
                  className="text-xs uppercase tracking-[0.2em] text-accent hover:text-white"
                >
                  View Details
                </Link>
                <button
                  onClick={() => addItem(product, 1, "Black")}
                  className="border border-zinc-600 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition hover:border-white hover:text-white"
                >
                  Add
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
