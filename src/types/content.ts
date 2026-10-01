/** Typed schemas for everything the page renders. Content lives in src/config. */

export type SocialKind = "github" | "linkedin" | "resume" | "x" | "website";

export interface Social {
  kind: SocialKind;
  label: string;
  handle: string;
  href: string;
}

/** One field of the contact form */
export interface FormField {
  label: string;
  placeholder: string;
  /** shown under the field when it fails validation */
  error: string;
}

/** The "Send a message" form on the contact board */
export interface ContactForm {
  title: string;
  /**
   * Where the form posts (JSON: name, email, message), e.g. a Formspree or Web3Forms endpoint. Without one the
   * form opens the visitor's email app with the message filled in.
   */
  endpoint?: string;
  fields: { name: FormField; email: FormField; message: FormField };
  send: string;
  sending: string;
  sent: string;
  /** shown when posting fails; the email address is appended */
  failed: string;
  /** shown when there is no endpoint and the email app is opened instead */
  opening: string;
  /** email subject; {name} is replaced */
  subject: string;
}

export interface SiteConfig {
  name: { first: string; last: string; full: string };
  role: string;
  description: string;
  url: string;
  locale: string;
  email: string;
  location: string;
  /** shown next to the location, with the current local time */
  timezone: { label: string; iana: string };
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
  contact: {
    pitch: string;
    /** heading sticker over the links */
    reachTitle: string;
    emailLabel: string;
    copyLabel: string;
    copiedLabel: string;
    openLabel: string;
    basedIn: string;
    /** sticker slapped across the bottom edge of the board */
    sticker: string;
    /** graffiti tag sprayed on the ramp in the background */
    tag: string;
    form: ContactForm;
  };
  socials: Social[];
  resume: { title: string; href: string; label: string };
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
