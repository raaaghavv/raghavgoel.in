import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/llms.txt`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/llms-full.txt`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
