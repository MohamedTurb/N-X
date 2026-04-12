"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "../../components/site-footer";
import { SiteNav } from "../../components/site-nav";
import { useCart } from "../../components/cart-provider";
import { RequireAuth } from "../../components/require-auth";

function formatCurrency(value: number) {
  return `EGP ${value.toLocaleString("en-US")}`;
}

const SHIPPING_COST = 70;

export default function CartPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <RequireAuth>
        <CartContent />
      </RequireAuth>
      <SiteFooter />
    </main>
  );
}

function CartContent() {
  const { items, removeItem, updateQuantity, totalPrice, isLoading } = useCart();

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <h1 className="font-display text-4xl tracking-[0.08em] sm:text-6xl">CART</h1>
        <div className="mt-12 border border-zinc-800 p-6 text-center sm:p-8">
          <p className="font-body text-sm uppercase tracking-[0.2em] text-zinc-400">Loading cart...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
      <h1 className="font-display text-4xl tracking-[0.08em] sm:text-6xl">CART</h1>

      {items.length === 0 ? (
        <div className="mt-12 border border-zinc-800 p-6 text-center sm:p-8">
          <p className="font-body text-sm uppercase tracking-[0.2em] text-zinc-400">Your cart is empty.</p>
          <Link href="/shop" className="mt-6 inline-block text-xs uppercase tracking-[0.24em] text-accent hover:text-white">
            Go To Shop
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_340px] md:gap-10">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={`${item.product.slug}-${item.color}-${item.size}`}
                className="grid gap-4 border border-zinc-800 bg-night p-4 sm:grid-cols-[100px_1fr_auto] md:grid-cols-[120px_1fr_auto]"
              >
                <div className="relative h-36 overflow-hidden bg-zinc-950 sm:h-32 md:h-28">
                  <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                </div>

                <div>
                  <p className="font-display text-2xl tracking-[0.05em]">{item.product.name}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-400">{item.product.category}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-400">Color: {item.color}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-400">Size: {item.size}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">Code: {item.product.id}</p>
                  <p className="mt-3 font-body text-sm text-zinc-300">{item.product.priceLabel}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    onClick={() => void updateQuantity(item.product.slug, item.color, item.size, item.quantity - 1)}
                    className="h-8 w-8 border border-zinc-700 text-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => void updateQuantity(item.product.slug, item.color, item.size, item.quantity + 1)}
                    className="h-8 w-8 border border-zinc-700 text-sm"
                  >
                    +
                  </button>
                  <button
                    onClick={() => void removeItem(item.product.slug, item.color, item.size)}
                    className="text-xs uppercase tracking-[0.16em] text-zinc-500 hover:text-white sm:ml-2 md:ml-4 md:tracking-[0.2em]"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit border border-zinc-800 bg-night p-6">
            <p className="font-body text-xs uppercase tracking-[0.25em] text-zinc-400">Order Summary</p>
            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="text-zinc-400">Subtotal</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-zinc-400">Shipping</span>
              <span>{formatCurrency(SHIPPING_COST)}</span>
            </div>
            <div className="mt-5 border-t border-zinc-800 pt-5">
              <div className="flex items-center justify-between">
                <span className="font-body text-xs uppercase tracking-[0.2em] text-zinc-400">Total</span>
                <span className="font-display text-2xl">{formatCurrency(totalPrice + SHIPPING_COST)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-7 block border border-accent bg-accent px-5 py-3 text-center font-body text-xs tracking-[0.24em] text-white"
            >
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
