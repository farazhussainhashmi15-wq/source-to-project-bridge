import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "@/components/LandingPage";

// Aap ka sahi Vercel URL
const SITE_URL = "https://source-to-project-bridge.vercel.app";
const OG_IMAGE_URL = `${SITE_URL}/og-image.jpg`;

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Karachi Business Growth — Ads, SEO & WhatsApp AI" },
      {
        name: "description",
        content:
          "Meta, TikTok & Google ads, Google Maps SEO, websites and WhatsApp AI funnels for Karachi businesses.",
      },

      // Google Search Console Verification Tag
      {
        name: "google-site-verification",
        content: "D3oBkvWhZt4T-EAyDuBK9mS6lyf30gQKd8LlKB_NmY8",
      },

      // Open Graph Metadata
      { property: "og:title", content: "Karachi Business Growth — Ads, SEO & WhatsApp AI" },
      {
        property: "og:description",
        content:
          "Digital marketing that scales Karachi brands: ads, local SEO, websites and WhatsApp automation.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },

      // Twitter Card Metadata
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Karachi Business Growth — Ads, SEO & WhatsApp AI" },
      {
        name: "twitter:description",
        content:
          "Digital marketing that scales Karachi brands: ads, local SEO, websites and WhatsApp automation.",
      },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "Karachi Business Growth",
          image: OG_IMAGE_URL,
          description:
            "Meta, TikTok & Google ads, Google Maps SEO, websites and WhatsApp AI funnels for Karachi businesses.",
          url: `${SITE_URL}/`,
          telephone: "+923142763051",
          email: "karachibussinessgrowth@gmail.com",
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Gulshan-e-Maymar",
            addressRegion: "Karachi",
            addressCountry: "PK",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: "24.9983",
            longitude: "67.1350",
          },
          areaServed: { 
            "@type": "City", 
            name: "Karachi" 
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+923142763051",
            contactType: "customer service",
            availableLanguage: ["English", "Urdu"],
          },
        }),
      },
    ],
  }),
  component: LandingPage,
});
