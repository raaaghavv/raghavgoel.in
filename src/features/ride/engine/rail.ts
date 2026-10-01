import { motion } from "@/config/motion";
import { layout } from "@/config/theme";
import { clamp } from "./math";
import type { LiveCheckpoint, RideContext } from "./types";

/**
 * The scrollbar: checkpoint layout, grab-and-drag with preserved offset,
 * press-anywhere-to-jump, magnet snap to checkpoints and keyboard control.
 * Desktop runs it down the right side; phones (`geo.flat`) run it along the bottom. Positions along it are
 * handed to CSS as `--at` / `--fill` so the same code serves both.
 */
export function createRail(ctx: RideContext) {
  const { els, root } = ctx;
  const sections = [...document.querySelectorAll<HTMLElement>("[data-checkpoint]")];
  const cps: LiveCheckpoint[] = sections.map((section) => {
    const id = section.dataset.checkpoint!;
    return {
      id,
      title: section.dataset.title ?? id,
      alias: section.dataset.alias ?? id,
      section,
      li: els.railItems.get(id)!,
      top: 0,
      p: 0,
    };
  });

  /** start/length: where the rail begins and how long it is along its axis; line: the rail's fixed other coordinate */
  const geo = { flat: false, start: 0, length: 1, line: 0, docMax: 1 };
  const state = { drag: null as null | { id: number; a0: number; p0: number }, used: false };

  function measure() {
    const r = els.rail.getBoundingClientRect();
    geo.flat = window.innerWidth <= layout.mobileBreakpoint;
    geo.start = geo.flat ? r.left : r.top;
    geo.length = Math.max(1, geo.flat ? r.width : r.height);
    geo.line = geo.flat ? r.top + r.height / 2 : window.innerWidth - layout.railRight;
    geo.docMax = Math.max(1, root.scrollHeight - window.innerHeight);
    els.thumb.setAttribute("aria-orientation", geo.flat ? "horizontal" : "vertical");
    // one anchor per checkpoint, at the exact section top: the rail dot, every navigation and "current" detection
    // all use it. The start line is the page top; later ones are capped at the page bottom (a short finish lands there).
    cps.forEach((c, i) => {
      c.top = i === 0 ? 0 : clamp(c.section.offsetTop, 0, geo.docMax);
      c.p = c.top / geo.docMax;
      // the finish flag is drawn at the end of the rail, so the rider reaches it at 100% even when the last
      // section is taller than the screen (its anchor, for navigation and the hash, stays the section top)
      const end = i === cps.length - 1;
      c.li.style.setProperty("--at", (end ? geo.length : c.p * geo.length) + "px");
    });
  }

  /** screen point on the rail at progress p */
  const at = (p: number) => {
    const a = geo.start + clamp(p) * geo.length;
    return geo.flat ? { x: a, y: geo.line } : { x: geo.line, y: a };
  };
  const axis = (e: PointerEvent) => (geo.flat ? e.clientX : e.clientY);
  const scrollY = () => ctx.lenis?.scroll ?? window.scrollY;
  const progress = () => clamp(scrollY() / geo.docMax);
  const setP = (p: number) => {
    const top = clamp(p) * geo.docMax;
    if (ctx.lenis) ctx.lenis.scrollTo(top, { immediate: true, force: true });
    else window.scrollTo({ top, behavior: "instant" });
  };
  const goTo = (p: number) => {
    const top = clamp(p) * geo.docMax;
    if (ctx.lenis) ctx.lenis.scrollTo(top, { duration: 0.9 });
    else window.scrollTo({ top, behavior: ctx.reduce ? "instant" : "smooth" });
  };
  const nearest = (p: number) => cps.reduce((a, c) => (Math.abs(c.p - p) < Math.abs(a.p - p) ? c : a), cps[0]);
  const current = (p: number) => {
    let cur = cps[0];
    cps.forEach((c) => {
      if (p >= c.p - 0.003) cur = c;
    });
    return cur;
  };

  function startDrag(e: PointerEvent, jump: boolean) {
    e.preventDefault();
    state.used = true;
    const pj = clamp((axis(e) - geo.start) / geo.length);
    if (jump) setP(pj);
    state.drag = { id: e.pointerId, a0: axis(e), p0: jump ? pj : progress() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    root.dataset.grabbing = "";
  }
  function moveDrag(e: PointerEvent) {
    if (!state.drag || e.pointerId !== state.drag.id) return;
    setP(state.drag.p0 + (axis(e) - state.drag.a0) / geo.length);
  }
  function endDrag(e: PointerEvent) {
    if (!state.drag || e.pointerId !== state.drag.id) return;
    state.drag = null;
    delete root.dataset.grabbing;
    const p = progress(),
      n = nearest(p);
    if (Math.abs(n.p - p) < motion.rail.snapWithin && n.p !== p) goTo(n.p);
  }
  function onKey(e: KeyboardEvent) {
    const p = progress(),
      i = cps.indexOf(current(p));
    const step = (window.innerHeight * motion.rail.keyStep) / geo.docMax;
    const prev = p - cps[i].p > 0.01 ? cps[i] : cps[Math.max(0, i - 1)];
    const k = (
      {
        ArrowDown: p + step,
        ArrowUp: p - step,
        ArrowRight: p + step,
        ArrowLeft: p - step,
        PageDown: (cps[i + 1] ?? cps[i]).p,
        PageUp: prev.p,
        Home: 0,
        End: 1,
      } as Record<string, number>
    )[e.key];
    if (k === undefined) return;
    e.preventDefault();
    state.used = true;
    goTo(k);
  }

  const off: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(
    el: HTMLElement,
    type: K,
    fn: (e: HTMLElementEventMap[K]) => void,
  ) => {
    el.addEventListener(type, fn as EventListener);
    off.push(() => el.removeEventListener(type, fn as EventListener));
  };
  (
    [
      [els.thumb, false],
      [els.track, true],
    ] as const
  ).forEach(([el, jump]) => {
    on(el, "pointerdown", (e) => startDrag(e, jump));
    on(el, "pointermove", moveDrag);
    on(el, "pointerup", endDrag);
    on(el, "pointercancel", endDrag);
  });
  on(els.thumb, "keydown", onKey);
  cps.forEach((c) => {
    const b = c.li.querySelector("button");
    if (b) on(b, "click", () => goTo(c.p));
  });

  measure();
  return {
    cps,
    geo,
    state,
    measure,
    at,
    progress,
    goTo,
    current,
    destroy: () => off.forEach((f) => f()),
  };
}

export type Rail = ReturnType<typeof createRail>;
