"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, pathname, router, status]);

  if (status === "loading" || !isAuthenticated) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center border border-zinc-800 bg-night p-8 text-center">
        <p className="font-body text-[11px] uppercase tracking-[0.22em] text-zinc-400">Loading secure session</p>
      </div>
    );
  }

  return <>{children}</>;
}