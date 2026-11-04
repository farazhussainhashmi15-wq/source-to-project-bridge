import { createFileRoute } from "@tanstack/react-router";
import ServicePage from "@/components/ServicePage";
import { serviceHead, servicePages } from "@/lib/service-pages";

const config = servicePages.find((s) => s.slug === "/google-ads")!;

export const Route = createFileRoute("/google-ads")({
  staticData: { sitemap: true },
  head: () => serviceHead(config),
  component: GoogleAdsPage,
});

function GoogleAdsPage() {
  return <ServicePage config={config} />;
}
