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
  newProduct: ProductFormState;
  newProductImageKey: number;
  isCreatingProduct: boolean;
  editingProductId: number | null;
  editingProduct: ProductFormState;
  editingProductImageKey: number;
  savingProductId: number | null;
  deletingProductId: number | null;
  onQueryChange: (value: string) => void;
  onCreateProduct: () => void;
  onNewProductChange: (next: ProductFormState) => void;
  onNewImageSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onEditProductChange: (next: ProductFormState) => void;
  onEditImageSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onStartEditing: (product: Product) => void;
  onSaveProduct: (productId: number) => void;
  onDeleteProduct: (product: Product) => void;
  onCancelEdit: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export function AdminProductsSection({
  products,
  query,
  pagination,
  isLoadingProducts,
  newProduct,
  newProductImageKey,
  isCreatingProduct,
  editingProductId,
  editingProduct,
  editingProductImageKey,
  savingProductId,
  deletingProductId,
  onQueryChange,
  onCreateProduct,
  onNewProductChange,
  onNewImageSelect,
  onEditProductChange,
  onEditImageSelect,
  onStartEditing,
  onSaveProduct,
  onDeleteProduct,
  onCancelEdit,
  onPreviousPage,
  onNextPage,
}: Props) {
  return (
    <aside>
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-3xl tracking-[0.06em] sm:text-4xl">Catalog</h2>
        <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 sm:text-xs">GET /products</span>
      </div>

      <div className="mt-5 border border-zinc-800 bg-night p-4">
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
        <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          Showing {products.length} / {pagination.total}
        </p>
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
          products.map((product) => (
            <article key={product.id} className="border border-zinc-800 bg-night p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-2xl tracking-[0.05em]">{product.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-400">{product.category}</p>
                </div>
                <span className={`text-xs uppercase tracking-[0.16em] ${product.stockLeft <= 5 ? "text-accent" : "text-zinc-400"}`}>
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
          ))
        )}
      </div>
    </aside>
  );
}