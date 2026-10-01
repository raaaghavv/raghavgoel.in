import type { ThemeColor } from "@/types/content";

/**
 * Single source of truth for the palette and shared visual tokens.
 * Rendered as CSS custom properties in app/layout.tsx and imported directly
 * by the three.js skater and the fx canvas, so one edit recolors everything.
 */
export const colors: Record<ThemeColor, string> = {
  paper: "#EEECE6",
  paper2: "#E1DED5",
  ink: "#121212",
  muted: "#57544D",
  pink: "#FF3EA5",
  acid: "#E6FF00",
  blue: "#2B50FF",
  cyan: "#7DF9FF",
  grip: "#1C1C1D",
  white: "#FFFFFF",
};

/** Skater materials (three.js) — derived from the palette where possible. */
export const skaterColors = {
  hoodie: colors.acid,
  pants: colors.blue,
  skate: colors.pink,
  wheels: colors.acid,
  sole: "#151515",
  skin: "#B97A56",
  beanie: "#151515",
  beanieBand: colors.pink,
  headphones: colors.pink,
  eyes: colors.white,
  outline: colors.ink,
};

/** Number printed on the front and back of the skater's hoodie, like a jersey. */
export const jersey = {
  number: "99",
  fill: colors.ink,
  outline: colors.pink,
  /** CSS variable holding the display font family (from next/font) */
  fontVar: "--font-bowlby",
  fallbackFont: "Arial Black, Impact, sans-serif",
};

/** Toon lighting for the skater. three ≥0.155 uses physical light units, hence the π factor. */
export const skaterLighting = {
  ambient: 0.55 * Math.PI,
  sun: 0.75 * Math.PI,
  sunDirection: [-1, 2, 3] as const,
  /** 3-band toon ramp (0–255 luminance) */
  bands: [95, 175, 255],
  /** inverted-hull outline thickness in skater units */
  outline: 0.05,
};

/** Card-binder backgrounds per certificate type. */
export const cardTints = { ai: "#FFD1E8", ops: "#CBD5FF", be: "#F4FFB0", frame: "#F5D90A" };

/** Particle palette for confetti and fireworks. */
export const partyColors = [colors.pink, colors.acid, colors.blue, colors.white, colors.cyan];

export const layout = {
  /** desktop: the rail runs down the right side, this far from the edge */
  railRight: 96,
  /** phones (≤ mobileBreakpoint): the rail runs along the bottom instead */
  bottomRail: {
    /** rail line height above the screen bottom (plus the safe area) */
    inset: 26,
  },
  /** right padding that keeps content clear of the rail (on phones the rail is at the bottom: just the gutter) */
  contentRight: { desktop: 150, mobile: 16 },
  gutter: { desktop: 24, mobile: 16 },
  maxWidth: 1280,
  mobileBreakpoint: 700,
};

const kebab = (s: string) => s.replace(/[A-Z0-9]+/g, (m) => "-" + m.toLowerCase());

/** `:root{…}` block; the only place CSS variables for the theme are defined. */
export function themeCss(): string {
  const c = Object.entries(colors)
    .map(([k, v]) => `--${kebab(k)}:${v};`)
    .join("");
  const t = Object.entries(cardTints)
    .map(([k, v]) => `--card-${k}:${v};`)
    .join("");
  const l = [
    `--rail-right:${layout.railRight}px;`,
    `--content-right:${layout.contentRight.desktop}px;`,
    `--gutter:${layout.gutter.desktop}px;`,
    `--max-width:${layout.maxWidth}px;`,
    `--rail-bottom:${layout.bottomRail.inset}px;`,
  ].join("");
  const m = `--content-right:${layout.contentRight.mobile}px;--gutter:${layout.gutter.mobile}px;`;
  return `:root{color-scheme:light;${c}${t}${l}}@media (max-width:${layout.mobileBreakpoint}px){:root{${m}}}`;
}
