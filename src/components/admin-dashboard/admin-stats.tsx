type Props = {
  revenue: number;
  pending: number;
  lowStock: number;
};

function formatCurrency(value: number) {
  return `EGP ${value.toLocaleString("en-US")}`;
}

export function AdminStats({ revenue, pending, lowStock }: Props) {
  return (
    <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
      <div className="border border-zinc-800 bg-night p-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Revenue</p>
        <p className="mt-3 font-display text-3xl tracking-[0.06em]">{formatCurrency(revenue)}</p>
      </div>
      <div className="border border-zinc-800 bg-night p-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Pending Orders</p>
        <p className="mt-3 font-display text-3xl tracking-[0.06em]">{pending}</p>
      </div>
      <div className="border border-zinc-800 bg-night p-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Low Stock Items</p>
        <p className="mt-3 font-display text-3xl tracking-[0.06em]">{lowStock}</p>
      </div>
    </div>
  );
}