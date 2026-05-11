import type { Order } from "../../services/order-api";

type OrderStatus = Order["status"];

type Props = {
  orders: Order[];
  orderFilter: "all" | OrderStatus;
  orderStatusDrafts: Record<number, OrderStatus>;
  updatingOrderId: number | null;
  filteredOrderCount: number;
  onFilterChange: (status: "all" | OrderStatus) => void;
  onStatusDraftChange: (orderId: number, status: OrderStatus) => void;
  onStatusSave: (orderId: number) => void;
};

const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered"];

function formatCurrency(value: number) {
  return `EGP ${value.toLocaleString("en-US")}`;
}

export function AdminOrdersSection({
  orders,
  orderFilter,
  orderStatusDrafts,
  updatingOrderId,
  filteredOrderCount,
  onFilterChange,
  onStatusDraftChange,
  onStatusSave,
}: Props) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-3xl tracking-[0.06em] sm:text-4xl">All Orders</h2>
        <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 sm:text-xs">GET /orders/all</span>
      </div>

      <div className="mt-5 flex flex-col gap-4 border border-zinc-800 bg-night p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Filter Status</label>
          <div className="overflow-x-auto pb-1">
            <div className="flex w-max flex-nowrap gap-2 rounded-full border border-zinc-700/90 bg-black/70 p-1.5">
              {(["all", ...ORDER_STATUSES] as Array<"all" | OrderStatus>).map((status) => {
                const isActive = orderFilter === status;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onFilterChange(status)}
                    className={`rounded-full border px-5 py-2.5 text-[10px] uppercase tracking-[0.22em] transition duration-200 sm:px-6 sm:text-xs sm:tracking-[0.28em] ${
                      isActive
                        ? "border-accent bg-accent text-white shadow-[0_8px_24px_rgba(255,0,51,0.28)]"
                        : "border-zinc-700 bg-black text-zinc-300 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    {status === "all" ? "All" : status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 sm:ml-auto sm:text-right">
          Showing {filteredOrderCount} / {orders.length}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {orders.length === 0 ? (
          <div className="border border-zinc-800 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">No orders found.</p>
          </div>
        ) : null}

        {orders.length > 0 &&
          orders.map((order) => (
            <article key={order.id} className="border border-zinc-800 bg-night p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display text-2xl tracking-[0.05em]">Order #{order.id}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-400">User #{order.userId}</p>
                  <p className="mt-1 max-w-full break-words text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Name: {order.customerName || order.userName || "N/A"}
                  </p>
                  <p className="mt-1 max-w-full break-all text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Email: {order.customerEmail || order.userEmail || "N/A"}
                  </p>
                  <p className="mt-1 max-w-full break-words text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Phone: {order.customerPhone || "N/A"}
                  </p>
                  <p className="mt-1 max-w-full break-words text-xs tracking-[0.08em] text-zinc-500">
                    Address: {order.shippingAddress || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-300">{order.totalPriceLabel ?? formatCurrency(order.totalPrice)}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-zinc-900 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <label htmlFor={`status-${order.id}`} className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    Status
                  </label>
                  <select
                    id={`status-${order.id}`}
                    value={orderStatusDrafts[order.id] ?? order.status}
                    onChange={(event) => onStatusDraftChange(order.id, event.target.value as OrderStatus)}
                    className="border border-zinc-700 bg-black px-3 py-2 text-xs uppercase tracking-[0.14em] text-zinc-100"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => onStatusSave(order.id)}
                  disabled={updatingOrderId === order.id || (orderStatusDrafts[order.id] ?? order.status) === order.status}
                  className="border border-white px-4 py-2 text-[10px] uppercase tracking-[0.18em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {updatingOrderId === order.id ? "Updating..." : "Update Status"}
                </button>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 border-t border-zinc-900 pt-3">
                    <span className="max-w-[70%] truncate text-zinc-300">
                      {item.productName} ({item.color}) x {item.quantity}
                    </span>
                    <span>{item.priceLabel}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}