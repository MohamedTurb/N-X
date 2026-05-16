"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "../services/product-api";
import { getErrorMessage } from "../services/api";
import { useCart } from "./cart-provider";
import { useAuth } from "./auth-provider";
import { useToast } from "./toast-provider";

type ShopGridProps = {
  products: Product[];
};

export function ShopGrid({ products }: ShopGridProps) {
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const shopProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory = filter === "All" || item.category === filter;
      const matchesSearch =
        deferredSearch.length === 0 ||
        [item.name, item.description, item.category].join(" ").toLowerCase().includes(deferredSearch);

      return matchesCategory && matchesSearch;
    });
  }, [deferredSearch, filter, products]);

  const categories = useMemo(() => {
    const unique = new Set(products.map((product) => product.category));
    return ["All", ...Array.from(unique)];
  }, [products]);

  const handleAdd = (product: Product) => {
    if (!isAuthenticated) {
      router.push("/login?next=/shop");
      return;
    }

    void addItem(product, 1, "Black", "M").catch((error) => {
      showToast(getErrorMessage(error), "error");
    });
  };

  return (
    <>
      <div className="mb-10 space-y-5 sm:mb-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Catalog</p>
            <h1 className="font-display text-4xl tracking-[0.08em] sm:text-6xl">SHOP</h1>
            <p className="max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Browse the latest drops, filter by category, and jump straight to the pieces you want.
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-xs uppercase tracking-[0.18em] text-zinc-400 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm">
            {shopProducts.length} item{shopProducts.length === 1 ? "" : "s"} shown
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex-1">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-zinc-500">Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, categories, descriptions..."
              className="w-full rounded-[1.1rem] border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-white/40"
            />
          </label>

          <div className="overflow-x-auto pb-1 lg:pb-0">
            <div className="flex min-w-max items-center gap-2 rounded-[1.25rem] border border-zinc-700/80 bg-zinc-950/70 p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`whitespace-nowrap rounded-[0.9rem] px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] transition duration-200 sm:px-6 sm:text-xs sm:tracking-[0.24em] ${
                  filter === item
                    ? "bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.12)]"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
            </div>
          </div>
        </div>
      </div>

      {shopProducts.length === 0 ? (
        <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950/70 p-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">No results</p>
          <h2 className="mt-3 font-display text-2xl tracking-[0.08em]">Nothing matches your search</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
            Try a different category or clear the search box to see the full catalog again.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setFilter("All");
            }}
            className="mt-6 border border-zinc-600 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition hover:border-white hover:text-white"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shopProducts.map((product) => (
          <article
            key={product.slug}
            className="group relative overflow-hidden border border-zinc-800 bg-night transition duration-300 hover:-translate-y-1 hover:border-zinc-600"
          >
            <Link href={`/shop/${product.slug}`} className="block">
              <div className="relative h-56 overflow-hidden bg-zinc-950 sm:h-64 md:h-72">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-contain object-center transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-90" />
              </div>
            </Link>

            <div className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-xl leading-none tracking-[0.06em] sm:text-2xl">{product.name}</h2>
                {product.stockLeft <= 5 ? (
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-amber-300">
                    Low stock
                  </span>
                ) : null}
              </div>
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
                  onClick={() => handleAdd(product)}
                  className="border border-zinc-600 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition hover:border-white hover:text-white"
                >
                  Add
                </button>
              </div>
            </div>
          </article>
          ))}
        </div>
      )}
    </>
  );
}
