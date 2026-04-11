import { ShopGrid } from "../../components/shop-grid";
import { SiteFooter } from "../../components/site-footer";
import { SiteNav } from "../../components/site-nav";
import { getProducts } from "../../lib/products-api";

export default async function ShopPage() {
  const shopProducts = await getProducts();

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <ShopGrid products={shopProducts} />
      </section>
      <SiteFooter />
    </main>
  );
}
