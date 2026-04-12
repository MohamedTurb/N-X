import { requestJson } from "./api";

export type BackendProduct = {
  id: number;
  name: string;
  description: string;
  price: number | string;
  stock: number;
  category: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  priceValue: number;
  priceLabel: string;
  stockLeft: number;
  category: string;
  categoryKey: string;
  imageUrl: string;
};

let productCache: Product[] | null = null;
let productCachePromise: Promise<Product[]> | null = null;

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatCurrency(value: number) {
  return `EGP ${value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function titleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function mapProduct(product: BackendProduct): Product {
  const priceValue = typeof product.price === "number" ? product.price : Number.parseFloat(product.price);

  return {
    id: product.id,
    slug: toSlug(product.name),
    name: product.name,
    description: product.description,
    priceValue,
    priceLabel: formatCurrency(priceValue),
    stockLeft: product.stock,
    categoryKey: product.category,
    category: titleCase(product.category),
    imageUrl: product.imageUrl,
  };
}

export function clearProductCache() {
  productCache = null;
  productCachePromise = null;
}

export async function getProducts(forceRefresh = false) {
  if (productCache && !forceRefresh) {
    return productCache;
  }

  if (productCachePromise && !forceRefresh) {
    return productCachePromise;
  }

  productCachePromise = requestJson<BackendProduct[]>("/products").then((items) => {
    productCache = items.map(mapProduct);
    return productCache;
  });

  return productCachePromise.finally(() => {
    productCachePromise = null;
  });
}

export async function getProductById(id: number, forceRefresh = false) {
  const products = await getProducts(forceRefresh);
  const cached = products.find((product) => product.id === id);

  if (cached) {
    return cached;
  }

  const product = await requestJson<BackendProduct>(`/products/${id}`);
  return mapProduct(product);
}

export async function getProductBySlug(slug: string, forceRefresh = false) {
  const products = await getProducts(forceRefresh);
  const match = products.find((product) => product.slug === slug);

  if (!match) {
    return null;
  }

  return getProductById(match.id, forceRefresh);
}

export async function createProduct(token: string, payload: Omit<BackendProduct, "id">) {
  const product = await requestJson<BackendProduct>("/products", {
    method: "POST",
    token,
    body: payload,
  });

  clearProductCache();
  return mapProduct(product);
}

export async function updateProduct(token: string, id: number, payload: Partial<BackendProduct>) {
  const product = await requestJson<BackendProduct>(`/products/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });

  clearProductCache();
  return mapProduct(product);
}

export async function deleteProduct(token: string, id: number) {
  const response = await requestJson<{ message: string }>(`/products/${id}`, {
    method: "DELETE",
    token,
  });

  clearProductCache();
  return response;
}