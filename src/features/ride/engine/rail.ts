import { motion } from "@/config/motion";
import { layout } from "@/config/theme";
import { clamp } from "./math";
import type { LiveCheckpoint, RideContext } from "./types";

/**
 * The scrollbar: checkpoint layout, grab-and-drag with preserved offset,
 * press-anywhere-to-jump, magnet snap to checkpoints and keyboard control.
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

  const geo = { top: 0, height: 1, docMax: 1, railRight: layout.railRight.desktop };
  const state = { drag: null as null | { id: number; y0: number; p0: number }, used: false };

  function measure() {
    const r = els.rail.getBoundingClientRect();
    geo.top = r.top;
    geo.height = r.height;
    geo.railRight = window.innerWidth <= layout.mobileBreakpoint ? layout.railRight.mobile : layout.railRight.desktop;
    geo.docMax = Math.max(1, root.scrollHeight - window.innerHeight);
    // one anchor per checkpoint, at the exact section top: the rail dot, every navigation and "current" detection
    // all use it. The start line is the page top; later ones are capped at the page bottom (a short finish lands there).
    cps.forEach((c, i) => {
      c.top = i === 0 ? 0 : clamp(c.section.offsetTop, 0, geo.docMax);
      c.p = c.top / geo.docMax;
      c.li.style.top = c.p * geo.height + "px";
    });
  }

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
    const pj = clamp((e.clientY - geo.top) / geo.height);
    if (jump) setP(pj);
    state.drag = { id: e.pointerId, y0: e.clientY, p0: jump ? pj : progress() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    root.dataset.grabbing = "";
  }
  function moveDrag(e: PointerEvent) {
    if (!state.drag || e.pointerId !== state.drag.id) return;
    setP(state.drag.p0 + (e.clientY - state.drag.y0) / geo.height);
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
    progress,
    goTo,
    current,
    destroy: () => off.forEach((f) => f()),
  };
}

export type Rail = ReturnType<typeof createRail>;
