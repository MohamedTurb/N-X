export default function ShopLoading() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="border border-zinc-800 bg-night p-5">
          <div className="h-64 animate-pulse bg-zinc-900 sm:h-72" />
          <div className="mt-5 space-y-3">
            <div className="h-7 w-3/4 animate-pulse bg-zinc-900" />
            <div className="h-4 w-full animate-pulse bg-zinc-900" />
            <div className="h-4 w-1/3 animate-pulse bg-zinc-900" />
          </div>
        </div>
      ))}
    </div>
  );
}