import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { sitemapStaticPaths, sitemapXML } from "@/lib/sitemap";

describe("Karachi Business Growth sitemap", () => {
  it("includes the homepage and excludes private, sign-in and API URLs", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(sitemapStaticPaths(router)).toEqual(["/"]);
  });

  it("uses the public origin and omits unverified lastmod dates", () => {
    const xml = sitemapXML("https://karachi-bussiness-growth.lovable.app", [{ path: "/" }]);
    expect(xml).toContain("<loc>https://karachi-bussiness-growth.lovable.app/</loc>");
    expect(xml).not.toContain("<lastmod>");
  });

  it("rejects external sitemap paths", () => {
    expect(() => sitemapXML("https://karachi-bussiness-growth.lovable.app", [{ path: "//example.com" }])).toThrow("Invalid sitemap path");
  });
});