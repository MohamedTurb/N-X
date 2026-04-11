export type Category = "All" | "Hoodies" | "Tees";

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  priceValue: number;
  priceLabel: string;
  stockLeft: number;
  category: Exclude<Category, "All">;
  imageUrl: string;
};

const products: Product[] = [
  {
    id: 101,
    slug: "own-the-dark-signature-tee",
    name: "OWN THE DARK SIGNATURE TEE",
    description: "Heavy cotton silhouette with a stark front mark and washed noir finish.",
    priceValue: 750,
    priceLabel: "EGP 750",
    stockLeft: 9,
    category: "Tees",
    imageUrl: "/products/nox-signature-tee.png",
  },
  {
    id: 102,
    slug: "tofan-nox-tee",
    name: "NØX: TOFAN (The Storm)",
    description: "Clean graphic cut with a softer drape and a low-sheen streetwear finish.",
    priceValue: 700,
    priceLabel: "EGP 700",
    stockLeft: 7,
    category: "Tees",
    imageUrl: "/products/tofan-nox.png",
  },
  {
    id: 103,
    slug: "backlink-shadow-tee",
    name: "NØX: SUKOON Tranquility (Essential Tee)",
    description: "Back graphic tee tuned for a sharper silhouette and heavy contrast print.",
    priceValue: 750,
    priceLabel: "EGP 750 ",
    stockLeft: 5,
    category: "Tees",
    imageUrl: "/products/backlink-shadow.jpg",
  },
  {
    id: 201,
    slug: "void-frame-hoodie",
    name: "NØX: SLIM SHADY Retro Legend Tee",
    description: "Oversized fleece hoodie with a rigid hood and deep tonal layering.",
    priceValue: 600,
    priceLabel: "EGP 600",
    stockLeft: 6,
    category: "Tees",
    imageUrl: "/products/void-frame-hoodie.png",
  },
  {
    id: 202,
    slug: "void-frame-hoodie-alt",
    name: "NØX: PABLO (CONTROL) Vintage Edition",
    description: "Alternate treatment of the same silhouette with a colder, cleaner finish.",
    priceValue: 700,
    priceLabel: "EGP 700",
    stockLeft: 4,
    category: "Tees",
    imageUrl: "/products/void-frame-hoodie-alt.png",
  },
];

export async function getProducts(): Promise<Product[]> {
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
