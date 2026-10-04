import { motion } from "@/config/motion";
import { clamp, easeInOut, lerp } from "./math";
import type { Rail } from "./rail";
import type { RideContext } from "./types";

type Mode = "hero" | "toRail" | "rail" | "toHero";

/**
 * Hero ↔ rail transition. Scroll *intent* (wheel, swipe, keys, in-page links)
 * triggers it: we hold the scroll, play the stunt on a timer, then glide one
 * step to the first section. Extra input during the stunt fast-forwards it.
 */
export function createStunt(ctx: RideContext, rail: Rail, hooks: { finishIntro: () => void }) {
  const M = motion.stunt,
    G = motion.glide;
  const s = {
    mode: "hero" as Mode,
    from: 0,
    to: 0,
    el: 0,
    dur: M.toRail,
    speed: 1,
    after: null as null | (() => void),
    t: 0,
    locked: false,
    gliding: false,
  };
  const firstSection = () => rail.cps[1]?.top ?? window.innerHeight;
  const scrollY = () => ctx.lenis?.scroll ?? window.scrollY;

  function lock(on: boolean) {
    s.locked = on;
    if (ctx.lenis) {
      if (on) ctx.lenis.stop();
      else ctx.lenis.start();
    } else ctx.root.style.overflow = on ? "hidden" : "";
  }
  function play(to: 0 | 1, after?: () => void) {
    Object.assign(s, {
      mode: to ? "toRail" : "toHero",
      from: s.t,
      to,
      el: 0,
      speed: 1,
      after: after ?? null,
      dur: to ? M.toRail : M.toHero,
    });
    lock(true);
  }
  function glide(top: number, ms: number, done: () => void) {
    lock(true);
    s.gliding = true;
    const target = clamp(top, 0, rail.geo.docMax);
    const finish = () => {
      s.gliding = false;
      done();
    };
    if (ctx.lenis)
      ctx.lenis.scrollTo(target, {
        duration: ms / 1000,
        easing: easeInOut,
        force: true,
        lock: true,
        onComplete: finish,
      });
    else {
      window.scrollTo({ top: target, behavior: "instant" });
      finish();
    }
  }
  const release = () => lock(false);

  function goDown(top = firstSection()) {
    hooks.finishIntro();
    play(1, () => glide(top, G.toProjects, release));
  }
  function goHome() {
    const ms = clamp(scrollY() / G.homePxPerMs, G.homeMin, G.homeMax);
    glide(0, ms, () => play(0, release));
  }
  const boost = () => {
    s.speed = M.fastForward;
  };
  /** land straight on the rail, e.g. when the page opens on #projects */
  function jumpToRail() {
    Object.assign(s, { mode: "rail", t: 1, from: 1, to: 1, after: null });
  }
  /** go to a checkpoint by id with the right move for the current mode */
  function navigate(id: string) {
    const i = rail.cps.findIndex((c) => c.id === id);
    if (i < 0 || s.locked) return;
    if (i === 0) {
      if (s.mode === "rail") goHome();
      return;
    }
    const top = rail.cps[i].top;
    if (s.mode === "hero" && !ctx.simple) goDown(top);
    else if (ctx.lenis) ctx.lenis.scrollTo(top, { duration: 0.9 });
    else window.scrollTo({ top, behavior: ctx.reduce ? "instant" : "smooth" });
  }
  const atFirstSection = () => scrollY() <= firstSection() + 4;
  const dragging = () => !!rail.state.drag;

  /** Lenis wheel hook: return false to swallow the wheel event. */
  function onVirtualScroll({ deltaY, event }: { deltaY: number; event: WheelEvent | TouchEvent }) {
    if (event.type !== "wheel") return true;
    if (s.locked) {
      event.preventDefault();
      boost();
      return false;
    }
    if (s.mode === "hero" && deltaY > 0) {
      event.preventDefault();
      goDown();
      return false;
    }
    if (s.mode === "rail" && deltaY < 0 && atFirstSection() && !dragging()) {
      event.preventDefault();
      goHome();
      return false;
    }
    return true;
  }

  const off: (() => void)[] = [];
  const listen = <K extends keyof WindowEventMap>(
    type: K,
    fn: (e: WindowEventMap[K]) => void,
    opts?: AddEventListenerOptions,
  ) => {
    // a modal over the page (an opened project deck, html[data-modal]) owns input: no ride moves underneath it
    const guarded = (e: WindowEventMap[K]) => {
      if (!document.documentElement.hasAttribute("data-modal")) fn(e);
    };
    window.addEventListener(type, guarded, opts);
    off.push(() => window.removeEventListener(type, guarded, opts));
  };

  if (!ctx.simple) {
    if (!ctx.lenis)
      listen(
        "wheel",
        (e) => {
          onVirtualScroll({ deltaY: e.deltaY, event: e });
        },
        { passive: false },
      );
    let ty: number | null = null;
    listen(
      "touchstart",
      (e) => {
        ty = e.touches[0].clientY;
      },
      { passive: true },
    );
    listen(
      "touchmove",
      (e) => {
        if (s.locked) {
          e.preventDefault();
          return;
        }
        if (ty === null || dragging()) return;
        const d = ty - e.touches[0].clientY;
        if (s.mode === "hero" && d > G.touchIntent) {
          e.preventDefault();
          ty = null;
          goDown();
        } else if (s.mode === "rail" && d < -G.touchIntent && atFirstSection()) {
          e.preventDefault();
          ty = null;
          goHome();
        }
      },
      { passive: false },
    );
    listen("keydown", (e) => {
      // typing in a form field (Home, Space, arrows) is text editing, never ride navigation
      if ((e.target as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable]")) return;
      const down = ["ArrowDown", "PageDown", "End"].includes(e.key) || (e.key === " " && !e.shiftKey);
      const up = ["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey);
      if (s.locked) {
        if (down || up || e.key === "Home") {
          e.preventDefault();
          boost();
        }
        return;
      }
      if (e.target === ctx.els.thumb) return;
      if (s.mode === "hero" && down) {
        e.preventDefault();
        goDown(e.key === "End" ? rail.geo.docMax : undefined);
      } else if (s.mode === "rail" && ((up && atFirstSection()) || e.key === "Home")) {
        e.preventDefault();
        goHome();
      }
    });
    // in-page links from the hero get the same move
    const onLink = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a || s.mode !== "hero" || s.locked) return;
      const el = document.querySelector<HTMLElement>(a.getAttribute("href")!);
      if (!el) return;
      e.preventDefault();
      goDown(rail.cps.find((c) => c.section === el)?.top ?? el.offsetTop);
    };
    document.addEventListener("click", onLink);
    off.push(() => document.removeEventListener("click", onLink));
  }

  /** advance the state machine; returns stunt progress 0 (hero) … 1 (on the rail) */
  function update(dt: number) {
    const y = scrollY(),
      h = window.innerHeight;
    if (ctx.simple) {
      s.t = y > h * 0.3 ? 1 : 0;
      return s.t;
    }
    if (s.mode === "toRail" || s.mode === "toHero") {
      s.el += dt * 1000 * s.speed;
      const k = clamp(s.el / s.dur);
      s.t = lerp(s.from, s.to, k);
      if (k >= 1) {
        s.mode = s.to ? "rail" : "hero";
        const f = s.after;
        s.after = null;
        f?.();
      }
    } else if (!s.locked && !s.gliding) {
      // arrived some other way: rail dragged to the top, a link, native keys
      if (s.mode === "rail" && y < 2 && !dragging()) play(0, release);
      else if (s.mode === "hero" && y > h * 0.5) play(1, release);
    }
    return s.t;
  }

  return {
    state: s,
    update,
    goHome,
    onVirtualScroll,
    jumpToRail,
    navigate,
    destroy: () => {
      off.forEach((f) => f());
      lock(false);
    },
  };
}

export type Stunt = ReturnType<typeof createStunt>;
