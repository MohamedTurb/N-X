export default function ProductLoading() {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:gap-10 sm:px-6 md:grid-cols-2 md:py-20">
      <div className="h-[40vh] animate-pulse border border-zinc-800 bg-zinc-900 sm:h-[50vh] md:h-[60vh] lg:h-[75vh]" />
      <div className="space-y-5">
        <div className="h-4 w-28 animate-pulse bg-zinc-900" />
        <div className="h-14 w-full animate-pulse bg-zinc-900" />
        <div className="h-4 w-full animate-pulse bg-zinc-900" />
        <div className="h-4 w-5/6 animate-pulse bg-zinc-900" />
        <div className="h-10 w-40 animate-pulse bg-zinc-900" />
      </div>
    </section>
  );
}