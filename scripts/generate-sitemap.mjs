import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const siteUrl = (process.env.SITE_URL ?? "https://anmaylaptop.thanhtunguet.io.vn").replace(/\/$/, "");
const routesPath = path.join(rootDir, "prerender.routes.json");
const routes = JSON.parse(readFileSync(routesPath, "utf-8"));

const toUrl = (route) => `${siteUrl}${route === "/" ? "" : route}`;

const body = routes
  .map(
    (route) => `  <url>
    <loc>${toUrl(route)}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === "/" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

const publicDir = path.join(rootDir, "public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(path.join(publicDir, "sitemap.xml"), xml, "utf-8");
console.log(`Sitemap generated with ${routes.length} routes at public/sitemap.xml`);


