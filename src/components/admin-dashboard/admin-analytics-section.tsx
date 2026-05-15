import type { AdminDashboardSummary } from "../../services/order-api";

type Props = {
  summary: AdminDashboardSummary | null;
  isLoading: boolean;
};

function formatRatio(value: number) {
  return `${Math.round(value * 100)}%`;
}

function ChartBar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = max > 0 ? Math.max(6, (value / max) * 100) : 6;

  return (
    <div className="grid grid-cols-[52px_1fr_72px] items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-zinc-500 sm:grid-cols-[68px_1fr_84px]">
      <span className="truncate">{label}</span>
      <div className="h-2 rounded-full bg-zinc-900">
        <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${width}%` }} />
      </div>
      <span className="text-right text-zinc-300">EGP {value.toLocaleString("en-US")}</span>
    </div>
  );
}

function SkeletonBlock() {
  return <div className="h-28 animate-pulse border border-zinc-800 bg-zinc-950/70" />;
}

export function AdminAnalyticsSection({ summary, isLoading }: Props) {
  if (isLoading || !summary) {
    return (
      <section className="mt-10 space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SkeletonBlock />
          <SkeletonBlock />
          <SkeletonBlock />
          <SkeletonBlock />
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <SkeletonBlock />
          <SkeletonBlock />
        </div>
      </section>
    );
  }

  const { overview, charts } = summary;
  const maxDaily = Math.max(1, ...charts.dailySales.map((item) => item.total));
  const maxMonthly = Math.max(1, ...charts.monthlySales.map((item) => item.total));
  const maxTopProducts = Math.max(1, ...charts.topProducts.map((item) => item.quantity));

  return (
    <section className="mt-10 space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="border border-zinc-800 bg-night p-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Revenue</p>
          <p className="mt-3 font-display text-3xl tracking-[0.06em]">{overview.revenueLabel}</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500">{overview.totalOrders} orders</p>
        </div>
        <div className="border border-zinc-800 bg-night p-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Today / Week</p>
          <p className="mt-3 font-display text-3xl tracking-[0.06em]">{overview.ordersToday} / {overview.ordersThisWeek}</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500">Orders created</p>
        </div>
        <div className="border border-zinc-800 bg-night p-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Average Order</p>
          <p className="mt-3 font-display text-3xl tracking-[0.06em]">{overview.averageOrderValueLabel}</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500">Basket value</p>
        </div>
        <div className="border border-zinc-800 bg-night p-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Low Stock / Pending</p>
          <p className="mt-3 font-display text-3xl tracking-[0.06em]">{overview.lowStockItems} / {overview.pendingOrders}</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500">Attention needed</p>
        </div>
        <div className="border border-zinc-800 bg-night p-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Stock Alerts</p>
          <p className="mt-3 font-display text-3xl tracking-[0.06em]">{overview.outOfStockItems} / {overview.reorderNeededItems}</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500">Out / Reorder</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="border border-zinc-800 bg-night p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Daily Sales</p>
              <h3 className="mt-2 font-display text-2xl tracking-[0.06em]">Last 7 Days</h3>
            </div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Trend</span>
          </div>
          <div className="mt-6 space-y-3">
            {charts.dailySales.map((item) => (
              <ChartBar key={item.label} label={item.label} value={item.total} max={maxDaily} />
            ))}
          </div>
        </div>

        <div className="border border-zinc-800 bg-night p-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Order Status</p>
            <h3 className="mt-2 font-display text-2xl tracking-[0.06em]">Distribution</h3>
          </div>
          <div className="mt-5 space-y-3">
            {charts.orderStatuses.map((status) => {
              const total = summary.overview.totalOrders || 1;
              const ratio = status.count / total;

              return (
                <div key={status.status} className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    <span>{status.status}</span>
                    <span>{status.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-900">
                    <div className="h-2 rounded-full bg-white" style={{ width: `${Math.max(6, ratio * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 border-t border-zinc-900 pt-4 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Cancellation rate: {formatRatio(summary.overview.cancellationRate)}
          </div>
          <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Featured products: {summary.overview.featuredProducts} | Inactive customers: {summary.overview.inactiveCustomers}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="border border-zinc-800 bg-night p-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Monthly Sales</p>
            <h3 className="mt-2 font-display text-2xl tracking-[0.06em]">Last 6 Months</h3>
          </div>
          <div className="mt-6 space-y-3">
            {charts.monthlySales.map((item) => (
              <ChartBar key={item.label} label={item.label} value={item.total} max={maxMonthly} />
            ))}
          </div>
        </div>

        <div className="border border-zinc-800 bg-night p-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Top Products</p>
            <h3 className="mt-2 font-display text-2xl tracking-[0.06em]">Best Sellers</h3>
          </div>
          <div className="mt-5 space-y-4">
            {charts.topProducts.length === 0 ? (
              <p className="text-sm text-zinc-500">No sales data yet.</p>
            ) : (
              charts.topProducts.map((product) => (
                <div key={product.id} className="space-y-2 border-b border-zinc-900 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-display text-lg tracking-[0.05em]">{product.name}</p>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">{product.category}</p>
                    </div>
                    <p className="text-right text-sm text-zinc-300">{product.revenueLabel}</p>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                    <div className="h-2 rounded-full bg-zinc-900">
                      <div className="h-2 rounded-full bg-accent" style={{ width: `${Math.max(8, (product.quantity / maxTopProducts) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">x {product.quantity}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
