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
        className="mx-auto flex min-h-[70vh] max-w-6xl items-center px-4 py-16 sm:min-h-[78vh] sm:px-6 sm:py-20"
      >
        <div>
          <p className="font-display text-[10px] tracking-[0.35em] text-zinc-400 sm:text-xs sm:tracking-[0.5em]">MANIFESTO</p>
          <h1 className="mt-6 max-w-4xl font-display text-3xl uppercase leading-[0.95] sm:mt-8 sm:text-5xl md:text-6xl lg:text-7xl">
            NØX is not fashion. It is controlled identity collapse.
          </h1>
          <p className="mt-8 max-w-2xl font-body text-sm leading-relaxed tracking-[0.08em] text-zinc-300 sm:mt-10 sm:tracking-[0.12em]">
            A discipline of erasure. A wardrobe of void structures. NØX is where identity is stripped,
            rebuilt, and weaponized in silence.
          </p>
        </div>
      </motion.section>
      <SiteFooter />
    </main>
  );
}
