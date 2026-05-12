import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "../../../components/product-actions";
import { SiteFooter } from "../../../components/site-footer";
import { SiteNav } from "../../../components/site-nav";
import { getProductBySlug } from "../../../lib/products-api";
import { getProductSizing } from "../../../lib/product-sizing";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug, true);

  if (!product) {
    notFound();
  }

  const sizing = getProductSizing(product.categoryKey);

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:gap-10 sm:px-6 md:grid-cols-2 md:py-20">
        <div className="relative h-[40vh] overflow-hidden border border-zinc-800 bg-zinc-950 sm:h-[50vh] md:h-[60vh] lg:h-[75vh]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="font-body text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs sm:tracking-[0.35em]">{product.category}</p>
          <h1 className="mt-4 font-display text-4xl leading-none tracking-[0.06em] sm:text-6xl">
            {product.name}
          </h1>
          <p className="mt-6 max-w-xl font-body text-sm leading-relaxed tracking-[0.09em] text-zinc-300">
            {product.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <p className="font-display text-3xl tracking-[0.06em]">{product.priceLabel}</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-400 sm:text-xs sm:tracking-[0.2em]">{product.stockLeft} left</p>
          </div>

          <ProductActions product={product} />

          <section id="size-chart" className="mt-10 rounded-md border border-zinc-800 bg-zinc-950/60 p-4 sm:p-5">
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs sm:tracking-[0.28em]">
              {sizing.label}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-zinc-500 sm:text-xs sm:tracking-[0.2em]">
              {sizing.helperText}
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:text-xs sm:tracking-[0.2em]">
                    <th className="py-3 pr-4">Size</th>
                    <th className="py-3 pr-4">{sizing.firstColumnLabel} (cm)</th>
                    <th className="py-3 pr-4">{sizing.secondColumnLabel} (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {sizing.rows.map((item) => (
                    <tr key={item.size} className="border-b border-zinc-900 text-xs text-zinc-200 sm:text-sm">
                      <td className="py-3 pr-4 font-display text-lg tracking-[0.06em] text-white">{item.size}</td>
                      <td className="py-3 pr-4">{item.firstValue}</td>
                      <td className="py-3 pr-4">{item.secondValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <Link href="/shop" className="mt-8 text-xs uppercase tracking-[0.22em] text-zinc-400 hover:text-white">
            Back To Shop
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
