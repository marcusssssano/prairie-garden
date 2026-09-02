import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Belt-and-suspenders: this redirect is just for UX (don't show admin UI
// to non-admins). The real enforcement is the `is_admin()` RLS policies —
// even if someone bypassed this check entirely, every read/write below
// still goes through the database's own admin check.
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
    <div className="mx-auto flex max-w-6xl gap-10 px-6 py-12">
      <nav className="w-40 shrink-0">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-sage-deep">
          Admin
        </span>
        <ul className="mt-4 space-y-1">
          <li>
            <Link
              href="/admin/plants"
              className="block rounded-lg px-3 py-2 font-body text-sm text-forest/70 transition-colors hover:bg-bg-soft hover:text-forest"
            >
              Plants
            </Link>
          </li>
          <li>
            <Link
              href="/admin/orders"
              className="block rounded-lg px-3 py-2 font-body text-sm text-forest/70 transition-colors hover:bg-bg-soft hover:text-forest"
            >
              Orders
            </Link>
          </li>
        </ul>
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
