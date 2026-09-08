import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LeafClickBurst from "@/components/LeafClickBurst";

// The customer-facing chrome (shop nav, cart, footer) — everything under
// this route group gets it. /admin deliberately lives outside this group
// with its own separate layout, since an admin managing inventory has no
// use for "Shop" links or a cart icon.
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      <LeafClickBurst />
    </>
  );
}
