import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "@/components/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Karachi Business Growth — Ads, SEO & WhatsApp AI" },
      { name: "description", content: "Meta, TikTok & Google ads, Google Maps SEO, websites and WhatsApp AI funnels for Karachi businesses." },
      { property: "og:title", content: "Karachi Business Growth — Ads, SEO & WhatsApp AI" },
      { property: "og:description", content: "Digital marketing that scales Karachi brands: ads, local SEO, websites and WhatsApp automation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});
