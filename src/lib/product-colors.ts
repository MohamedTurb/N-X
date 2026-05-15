export const PRODUCT_COLORS = [
  "White",
  "Black",
  "Olive Green",
  "Beige",
  "Burgundy",
  "Baby Blue",
  "Teal",
  "Coffee",
  "Steel Gray",
] as const;

export type ProductColor = (typeof PRODUCT_COLORS)[number];

export const DEFAULT_PRODUCT_COLOR: ProductColor = "Black";