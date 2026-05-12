export type SizeChartRow = {
  size: string;
  firstValue: string;
  secondValue: string;
};

export type ProductSizing = {
  label: string;
  selectionLabel: string;
  firstColumnLabel: string;
  secondColumnLabel: string;
  sizes: string[];
  defaultSize: string;
  rows: SizeChartRow[];
  helperText: string;
};

const SIZE_CHARTS: Record<string, ProductSizing> = {
  "t-shirts": {
    label: "Oversized T-Shirt",
    selectionLabel: "Size",
    firstColumnLabel: "Width",
    secondColumnLabel: "Length",
    sizes: ["M", "L", "XL", "2XL"],
    defaultSize: "M",
    rows: [
      { size: "M", firstValue: "56", secondValue: "73" },
      { size: "L", firstValue: "59", secondValue: "75" },
      { size: "XL", firstValue: "62", secondValue: "78" },
      { size: "2XL", firstValue: "65", secondValue: "80" },
    ],
    helperText: "Oversized fit for premium streetwear tees.",
  },
  hoodies: {
    label: "Oversized Hoodie",
    selectionLabel: "Size",
    firstColumnLabel: "Width",
    secondColumnLabel: "Length",
    sizes: ["M", "L", "XL", "2XL"],
    defaultSize: "M",
    rows: [
      { size: "M", firstValue: "60", secondValue: "72" },
      { size: "L", firstValue: "63", secondValue: "74" },
      { size: "XL", firstValue: "66", secondValue: "76" },
      { size: "2XL", firstValue: "69", secondValue: "78" },
    ],
    helperText: "Heavyweight hoodie measurements with a relaxed fit.",
  },
  pants: {
    label: "Relaxed Pants",
    selectionLabel: "Waist",
    firstColumnLabel: "Waist",
    secondColumnLabel: "Length",
    sizes: ["30", "32", "34", "36"],
    defaultSize: "32",
    rows: [
      { size: "30", firstValue: "39", secondValue: "104" },
      { size: "32", firstValue: "41", secondValue: "106" },
      { size: "34", firstValue: "43", secondValue: "108" },
      { size: "36", firstValue: "45", secondValue: "110" },
    ],
    helperText: "Waist and length measurements for relaxed-fit pants.",
  },
  accessories: {
    label: "One Size",
    selectionLabel: "Size",
    firstColumnLabel: "Fit",
    secondColumnLabel: "Notes",
    sizes: ["One Size"],
    defaultSize: "One Size",
    rows: [{ size: "OS", firstValue: "Adjustable", secondValue: "One size" }],
    helperText: "Accessories are one-size and adjustable where needed.",
  },
};

const FALLBACK_SIZING: ProductSizing = SIZE_CHARTS["t-shirts"];

export function getProductSizing(categoryKey?: string | null) {
  if (!categoryKey) {
    return FALLBACK_SIZING;
  }

  return SIZE_CHARTS[categoryKey] ?? FALLBACK_SIZING;
}

export function getAllProductSizing() {
  return [SIZE_CHARTS["t-shirts"], SIZE_CHARTS.hoodies, SIZE_CHARTS.pants, SIZE_CHARTS.accessories];
}