import { readFileSync } from "node:fs";

const prerenderRoutes = JSON.parse(
  readFileSync(new URL("./prerender.routes.json", import.meta.url), "utf-8")
) as string[];

export { prerenderRoutes };

export const siteUrl = process.env.SITE_URL ?? "https://anmaylaptop.com";

export const sitemap = {
  hostname: siteUrl,
  routes: prerenderRoutes.map((route) => ({
    url: route,
    changefreq: "weekly",
    priority: route === "/" ? 1.0 : 0.8,
  })),
};
