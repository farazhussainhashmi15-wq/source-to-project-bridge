import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "@/components/LandingPage";

const SITE_URL = "https://karachi-bussiness-growth.lovable.app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Karachi Business Growth — Ads, SEO & WhatsApp AI" },
      {
        name: "description",
        content:
          "Meta, TikTok & Google ads, Google Maps SEO, websites and WhatsApp AI funnels for Karachi businesses.",
      },
      { property: "og:title", content: "Karachi Business Growth — Ads, SEO & WhatsApp AI" },
      {
        property: "og:description",
        content:
          "Digital marketing that scales Karachi brands: ads, local SEO, websites and WhatsApp automation.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Karachi Business Growth — Ads, SEO & WhatsApp AI" },
      {
        name: "twitter:description",
        content:
          "Digital marketing that scales Karachi brands: ads, local SEO, websites and WhatsApp automation.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
  }),
  component: LandingPage,
});
