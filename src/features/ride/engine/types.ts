import type Lenis from "lenis";

/** Overlay elements rendered by RideLayer and handed to the engine. */
export interface RideElements {
  /** full-viewport overlay the rider art is drawn into */
  skater: SVGSVGElement;
  fxCanvas: HTMLCanvasElement;
  rail: HTMLElement;
  track: HTMLElement;
  fill: HTMLElement;
  pct: HTMLElement;
  thumb: HTMLElement;
  bubble: HTMLElement;
  hint: HTMLElement;
  banner: HTMLElement;
  bannerNo: HTMLElement;
  bannerName: HTMLElement;
  toTop: HTMLButtonElement;
  /** rail checkpoint <li>s keyed by checkpoint id */
  railItems: Map<string, HTMLElement>;
}

/** A checkpoint as found in the page: config + its section element. */
export interface LiveCheckpoint {
  id: string;
  title: string;
  alias: string;
  section: HTMLElement;
  li: HTMLElement;
  /** scroll offset this checkpoint lands on: the section's exact top (capped at the page bottom) */
  top: number;
  /** 0..1 position along the document (top / max scroll) */
  p: number;
}

export interface RideContext {
  els: RideElements;
  lenis: Lenis | null;
  /** reduced motion: no scroll hijacking, no particles */
  simple: boolean;
  reduce: boolean;
  root: HTMLElement;
}
