"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useAuth } from "../auth-provider";
import { useToast } from "../toast-provider";
import { ApiError, getErrorMessage } from "../../services/api";
import { orderApi, type AdminDashboardSummary, type Order } from "../../services/order-api";
import {
  createProduct,
  deleteProduct,
  getProductsPage,
  uploadProductImage,
  type Product,
  updateProduct,
} from "../../services/product-api";
import { AdminAnalyticsSection } from "./admin-analytics-section";
import { AdminCustomersSection } from "./admin-customers-section";
import { AdminHeader } from "./admin-header";
import { AdminOrdersSection } from "./admin-orders-section";
import { AdminProductsSection } from "./admin-products-section";

function formatCurrency(value: number) {
  return `EGP ${value.toLocaleString("en-US")}`;
}

type OrderStatus = Order["status"];
type OrderFilter = "all" | OrderStatus;

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  imageUrl: string;
  imagePublicId: string;
};

const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  imageUrl: "",
  imagePublicId: "",
};

function toToastMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return getErrorMessage(error);
}

export function AdminDashboardView() {
  const { token, logout, user } = useAuth();
  const { showToast } = useToast();

  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderPagination, setOrderPagination] = useState({ page: 1, limit: 4, total: 0, totalPages: 1 });
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [debouncedOrderSearch, setDebouncedOrderSearch] = useState("");
  const [orderStatusDrafts, setOrderStatusDrafts] = useState<Record<number, OrderStatus>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [productPagination, setProductPagination] = useState({ page: 1, limit: 6, total: 0, totalPages: 1 });
  const [productQuery, setProductQuery] = useState("");
  const [debouncedProductQuery, setDebouncedProductQuery] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "price" | "stock" | "name">("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  const [newProduct, setNewProduct] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [newProductImageKey, setNewProductImageKey] = useState(0);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [editingProductImageKey, setEditingProductImageKey] = useState(0);
  const [savingProductId, setSavingProductId] = useState<number | null>(null);

  const refreshSummary = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setSummaryLoading(true);
      const nextSummary = await orderApi.getDashboardSummary(token);
      setSummary(nextSummary);
      setDashboardError("");
    } catch (error) {
      const message = toToastMessage(error);
      setDashboardError(message);
      showToast(message, "error");
    } finally {
      setSummaryLoading(false);
    }
  }, [showToast, token]);

  const refreshOrders = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setIsLoadingOrders(true);
      const response = await orderApi.getAdminOrdersPage(token, {
        page: orderPagination.page,
        limit: orderPagination.limit,
        status: orderFilter,
        search: debouncedOrderSearch || undefined,
      });

      setOrders(response.data);
      setOrderPagination(response.pagination);
      setOrderStatusDrafts((current) => {
        const next = { ...current };
        for (const order of response.data) {
          next[order.id] = order.status;
        }
        return next;
      });
      setDashboardError("");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        return;
      }

      const message = toToastMessage(error);
      setDashboardError(message);
      showToast(message, "error");
    } finally {
      setIsLoadingOrders(false);
    }
  }, [debouncedOrderSearch, logout, orderFilter, orderPagination.limit, orderPagination.page, showToast, token]);

  const refreshProducts = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setIsLoadingProducts(true);
      const response = await getProductsPage({
        search: debouncedProductQuery || undefined,
        page: productPagination.page,
        limit: productPagination.limit,
        sortBy,
        sortDirection,
      });

      setProducts(response.items);
      setProductPagination(response.pagination);
      setSelectedProductIds((current) => current.filter((id) => response.items.some((product) => product.id === id)));
      setDashboardError("");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        return;
      }

      const message = toToastMessage(error);
      setDashboardError(message);
      showToast(message, "error");
    } finally {
      setIsLoadingProducts(false);
    }
  }, [debouncedProductQuery, logout, productPagination.limit, productPagination.page, showToast, sortBy, sortDirection, token]);

  useEffect(() => {
    void refreshSummary();
  }, [refreshSummary]);

  useEffect(() => {
    void refreshOrders();
  }, [refreshOrders]);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedOrderSearch(orderSearch.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [orderSearch]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedProductQuery(productQuery.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [productQuery]);

  const statsSummary = useMemo(() => summary?.overview ?? null, [summary]);

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
    } catch (error) {
      showToast(toToastMessage(error), "error");
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

    const snapshot = orders;
    const previousStatus = currentOrder.status;

    try {
      setUpdatingOrderId(orderId);
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)));

      const updated = await orderApi.updateOrderStatus(token, orderId, nextStatus);
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status: updated.status } : order)));
      setOrderStatusDrafts((current) => ({ ...current, [orderId]: updated.status }));
      showToast(`Order #${orderId} updated to ${updated.status}`, "success");
      void refreshSummary();
    } catch (error) {
      setOrders(snapshot);
      setOrderStatusDrafts((current) => ({ ...current, [orderId]: previousStatus }));

      if (error instanceof ApiError && error.status === 401) {
        logout();
        return;
      }

      showToast(toToastMessage(error), "error");
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
      setProducts((current) => [created, ...current].slice(0, productPagination.limit));
      setSelectedProductIds((current) => current.filter((id) => id !== created.id));
      setNewProduct(EMPTY_PRODUCT_FORM);
      setNewProductImageKey((current) => current + 1);
      showToast(`Created ${created.name}`, "success");
      void refreshSummary();
      void refreshProducts();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        return;
      }

      showToast(toToastMessage(error), "error");
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

    const snapshot = products;

    try {
      setSavingProductId(productId);
      const optimisticProduct = {
        ...products.find((product) => product.id === productId),
        name: editingProduct.name,
        description: editingProduct.description,
        priceValue: price,
        priceLabel: formatCurrency(price),
        stockLeft: stock,
        category: editingProduct.category,
        categoryKey: editingProduct.category,
        imageUrl: editingProduct.imageUrl,
        imagePublicId: editingProduct.imagePublicId || null,
      } as Product;

      setProducts((current) => current.map((product) => (product.id === productId ? optimisticProduct : product)));
      const updated = await updateProduct(token, productId, {
        name: editingProduct.name,
        description: editingProduct.description,
        price,
        stock,
        category: editingProduct.category,
        imageUrl: editingProduct.imageUrl,
        imagePublicId: editingProduct.imagePublicId,
      });
      setProducts((current) => current.map((product) => (product.id === productId ? updated : product)));
      setEditingProductId(null);
      setEditingProductImageKey((current) => current + 1);
      showToast(`Updated ${updated.name}`, "success");
      void refreshSummary();
    } catch (error) {
      setProducts(snapshot);

      if (error instanceof ApiError && error.status === 401) {
        logout();
        return;
      }

      showToast(toToastMessage(error), "error");
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

    const snapshot = products;

    try {
      setDeletingProductId(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setSelectedProductIds((current) => current.filter((id) => id !== product.id));
      await deleteProduct(token, product.id);
      showToast(`Deleted ${product.name}`, "info");
      void refreshSummary();
    } catch (error) {
      setProducts(snapshot);

      if (error instanceof ApiError && error.status === 401) {
        logout();
        return;
      }

      showToast(toToastMessage(error), "error");
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!token || selectedProductIds.length === 0) {
      return;
    }

    if (!window.confirm(`Delete ${selectedProductIds.length} selected products?`)) {
      return;
    }

    const snapshot = products;
    const selectedSet = new Set(selectedProductIds);

    try {
      setIsBulkDeleting(true);
      setProducts((current) => current.filter((product) => !selectedSet.has(product.id)));
      setSelectedProductIds([]);

      await Promise.all(selectedProductIds.map((id) => deleteProduct(token, id)));
      showToast(`Deleted ${selectedSet.size} products`, "info");
      void refreshSummary();
      void refreshProducts();
    } catch (error) {
      setProducts(snapshot);
      showToast(toToastMessage(error), "error");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handlePreviousOrderPage = () => {
    setOrderPagination((current) => ({ ...current, page: Math.max(1, current.page - 1) }));
  };

  const handleNextOrderPage = () => {
    setOrderPagination((current) => ({ ...current, page: Math.min(current.totalPages, current.page + 1) }));
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

  const handleOrderSearchChange = (value: string) => {
    setOrderPagination((current) => ({ ...current, page: 1, totalPages: current.totalPages }));
    setOrderSearch(value);
  };

  const handleOrderFilterChange = (status: OrderFilter) => {
    setOrderPagination((current) => ({ ...current, page: 1, totalPages: current.totalPages }));
    setOrderFilter(status);
  };

  const handleSortChange = (nextSort: "createdAt" | "price" | "stock" | "name") => {
    setProductPagination((current) => ({ ...current, page: 1, totalPages: current.totalPages }));
    setSortBy(nextSort);
  };

  const handleSortDirectionChange = () => {
    setProductPagination((current) => ({ ...current, page: 1, totalPages: current.totalPages }));
    setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
  };

  const handleToggleProductSelection = (productId: number) => {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  };

  const handleToggleAllProducts = (checked: boolean) => {
    setSelectedProductIds(checked ? products.map((product) => product.id) : []);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
      <AdminHeader username={user?.username} />

      {dashboardError ? (
        <div className="mt-10 border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-100">
          {dashboardError}
        </div>
      ) : null}

      <AdminAnalyticsSection summary={summary} isLoading={summaryLoading} />
      <AdminCustomersSection customers={summary?.customers ?? []} isLoading={summaryLoading} />

      <div className="mt-12 grid gap-8 md:grid-cols-[1fr_350px] xl:grid-cols-[1.35fr_0.9fr] md:gap-10">
        <AdminOrdersSection
          orders={orders}
          orderFilter={orderFilter}
          orderStatusDrafts={orderStatusDrafts}
          updatingOrderId={updatingOrderId}
          filteredOrderCount={orders.length}
          isLoading={isLoadingOrders}
          pagination={orderPagination}
          search={orderSearch}
          onFilterChange={handleOrderFilterChange}
          onSearchChange={handleOrderSearchChange}
          onStatusDraftChange={handleOrderStatusDraft}
          onStatusSave={(orderId) => void handleOrderStatusSave(orderId)}
          onPreviousPage={handlePreviousOrderPage}
          onNextPage={handleNextOrderPage}
        />

        <AdminProductsSection
          products={products}
          query={productQuery}
          pagination={productPagination}
          isLoadingProducts={isLoadingProducts}
          sortBy={sortBy}
          sortDirection={sortDirection}
          selectedProductIds={selectedProductIds}
          newProduct={newProduct}
          newProductImageKey={newProductImageKey}
          isCreatingProduct={isCreatingProduct}
          isBulkDeleting={isBulkDeleting}
          editingProductId={editingProductId}
          editingProduct={editingProduct}
          editingProductImageKey={editingProductImageKey}
          savingProductId={savingProductId}
          deletingProductId={deletingProductId}
          onQueryChange={handleQueryChange}
          onSortChange={handleSortChange}
          onSortDirectionChange={handleSortDirectionChange}
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
          onToggleProductSelection={handleToggleProductSelection}
          onToggleAllProducts={handleToggleAllProducts}
          onBulkDelete={() => void handleBulkDelete()}
          onCancelEdit={() => {
            setEditingProductId(null);
            setEditingProductImageKey((current) => current + 1);
          }}
          onPreviousPage={handlePreviousProductPage}
          onNextPage={handleNextProductPage}
        />
      </div>
    </section>
  );
}
