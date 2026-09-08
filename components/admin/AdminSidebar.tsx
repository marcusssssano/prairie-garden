"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/plants", label: "Plants" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto pb-2 md:w-40 md:shrink-0 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
      {LINKS.map((link) => {
        // /admin/plants should also read as active for its /new and
        // /[id]/edit subpages — exact match only for /admin itself,
        // otherwise a plain prefix match would make Dashboard "active"
        // on every admin page.
        const isActive =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-lg px-3 py-2 font-body text-sm transition-colors ${
              isActive
                ? "bg-sage-deep/15 text-sage-deep"
                : "text-forest/70 hover:bg-bg-soft hover:text-forest"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
