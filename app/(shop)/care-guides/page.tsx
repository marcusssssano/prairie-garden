import Link from "next/link";
import ContentPage, { ContentSection } from "@/components/ContentPage";
import MelinaGuide from "@/components/MelinaGuide";

export const metadata = {
  title: "Plant care guides — Prairie Garden",
  description:
    "Watering, light, and first-week advice for the houseplants we sell — the basics that keep most plants alive.",
};

export default function CareGuidesPage() {
  return (
    <ContentPage
      eyebrow="Support"
      title="Plant care guides"
      intro="Most houseplants die from too much attention rather than too little. These are the few things that actually matter."
    >
      <ContentSection heading="The first two weeks">
        <p>
          A new plant has just been through a move, so give it a settling
          period. Put it somewhere with the light it wants, water it once,
          and then leave it alone. Don&apos;t repot, don&apos;t fertilise,
          and don&apos;t keep shifting it around looking for a better spot
          — plants adapt to a position over weeks, and moving resets that
          each time.
        </p>
        <p>
          Some yellowing or leaf drop in the first fortnight is normal.
          New growth is the signal that it&apos;s settled.
        </p>
      </ContentSection>

      <ContentSection heading="Watering">
        <p>
          Check before you water rather than watering on a schedule. Push
          a finger about two inches into the soil: if it&apos;s damp,
          wait. If it&apos;s dry, water thoroughly until it runs out of
          the drainage holes, then empty the saucer.
        </p>
        <p>
          Shallow, frequent sips are worse than a proper soak. Roots grow
          toward water, and a pot that&apos;s only ever wet at the top
          grows a shallow, fragile root system.
        </p>
        <p>
          Overwatering is the most common way to kill a houseplant. Soft,
          yellowing lower leaves and soil that stays wet for over a week
          usually mean too much water, not too little.
        </p>
      </ContentSection>

      <ContentSection heading="Light">
        <p>
          <strong className="font-medium text-forest">Low light</strong> means
          a few feet back from a window, or a north-facing room — not a
          windowless corner. Snake plants and ZZ plants tolerate this well.
        </p>
        <p>
          <strong className="font-medium text-forest">Bright indirect</strong>{" "}
          means near a window but out of the sun&apos;s direct path. This
          suits most foliage plants, including pothos and monstera.
        </p>
        <p>
          <strong className="font-medium text-forest">Full sun</strong> means
          several hours of direct light — a south-facing windowsill.
          Succulents, cacti, and bird of paradise want this.
        </p>
        <p>
          Leggy, stretched growth reaching toward a window means not
          enough light. Pale, bleached patches mean too much.
        </p>
      </ContentSection>

      <ContentSection heading="Humidity and airflow">
        <p>
          Philippine humidity suits most houseplants well, so misting is
          usually unnecessary. What matters more is airflow — a plant
          crammed against a wall in still air is more prone to pests and
          fungal spots than one with room around it.
        </p>
      </ContentSection>

      <ContentSection heading="When something goes wrong">
        <p>
          Check the roots before anything else. Slide the plant out of its
          pot: healthy roots are firm and pale, while rotting ones are
          brown, soft, and smell sour. Root rot means cutting away the
          damaged roots and repotting in fresh, drier soil.
        </p>
        <p>
          Still stuck? Every plant page carries specific advice for that
          species —{" "}
          <Link href="/shop" className="text-clay hover:underline">
            browse the shop
          </Link>{" "}
          and check the plant you&apos;re worried about, or email us a
          photo.
        </p>
      </ContentSection>

      <div className="pt-2">
        <MelinaGuide
          pose="pointing"
          message="When in doubt, water less and wait longer. That advice alone saves most plants."
        />
      </div>
    </ContentPage>
  );
}
