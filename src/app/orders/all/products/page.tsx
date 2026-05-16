"use client";

import { SiteFooter } from "../../../../components/site-footer";
import { SiteNav } from "../../../../components/site-nav";
import { RequireAdmin } from "../../../../components/require-admin";
import { AdminDashboardView } from "../../../../components/admin-dashboard/admin-dashboard-view";

export default function AdminProductsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <RequireAdmin>
        <AdminDashboardView focusSection="products" />
      </RequireAdmin>
      <SiteFooter />
    </main>
  );
}
