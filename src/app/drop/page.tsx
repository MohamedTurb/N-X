"use client";

import { motion } from "framer-motion";
import { SiteFooter } from "../../components/site-footer";
import { SiteNav } from "../../components/site-nav";
import { featuredProducts, reveal } from "../../lib/nox-data";

export default function DropPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.75 }}
          className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <h1 className="font-display text-4xl tracking-[0.08em] sm:text-6xl">ORIGIN DROP 01</h1>
          <p className="font-body text-xs uppercase tracking-[0.35em] text-zinc-400">Limited Unit Pieces</p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product, index) => (
            <motion.article
              key={product.name}
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: index * 0.06 }}
              className="group relative overflow-hidden border border-zinc-800 bg-night"
            >
              <div className="glitch-card relative h-72 overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${product.tone} transition duration-500 group-hover:scale-110 group-hover:blur-[1px]`}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,0,51,0.3),transparent_30%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="space-y-3 p-5">
                <h2 className="font-display text-2xl leading-none tracking-[0.06em]">{product.name}</h2>
                <div className="flex items-center justify-between text-sm text-zinc-300">
                  <span>{product.price}</span>
                  <span className="rounded-full border border-accent/60 px-3 py-1 text-xs uppercase tracking-[0.16em] text-accent">
                    {product.stockLeft} left
                  </span>
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
