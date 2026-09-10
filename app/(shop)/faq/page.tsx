import Link from "next/link";
import ContentPage, { ContentSection } from "@/components/ContentPage";

export const metadata = {
  title: "FAQ — Prairie Garden",
  description:
    "Common questions about ordering, shipping, payment, and plant care at Prairie Garden.",
};

export default function FaqPage() {
  return (
    <ContentPage
      eyebrow="Support"
      title="Frequently asked questions"
      intro="If your question isn't here, email hello@prairiegarden.shop and we'll get back to you within a business day."
    >
      <ContentSection heading="Is this a real shop?">
        <p>
          No — Prairie Garden is a portfolio project built to demonstrate a
          complete e-commerce build: catalog, cart, checkout, payments,
          accounts, and an admin dashboard. The plants, address, and
          business details are fictional.
        </p>
        <p>
          Checkout runs in Stripe&apos;s test mode, so no real money moves
          and no card is ever charged. You can try the full flow with the
          test card{" "}
          <span className="font-mono text-forest">4242 4242 4242 4242</span>,
          any future expiry date, and any CVC.
        </p>
      </ContentSection>

      <ContentSection heading="Do I need an account to order?">
        <p>
          No. You can check out as a guest with just an email address.
          Creating an account keeps your order history in one place and
          saves you re-entering details next time.
        </p>
        <p>
          Guest orders stay tied to the email you used — you can pull one
          up any time from the confirmation link by entering that address.
        </p>
      </ContentSection>

      <ContentSection heading="Where do you ship?">
        <p>
          Within the Philippines only. See{" "}
          <Link href="/shipping-returns" className="text-clay hover:underline">
            shipping &amp; returns
          </Link>{" "}
          for delivery times by region and how we pack.
        </p>
      </ContentSection>

      <ContentSection heading="How do I track my order?">
        <p>
          Your confirmation page updates on its own as the order moves from
          received to confirmed — no need to refresh. If you have an
          account, every order is listed under{" "}
          <Link href="/account/orders" className="text-clay hover:underline">
            your orders
          </Link>
          .
        </p>
      </ContentSection>

      <ContentSection heading="Can I get a receipt?">
        <p>
          Yes. Once an order is confirmed, the confirmation page has a
          Print receipt button that produces a clean, printable copy — use
          your browser&apos;s Save as PDF option if you want a file.
        </p>
      </ContentSection>

      <ContentSection heading="What if a plant arrives damaged?">
        <p>
          Email us within 48 hours with photos of the plant and packaging
          and we&apos;ll replace or refund it. Full details are on the{" "}
          <Link href="/shipping-returns" className="text-clay hover:underline">
            shipping &amp; returns
          </Link>{" "}
          page.
        </p>
      </ContentSection>

      <ContentSection heading="How do I care for what I bought?">
        <p>
          Each plant page carries advice specific to that species, and the{" "}
          <Link href="/care-guides" className="text-clay hover:underline">
            care guides
          </Link>{" "}
          cover the fundamentals — watering, light, and what to do in the
          first two weeks.
        </p>
      </ContentSection>

      <ContentSection heading="Is there a limit on order size?">
        <p>
          The online cart holds up to 100 items in total. For anything
          larger — an office fit-out, an event — email us directly and
          we&apos;ll arrange it properly rather than sending a pallet
          through standard courier.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
