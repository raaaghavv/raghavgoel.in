/** Typed schemas for everything the page renders. Content lives in src/config. */

export type SocialKind = "github" | "linkedin" | "resume" | "x" | "website";

export interface Social {
  kind: SocialKind;
  label: string;
  handle: string;
  href: string;
  /** sticker shape/color variant, see Finish.module.css */
  sticker: "tag" | "round" | "block";
}

export interface SiteConfig {
  name: { first: string; last: string; full: string };
  role: string;
  description: string;
  url: string;
  locale: string;
  email: string;
  location: string;
  availability: string;
  employer: { name: string; url?: string };
  education: { school: string; degree: string; from: string; to?: string };
  hero: {
    tags: string[];
    /** `**bold**` segments are highlighted */
    subheading: string;
    scribble: string;
    ctas: { label: string; href: string; primary?: boolean }[];
  };
  contact: { pitch: string; copyLabel: string; copiedLabel: string };
  socials: Social[];
  resume: { href: string; label: string };
  footnote: string;
}

export interface Checkpoint {
  /** DOM id of the section; also the in-page anchor */
  id: string;
  /** the real word, rendered as the big title and on the rail */
  title: string;
  /** skate name, rendered as the sticker and on the checkpoint banner */
  alias: string;
  blurb?: string;
}

export type DeckGraphic = "dot" | "stripes" | "checker" | "star" | "halftone" | "split";

export interface Project {
  name: string;
  graphic: DeckGraphic;
  meta: string;
  tag: string;
  problem: string;
  built: string;
  result: { value: string; unit: string };
  stack: string[];
  live?: boolean;
  href?: string;
}

export interface DurometerTier {
  min: number;
  label: string;
}

export interface WheelGroup {
  name: string;
  /** theme color token name used for the urethane */
  color: ThemeColor;
  /** theme color token name used for the printed text */
  text: ThemeColor;
  items: { name: string; duro: number }[];
}

/** Rubber stamp on a run-log row: big value in the middle, text around the rim. */
export interface Stamp {
  value: string;
  caption?: string;
  ring: string;
  /** ink color token; defaults to pink */
  color?: ThemeColor;
}

export interface ExperienceEntry {
  from: string;
  /** omit while ongoing: the range then ends in the highlighted "now" badge */
  to?: string;
  title: string;
  org: string;
  badge?: string;
  stamp?: Stamp;
  /** `**bold**` segments are emphasised */
  points: string[];
}

export type CardType = "ai" | "ops" | "be";

export interface Certificate {
  name: string;
  type: CardType;
  art: string;
  issuer: string;
  date: string;
  hours?: string;
  move: string;
  desc: string;
  rare?: boolean;
}

export interface Publication {
  title: string;
  venue: string;
  authors: string[];
}

export type ThemeColor = "paper" | "paper2" | "ink" | "muted" | "pink" | "acid" | "blue" | "cyan" | "grip" | "white";
