export const PRODUCT_COLORS = [
  "White",
  "Black",
  "Rose",
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

export const PRODUCT_COLOR_SWATCHES: Record<ProductColor, string> = {
  White: "#f5f5f5",
  Black: "#111111",
  Rose: "#d16f8b",
  "Olive Green": "#646b3a",
  Beige: "#d8c4a8",
  Burgundy: "#6b1f35",
  "Baby Blue": "#88bde6",
  Teal: "#0f766e",
  Coffee: "#5b3a29",
  "Steel Gray": "#71717a",
};