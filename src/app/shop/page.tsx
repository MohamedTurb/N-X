import { ShopGrid } from "../../components/shop-grid";
import { SiteFooter } from "../../components/site-footer";
import { SiteNav } from "../../components/site-nav";
import { getProducts, type Product } from "../../lib/products-api";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  let shopProducts: Product[] = [];
  try {
    shopProducts = await getProducts(true);
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />

      <section className="relative mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="pointer-events-none absolute inset-x-6 top-6 -z-0 h-40 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10">
          <ShopGrid products={shopProducts} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
