import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "../../components/site-footer";
import { SiteNav } from "../../components/site-nav";
import { getProducts } from "../../lib/products-api";

export default async function DropPage() {
  let products: Awaited<ReturnType<typeof getProducts>> = [];

  try {
    products = await getProducts(true);
  } catch (error) {
    console.error("Failed to fetch drop products:", error);
  }

  const featuredProducts = products.slice(0, 6);

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-display text-4xl tracking-[0.08em] sm:text-6xl">ORIGIN DROP 01</h1>
          <p className="font-body text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs sm:tracking-[0.35em]">Limited Unit Pieces</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <article key={product.slug} className="group relative overflow-hidden border border-zinc-800 bg-night">
              <Link href={`/shop/${product.slug}`} className="block">
                <div className="relative h-64 overflow-hidden bg-zinc-950 sm:h-72">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>
              <div className="space-y-3 p-5">
                <h2 className="font-display text-2xl leading-none tracking-[0.06em]">{product.name}</h2>
                <div className="flex items-center justify-between text-sm text-zinc-300">
                  <span>{product.priceLabel}</span>
                  <span className="rounded-full border border-accent/60 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-accent sm:text-xs sm:tracking-[0.16em]">
                    {product.stockLeft} left
                  </span>
                </div>
                <Link href={`/shop/${product.slug}`} className="text-xs uppercase tracking-[0.2em] text-accent hover:text-white">
                  View Product
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
