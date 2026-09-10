import Link from "next/link";
import ContentPage, { ContentSection } from "@/components/ContentPage";

export const metadata = {
  title: "Terms of service — Prairie Garden",
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      title="Terms of service"
      intro="Prairie Garden is a portfolio demonstration project rather than a trading business, so there is no real contract of sale here. This page sets out what that means in practice."
    >
      <ContentSection heading="No real orders or payments">
        <p>
          Nothing on this site is genuinely for sale. Placing an order
          creates a record in a demonstration database and confirms a
          test-mode payment through Stripe. No card is charged, no money
          moves, and no plant will be shipped to you.
        </p>
      </ContentSection>

      <ContentSection heading="Fictional business details">
        <p>
          The shop name, street address, opening hours, prices, stock
          levels, and product descriptions are invented for the purposes of
          the demonstration. They don&apos;t describe a real trader and
          shouldn&apos;t be relied on as though they did.
        </p>
      </ContentSection>

      <ContentSection heading="Using the site">
        <p>
          You&apos;re welcome to explore every flow, including checkout,
          accounts, and password resets. Please use test data rather than
          real personal information, and don&apos;t attempt to attack,
          overload, or extract data from the service.
        </p>
      </ContentSection>

      <ContentSection heading="Availability">
        <p>
          The site runs on free hosting tiers and may be paused, reset, or
          taken down at any time without notice. Data you create may be
          cleared as part of routine housekeeping.
        </p>
      </ContentSection>

      <ContentSection heading="Questions">
        <p>
          Anything unclear, reach us at{" "}
          <span className="font-mono text-forest">hello@prairiegarden.shop</span>{" "}
          or read the{" "}
          <Link href="/faq" className="text-clay hover:underline">
            FAQ
          </Link>
          .
        </p>
      </ContentSection>
    </ContentPage>
  );
}
