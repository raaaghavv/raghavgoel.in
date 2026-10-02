import type { ThemeColor } from "@/types/content";

/**
 * Single source of truth for the palette and shared visual tokens.
 * Rendered as CSS custom properties in app/layout.tsx (the rider's art paints with them) and imported directly
 * by the fx canvas, so one edit recolors everything.
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

/**
 * The rider's palette (rendered as --rider-* variables; RideLayer.module.css paints the art with them). `far` is the
 * back arm, leg and skate: a touch darker than the near side so it reads as behind.
 */
export const riderColors = {
  acid: colors.acid,
  acidShade: "#C6DA00",
  pink: colors.pink,
  pinkShade: "#DC2C89",
  blue: colors.blue,
  blueShade: "#1F3CCB",
  skin: "#EDA263",
  skinShade: "#D88C53",
  hair: "#2E1B10",
  hairLight: "#43291A",
  hairDark: "#140A05",
  iris: "#5E3A1F",
  wheel: colors.acid,
  wheelShade: "#B4C700",
  hub: "#8C8475",
  plate: "#A6A39A",
  far: {
    acid: "#DDF600",
    acidShade: "#BFD400",
    pink: "#F23A9B",
    pinkShade: "#CF2880",
    blue: "#2849F0",
    blueShade: "#1C37BE",
    skin: "#E39A5E",
    wheel: "#DDF600",
    wheelShade: "#A9BB00",
  },
};

/** Card-binder backgrounds per certificate type. */
export const cardTints = { ai: "#FFD1E8", ops: "#CBD5FF", be: "#F4FFB0", frame: "#F5D90A" };

/** The contact board and the skatepark behind it (rendered as --park-* variables). */
export const parkColors = {
  board: "#243A30",
  cream: "#F1E7CC",
  bulb: "#FFD56B",
  leaf: "#7E9A72",
  leafDark: "#56704F",
  concrete: "#CDC8BB",
  steel: "#5C5952",
  ramp: "#D9D4C8",
  post: "#8C6440",
  wood: "#C9A27A",
};

/** The sky across the top of the hero: a pale wash fading into the paper, with soft clouds (0 = plain paper, 1 = full). */
export const heroSky = { tint: "#BFF3F2", cloud: colors.white, strength: 0.5 };

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
  /** phones: decks are scaled (within zoom) so the row shows whole decks plus part of the next one, a swipe cue */
  deckRow: { peek: { min: 0.25, max: 0.65 }, zoom: { min: 0.8, max: 1.2 } },
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
  const { far, ...near } = riderColors;
  const r =
    Object.entries(near)
      .map(([k, v]) => `--rider-${kebab(k)}:${v};`)
      .join("") +
    Object.entries(far)
      .map(([k, v]) => `--rider-far-${kebab(k)}:${v};`)
      .join("");
  const f = Object.entries(parkColors)
    .map(([k, v]) => `--park-${kebab(k)}:${v};`)
    .join("");
  const h = Object.entries(heroSky)
    .map(([k, v]) => `--hero-sky-${kebab(k)}:${v};`)
    .join("");
  const l = [
    `--rail-right:${layout.railRight}px;`,
    `--content-right:${layout.contentRight.desktop}px;`,
    `--gutter:${layout.gutter.desktop}px;`,
    `--max-width:${layout.maxWidth}px;`,
    `--rail-bottom:${layout.bottomRail.inset}px;`,
  ].join("");
  const m = `--content-right:${layout.contentRight.mobile}px;--gutter:${layout.gutter.mobile}px;`;
  return `:root{color-scheme:light;${c}${t}${r}${f}${h}${l}}@media (max-width:${layout.mobileBreakpoint}px){:root{${m}}}`;
}
