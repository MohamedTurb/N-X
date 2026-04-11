"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SiteFooter } from "../../components/site-footer";
import { SiteNav } from "../../components/site-nav";
import { useCart } from "../../components/cart-provider";

type SavedOrder = {
  orderCode: string;
  createdAt: string;
  customerName: string;
  phone: string;
  items: Array<{
    productName: string;
    productCode: number;
    color: string;
    size: string;
    quantity: number;
  }>;
};

const ORDER_STORAGE_KEY = "nox-orders-v1";

function formatCurrency(value: number) {
  return `EGP ${value.toLocaleString("en-US")}`;
}

function normalizeEgyptianPhone(raw: string): { local: string } | null {
  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("0020")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("20") && digits.length === 12) {
    digits = `0${digits.slice(2)}`;
  }

  if (!/^01[0125][0-9]{8}$/.test(digits)) {
    return null;
  }

  return {
    local: digits,
  };
}

function saveOrder(order: SavedOrder) {
  const raw = window.localStorage.getItem(ORDER_STORAGE_KEY);

  if (!raw) {
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify([order]));
    return;
  }

  try {
    const existing = JSON.parse(raw) as SavedOrder[];
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify([order, ...existing]));
  } catch {
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify([order]));
  }
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [isPlaced, setIsPlaced] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [error, setError] = useState("");

  const finalTotal = useMemo(() => totalPrice + 120, [totalPrice]);

  const handlePlaceOrder = () => {
    const cleanedName = customerName.trim();

    if (items.length === 0) {
      setError("Cart is empty.");
      return;
    }

    if (cleanedName.length < 3) {
      setError("Please enter a valid full name.");
      return;
    }

    const normalizedPhone = normalizeEgyptianPhone(phone);

    if (!normalizedPhone) {
      setError("Please enter a valid Egyptian mobile number.");
      return;
    }

    setError("");

    const lines = items.map((item, index) => {
      return `${index + 1}) Product: ${item.product.name}\nCode: ${item.product.id}\nColor: ${item.color}\nSize: ${item.size}\nQty: ${item.quantity}`;
    });

    const nextOrderCode = `NOX-${Date.now()}`;

    const message = [
      "NØX New Order",
      `Name: ${cleanedName}`,
      `Phone: ${normalizedPhone.local}`,
      "Items:",
      ...lines,
    ]
      .filter(Boolean)
      .join("\n");

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const whatsappUrl = isMobile
      ? `https://wa.me/201030498067?text=${encodeURIComponent(message)}`
      : `https://web.whatsapp.com/send?phone=201030498067&text=${encodeURIComponent(message)}`;

    saveOrder({
      orderCode: nextOrderCode,
      createdAt: new Date().toISOString(),
      customerName: cleanedName,
      phone: normalizedPhone.local,
      items: items.map((item) => ({
        productName: item.product.name,
        productCode: item.product.id,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
      })),
    });

    const openedWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (!openedWindow) {
      window.location.href = whatsappUrl;
    }

    setOrderCode(nextOrderCode);
    setIsPlaced(true);
    clearCart();
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <h1 className="font-display text-4xl tracking-[0.08em] sm:text-6xl">CHECKOUT</h1>

        {isPlaced ? (
          <div className="mt-12 border border-zinc-800 p-6 text-center sm:p-10">
            <p className="font-display text-3xl tracking-[0.06em] sm:text-4xl sm:tracking-[0.08em]">ORDER CONFIRMED</p>
            <p className="mt-4 font-body text-[11px] uppercase tracking-[0.14em] text-zinc-400 sm:text-xs sm:tracking-[0.2em]">
              This is a mock checkout. No payment was processed.
            </p>
            <p className="mt-3 break-all font-body text-[11px] uppercase tracking-[0.14em] text-zinc-500 sm:text-xs sm:tracking-[0.2em]">Order Code: {orderCode}</p>
            <Link href="/shop" className="mt-8 inline-block text-xs uppercase tracking-[0.22em] text-accent hover:text-white">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
            <form className="space-y-5 border border-zinc-800 bg-night p-6">
              <p className="font-body text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs sm:tracking-[0.3em]">Shipping Details</p>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm"
                placeholder="Full Name"
              />
              <input className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm" placeholder="Email" />
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm"
                placeholder="Phone (01XXXXXXXXX)"
              />
              <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 sm:text-[11px] sm:tracking-[0.18em]">
                Use Egyptian mobile format: 010..., 011..., 012..., or 015...
              </p>
              <input className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm" placeholder="Address" />
              <input className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm" placeholder="City" />

              {error ? <p className="text-xs uppercase tracking-[0.16em] text-accent">{error}</p> : null}

              <p className="pt-4 font-body text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs sm:tracking-[0.3em]">Payment</p>
              <div className="border border-zinc-700 p-4 text-xs uppercase tracking-[0.2em] text-zinc-300">
                Cash on Delivery (Mock)
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={items.length === 0}
                className="w-full border border-accent bg-accent px-5 py-3 font-body text-[11px] tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs sm:tracking-[0.24em]"
              >
                Place Order
              </button>
            </form>

            <aside className="h-fit border border-zinc-800 bg-night p-6">
              <p className="font-body text-xs uppercase tracking-[0.25em] text-zinc-400">Order Summary</p>

              <div className="mt-6 space-y-3 text-sm">
                {items.map((item) => (
                  <div key={`${item.product.slug}-${item.color}-${item.size}`} className="flex items-center justify-between">
                    <span className="max-w-[70%] truncate text-zinc-300">
                      {item.product.name} ({item.color}/{item.size}) x {item.quantity}
                    </span>
                    <span>{formatCurrency(item.product.priceValue * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-zinc-800 pt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Shipping</span>
                  <span>EGP 120</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-body text-xs uppercase tracking-[0.2em] text-zinc-400">Total</span>
                  <span className="font-display text-2xl">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
