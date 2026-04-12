"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteFooter } from "../../components/site-footer";
import { SiteNav } from "../../components/site-nav";
import { useCart } from "../../components/cart-provider";
import { RequireAuth } from "../../components/require-auth";
import { useAuth } from "../../components/auth-provider";
import { orderApi, type Order } from "../../services/order-api";
import { ApiError, getErrorMessage } from "../../services/api";
import { useToast } from "../../components/toast-provider";

function formatCurrency(value: number) {
  return `EGP ${value.toLocaleString("en-US")}`;
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <RequireAuth>
        <CheckoutContent />
      </RequireAuth>
      <SiteFooter />
    </main>
  );
}

function CheckoutContent() {
  const { items, totalPrice, clearCart } = useCart();
  const { token, logout } = useAuth();
  const { showToast } = useToast();
  const [isPlaced, setIsPlaced] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finalTotal = useMemo(() => totalPrice + 120, [totalPrice]);

  const handlePlaceOrder = async () => {
    const cleanedName = customerName.trim();

    if (items.length === 0) {
      setError("Cart is empty.");
      return;
    }

    if (cleanedName.length < 3) {
      setError("Please enter a valid full name.");
      return;
    }

    const cleanedEmail = email.trim();
    if (!cleanedEmail || !cleanedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!token) {
      setError("Session expired. Please sign in again.");
      return;
    }

    if (phone.trim().length < 6) {
      setError("Please enter a valid phone number.");
      return;
    }

    const cleanedAddress = address.trim();
    if (cleanedAddress.length < 5) {
      setError("Please enter a valid shipping address.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      const createdOrder = await orderApi.createOrder(token, {
        customerName: cleanedName,
        customerEmail: cleanedEmail,
        customerPhone: phone.trim(),
        shippingAddress: cleanedAddress,
      });
      setOrder(createdOrder);
      setIsPlaced(true);
      await clearCart();
      showToast("Order placed successfully", "success");
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) {
        logout();
        return;
      }

      const message = getErrorMessage(submitError);
      setError(message);
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
      <h1 className="font-display text-4xl tracking-[0.08em] sm:text-6xl">CHECKOUT</h1>

      {isPlaced ? (
        <div className="mt-12 border border-zinc-800 p-6 text-center sm:p-10">
          <p className="font-display text-3xl tracking-[0.06em] sm:text-4xl sm:tracking-[0.08em]">ORDER CONFIRMED</p>
          <p className="mt-4 font-body text-[11px] uppercase tracking-[0.14em] text-zinc-400 sm:text-xs sm:tracking-[0.2em]">
            Your order has been created successfully.
          </p>
          {order ? (
            <>
              <p className="mt-3 break-all font-body text-[11px] uppercase tracking-[0.14em] text-zinc-500 sm:text-xs sm:tracking-[0.2em]">
                Order ID: {order.id}
              </p>
              <p className="mt-2 break-all font-body text-[11px] uppercase tracking-[0.14em] text-zinc-500 sm:text-xs sm:tracking-[0.2em]">
                Total: {order.totalPriceLabel}
              </p>
            </>
          ) : null}
          <Link href="/shop" className="mt-8 inline-block text-xs uppercase tracking-[0.22em] text-accent hover:text-white">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_360px] md:gap-10">
          <form className="space-y-5 border border-zinc-800 bg-night p-6">
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs sm:tracking-[0.3em]">Shipping Details</p>
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm"
              placeholder="Full Name"
            />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm"
              placeholder="Email"
            />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm"
              placeholder="Phone"
            />
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm"
              placeholder="Address"
            />
            <input className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm" placeholder="City" />

            {error ? <p className="text-xs uppercase tracking-[0.16em] text-accent">{error}</p> : null}

            <p className="pt-4 font-body text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs sm:tracking-[0.3em]">Payment</p>
            <div className="border border-zinc-700 p-4 text-xs uppercase tracking-[0.2em] text-zinc-300">
              Cash on Delivery
            </div>

            <button
              type="button"
              onClick={() => void handlePlaceOrder()}
              disabled={items.length === 0 || isSubmitting}
              className="w-full border border-accent bg-accent px-5 py-3 font-body text-[11px] tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs sm:tracking-[0.24em]"
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </button>
          </form>

          <aside className="h-fit border border-zinc-800 bg-night p-6">
            <p className="font-body text-xs uppercase tracking-[0.25em] text-zinc-400">Order Summary</p>

            <div className="mt-6 space-y-3 text-sm">
              {items.map((item) => (
                <div key={item.product.slug} className="flex items-center justify-between gap-3">
                  <span className="max-w-[65%] truncate text-zinc-300 sm:max-w-[70%]">
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
  );
}
