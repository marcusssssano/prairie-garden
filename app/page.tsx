import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PlantCard from "@/components/PlantCard";
import MelinaHero from "@/components/MelinaHero";
import type { Plant } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();
  const { data: featuredPlants } = await supabase
    .from("plants")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(4)
    .returns<Plant[]>();

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-bg-soft px-6 py-20 md:py-28">
        {/* Subtle depth behind everything — a soft glow, not a flat block */}
        <div
          className="pointer-events-none absolute right-[-10%] top-[-20%] h-[420px] w-[420px] rounded-full bg-sage/10 blur-3xl"
          aria-hidden="true"
        />

        {/* Small celestial accents echoing Melina's moon/star apron */}
        <svg
          className="pointer-events-none absolute right-[12%] top-16 h-5 w-5 text-melina-purple/70 md:right-[18%]"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z" />
        </svg>
        <svg
          className="pointer-events-none absolute right-[6%] top-40 h-3 w-3 text-melina-teal/70 md:right-[10%]"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z" />
        </svg>
        <svg
          className="pointer-events-none absolute bottom-16 right-[22%] h-4 w-4 text-clay/60"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2a10 10 0 1 0 9.5 13.2A8 8 0 0 1 12 2Z" />
        </svg>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/decor/eucalyptus.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 hidden h-full w-auto object-contain object-right opacity-90 lg:block"
        />

        <MelinaHero />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-sage-deep">
            Prairie Garden
          </span>
          <h1 className="font-display text-4xl italic text-forest md:text-6xl">
            Bring the quiet outside, in.
          </h1>
          <p className="max-w-xl font-body text-base text-forest/80 md:text-lg">
            Slow-grown houseplants, picked for people who want green
            without the guesswork. Say hi to Melina — she&apos;ll help you
            find the right one.
          </p>
          <Link
            href="/shop"
            className="mt-4 rounded-full bg-clay px-8 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep"
          >
            Browse the shop
          </Link>
        </div>
      </section>

      {/* Vine divider — signature element, replaces a plain <hr> */}
      <div className="vine-divider" aria-hidden="true">
        <svg width="200" height="24" viewBox="0 0 200 24" fill="none">
          <path
            d="M0 12 Q 25 0, 50 12 T 100 12 T 150 12 T 200 12"
            stroke="#A4B089"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="50" cy="12" r="3" fill="#C98B5B" />
          <circle cx="150" cy="12" r="3" fill="#C98B5B" />
        </svg>
      </div>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="font-display text-2xl text-forest md:text-3xl">
          Featured this week
        </h2>
        {featuredPlants && featuredPlants.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
            {featuredPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        ) : (
          <p className="mt-2 font-body text-sm text-forest/60">
            New arrivals are on their way — check back soon.
          </p>
        )}
      </section>
    </main>
  );
}
