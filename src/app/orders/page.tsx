"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteFooter } from "../../components/site-footer";
import { SiteNav } from "../../components/site-nav";
import { RequireAuth } from "../../components/require-auth";
import { useAuth } from "../../components/auth-provider";
import { orderApi, type Order } from "../../services/order-api";
import { ApiError, getErrorMessage } from "../../services/api";
import { useToast } from "../../components/toast-provider";

function OrdersContent() {
  const { token, logout } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      if (!token) {
        return;
      }

      try {
        setIsLoading(true);
        const response = await orderApi.getMyOrders(token);
        if (active) {
          setOrders(response);
        }
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          logout();
          return;
        }

        const message = getErrorMessage(loadError);
        if (active) {
          setError(message);
        }
        showToast(message, "error");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      active = false;
    };
  }, [showToast, token]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
      <h1 className="font-display text-4xl tracking-[0.08em] sm:text-6xl">ORDERS</h1>

      {isLoading ? (
        <div className="mt-12 border border-zinc-800 p-6 text-center sm:p-8">
          <p className="font-body text-sm uppercase tracking-[0.2em] text-zinc-400">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="mt-12 border border-zinc-800 p-6 text-center sm:p-8">
          <p className="font-body text-sm uppercase tracking-[0.2em] text-zinc-400">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-12 border border-zinc-800 p-6 text-center sm:p-8">
          <p className="font-body text-sm uppercase tracking-[0.2em] text-zinc-400">No orders yet.</p>
          <Link href="/shop" className="mt-6 inline-block text-xs uppercase tracking-[0.24em] text-accent hover:text-white">
            Go To Shop
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="border border-zinc-800 bg-night p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display text-2xl tracking-[0.05em]">Order #{order.id}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-400">{order.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-300">{order.totalPriceLabel}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 border-t border-zinc-900 pt-3">
                    <span className="max-w-[70%] truncate text-zinc-300">
                      {item.productName} x {item.quantity}
                    </span>
                    <span>{item.priceLabel}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <RequireAuth>
        <OrdersContent />
      </RequireAuth>
      <SiteFooter />
    </main>
  );
}