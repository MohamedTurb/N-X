"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SiteFooter } from "../components/site-footer";
import { SiteNav } from "../components/site-nav";

const routes = [
  { href: "/intro", title: "Brand Intro" },
  { href: "/drop", title: "Origin Drop 01" },
  { href: "/shop", title: "Shop" },
  { href: "/lookbook", title: "Lookbook" },
];

export default function Home() {
  return (
    <main className="bg-black text-white">
      <SiteNav />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,51,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_38%)]" />
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center"
        >
          <motion.h1
            data-text="NØX"
            className="glitch-logo font-display text-[4rem] leading-none sm:text-[8rem] md:text-[11rem] lg:text-[13rem]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            NØX
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-3 font-body text-xs tracking-[0.32em] text-zinc-300 sm:text-sm sm:tracking-[0.55em] md:text-base"
          >
            OWN THE DARK
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-12"
          >
            <Link
              href="/intro"
              className="border border-white px-6 py-3 font-body text-[11px] tracking-[0.24em] transition hover:border-accent hover:bg-white hover:text-black sm:px-8 sm:text-xs sm:tracking-[0.36em]"
            >
              ENTER THE VOID
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="grid gap-4 sm:grid-cols-2">
          {routes.map((route, index) => (
            <motion.div
              key={route.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: index * 0.07 }}
            >
              <Link
                href={route.href}
                className="group flex flex-col items-start gap-2 border border-zinc-800 bg-night p-5 transition hover:border-accent sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-display text-2xl tracking-[0.08em] sm:text-3xl">{route.title}</span>
                <span className="font-body text-xs tracking-[0.28em] text-zinc-400 transition group-hover:text-white">
                  OPEN
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
