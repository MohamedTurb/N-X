"use client";

import { motion } from "framer-motion";
import { SiteFooter } from "../../components/site-footer";
import { SiteNav } from "../../components/site-nav";
import { reveal } from "../../lib/nox-data";

export default function IntroPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <motion.section
        variants={reveal}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.85, ease: "easeOut" }}
        className="mx-auto flex min-h-[78vh] max-w-6xl items-center px-6 py-20"
      >
        <div>
          <p className="font-display text-xs tracking-[0.5em] text-zinc-400">MANIFESTO</p>
          <h1 className="mt-8 max-w-4xl font-display text-5xl uppercase leading-[0.95] sm:text-6xl md:text-7xl">
            NØX is not fashion. It is controlled identity collapse.
          </h1>
          <p className="mt-10 max-w-2xl font-body text-sm leading-relaxed tracking-[0.12em] text-zinc-300">
            A discipline of erasure. A wardrobe of void structures. NØX is where identity is stripped,
            rebuilt, and weaponized in silence.
          </p>
        </div>
      </motion.section>
      <SiteFooter />
    </main>
  );
}
