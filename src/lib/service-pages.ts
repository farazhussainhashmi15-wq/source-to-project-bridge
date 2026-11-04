const SITE_URL = "https://karachi-bussiness-growth.lovable.app";

export type ServiceSlug = "/seo-services" | "/google-ads" | "/whatsapp-marketing";

export interface ServicePageConfig {
  slug: ServiceSlug;
  navLabel: string;
  badge: string;
  h1Prefix: string;
  h1Highlight: string;
  h1Suffix?: string;
  intro: string;
  benefits: { title: string; text: string }[];
  included: string[];
  process: { step: string; text: string }[];
  ctaTitle: string;
  ctaText: string;
  waMessage: string;
  metaTitle: string;
  metaDescription: string;
  schemaName: string;
}

export const servicePages: ServicePageConfig[] = [
  {
    slug: "/seo-services",
    navLabel: "SEO",
    badge: "Local SEO • Google Maps Ranking",
    h1Prefix: "Rank Higher on Google &",
    h1Highlight: "Google Maps in Karachi",
    intro:
      "Local SEO and Google Business Profile optimization that puts your Karachi business in front of customers searching right now — more calls, more direction requests, more walk-ins.",
    benefits: [
      {
        title: "Show up where customers search",
        text: "We optimize your Google Business Profile and website so you appear in the local map pack when Karachi customers search for what you sell.",
      },
      {
        title: "More calls, directions & walk-ins",
        text: "A fully optimized profile turns searches into phone calls, direction requests and WhatsApp messages from nearby buyers.",
      },
      {
        title: "Reviews that sell for you",
        text: "A simple review strategy that builds a steady stream of genuine 5-star proof and answers every customer professionally.",
      },
      {
        title: "Website SEO that compounds",
        text: "On-page fixes, technical cleanup and locally focused content that keeps climbing the rankings month after month.",
      },
      {
        title: "Karachi area targeting",
        text: "We target the specific areas your customers live in — from Gulshan-e-Maymar to DHA and beyond.",
      },
      {
        title: "Transparent monthly reporting",
        text: "See exactly what improved: rankings, calls, direction requests and website visits — no jargon, no hiding.",
      },
    ],
    included: [
      "Google Business Profile setup & optimization",
      "Local keyword & category research for Karachi",
      "Review generation & response strategy",
      "Local citations and map listings cleanup",
      "On-page & technical website SEO",
      "Monthly ranking and leads report",
    ],
    process: [
      { step: "Free Local SEO Audit", text: "We review your current Google presence, competitors and missed keyword opportunities in Karachi." },
      { step: "Optimize Everything", text: "Profile, categories, photos, services, website pages and citations — all aligned to your target keywords." },
      { step: "Grow & Report", text: "Ongoing optimization, review building and a clear monthly report on rankings and leads." },
    ],
    ctaTitle: "Get a Free Local SEO Audit",
    ctaText: "Send us your business name on WhatsApp and we'll show you exactly where you stand on Google Maps in Karachi — free.",
    waMessage: "Hi! I'd like a free Local SEO audit for my business in Karachi.",
    metaTitle: "Local SEO & Google Maps Ranking in Karachi — Karachi Business Growth",
    metaDescription:
      "Local SEO and Google Maps optimization for Karachi businesses. Rank higher, get more calls and walk-ins. Free audit — WhatsApp 0314 2763051.",
    schemaName: "Local SEO & Google Maps Optimization",
  },
  {
    slug: "/google-ads",
    navLabel: "Google Ads",
    badge: "Google & YouTube Ads Management",
    h1Prefix: "Google Ads That Capture Buyers",
    h1Highlight: "Already Searching in Karachi",
    intro:
      "Search, Performance Max and YouTube campaigns managed for one goal: turning high-intent Google searches into calls, WhatsApp leads and sales for your Karachi business.",
    benefits: [
      {
        title: "Reach buyers with intent",
        text: "Your ads appear the moment someone in Karachi searches for your product or service — the hottest leads there are.",
      },
      {
        title: "Fast, measurable results",
        text: "Campaigns can start generating calls and messages within days, with every rupee tracked to a result.",
      },
      {
        title: "Search + YouTube + Performance Max",
        text: "Full-funnel coverage: capture demand on Search, build demand on YouTube, and let Performance Max find converters.",
      },
      {
        title: "Conversion tracking done right",
        text: "Calls, WhatsApp clicks and form leads tracked properly, so budget flows to what actually brings customers.",
      },
      {
        title: "Landing pages that convert",
        text: "We build fast, mobile-first pages with one-tap WhatsApp so your ad clicks don't go to waste.",
      },
      {
        title: "Transparent spend & reporting",
        text: "You see exactly what was spent, what it brought in, and what we're improving next — every month.",
      },
    ],
    included: [
      "Google Search campaign setup & management",
      "Performance Max campaigns",
      "YouTube video ad campaigns",
      "Karachi keyword & competitor research",
      "Conversion tracking (calls, WhatsApp, forms)",
      "Landing page recommendations",
      "Weekly optimization & monthly reporting",
    ],
    process: [
      { step: "Audit & Goals", text: "We review your market, competitors and budget, then agree on a clear cost-per-lead target." },
      { step: "Launch Campaigns", text: "Search, YouTube or Performance Max campaigns go live with tracking and landing pages in place." },
      { step: "Optimize & Scale", text: "Weekly tuning of keywords, bids and creatives — scaling what brings the cheapest qualified leads." },
    ],
    ctaTitle: "Get a Free Google Ads Plan",
    ctaText: "Tell us your business and monthly budget on WhatsApp — we'll send back a campaign plan with expected costs and leads.",
    waMessage: "Hi! I'd like a free Google Ads plan for my business in Karachi.",
    metaTitle: "Google Ads Management in Karachi — Karachi Business Growth",
    metaDescription:
      "Google Ads, Performance Max and YouTube campaigns for Karachi businesses. Turn searches into calls and WhatsApp leads. Free plan — 0314 2763051.",
    schemaName: "Google Ads Management",
  },
  {
    slug: "/whatsapp-marketing",
    navLabel: "WhatsApp Marketing",
    badge: "WhatsApp Business • AI Automation",
    h1Prefix: "Turn WhatsApp Into Your",
    h1Highlight: "Karachi Sales Channel",
    intro:
      "In Karachi, deals close on WhatsApp. We set up your catalog, AI auto-replies and broadcast funnels so every enquiry gets an instant answer — day or night.",
    benefits: [
      {
        title: "Instant replies, 24/7",
        text: "AI auto-replies answer common questions the second a customer messages — no lead left waiting overnight.",
      },
      {
        title: "Your catalog inside WhatsApp",
        text: "Customers browse products, prices and offers without ever leaving the chat they're comfortable in.",
      },
      {
        title: "Broadcasts that bring repeat sales",
        text: "New arrivals, flash deals and VIP offers sent straight to opted-in customers who already trust you.",
      },
      {
        title: "Ads that open a chat, not a form",
        text: "Click-to-WhatsApp ads on Meta and Google drop hot leads directly into a conversation with your business.",
      },
      {
        title: "One inbox for every conversation",
        text: "Review full chat history and reply to customers from a single place — nothing slips through.",
      },
      {
        title: "Never miss a lead again",
        text: "Every message is stored and answered, so busy hours and holidays stop costing you sales.",
      },
    ],
    included: [
      "WhatsApp Business setup & verification",
      "Product catalog with prices & offers",
      "AI auto-replies for common questions",
      "Broadcast campaigns for deals & launches",
      "Click-to-WhatsApp ads integration",
      "Team inbox with full conversation history",
    ],
    process: [
      { step: "Setup & Catalog", text: "We configure your WhatsApp Business presence and build a catalog your customers can browse in chat." },
      { step: "Automate Replies", text: "AI answers FAQs instantly and hands over to you whenever a personal touch is needed." },
      { step: "Broadcast & Grow", text: "Launch offers and click-to-WhatsApp ads fill your chat with buyers — and the funnel keeps them coming back." },
    ],
    ctaTitle: "Get a Free WhatsApp Funnel Plan",
    ctaText: "Message us on WhatsApp and we'll map out the exact auto-reply and broadcast funnel for your business — free.",
    waMessage: "Hi! I'd like a free WhatsApp marketing funnel plan for my business.",
    metaTitle: "WhatsApp Marketing & AI Automation in Karachi — Karachi Business Growth",
    metaDescription:
      "WhatsApp Business setup, catalogs, AI auto-replies and broadcast funnels for Karachi businesses. Never miss a lead — WhatsApp 0314 2763051.",
    schemaName: "WhatsApp Marketing & AI Automation",
  },
];

export function serviceHead(config: ServicePageConfig) {
  const url = `${SITE_URL}${config.slug}`;
  return {
    meta: [
      { title: config.metaTitle },
      { name: "description", content: config.metaDescription },
      { property: "og:title", content: config.metaTitle },
      { property: "og:description", content: config.metaDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: config.metaTitle },
      { name: "twitter:description", content: config.metaDescription },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: config.schemaName,
          description: config.metaDescription,
          url,
          provider: {
            "@type": "ProfessionalService",
            name: "Karachi Business Growth",
            url: `${SITE_URL}/`,
            telephone: "+923142763051",
            email: "karachibussinessgrowth@gmail.com",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Gulshan-e-Maymar",
              addressRegion: "Karachi",
              addressCountry: "PK",
            },
          },
          areaServed: { "@type": "City", name: "Karachi" },
        }),
      },
    ],
  };
}
