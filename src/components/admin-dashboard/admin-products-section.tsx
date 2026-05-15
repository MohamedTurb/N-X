import type { ChangeEvent } from "react";
import type { Product } from "../../services/product-api";

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  imageUrl: string;
  imagePublicId: string;
  featured: boolean;
  variantsText: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type Props = {
  products: Product[];
  query: string;
  pagination: Pagination;
  isLoadingProducts: boolean;
  sortBy: "createdAt" | "price" | "stock" | "name";
  sortDirection: "asc" | "desc";
  stockFilter: "all" | "low" | "out" | "reorder" | "featured";
  selectedProductIds: number[];
  newProduct: ProductFormState;
  newProductImageKey: number;
  isCreatingProduct: boolean;
  isBulkDeleting: boolean;
  editingProductId: number | null;
  editingProduct: ProductFormState;
  editingProductImageKey: number;
  savingProductId: number | null;
  deletingProductId: number | null;
  onQueryChange: (value: string) => void;
  onSortChange: (sortBy: "createdAt" | "price" | "stock" | "name") => void;
  onSortDirectionChange: () => void;
  onStockFilterChange: (filter: "all" | "low" | "out" | "reorder" | "featured") => void;
  onCreateProduct: () => void;
  onNewProductChange: (next: ProductFormState) => void;
  onNewImageSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onEditProductChange: (next: ProductFormState) => void;
  onEditImageSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onStartEditing: (product: Product) => void;
  onSaveProduct: (productId: number) => void;
  onDeleteProduct: (product: Product) => void;
  onToggleProductSelection: (productId: number) => void;
  onToggleAllProducts: (checked: boolean) => void;
  onBulkDelete: () => void;
  onCancelEdit: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export function AdminProductsSection({
  products,
  query,
  pagination,
  isLoadingProducts,
  sortBy,
  sortDirection,
  selectedProductIds,
  newProduct,
  newProductImageKey,
  isCreatingProduct,
  isBulkDeleting,
  editingProductId,
  editingProduct,
  editingProductImageKey,
  savingProductId,
  deletingProductId,
  onQueryChange,
  onSortChange,
  onSortDirectionChange,
  onStockFilterChange,
  onCreateProduct,
  onNewProductChange,
  onNewImageSelect,
  onEditProductChange,
  onEditImageSelect,
  onStartEditing,
  onSaveProduct,
  onDeleteProduct,
  onToggleProductSelection,
  onToggleAllProducts,
  onBulkDelete,
  onCancelEdit,
  onPreviousPage,
  onNextPage,
}: Props) {
  const getStockTag = (stockLeft: number) => {
    if (stockLeft <= 0) {
      return { label: "Out of stock", tone: "text-red-300 border-red-500/40" };
    }

    if (stockLeft <= 5) {
      return { label: "Reorder needed", tone: "text-amber-300 border-amber-500/40" };
    }

    if (stockLeft <= 10) {
      return { label: "Low stock", tone: "text-orange-300 border-orange-500/40" };
    }

    return { label: "In stock", tone: "text-emerald-300 border-emerald-500/40" };
  };

  return (
    <aside>
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-3xl tracking-[0.06em] sm:text-4xl">Catalog</h2>
        <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 sm:text-xs">GET /products</span>
      </div>

      <div className="mt-5 border border-zinc-800 bg-night p-4">
        <div className="grid gap-3">
          <div>
            <label htmlFor="product-search" className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Quick Search
            </label>
            <input
              id="product-search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search by name or category"
              className="mt-2 w-full border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as "createdAt" | "price" | "stock" | "name")}
              className="border border-zinc-700 bg-black px-3 py-2 text-sm uppercase tracking-[0.12em] text-zinc-100"
            >
              <option value="createdAt">Newest</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
            </select>
            <button
              type="button"
              onClick={onSortDirectionChange}
              className="border border-zinc-700 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-200 transition hover:border-white hover:text-white"
            >
              {sortDirection === "asc" ? "Ascending" : "Descending"}
            </button>
            <button
              type="button"
              onClick={onBulkDelete}
              disabled={selectedProductIds.length === 0 || isBulkDeleting}
              className="border border-accent px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-accent transition hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isBulkDeleting ? "Deleting..." : `Delete Selected (${selectedProductIds.length})`}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "out", "reorder", "low", "featured"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => onStockFilterChange(filter)}
                className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] transition ${
                  stockFilter === filter
                    ? "border-white bg-white text-black"
                    : "border-zinc-700 text-zinc-300 hover:border-white hover:text-white"
                }`}
              >
                {filter === "all" ? "All" : filter.replace(/\b\w/g, (char) => char.toUpperCase())}
              </button>
            ))}
          </div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Showing {products.length} / {pagination.total}
          </p>
        </div>
      </div>

      <div className="mt-5 border border-zinc-800 bg-night p-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Create Product</p>
        <div className="mt-4 grid gap-3">
          <input
            value={newProduct.name}
            onChange={(event) => onNewProductChange({ ...newProduct, name: event.target.value })}
            placeholder="Name"
            className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
          />
          <textarea
            value={newProduct.description}
            onChange={(event) => onNewProductChange({ ...newProduct, description: event.target.value })}
            placeholder="Description"
            rows={3}
            className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={newProduct.price}
              onChange={(event) => onNewProductChange({ ...newProduct, price: event.target.value })}
              placeholder="Price"
              className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
            />
            <input
              value={newProduct.stock}
              onChange={(event) => onNewProductChange({ ...newProduct, stock: event.target.value })}
              placeholder="Stock"
              className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <input
            value={newProduct.category}
            onChange={(event) => onNewProductChange({ ...newProduct, category: event.target.value })}
            placeholder="Category key (e.g. tops)"
            className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
          />
          <div className="grid gap-2 rounded border border-zinc-800 bg-black/30 p-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Variants JSON</label>
            <textarea
              value={newProduct.variantsText}
              onChange={(event) => onNewProductChange({ ...newProduct, variantsText: event.target.value })}
              placeholder='[{"sku":"TSH-001","color":"Black","size":"M","stock":12}]'
              rows={4}
              className="border border-zinc-700 bg-black px-3 py-2 font-mono text-xs text-zinc-100 placeholder:text-zinc-500"
            />
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Optional structured variants for colors, sizes, SKU, and stock per variant.
            </p>
          </div>
          <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
            <input
              type="checkbox"
              checked={newProduct.featured}
              onChange={(event) => onNewProductChange({ ...newProduct, featured: event.target.checked })}
            />
            Featured product
          </label>
          <div className="grid gap-2 rounded border border-zinc-800 bg-black/30 p-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Choose Image From Device</label>
            <input
              key={newProductImageKey}
              type="file"
              accept="image/*"
              onChange={onNewImageSelect}
              className="text-sm text-zinc-300 file:mr-4 file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
            />
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">The selected image will be saved with the product.</p>
          </div>
          <input
            value={newProduct.imageUrl}
            onChange={(event) => onNewProductChange({ ...newProduct, imageUrl: event.target.value })}
            placeholder="Or paste image URL"
            className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
          />
          <button
            type="button"
            onClick={onCreateProduct}
            disabled={isCreatingProduct}
            className="mt-1 border border-accent bg-accent px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreatingProduct ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border border-zinc-800 bg-night px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
        <button
          type="button"
          onClick={onPreviousPage}
          disabled={pagination.page <= 1 || isLoadingProducts}
          className="transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span>
          Page {pagination.page} / {pagination.totalPages}
        </span>
        <button
          type="button"
          onClick={onNextPage}
          disabled={pagination.page >= pagination.totalPages || isLoadingProducts}
          className="transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {isLoadingProducts ? (
          <div className="border border-zinc-800 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="border border-zinc-800 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">No products match this search.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border border-zinc-800 bg-night px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedProductIds.length > 0 && selectedProductIds.length === products.length}
                  onChange={(event) => onToggleAllProducts(event.target.checked)}
                />
                Select page
              </label>
              <span>{selectedProductIds.length} selected</span>
            </div>
            {products.map((product) => (
            <article key={product.id} className="border border-zinc-800 bg-night p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(product.id)}
                    onChange={() => onToggleProductSelection(product.id)}
                    className="mt-1"
                  />
                  <div>
                  <p className="font-display text-2xl tracking-[0.05em]">{product.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-400">{product.category}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em]">
                    <span className={`border px-2 py-1 ${getStockTag(product.stockLeft).tone}`}>{getStockTag(product.stockLeft).label}</span>
                    {product.featured ? <span className="border border-fuchsia-500/40 px-2 py-1 text-fuchsia-300">Featured</span> : null}
                    {product.variants?.length ? (
                      <span className="border border-zinc-700 px-2 py-1 text-zinc-300">{product.variants.length} variants</span>
                    ) : null}
                  </div>
                </div>
                </div>
                <span className={`text-xs uppercase tracking-[0.16em] ${product.stockLeft <= 0 ? "text-red-300" : product.stockLeft <= 5 ? "text-accent" : "text-zinc-400"}`}>
                  Stock {product.stockLeft}
                </span>
              </div>
              <p className="mt-3 text-sm text-zinc-300">{product.priceLabel}</p>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onStartEditing(product)}
                  className="border border-zinc-600 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-zinc-200 transition hover:border-white hover:text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteProduct(product)}
                  disabled={deletingProductId === product.id}
                  className="border border-zinc-700 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-zinc-400 transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {deletingProductId === product.id ? "Deleting..." : "Delete"}
                </button>
              </div>

              {editingProductId === product.id ? (
                <div className="mt-4 grid gap-3 border-t border-zinc-900 pt-4">
                  <input
                    value={editingProduct.name}
                    onChange={(event) => onEditProductChange({ ...editingProduct, name: event.target.value })}
                    placeholder="Name"
                    className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                  />
                  <textarea
                    value={editingProduct.description}
                    onChange={(event) => onEditProductChange({ ...editingProduct, description: event.target.value })}
                    placeholder="Description"
                    rows={3}
                    className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={editingProduct.price}
                      onChange={(event) => onEditProductChange({ ...editingProduct, price: event.target.value })}
                      placeholder="Price"
                      className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                    />
                    <input
                      value={editingProduct.stock}
                      onChange={(event) => onEditProductChange({ ...editingProduct, stock: event.target.value })}
                      placeholder="Stock"
                      className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                    />
                  </div>
                  <input
                    value={editingProduct.category}
                    onChange={(event) => onEditProductChange({ ...editingProduct, category: event.target.value })}
                    placeholder="Category key"
                    className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                  />
                  <div className="grid gap-2 rounded border border-zinc-800 bg-black/30 p-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Variants JSON</label>
                    <textarea
                      value={editingProduct.variantsText}
                      onChange={(event) => onEditProductChange({ ...editingProduct, variantsText: event.target.value })}
                      rows={4}
                      className="border border-zinc-700 bg-black px-3 py-2 font-mono text-xs text-zinc-100 placeholder:text-zinc-500"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                    <input
                      type="checkbox"
                      checked={editingProduct.featured}
                      onChange={(event) => onEditProductChange({ ...editingProduct, featured: event.target.checked })}
                    />
                    Featured product
                  </label>
                  <div className="grid gap-2 rounded border border-zinc-800 bg-black/30 p-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Choose Image From Device</label>
                    <input
                      key={editingProductImageKey}
                      type="file"
                      accept="image/*"
                      onChange={onEditImageSelect}
                      className="text-sm text-zinc-300 file:mr-4 file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
                    />
                    <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                      The selected image will replace the current product image.
                    </p>
                  </div>
                  <input
                    value={editingProduct.imageUrl}
                    onChange={(event) => onEditProductChange({ ...editingProduct, imageUrl: event.target.value })}
                    placeholder="Or paste image URL"
                    className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                  />

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onSaveProduct(product.id)}
                      disabled={savingProductId === product.id}
                      className="border border-white px-4 py-2 text-[10px] uppercase tracking-[0.18em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {savingProductId === product.id ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="border border-zinc-700 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition hover:border-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
          </>
        )}
      </div>
    </aside>
  );
}