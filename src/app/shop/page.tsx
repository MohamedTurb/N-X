"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { SiteFooter } from "../../components/site-footer";
import { SiteNav } from "../../components/site-nav";
import { Category, featuredProducts, reveal } from "../../lib/nox-data";

export default function ShopPage() {
  const [filter, setFilter] = useState<Category>("All");

  const shopProducts = useMemo(() => {
    if (filter === "All") {
      return featuredProducts;
    }

    return featuredProducts.filter((item) => item.category === filter);
  }, [filter]);

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7 }}
          className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <h1 className="font-display text-4xl tracking-[0.08em] sm:text-6xl">SHOP</h1>
          <div className="flex items-center gap-2 rounded-full border border-zinc-700 p-1">
            {(["All", "Hoodies", "Tees"] as Category[]).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                  filter === item ? "bg-white text-black" : "text-zinc-300 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shopProducts.map((product, index) => (
            <motion.article
              key={`${product.name}-shop`}
              variants={reveal}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.45, delay: index * 0.04 }}
              className="group relative overflow-hidden border border-zinc-800"
            >
              <div className="glitch-card relative h-64 overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-tr ${product.tone} transition duration-500 group-hover:scale-105`}
                />
                <div className="absolute inset-x-0 bottom-0 h-20 translate-y-full bg-gradient-to-t from-black to-transparent transition-transform duration-500 group-hover:translate-y-0" />
              </div>
              <div className="p-5">
                <h2 className="font-display text-xl tracking-[0.08em]">{product.name}</h2>
                <div className="mt-3 flex items-center justify-between text-sm text-zinc-300">
                  <span>{product.price}</span>
                  <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">{product.category}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
