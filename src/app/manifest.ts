import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { colors } from "@/config/theme";
import { iconImage } from "@/config/seo";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name.full} — ${site.role}`,
    short_name: site.name.first,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: colors.paper,
    theme_color: colors.pink,
    icons: [{ src: iconImage.path, sizes: `${iconImage.size}x${iconImage.size}`, type: "image/png" }],
  };
}
