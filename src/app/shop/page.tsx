import { ShopGrid } from "../../components/shop-grid";
import { SiteFooter } from "../../components/site-footer";
import { SiteNav } from "../../components/site-nav";
import { getProducts, type Product } from "../../lib/products-api";

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
      
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <ShopGrid products={shopProducts} />
      </section>
      <SiteFooter />
    </main>
  );
}
