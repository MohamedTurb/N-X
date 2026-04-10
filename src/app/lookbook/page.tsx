"use client";

import { motion } from "framer-motion";
import { SiteFooter } from "../../components/site-footer";
import { SiteNav } from "../../components/site-nav";
import { lookbookFrames, reveal } from "../../lib/nox-data";

export default function LookbookPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <section className="px-0 py-10">
        {lookbookFrames.map((frame, index) => (
          <motion.div
            key={frame}
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.32 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative mx-auto mb-10 flex h-[70vh] max-w-7xl items-end border-y border-zinc-800 px-8 py-10 md:h-[78vh]"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                index % 2 === 0
                  ? "from-zinc-900 via-black to-neutral-800"
                  : "from-black via-zinc-800 to-black"
              }`}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,0,51,0.2),transparent_30%)]" />
            <p className="relative z-10 max-w-3xl font-display text-4xl leading-[0.95] tracking-[0.08em] md:text-7xl">
              {frame}
            </p>
          </motion.div>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
