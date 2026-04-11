"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./cart-provider";

const links = [
  { href: "/intro", label: "Intro" },
  { href: "/drop", label: "Drop" },
  { href: "/shop", label: "Shop" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/cart", label: "Cart" },
];

export function SiteNav() {
  const pathname = usePathname();
  const { totalCount } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-900/80 bg-black/85 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link
          href="/"
          className={`font-display text-3xl leading-none tracking-[0.08em] transition sm:text-4xl ${
            pathname === "/" ? "text-white" : "text-zinc-200 hover:text-white"
          }`}
        >
          NØX
        </Link>
        <div className="w-full sm:w-auto">
          <div className="flex flex-wrap items-center gap-1.5 sm:justify-end sm:gap-3">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const isCartLink = link.href === "/cart";

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`whitespace-nowrap px-2 py-1 font-body text-[10px] uppercase tracking-[0.15em] transition sm:px-3 sm:text-xs sm:tracking-[0.2em] ${
                  isActive
                    ? "border-b border-accent text-white"
                    : "text-zinc-400 hover:text-white"
                } ${isCartLink ? "inline-flex items-center gap-1.5" : ""}`}
              >
                {link.label}
                {isCartLink && totalCount > 0 ? (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold leading-none text-white sm:h-5 sm:min-w-5 sm:text-[10px]">
                    {totalCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
          </div>
        </div>
      </nav>
    </header>
  );
}
