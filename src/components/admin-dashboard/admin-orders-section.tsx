import type { Order } from "../../services/order-api";

type OrderStatus = Order["status"];

type Props = {
  orders: Order[];
  orderFilter: "all" | OrderStatus;
  orderStatusDrafts: Record<number, OrderStatus>;
  orderShippingDrafts: Record<number, { trackingNumber: string; shipmentStatus: "pending" | "packed" | "shipped" | "delivered" }>;
  updatingOrderId: number | null;
  updatingShippingOrderId: number | null;
  filteredOrderCount: number;
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  search: string;
  onFilterChange: (status: "all" | OrderStatus) => void;
  onSearchChange: (value: string) => void;
  onStatusDraftChange: (orderId: number, status: OrderStatus) => void;
  onStatusSave: (orderId: number) => void;
  onShippingDraftChange: (orderId: number, next: { trackingNumber: string; shipmentStatus: "pending" | "packed" | "shipped" | "delivered" }) => void;
  onShippingSave: (orderId: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "canceled", "refunded"];
const SHIPMENT_STATUSES = ["pending", "packed", "shipped", "delivered"] as const;

function formatCurrency(value: number) {
  return `EGP ${value.toLocaleString("en-US")}`;
}

export function AdminOrdersSection({
  orders,
  orderFilter,
  orderStatusDrafts,
  orderShippingDrafts,
  updatingOrderId,
  updatingShippingOrderId,
  filteredOrderCount,
  isLoading,
  pagination,
  search,
  onFilterChange,
  onSearchChange,
  onPreviousPage,
  onNextPage,
  onStatusDraftChange,
  onStatusSave,
  onShippingDraftChange,
  onShippingSave,
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
        <div className="min-w-[240px] sm:ml-auto">
          <label htmlFor="order-search" className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            Search Orders
          </label>
          <input
            id="order-search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Name, email, phone, address"
            className="mt-2 w-full border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border border-zinc-800 bg-night px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
        <button
          type="button"
          onClick={onPreviousPage}
          disabled={pagination.page <= 1 || isLoading}
          className="transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span>
          Showing {filteredOrderCount} / {pagination.total} | Page {pagination.page} / {pagination.totalPages}
        </span>
        <button
          type="button"
          onClick={onNextPage}
          disabled={pagination.page >= pagination.totalPages || isLoading}
          className="transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {isLoading ? (
          <div className="border border-zinc-800 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="border border-zinc-800 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              {search ? "No orders match this search." : "No orders found."}
            </p>
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
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onStatusSave(order.id)}
                    disabled={updatingOrderId === order.id || (orderStatusDrafts[order.id] ?? order.status) === order.status}
                    className="border border-white px-4 py-2 text-[10px] uppercase tracking-[0.18em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {updatingOrderId === order.id ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 border-t border-zinc-900 pt-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <label htmlFor={`tracking-${order.id}`} className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                      Tracking Number
                    </label>
                    <input
                      id={`tracking-${order.id}`}
                      value={orderShippingDrafts[order.id]?.trackingNumber ?? order.trackingNumber ?? ""}
                      onChange={(event) =>
                        onShippingDraftChange(order.id, {
                          trackingNumber: event.target.value,
                          shipmentStatus: orderShippingDrafts[order.id]?.shipmentStatus ?? order.shipmentStatus ?? "pending",
                        })
                      }
                      placeholder="Enter tracking number"
                      className="mt-2 w-full border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={`shipment-${order.id}`} className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                      Shipment Status
                    </label>
                    <select
                      id={`shipment-${order.id}`}
                      value={orderShippingDrafts[order.id]?.shipmentStatus ?? order.shipmentStatus ?? "pending"}
                      onChange={(event) =>
                        onShippingDraftChange(order.id, {
                          trackingNumber: orderShippingDrafts[order.id]?.trackingNumber ?? order.trackingNumber ?? "",
                          shipmentStatus: event.target.value as (typeof SHIPMENT_STATUSES)[number],
                        })
                      }
                      className="mt-2 border border-zinc-700 bg-black px-3 py-2 text-xs uppercase tracking-[0.14em] text-zinc-100"
                    >
                      {SHIPMENT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onShippingSave(order.id)}
                  disabled={updatingShippingOrderId === order.id}
                  className="border border-zinc-500 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-200 transition hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {updatingShippingOrderId === order.id ? "Saving..." : "Save Shipping"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em]">
                <span className="border border-zinc-700 px-2 py-1 text-zinc-300">Shipment: {order.shipmentStatus}</span>
                {order.trackingNumber ? <span className="border border-zinc-700 px-2 py-1 text-zinc-300">Tracking: {order.trackingNumber}</span> : null}
                {order.status === "canceled" ? <span className="border border-red-500/40 px-2 py-1 text-red-300">Canceled</span> : null}
                {order.status === "refunded" ? <span className="border border-amber-500/40 px-2 py-1 text-amber-300">Refunded</span> : null}
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