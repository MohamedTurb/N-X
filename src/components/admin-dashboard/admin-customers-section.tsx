type Customer = {
  id: number;
  username: string;
  email: string;
  orderCount: number;
  totalSpentLabel: string;
  lastActivityAt: string;
};

type Props = {
  customers: Customer[];
  topCustomers: Customer[];
  inactiveCustomers: number;
  isLoading: boolean;
};

function SkeletonRow() {
  return <div className="h-16 animate-pulse border border-zinc-800 bg-zinc-950/70" />;
}

export function AdminCustomersSection({ customers, topCustomers, inactiveCustomers, isLoading }: Props) {
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-3xl tracking-[0.06em] sm:text-4xl">Customers</h2>
        <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 sm:text-xs">Derived from orders</span>
      </div>

      <div className="mt-5 border border-zinc-800 bg-night p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Customer Activity</p>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Shows order count, spend, and last activity for each non-admin user. Inactive customers: {inactiveCustomers}. Dedicated block/unblock controls can be added once the user status model is extended.
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Recently Active</p>
          {isLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : customers.length === 0 ? (
            <div className="border border-zinc-800 p-6 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">No customer activity yet.</p>
            </div>
          ) : (
            customers.map((customer) => (
              <article key={customer.id} className="border border-zinc-800 bg-night p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-display text-2xl tracking-[0.05em]">{customer.username}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-400">{customer.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:text-right">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Orders</p>
                      <p className="mt-1 text-lg text-zinc-100">{customer.orderCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Spent</p>
                      <p className="mt-1 text-lg text-zinc-100">{customer.totalSpentLabel}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-zinc-900 pt-3 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  <span>Last activity {new Date(customer.lastActivityAt).toLocaleString()}</span>
                  <span>Active</span>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Top Customers</p>
          {isLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : topCustomers.length === 0 ? (
            <div className="border border-zinc-800 p-6 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">No top customer data yet.</p>
            </div>
          ) : (
            topCustomers.map((customer) => (
              <article key={customer.id} className="border border-zinc-800 bg-night p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-display text-2xl tracking-[0.05em]">{customer.username}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-400">{customer.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:text-right">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Orders</p>
                      <p className="mt-1 text-lg text-zinc-100">{customer.orderCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Spent</p>
                      <p className="mt-1 text-lg text-zinc-100">{customer.totalSpentLabel}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-zinc-900 pt-3 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  <span>Last activity {new Date(customer.lastActivityAt).toLocaleString()}</span>
                  <span>Top spender</span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
