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
  getProductsPage,
  uploadProductImage,
  type Product,
  updateProduct,
} from "../../../services/product-api";
import { useToast } from "../../../components/toast-provider";
import { AdminHeader, AdminOrdersSection, AdminProductsSection, AdminStats } from "../../../components/admin-dashboard";

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
  imagePublicId: string;
};

const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered"];

const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  imageUrl: "",
  imagePublicId: "",
};

type OrderFilter = "all" | OrderStatus;

function AdminDashboard() {
  const { token, logout, user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusDrafts, setOrderStatusDrafts] = useState<Record<number, OrderStatus>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productPagination, setProductPagination] = useState({ page: 1, limit: 6, total: 0, totalPages: 1 });
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [productQuery, setProductQuery] = useState("");
  const [debouncedProductQuery, setDebouncedProductQuery] = useState("");
  const [newProduct, setNewProduct] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [newProductImageKey, setNewProductImageKey] = useState(0);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [editingProductImageKey, setEditingProductImageKey] = useState(0);
  const [savingProductId, setSavingProductId] = useState<number | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
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
        const [ordersResponse, productsResponse] = await Promise.all([orderApi.getAllOrders(token), getProducts()]);

        if (active) {
          setOrders(ordersResponse);
          setOrderStatusDrafts(
            ordersResponse.reduce<Record<number, OrderStatus>>((acc, order) => {
              acc[order.id] = order.status;
              return acc;
            }, {})
          );
          setAllProducts(productsResponse);
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

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedProductQuery(productQuery.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [productQuery]);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      if (!token) {
        return;
      }

      try {
        setIsLoadingProducts(true);
        const response = await getProductsPage({
          search: debouncedProductQuery || undefined,
          page: productPagination.page,
          limit: productPagination.limit,
        });

        if (active) {
          setProducts(response.items);
          setProductPagination(response.pagination);
        }
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          logout();
          return;
        }

        showToast(getErrorMessage(loadError), "error");
      } finally {
        if (active) {
          setIsLoadingProducts(false);
        }
      }
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, [debouncedProductQuery, logout, productPagination.limit, productPagination.page, showToast, token]);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const pending = orders.filter((order) => order.status === "pending").length;
    const lowStock = allProducts.filter((product) => product.stockLeft <= 5).length;

    return { revenue, pending, lowStock };
  }, [allProducts, orders]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") {
      return orders;
    }

    return orders.filter((order) => order.status === orderFilter);
  }, [orderFilter, orders]);

  const handleProductImageSelect = async (
    event: ChangeEvent<HTMLInputElement>,
    applyImage: (imageUrl: string, imagePublicId: string) => void
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

    if (!token) {
      showToast("Please sign in again to upload images", "error");
      event.target.value = "";
      return;
    }

    try {
      const upload = await uploadProductImage(token, file);
      applyImage(upload.url, upload.publicId);
      showToast("Image uploaded", "success");
    } catch {
      showToast("Failed to upload image", "error");
      event.target.value = "";
    }
  };

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
        imagePublicId: newProduct.imagePublicId,
      });
      setAllProducts((current) => [created, ...current]);
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
      imagePublicId: product.imagePublicId ?? "",
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
        imagePublicId: editingProduct.imagePublicId,
      });
      setAllProducts((current) => current.map((product) => (product.id === productId ? updated : product)));
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
      setAllProducts((current) => current.filter((item) => item.id !== product.id));
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

  const handlePreviousProductPage = () => {
    setProductPagination((current) => ({ ...current, page: Math.max(1, current.page - 1) }));
  };

  const handleNextProductPage = () => {
    setProductPagination((current) => ({ ...current, page: Math.min(current.totalPages, current.page + 1) }));
  };

  const handleQueryChange = (value: string) => {
    setProductPagination((current) => ({ ...current, page: 1, totalPages: current.totalPages }));
    setProductQuery(value);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
      <AdminHeader username={user?.username} />

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
          <AdminStats revenue={stats.revenue} pending={stats.pending} lowStock={stats.lowStock} />

          <div className="mt-12 grid gap-8 md:grid-cols-[1fr_350px] xl:grid-cols-[1.35fr_0.9fr] md:gap-10">
            <AdminOrdersSection
              orders={orders.filter((order) => orderFilter === "all" || order.status === orderFilter)}
              orderFilter={orderFilter}
              orderStatusDrafts={orderStatusDrafts}
              updatingOrderId={updatingOrderId}
              filteredOrderCount={orders.filter((order) => orderFilter === "all" || order.status === orderFilter).length}
              onFilterChange={setOrderFilter}
              onStatusDraftChange={handleOrderStatusDraft}
              onStatusSave={handleOrderStatusSave}
            />

            <AdminProductsSection
              products={products}
              query={productQuery}
              pagination={productPagination}
              isLoadingProducts={isLoadingProducts}
              newProduct={newProduct}
              newProductImageKey={newProductImageKey}
              isCreatingProduct={isCreatingProduct}
              editingProductId={editingProductId}
              editingProduct={editingProduct}
              editingProductImageKey={editingProductImageKey}
              savingProductId={savingProductId}
              deletingProductId={deletingProductId}
              onQueryChange={handleQueryChange}
              onCreateProduct={() => void handleCreateProduct()}
              onNewProductChange={setNewProduct}
              onNewImageSelect={(event) =>
                void handleProductImageSelect(event, (imageUrl, imagePublicId) =>
                  setNewProduct((current) => ({ ...current, imageUrl, imagePublicId }))
                )
              }
              onEditProductChange={setEditingProduct}
              onEditImageSelect={(event) =>
                void handleProductImageSelect(event, (imageUrl, imagePublicId) =>
                  setEditingProduct((current) => ({ ...current, imageUrl, imagePublicId }))
                )
              }
              onStartEditing={startEditingProduct}
              onSaveProduct={(productId) => void handleSaveProduct(productId)}
              onDeleteProduct={(product) => void handleDeleteProduct(product)}
              onCancelEdit={() => {
                setEditingProductId(null);
                setEditingProductImageKey((current) => current + 1);
              }}
              onPreviousPage={handlePreviousProductPage}
              onNextPage={handleNextProductPage}
            />
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