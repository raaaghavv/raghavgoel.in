import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { colors } from "@/config/theme";

export const dynamic = "force-static";
const size = { width: 64, height: 64 };

/**
 * Favicon: the RG monogram from the old site, set in the hero's display face: white letters with an ink outline (crisp
 * on light and dark tab bars alike) and the hero name's pink offset shadow, on a transparent background. Bowlby One is read from a vendored TTF at build time (the image renderer can't
 * read the woff2 next/font serves); nothing extra ships to visitors.
 */
export async function GET() {
  const bowlby = await readFile(join(process.cwd(), "src/assets/fonts/BowlbyOne-Regular.ttf"));
  const initials = site.name.first[0] + site.name.last[0];
  return new ImageResponse(
    <div
      style={{
        width: 64,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <span
        style={{
          fontFamily: "Bowlby One",
          fontSize: 35,
          lineHeight: 1,
          letterSpacing: -2,
          color: colors.white,
          WebkitTextStroke: `3px ${colors.ink}`,
          textShadow: `3px 3px 0 ${colors.pink}`,
          marginTop: 4,
        }}
      >
        {initials}
      </span>
    </div>,
    { ...size, fonts: [{ name: "Bowlby One", data: bowlby, weight: 400, style: "normal" }] },
  );
}
