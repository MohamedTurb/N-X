"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { ApiError, getErrorMessage } from "../../services/api";
import { createProduct, uploadProductImage } from "../../services/product-api";
import { useAuth } from "../auth-provider";
import { useToast } from "../toast-provider";

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

const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  imageUrl: "",
  imagePublicId: "",
  featured: false,
  variantsText: "[]",
};

function parseVariantsText(variantsText: string) {
  const trimmed = variantsText.trim();

  if (!trimmed) {
    return [];
  }

  const parsed = JSON.parse(trimmed);

  if (!Array.isArray(parsed)) {
    throw new Error("Variants must be a JSON array");
  }

  return parsed;
}

function formatCurrency(value: number) {
  return `EGP ${value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function AdminProductCreateForm() {
  const { token, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [imageKey, setImageKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const previewSource = useMemo(() => previewUrl || form.imageUrl, [form.imageUrl, previewUrl]);

  const handleImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !token) {
      return;
    }

    try {
      const upload = await uploadProductImage(token, file);
      setForm((current) => ({ ...current, imageUrl: upload.url, imagePublicId: upload.publicId }));
      setPreviewUrl(upload.url);
      showToast("Image uploaded", "success");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        return;
      }

      showToast(getErrorMessage(error), "error");
    }
  };

  const resetForm = () => {
    setForm(EMPTY_PRODUCT_FORM);
    setPreviewUrl("");
    setImageKey((current) => current + 1);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    const price = Number.parseFloat(form.price);
    const stock = Number.parseInt(form.stock, 10);

    if (!form.name || !form.description || !form.category || !form.imageUrl) {
      showToast("All product fields are required", "error");
      return;
    }

    if (!Number.isFinite(price) || !Number.isInteger(stock)) {
      showToast("Price and stock must be valid numbers", "error");
      return;
    }

    let variants;

    try {
      variants = parseVariantsText(form.variantsText);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Invalid variants JSON", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createProduct(token, {
        name: form.name,
        description: form.description,
        price,
        stock,
        category: form.category,
        imageUrl: form.imageUrl,
        imagePublicId: form.imagePublicId,
        featured: form.featured,
        variants,
      });

      showToast(`Created ${created.name}`, "success");
      resetForm();
      router.push("/orders/all");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        return;
      }

      showToast(getErrorMessage(error), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Admin Catalog</p>
          <h1 className="font-display text-4xl tracking-[0.08em] sm:text-6xl">ADD PRODUCT</h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            Create a single product entry from a dedicated page, upload its image, and send it straight to the catalog.
          </p>
        </div>

        <Link
          href="/orders/all"
          className="inline-flex items-center justify-center border border-zinc-700 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition hover:border-white hover:text-white"
        >
          Back to dashboard
        </Link>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-8 space-y-5 border border-zinc-800 bg-night p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Product name"
              className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-white/40"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Short product description"
              rows={4}
              className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-white/40"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Price</span>
            <input
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              placeholder="0.00"
              inputMode="decimal"
              className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-white/40"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Stock</span>
            <input
              value={form.stock}
              onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
              placeholder="0"
              inputMode="numeric"
              className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-white/40"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Category key</span>
            <input
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              placeholder="tops, hoodies, bottoms..."
              className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-white/40"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Choose image from device</span>
            <input
              key={imageKey}
              type="file"
              accept="image/*"
              onChange={(event) => void handleImageSelect(event)}
              className="block w-full text-sm text-zinc-300 file:mr-4 file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Or paste image URL</span>
            <input
              value={form.imageUrl}
              onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
              placeholder="https://..."
              className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-white/40"
            />
          </label>

          <label className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
            />
            <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-400">Featured product</span>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Variants JSON</span>
            <textarea
              value={form.variantsText}
              onChange={(event) => setForm((current) => ({ ...current, variantsText: event.target.value }))}
              rows={5}
              placeholder='[{"sku":"TSH-001","color":"Black","size":"M","stock":12}]'
              className="w-full border border-zinc-700 bg-black px-4 py-3 font-mono text-xs text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-white/40"
            />
          </label>
        </div>

        {previewSource ? (
          <div className="overflow-hidden border border-zinc-800 bg-black/40">
            <div className="relative aspect-[16/9] w-full">
              <Image src={previewSource} alt={form.name || "Product preview"} fill className="object-cover" />
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            {form.price && Number.isFinite(Number.parseFloat(form.price))
              ? formatCurrency(Number.parseFloat(form.price))
              : "Price preview"}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={resetForm}
              className="border border-zinc-700 px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-zinc-300 transition hover:border-white hover:text-white"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="border border-accent bg-accent px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create product"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
