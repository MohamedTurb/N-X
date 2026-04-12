"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white px-4">
      <div className="max-w-xl border border-zinc-800 bg-night p-8 text-center">
        <p className="font-display text-4xl tracking-[0.08em]">Something went wrong</p>
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-zinc-400">
          The application could not load data from the backend.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="border border-accent bg-accent px-5 py-3 text-xs uppercase tracking-[0.2em] text-white"
          >
            Try Again
          </button>
          <Link href="/shop" className="border border-zinc-700 px-5 py-3 text-xs uppercase tracking-[0.2em] text-zinc-300">
            Go To Shop
          </Link>
        </div>
      </div>
    </main>
  );
}