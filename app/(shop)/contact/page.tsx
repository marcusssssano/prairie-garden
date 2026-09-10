import ContentPage, { ContentSection } from "@/components/ContentPage";
import MelinaGuide from "@/components/MelinaGuide";

export const metadata = {
  title: "Contact us — Prairie Garden",
  description:
    "Get in touch with Prairie Garden about an order, a plant, or care advice.",
};

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="Support"
      title="Get in touch"
      intro="Questions about an order, a plant that's not doing well, or something you can't find on the site — we read everything that comes in."
    >
      <ContentSection heading="Email">
        <p>
          <span className="font-mono text-forest">hello@prairiegarden.shop</span>
        </p>
        <p>
          We reply within one business day. If you&apos;re writing about an
          existing order, include the order number from your confirmation
          page and we&apos;ll be able to help faster.
        </p>
      </ContentSection>

      <ContentSection heading="Visit the shop">
        <p>
          142 Meadowbrook Lane
          <br />
          Tanza, Cavite 4108
        </p>
        <p>
          Open Monday to Saturday, 9am to 6pm. Closed Sundays and public
          holidays. Drop by if you&apos;d like to see a plant in person before
          buying — we&apos;re happy to walk you through what thrives in your
          space.
        </p>
      </ContentSection>

      <ContentSection heading="Plant care questions">
        <p>
          You don&apos;t need to have bought from us to ask. Send a photo and
          tell us roughly how much light the spot gets, and we&apos;ll tell you
          what we&apos;d try.
        </p>
      </ContentSection>

      <div className="pt-2">
        <MelinaGuide
          pose="waving"
          message="I answer most of the plant questions myself — don't be shy about sending photos!"
        />
      </div>
    </ContentPage>
  );
}
