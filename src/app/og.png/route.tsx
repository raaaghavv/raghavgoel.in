import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { colors } from "@/config/theme";
import { ogImage } from "@/config/seo";

export const dynamic = "force-static";

/** Share card in the zine style: paper, ink, pink sticker, acid tags. */
export function GET() {
  const ink = colors.ink;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: colors.paper,
        padding: 64,
        color: ink,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 26,
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        <span>{site.name.full} / portfolio</span>
        <span style={{ background: ink, color: colors.acid, padding: "8px 18px", borderRadius: 40 }}>
          {site.availability}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <span
            style={{
              fontSize: 210,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: -6,
              textShadow: `10px 10px 0 ${colors.pink}`,
            }}
          >
            {site.name.first.toUpperCase()}
          </span>
          <span
            style={{
              marginLeft: 24,
              marginTop: 10,
              fontSize: 64,
              fontWeight: 900,
              background: colors.pink,
              border: `6px solid ${ink}`,
              padding: "6px 18px",
              transform: "rotate(-7deg)",
            }}
          >
            {site.name.last.toUpperCase()}
          </span>
        </div>
        <div style={{ height: 12, background: ink, borderRadius: 6, marginTop: 24 }} />
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {site.hero.tags.map((t, i) => (
          <span
            key={t}
            style={{
              fontSize: 26,
              letterSpacing: 3,
              textTransform: "uppercase",
              border: `4px solid ${ink}`,
              padding: "8px 14px",
              background: i === 1 ? colors.acid : colors.paper,
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>,
    { width: ogImage.width, height: ogImage.height },
  );
}
