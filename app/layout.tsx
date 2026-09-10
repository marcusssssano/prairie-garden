import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { getSiteUrl } from "@/lib/siteUrl";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

const SITE_DESCRIPTION =
  "A small online plant shop. Browse slow-grown houseplants, get care tips from our garden guide Melina, and check out in a couple of taps.";

export const metadata: Metadata = {
  // metadataBase lets pages declare relative OG image paths and still
  // produce the absolute URLs that social scrapers require.
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Prairie Garden — Plants for calm spaces",
    // Pages that set their own title already include the shop name, so
    // this only fills in for any that don't.
    template: "%s",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Prairie Garden",
    title: "Prairie Garden — Plants for calm spaces",
    description: SITE_DESCRIPTION,
    locale: "en_PH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prairie Garden — Plants for calm spaces",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} flex min-h-screen flex-col font-body`}
      >
        {children}
      </body>
    </html>
  );
}
