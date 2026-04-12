"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isAdmin) {
      router.replace("/shop");
    }
  }, [isAdmin, isAuthenticated, pathname, router, status]);

  if (status === "loading" || !isAuthenticated) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center border border-zinc-800 bg-night p-8 text-center">
        <p className="font-body text-[11px] uppercase tracking-[0.22em] text-zinc-400">Loading admin session</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center border border-zinc-800 bg-night p-8 text-center">
        <p className="font-body text-[11px] uppercase tracking-[0.22em] text-zinc-400">Access denied</p>
      </div>
    );
  }

  return <>{children}</>;
}