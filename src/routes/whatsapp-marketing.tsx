import { createFileRoute } from "@tanstack/react-router";
import ServicePage from "@/components/ServicePage";
import { serviceHead, servicePages } from "@/lib/service-pages";

const config = servicePages.find((s) => s.slug === "/whatsapp-marketing")!;

export const Route = createFileRoute("/whatsapp-marketing")({
  staticData: { sitemap: true },
  head: () => serviceHead(config),
  component: WhatsAppMarketingPage,
});

function WhatsAppMarketingPage() {
  return <ServicePage config={config} />;
}
