import { requestJson } from "./api";

export type BackendProduct = {
  id: number;
  name: string;
  description: string;
  price: number | string;
  stock: number;
  category: string;
  imageUrl: string;
  imagePublicId?: string | null;
  imageVariants?: Array<{ width: number; url: string }>;
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
  imagePublicId?: string | null;
  imageVariants?: Array<{ width: number; url: string }>;
};

let productCache: Product[] | null = null;
let productCachePromise: Promise<Product[]> | null = null;

type ProductsResponse = Product[] | { data: BackendProduct[]; pagination?: { page: number; limit: number; total: number; totalPages: number } };

export type ProductsPage = {
  items: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type GetProductsPageOptions = {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
};

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
    imagePublicId: product.imagePublicId,
    imageVariants: product.imageVariants,
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

  productCachePromise = requestJson<ProductsResponse>("/products").then((payload) => {
    const items = Array.isArray(payload) ? payload : payload.data;
    productCache = items.map(mapProduct);
    return productCache;
  });

  return productCachePromise.finally(() => {
    productCachePromise = null;
  });
}

export async function getProductsPage(options: GetProductsPageOptions = {}) {
  const searchParams = new URLSearchParams();

  if (options.search) {
    searchParams.set("search", options.search);
  }

  if (options.category) {
    searchParams.set("category", options.category);
  }

  if (options.page) {
    searchParams.set("page", String(options.page));
  }

  if (options.limit) {
    searchParams.set("limit", String(options.limit));
  }

  const query = searchParams.toString();
  const payload = await requestJson<ProductsResponse>(query ? `/products?${query}` : "/products");

  if (Array.isArray(payload)) {
    const items = payload.map(mapProduct);

    return {
      items,
      pagination: {
        page: 1,
        limit: items.length || options.limit || 12,
        total: items.length,
        totalPages: 1,
      },
    } satisfies ProductsPage;
  }

  return {
    items: payload.data.map(mapProduct),
    pagination: payload.pagination ?? {
      page: options.page ?? 1,
      limit: options.limit ?? 12,
      total: payload.data.length,
      totalPages: 1,
    },
  } satisfies ProductsPage;
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

export async function uploadProductImage(token: string, file: File) {
  const formData = new FormData();
  formData.append("image", file);

  return requestJson<{
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    variants: Array<{ width: number; url: string }>;
  }>("/uploads/product-image", {
    method: "POST",
    token,
    body: formData,
  });
}