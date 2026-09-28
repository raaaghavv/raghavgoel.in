import { ImageResponse } from "next/og";
import { colors } from "@/config/theme";

export const dynamic = "force-static";
const size = { width: 64, height: 64 };

/** Favicon: a skate wheel in the site palette. */
export function GET() {
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
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          background: colors.pink,
          border: `5px solid ${colors.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            background: colors.acid,
            border: `5px solid ${colors.ink}`,
          }}
        />
      </div>
    </div>,
    size,
  );
}
