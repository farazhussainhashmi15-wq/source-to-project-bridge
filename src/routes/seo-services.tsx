import { createFileRoute } from "@tanstack/react-router";
import ServicePage from "@/components/ServicePage";
import { serviceHead, servicePages } from "@/lib/service-pages";

const config = servicePages.find((s) => s.slug === "/seo-services")!;

export const Route = createFileRoute("/seo-services")({
  staticData: { sitemap: true },
  head: () => serviceHead(config),
  component: SeoServicesPage,
});

function SeoServicesPage() {
  return <ServicePage config={config} />;
}
