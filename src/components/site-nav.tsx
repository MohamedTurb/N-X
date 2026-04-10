"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/intro", label: "Intro" },
  { href: "/drop", label: "Drop" },
  { href: "/shop", label: "Shop" },
  { href: "/lookbook", label: "Lookbook" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-900/80 bg-black/85 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className={`font-display text-4xl leading-none tracking-[0.08em] transition ${
            pathname === "/" ? "text-white" : "text-zinc-200 hover:text-white"
          }`}
        >
          NØX
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`px-2 py-1 font-body text-[10px] uppercase tracking-[0.2em] transition sm:px-3 sm:text-xs ${
                  isActive
                    ? "border-b border-accent text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
