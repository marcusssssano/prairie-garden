import Link from "next/link";

// Catches notFound() calls from any nested admin page (e.g. editing a
// plant that's been deleted) — without this, Next falls back to its
// generic 404, which renders outside this section's layout entirely,
// dropping the sidebar/top bar for what should still feel like an
// in-admin error state.
export default function AdminNotFound() {
  return (
    <div className="py-12 text-center">
      <h1 className="font-display text-2xl italic text-forest">
        Not found
      </h1>
      <p className="mt-2 font-body text-sm text-forest/60">
        That plant or order doesn&apos;t exist — it may have already been
        deleted.
      </p>
      <Link
        href="/admin"
        className="mt-6 inline-block rounded-full bg-clay px-6 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
