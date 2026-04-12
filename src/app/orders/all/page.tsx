"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { SiteFooter } from "../../../components/site-footer";
import { SiteNav } from "../../../components/site-nav";
import { RequireAdmin } from "../../../components/require-admin";
import { useAuth } from "../../../components/auth-provider";
import { ApiError, getErrorMessage } from "../../../services/api";
import { orderApi, type Order } from "../../../services/order-api";
import {
  createProduct,
  deleteProduct,
  getProducts,
  type Product,
  updateProduct,
} from "../../../services/product-api";
import { useToast } from "../../../components/toast-provider";

function formatCurrency(value: number) {
  return `EGP ${value.toLocaleString("en-US")}`;
}

type OrderStatus = Order["status"];

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  imageUrl: string;
};

const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered"];
  const handleProductImageSelect = async (
    event: ChangeEvent<HTMLInputElement>,
    applyImageUrl: (imageUrl: string) => void
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file", "error");
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      applyImageUrl(dataUrl);
    } catch {
      showToast("Failed to load image file", "error");
      event.target.value = "";
    }
  };

const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  imageUrl: "",
};

type OrderFilter = "all" | OrderStatus;

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to read image file"));
    };

    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

function AdminDashboard() {
  const { token, logout, user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusDrafts, setOrderStatusDrafts] = useState<Record<number, OrderStatus>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [productQuery, setProductQuery] = useState("");
  const [newProduct, setNewProduct] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [newProductImageKey, setNewProductImageKey] = useState(0);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [editingProductImageKey, setEditingProductImageKey] = useState(0);
  const [savingProductId, setSavingProductId] = useState<number | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadAdminData = async () => {
      if (!token) {
        return;
      }

      try {
        setIsLoading(true);
        const [ordersResponse, productsResponse] = await Promise.all([
          orderApi.getAllOrders(token),
          getProducts(),
        ]);

        if (active) {
          setOrders(ordersResponse);
          setOrderStatusDrafts(
            ordersResponse.reduce<Record<number, OrderStatus>>((acc, order) => {
              acc[order.id] = order.status;
              return acc;
            }, {})
          );
          setProducts(productsResponse);
        }
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          logout();
          return;
        }

        const message = getErrorMessage(loadError);
        if (active) {
          setError(message);
        }
        showToast(message, "error");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadAdminData();

    return () => {
      active = false;
    };
  }, [logout, showToast, token]);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const pending = orders.filter((order) => order.status === "pending").length;
    const lowStock = products.filter((product) => product.stockLeft <= 5).length;

    return { revenue, pending, lowStock };
  }, [orders, products]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") {
      return orders;
    }

    return orders.filter((order) => order.status === orderFilter);
  }, [orderFilter, orders]);

  const filteredProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.categoryKey.toLowerCase().includes(query)
      );
    });
  }, [productQuery, products]);

  const handleOrderStatusDraft = (orderId: number, status: OrderStatus) => {
    setOrderStatusDrafts((current) => ({ ...current, [orderId]: status }));
  };

  const handleOrderStatusSave = async (orderId: number) => {
    if (!token) {
      return;
    }

    const nextStatus = orderStatusDrafts[orderId];
    const currentOrder = orders.find((order) => order.id === orderId);

    if (!nextStatus || !currentOrder || nextStatus === currentOrder.status) {
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      const updated = await orderApi.updateOrderStatus(token, orderId, nextStatus);
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status: updated.status } : order))
      );
      setOrderStatusDrafts((current) => ({ ...current, [orderId]: updated.status }));
      showToast(`Order #${orderId} updated to ${updated.status}`, "success");
    } catch (updateError) {
      if (updateError instanceof ApiError && updateError.status === 401) {
        logout();
        return;
      }

      showToast(getErrorMessage(updateError), "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCreateProduct = async () => {
    if (!token) {
      return;
    }

    const price = Number.parseFloat(newProduct.price);
    const stock = Number.parseInt(newProduct.stock, 10);

    if (!newProduct.name || !newProduct.description || !newProduct.category || !newProduct.imageUrl) {
      showToast("All product fields are required", "error");
      return;
    }

    if (!Number.isFinite(price) || !Number.isInteger(stock)) {
      showToast("Price and stock must be valid numbers", "error");
      return;
    }

    try {
      setIsCreatingProduct(true);
      const created = await createProduct(token, {
        name: newProduct.name,
        description: newProduct.description,
        price,
        stock,
        category: newProduct.category,
        imageUrl: newProduct.imageUrl,
      });
      setProducts((current) => [created, ...current]);
      setNewProduct(EMPTY_PRODUCT_FORM);
      setNewProductImageKey((current) => current + 1);
      showToast(`Created ${created.name}`, "success");
    } catch (createError) {
      if (createError instanceof ApiError && createError.status === 401) {
        logout();
        return;
      }

      showToast(getErrorMessage(createError), "error");
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const startEditingProduct = (product: Product) => {
    setEditingProductId(product.id);
    setEditingProduct({
      name: product.name,
      description: product.description,
      price: String(product.priceValue),
      stock: String(product.stockLeft),
      category: product.categoryKey,
      imageUrl: product.imageUrl,
    });
    setEditingProductImageKey((current) => current + 1);
  };

  const handleSaveProduct = async (productId: number) => {
    if (!token) {
      return;
    }

    const price = Number.parseFloat(editingProduct.price);
    const stock = Number.parseInt(editingProduct.stock, 10);

    if (!editingProduct.name || !editingProduct.description || !editingProduct.category || !editingProduct.imageUrl) {
      showToast("All product fields are required", "error");
      return;
    }

    if (!Number.isFinite(price) || !Number.isInteger(stock)) {
      showToast("Price and stock must be valid numbers", "error");
      return;
    }

    try {
      setSavingProductId(productId);
      const updated = await updateProduct(token, productId, {
        name: editingProduct.name,
        description: editingProduct.description,
        price,
        stock,
        category: editingProduct.category,
        imageUrl: editingProduct.imageUrl,
      });
      setProducts((current) => current.map((product) => (product.id === productId ? updated : product)));
      setEditingProductId(null);
      setEditingProductImageKey((current) => current + 1);
      showToast(`Updated ${updated.name}`, "success");
    } catch (updateError) {
      if (updateError instanceof ApiError && updateError.status === 401) {
        logout();
        return;
      }

      showToast(getErrorMessage(updateError), "error");
    } finally {
      setSavingProductId(null);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!token) {
      return;
    }

    if (!window.confirm(`Delete ${product.name}?`)) {
      return;
    }

    try {
      setDeletingProductId(product.id);
      await deleteProduct(token, product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (editingProductId === product.id) {
        setEditingProductId(null);
        setEditingProductImageKey((current) => current + 1);
      }
      showToast(`Deleted ${product.name}`, "info");
    } catch (deleteError) {
      if (deleteError instanceof ApiError && deleteError.status === 401) {
        logout();
        return;
      }

      showToast(getErrorMessage(deleteError), "error");
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-[10px] tracking-[0.35em] text-zinc-500 sm:text-xs sm:tracking-[0.5em]">ADMIN</p>
          <h1 className="mt-4 font-display text-4xl tracking-[0.08em] sm:text-6xl">ORDER CONTROL</h1>
        </div>
        <div className="text-right">
          <p className="font-body text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs sm:tracking-[0.3em]">
            {user?.username}
          </p>
          <Link href="/orders" className="mt-3 inline-block text-xs uppercase tracking-[0.22em] text-accent hover:text-white">
            My Orders
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-12 border border-zinc-800 p-6 text-center sm:p-8">
          <p className="font-body text-sm uppercase tracking-[0.2em] text-zinc-400">Loading admin dashboard...</p>
        </div>
      ) : error ? (
        <div className="mt-12 border border-zinc-800 p-6 text-center sm:p-8">
          <p className="font-body text-sm uppercase tracking-[0.2em] text-zinc-400">{error}</p>
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="border border-zinc-800 bg-night p-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Revenue</p>
              <p className="mt-3 font-display text-3xl tracking-[0.06em]">{formatCurrency(stats.revenue)}</p>
            </div>
            <div className="border border-zinc-800 bg-night p-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Pending Orders</p>
              <p className="mt-3 font-display text-3xl tracking-[0.06em]">{stats.pending}</p>
            </div>
            <div className="border border-zinc-800 bg-night p-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Low Stock Items</p>
              <p className="mt-3 font-display text-3xl tracking-[0.06em]">{stats.lowStock}</p>
            </div>
          </div>

          <div className="mt-12 grid gap-10 xl:grid-cols-[1.35fr_0.9fr]">
            <section>
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-display text-3xl tracking-[0.06em] sm:text-4xl">All Orders</h2>
                <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 sm:text-xs">GET /orders/all</span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 border border-zinc-800 bg-night p-4">
                <label htmlFor="order-filter" className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  Filter Status
                </label>
                <select
                  id="order-filter"
                  value={orderFilter}
                  onChange={(event) => setOrderFilter(event.target.value as OrderFilter)}
                  className="border border-zinc-700 bg-black px-3 py-2 text-xs uppercase tracking-[0.14em] text-zinc-100"
                >
                  <option value="all">all</option>
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 sm:ml-auto">
                  Showing {filteredOrders.length} / {orders.length}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="border border-zinc-800 p-6 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                      {orders.length === 0 ? "No orders found." : "No orders match this filter."}
                    </p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <article key={order.id} className="border border-zinc-800 bg-night p-5 sm:p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-display text-2xl tracking-[0.05em]">Order #{order.id}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-400">User #{order.userId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-zinc-300">{order.totalPriceLabel}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 border-t border-zinc-900 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <label htmlFor={`status-${order.id}`} className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                            Status
                          </label>
                          <select
                            id={`status-${order.id}`}
                            value={orderStatusDrafts[order.id] ?? order.status}
                            onChange={(event) => handleOrderStatusDraft(order.id, event.target.value as OrderStatus)}
                            className="border border-zinc-700 bg-black px-3 py-2 text-xs uppercase tracking-[0.14em] text-zinc-100"
                          >
                            {ORDER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleOrderStatusSave(order.id)}
                          disabled={
                            updatingOrderId === order.id ||
                            (orderStatusDrafts[order.id] ?? order.status) === order.status
                          }
                          className="border border-white px-4 py-2 text-[10px] uppercase tracking-[0.18em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {updatingOrderId === order.id ? "Updating..." : "Update Status"}
                        </button>
                      </div>

                      <div className="mt-5 space-y-3 text-sm">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-4 border-t border-zinc-900 pt-3">
                            <span className="max-w-[70%] truncate text-zinc-300">
                              {item.productName} x {item.quantity}
                            </span>
                            <span>{item.priceLabel}</span>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

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
                  value={productQuery}
                  onChange={(event) => setProductQuery(event.target.value)}
                  placeholder="Search by name or category"
                  className="mt-2 w-full border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                />
                <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  Showing {filteredProducts.length} / {products.length}
                </p>
              </div>

              <div className="mt-5 border border-zinc-800 bg-night p-5">
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Create Product</p>
                <div className="mt-4 grid gap-3">
                  <input
                    value={newProduct.name}
                    onChange={(event) => setNewProduct((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Name"
                    className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                  />
                  <textarea
                    value={newProduct.description}
                    onChange={(event) => setNewProduct((current) => ({ ...current, description: event.target.value }))}
                    placeholder="Description"
                    rows={3}
                    className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={newProduct.price}
                      onChange={(event) => setNewProduct((current) => ({ ...current, price: event.target.value }))}
                      placeholder="Price"
                      className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                    />
                    <input
                      value={newProduct.stock}
                      onChange={(event) => setNewProduct((current) => ({ ...current, stock: event.target.value }))}
                      placeholder="Stock"
                      className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                    />
                  </div>
                  <input
                    value={newProduct.category}
                    onChange={(event) => setNewProduct((current) => ({ ...current, category: event.target.value }))}
                    placeholder="Category key (e.g. tops)"
                    className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                  />
                  <div className="grid gap-2 rounded border border-zinc-800 bg-black/30 p-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Choose Image From Device</label>
                    <input
                      key={newProductImageKey}
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        void handleProductImageSelect(event, (imageUrl) =>
                          setNewProduct((current) => ({ ...current, imageUrl }))
                        )
                      }
                      className="text-sm text-zinc-300 file:mr-4 file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
                    />
                    <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                      The selected image will be saved with the product.
                    </p>
                  </div>
                  <input
                    value={newProduct.imageUrl}
                    onChange={(event) => setNewProduct((current) => ({ ...current, imageUrl: event.target.value }))}
                    placeholder="Or paste image URL"
                    className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={() => void handleCreateProduct()}
                    disabled={isCreatingProduct}
                    className="mt-1 border border-accent bg-accent px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCreatingProduct ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {filteredProducts.length === 0 ? (
                  <div className="border border-zinc-800 p-6 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                      {products.length === 0 ? "No products found." : "No products match this search."}
                    </p>
                  </div>
                ) : (
                filteredProducts.map((product) => (
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
                        onClick={() => startEditingProduct(product)}
                        className="border border-zinc-600 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-zinc-200 transition hover:border-white hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteProduct(product)}
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
                          onChange={(event) => setEditingProduct((current) => ({ ...current, name: event.target.value }))}
                          placeholder="Name"
                          className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                        />
                        <textarea
                          value={editingProduct.description}
                          onChange={(event) =>
                            setEditingProduct((current) => ({ ...current, description: event.target.value }))
                          }
                          placeholder="Description"
                          rows={3}
                          className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            value={editingProduct.price}
                            onChange={(event) => setEditingProduct((current) => ({ ...current, price: event.target.value }))}
                            placeholder="Price"
                            className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                          />
                          <input
                            value={editingProduct.stock}
                            onChange={(event) => setEditingProduct((current) => ({ ...current, stock: event.target.value }))}
                            placeholder="Stock"
                            className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                          />
                        </div>
                        <input
                          value={editingProduct.category}
                          onChange={(event) => setEditingProduct((current) => ({ ...current, category: event.target.value }))}
                          placeholder="Category key"
                          className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                        />
                        <div className="grid gap-2 rounded border border-zinc-800 bg-black/30 p-3">
                          <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Choose Image From Device</label>
                          <input
                            key={editingProductImageKey}
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              void handleProductImageSelect(event, (imageUrl) =>
                                setEditingProduct((current) => ({ ...current, imageUrl }))
                              )
                            }
                            className="text-sm text-zinc-300 file:mr-4 file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
                          />
                          <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                            The selected image will replace the current product image.
                          </p>
                        </div>
                        <input
                          value={editingProduct.imageUrl}
                          onChange={(event) => setEditingProduct((current) => ({ ...current, imageUrl: event.target.value }))}
                          placeholder="Or paste image URL"
                          className="border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                        />

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => void handleSaveProduct(product.id)}
                            disabled={savingProductId === product.id}
                            className="border border-white px-4 py-2 text-[10px] uppercase tracking-[0.18em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {savingProductId === product.id ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProductId(null);
                              setEditingProductImageKey((current) => current + 1);
                            }}
                            className="border border-zinc-700 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition hover:border-zinc-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                ))) }
              </div>
            </aside>
          </div>
        </>
      )}
    </section>
  );
}

export default function OrdersAllPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <RequireAdmin>
        <AdminDashboard />
      </RequireAdmin>
      <SiteFooter />
    </main>
  );
}