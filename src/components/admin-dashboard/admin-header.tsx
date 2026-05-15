type Props = {
  username?: string;
};

export function AdminHeader({ username }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-display text-[10px] tracking-[0.35em] text-zinc-500 sm:text-xs sm:tracking-[0.5em]">ADMIN</p>
        <h1 className="mt-4 font-display text-4xl tracking-[0.08em] sm:text-6xl">ORDER CONTROL</h1>
      </div>
      <div className="text-right flex flex-col items-end gap-2">
        <p className="font-body text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs sm:tracking-[0.3em]">{username}</p>
        <a
          href="/orders/all/products/new"
          className="inline-flex items-center justify-center rounded border border-accent px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-accent hover:bg-accent hover:text-black"
        >
          Add Product
        </a>
      </div>
    </div>
  );
}