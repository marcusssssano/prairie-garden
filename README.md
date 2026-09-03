# Prairie Garden 🌿

A calm, natury plant shop — Next.js + Supabase + Stripe (test mode), built
as a portfolio project.

Deliberately scoped as a Philippines-only shop (₱ pricing, PH shipping
address only) rather than a fake "ships anywhere" storefront with no real
currency, tax, or shipping-zone logic behind it — a small regional business
is a more honest shape for a project this size than pretending to be global.

## Stack

- **Next.js 14** (App Router) — deployed on Vercel
- **Supabase** — Postgres, Auth, Storage (plant images)
- **Stripe Elements** — custom checkout UI, test mode
- **Melina** — our garden guide mascot

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** at supabase.com (free tier), then:
   - Go to the SQL Editor and run `supabase/schema.sql`
   - Copy your Project URL and anon key from Project Settings > API

3. **Create a Stripe account** at stripe.com (stay in **test mode** — toggle
   top right of the dashboard), then copy your test publishable + secret
   keys from Developers > API keys

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the Supabase and Stripe values.

5. **Run locally**
   ```bash
   npm run dev
   ```

6. **Deploy** — push to GitHub, import the repo in Vercel, add the same
   env vars in Vercel's Project Settings, deploy.

## Project structure

```
app/                  Pages (App Router)
components/           Shared UI components (Melina, ProductCard, etc.)
lib/supabase/         Browser + server Supabase clients
supabase/schema.sql   Database schema + Row Level Security policies
public/melina/        Melina pose images
```

## Design tokens

| Token | Hex | Use |
|---|---|---|
| `bg` | `#FFFFFF` | Primary background |
| `bg-soft` | `#F7F8F4` | Section backgrounds |
| `sage` | `#A4B089` | Brand, nav, accents |
| `sage-deep` | `#6B7A54` | Hover states, secondary text |
| `forest` | `#3D4A31` | Headings, body text |
| `clay` | `#C98B5B` | CTAs, sale tags |

Fonts: Fraunces (display), Inter (body), IBM Plex Mono (prices/tags).

## Payments note

Stripe runs in test mode throughout — no real charges. Use test card
`4242 4242 4242 4242`, any future expiry, any CVC.

## Status

- [x] Project scaffold, design tokens, Supabase client setup
- [x] Database schema with RLS
- [ ] Plant catalog + shop page
- [ ] Cart (client state)
- [ ] Checkout (Stripe Elements + PaymentIntent route)
- [ ] Stripe webhook → order creation
- [ ] Auth (guest + logged-in)
- [ ] Melina component + poses
- [ ] Admin dashboard
