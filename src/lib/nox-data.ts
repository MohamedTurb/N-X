export type Category = "All" | "Hoodies" | "Tees";

export type Product = {
  name: string;
  price: string;
  stockLeft: number;
  category: Exclude<Category, "All">;
  tone: string;
};

export const featuredProducts: Product[] = [
  {
    name: "VOID HOODIE",
    price: "EGP 6,999",
    stockLeft: 12,
    category: "Hoodies",
    tone: "from-zinc-700 via-zinc-900 to-black",
  },
  {
    name: "NØX CORE TEE",
    price: "EGP 3,199",
    stockLeft: 19,
    category: "Tees",
    tone: "from-neutral-700 via-black to-zinc-900",
  },
  {
    name: "SHADOW OVERSIZED TEE",
    price: "EGP 3,499",
    stockLeft: 9,
    category: "Tees",
    tone: "from-zinc-900 via-black to-neutral-800",
  },
  {
    name: "OBSIDIAN ZIP HOODIE",
    price: "EGP 7,599",
    stockLeft: 6,
    category: "Hoodies",
    tone: "from-neutral-600 via-zinc-900 to-black",
  },
  {
    name: "RECONSTRUCT PANEL TEE",
    price: "EGP 3,699",
    stockLeft: 14,
    category: "Tees",
    tone: "from-zinc-800 via-neutral-900 to-black",
  },
  {
    name: "NULL CODE HOODIE",
    price: "EGP 7,199",
    stockLeft: 8,
    category: "Hoodies",
    tone: "from-stone-700 via-zinc-900 to-black",
  },
];

export const lookbookFrames = [
  "ERASE THE PREVIOUS SELF",
  "REWRITE YOUR SILHOUETTE",
  "LEAVE ONLY SHADOW",
  "OWN THE DARK",
];

export const reveal = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};