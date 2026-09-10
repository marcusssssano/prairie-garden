import Link from "next/link";
import ContentPage, { ContentSection } from "@/components/ContentPage";

export const metadata = {
  title: "Shipping & returns — Prairie Garden",
  description:
    "How Prairie Garden packs and ships plants within the Philippines, and what to do if something arrives unhappy.",
};

export default function ShippingReturnsPage() {
  return (
    <ContentPage
      eyebrow="Support"
      title="Shipping & returns"
      intro="Plants are living things, so we pack them carefully and ship them quickly. Here's exactly what to expect."
    >
      <ContentSection heading="Where we ship">
        <p>
          We ship within the Philippines only. That&apos;s a deliberate
          choice rather than a limitation we haven&apos;t got to yet —
          shipping live plants internationally means phytosanitary
          certificates, customs inspections, and days in transit that
          most houseplants don&apos;t survive well.
        </p>
        <p>
          Every order is quoted and charged in Philippine pesos, and the
          delivery address has to be a Philippine one.
        </p>
      </ContentSection>

      <ContentSection heading="Delivery times">
        <p>
          Metro Manila and Cavite: 1–3 business days. Elsewhere in Luzon:
          3–5 business days. Visayas and Mindanao: 5–7 business days.
        </p>
        <p>
          Orders placed after 2pm are packed the following business day.
          We don&apos;t ship on Sundays or public holidays, since a plant
          sitting in a depot over a long weekend is a plant that arrives
          stressed.
        </p>
      </ContentSection>

      <ContentSection heading="How we pack">
        <p>
          Pots are wrapped and braced so the soil stays put, and the
          foliage is sleeved rather than crushed. Larger statement plants
          ship upright in a fitted box. Some leaf drop in transit is
          normal and usually recovers within a couple of weeks.
        </p>
      </ContentSection>

      <ContentSection heading="If something arrives damaged">
        <p>
          Email us at{" "}
          <span className="font-mono text-forest">hello@prairiegarden.shop</span>{" "}
          within 48 hours of delivery with photos of the plant and the
          packaging. We&apos;ll replace it on the next shipment out, or
          refund it in full if we can&apos;t.
        </p>
        <p>
          We don&apos;t ask you to ship damaged plants back — that just
          puts them through another journey.
        </p>
      </ContentSection>

      <ContentSection heading="Change of mind">
        <p>
          Because plants are perishable, we can&apos;t accept returns
          simply for a change of mind. If you&apos;re unsure whether
          something suits your space, ask us before ordering — check the
          light and size details on the{" "}
          <Link href="/shop" className="text-clay hover:underline">
            plant&apos;s page
          </Link>
          , or send us a photo of the spot and we&apos;ll advise.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
