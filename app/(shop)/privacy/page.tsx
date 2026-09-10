import Link from "next/link";
import ContentPage, { ContentSection } from "@/components/ContentPage";

export const metadata = {
  title: "Privacy policy — Prairie Garden",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      title="Privacy policy"
      intro="Prairie Garden is a portfolio demonstration project, not a real business. This page describes what the application actually does with data, which is worth knowing if you try the checkout flow."
    >
      <ContentSection heading="What this site collects">
        <p>
          If you place an order, the app stores the email address, name,
          phone number, and shipping address you type into the checkout
          form, along with the items and total. If you create an account,
          it stores your email and a securely hashed password.
        </p>
        <p>
          Because this is a demonstration, please don&apos;t enter real
          personal details you wouldn&apos;t want sitting in a test
          database. A made-up name and address work fine.
        </p>
      </ContentSection>

      <ContentSection heading="Card details">
        <p>
          Card numbers never reach this application. Payment fields are
          hosted by Stripe and submitted directly to them, and the site
          only ever receives a payment confirmation. Checkout runs in
          Stripe&apos;s test mode, so no real card can be charged.
        </p>
      </ContentSection>

      <ContentSection heading="Where data is stored">
        <p>
          Order and account data lives in a Supabase (PostgreSQL) database.
          Payment records live with Stripe. The site is hosted on Vercel,
          which processes standard web request logs.
        </p>
      </ContentSection>

      <ContentSection heading="What the site doesn't do">
        <p>
          There is no analytics, no advertising, no third-party tracking,
          and no marketing email. Nothing is sold or shared with anyone.
          The only cookies set are the ones Supabase uses to keep you
          signed in.
        </p>
      </ContentSection>

      <ContentSection heading="Removing your data">
        <p>
          Email{" "}
          <span className="font-mono text-forest">hello@prairiegarden.shop</span>{" "}
          and any test account or order you created will be deleted. See
          the{" "}
          <Link href="/faq" className="text-clay hover:underline">
            FAQ
          </Link>{" "}
          for more about how the demo works.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
