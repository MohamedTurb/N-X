import { SiteFooter } from "../../../../../components/site-footer";
import { SiteNav } from "../../../../../components/site-nav";
import { RequireAdmin } from "../../../../../components/require-admin";
import { AdminProductCreateForm } from "../../../../../components/admin-dashboard/admin-product-create-form";

export default function NewAdminProductPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav />
      <RequireAdmin>
        <AdminProductCreateForm />
      </RequireAdmin>
      <SiteFooter />
    </main>
  );
}
