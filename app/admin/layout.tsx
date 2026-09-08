import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminTopBar from "@/components/admin/AdminTopBar";
import AdminSidebar from "@/components/admin/AdminSidebar";

// Belt-and-suspenders: this redirect is just for UX (don't show admin UI
// to non-admins). The real enforcement is the `is_admin()` RLS policies —
// even if someone bypassed this check entirely, every read/write below
// still goes through the database's own admin check.
//
// Deliberately its own layout, separate from the customer-facing (shop)
// route group — an admin managing inventory has no use for a "Shop" nav
// link or a cart icon, so this never renders SiteHeader/SiteFooter at all.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <AdminTopBar />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 md:flex-row md:gap-10 md:py-12">
        <AdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
