# Prairie Garden 🌿

A full-stack plant shop — catalog, cart, Stripe checkout, customer accounts,
and an admin dashboard. Built as a portfolio project.

**Live:** [prairie-garden.vercel.app](https://prairie-garden.vercel.app)

Checkout runs in Stripe **test mode**, so you can complete a real order flow
end to end without any money moving. Use card `4242 4242 4242 4242`, any
future expiry, any CVC.

Deliberately scoped as a Philippines-only shop (₱ pricing, PH shipping
addresses, PH mobile numbers) rather than a fake "ships anywhere" storefront
with no real currency, tax, or shipping-zone logic behind it — a small
regional business is a more honest shape for a project this size than
pretending to be global.

---

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions) on Vercel
- **React 19** + **TypeScript** + **Tailwind CSS**
- **Supabase** — Postgres, Auth, and Row Level Security
- **Stripe** — PaymentIntents with a signature-verified webhook
- **Zustand** — cart state, persisted to localStorage

## What's built

**Storefront**
- Plant catalog with category / light / size filters
- Plant detail pages with an image gallery and care advice
- Cart with per-line quantity, stock clamping, and selective checkout
- "Buy now" for a single item, kept entirely separate from the cart
- Stripe Elements checkout, with retry on a declined card
- Order confirmation that live-polls until the webhook confirms payment
- Printable receipt
- Guest checkout, plus optional accounts with order history
- Password reset by email

**Admin** (`/admin`, gated on `profiles.is_admin`)
- Dashboard: revenue, pending orders, low stock, out of stock
- Plant CRUD with validation and a delete guard for plants tied to orders
- Order list with status filtering and inline status updates
- Its own layout — no cart or shop nav, and admin accounts can browse the
  storefront but not buy from it

**Melina** — an illustrated garden guide who appears throughout with
context-appropriate advice.

**Supporting pages** — contact, shipping & returns, care guides, FAQ, and
legal pages, plus error boundaries, a real 404, `sitemap.xml`, and
`robots.txt` that keeps crawlers out of the transactional routes.

## Architecture notes

A few decisions worth calling out, since they're the ones that took thought:

- **Payment trust.** The checkout API creates the order as `pending` and
  only the Stripe webhook — after signature verification — ever marks it
  `paid`. The browser is never trusted to confirm a payment.
- **Retries don't duplicate orders.** A declined card reuses the same
  PaymentIntent instead of minting a new order per attempt, so a fumbled
  card number doesn't leave orphaned records behind.
- **Prices are recomputed server-side.** The checkout request sends only
  plant IDs and quantities; every price and stock check comes from the
  database.
- **RLS is the real boundary.** Route guards are UX. Every read and write
  goes through Postgres policies, including an `is_admin()` security-definer
  function that avoids infinite policy recursion.
- **Column-level grants on `profiles`.** Users can update their own name and
  address but not `is_admin` — RLS restricts rows, not columns, so that
  needed an explicit `GRANT`.
- **Stock decrements atomically** via a SQL function, so two orders
  confirming at once can't lose an update.

## Picking this up on a new machine

If you already have the Supabase, Stripe, and Vercel projects set up (the
live site is running), this is all you need:

```bash
git clone https://github.com/marcusssssano/prairie-garden.git
cd prairie-garden
npm ci
```

Then recreate `.env.local` — it's deliberately not in the repo, so it never
travels with a clone. Copy `.env.example` to `.env.local` and fill in each
value from where it originates:

| Variable | Recover it from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY` | Stripe → Developers → API keys (test mode) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → the endpoint → Signing secret. For local dev, use the secret printed by `stripe listen` instead. |
| `CRON_SECRET` | Not recoverable — it's a random string. Generate a new one and set the same value in Vercel, or the daily keep-alive will start returning 401. |

> **Don't rely on `vercel env pull`.** It looks like the obvious shortcut,
> but Vercel stores these as *sensitive* variables, which are write-only —
> the pull succeeds but writes the literal text `[SENSITIVE]` in place of
> every value. Tested; it produces a config that builds but is wired to
> nothing.

The cheapest insurance is to keep a copy of your working `.env.local` in a
password manager, so a new machine is a paste rather than a scavenger hunt.

Check it worked with `npm run typecheck && npm run lint`, then `npm run dev`.

Pushing to `main` on GitHub does **not** deploy automatically unless the
repo is connected to the Vercel project (Vercel → prairie-garden → Settings →
Git). Until then, ship with `npx vercel --prod`.

## Running locally

1. **Install**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then
   in the SQL Editor run, in order:
   - `supabase/schema.sql` — tables, RLS policies, triggers
   - `supabase/migrations/001_qa_fixes.sql` — column-level grants and the
     atomic stock function
   - `supabase/seed.sql` — 14 sample plants

3. **Create a Stripe account** and stay in **test mode**. Copy the test
   publishable and secret keys from Developers → API keys.

4. **Environment variables**

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Where it comes from |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page |
   | `SUPABASE_SERVICE_ROLE_KEY` | same page — server-only, never expose |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → API keys |
   | `STRIPE_SECRET_KEY` | Stripe → API keys |
   | `STRIPE_WEBHOOK_SECRET` | from the webhook endpoint (below) |
   | `CRON_SECRET` | any random string you generate |

5. **Run**

   ```bash
   npm run dev
   ```

6. **Webhooks locally** — forward Stripe events to your dev server and use
   the signing secret it prints as `STRIPE_WEBHOOK_SECRET`:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## Deploying

1. Import the repo in Vercel (or `npx vercel --prod`).
2. Add every variable from the table above in Project Settings →
   Environment Variables.
3. In Stripe, add a webhook endpoint at
   `https://<your-domain>/api/webhooks/stripe` subscribed to
   `payment_intent.succeeded`, and set its signing secret as
   `STRIPE_WEBHOOK_SECRET`.
4. In Supabase → Authentication → URL Configuration, set **Site URL** to
   your deployed URL and add `https://<your-domain>/**` to **Redirect
   URLs**, so confirmation and password-reset emails link to the right
   place.

### Making yourself an admin

`is_admin` defaults to `false` and is deliberately not settable from the
app. Flip it in the Supabase SQL editor:

```sql
update profiles set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Maintenance notes

- **Supabase free-tier projects pause after ~7 days idle.** A Vercel cron
  (`vercel.json`) hits `/api/cron/keep-alive` daily to prevent that. If the
  site ever shows database errors, check whether the project is paused.
- **Auth emails.** Supabase's built-in email sender is heavily rate-limited
  and only really suitable for testing. For reliable signup and
  password-reset delivery, configure a custom SMTP provider (Resend,
  Postmark, SendGrid) under Authentication → Emails.

## Design tokens

| Token | Hex | Use |
|---|---|---|
| `bg` | `#FFFFFF` | Primary background |
| `bg-soft` | `#F7F8F4` | Section backgrounds |
| `sage` | `#A4B089` | Brand, nav, accents |
| `sage-deep` | `#6B7A54` | Hover states, secondary text |
| `forest` | `#3D4A31` | Headings, body text |
| `clay` | `#C98B5B` | CTAs, sale tags |

Fonts: Fraunces (display), Inter (body), IBM Plex Mono (prices and tags).
