"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "@/config/motion";
import { colors } from "@/config/theme";

type Wheel = { el: SVGGElement; row: Element | null; angle: number; vel: number; delay: number };
type Puff = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  grow: number;
  life: number;
  max: number;
  /** drawn on the layer in front of the wheels instead of behind them */
  front: boolean;
};

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a.toFixed(3)})`;
};

/**
 * Wheels roll into the section: each gets a spin kick when the section enters the viewport
 * (scaled by how fast you scrolled in), then friction brings it to a natural stop.
 * Hovering a wheel flicks it with the same physics, and swiping a sideways row (phones) rolls
 * its wheels like they're on the ground. Spin one hard enough and it does a burnout: smoke pours
 * off its contact patch, the faster the more (motion.wheels.smoke). Targets elements marked [data-spin].
 */
export default function WheelSpin({
  children,
  className,
  smokeClassName,
}: {
  children: ReactNode;
  className?: string;
  smokeClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const smokeRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const W = motion.wheels;
    const wheels: Wheel[] = [...root.querySelectorAll<SVGGElement>("[data-spin]")].map((el) => ({
      el,
      row: el.closest("ul"),
      angle: 0,
      vel: 0,
      delay: 0,
    }));

    /* burnout smoke: soft haze that rolls out from the contact patch and blows up a little, mostly behind the
       wheels with some drifting in front (two stacked canvases of the same size) */
    const canvas = smokeRef.current;
    const layers = [smokeRef.current, frontRef.current]
      .filter((c): c is HTMLCanvasElement => !!c)
      .map((c) => ({ c, g: c.getContext("2d")! }));
    const back = layers[0]?.g,
      front = layers[1]?.g;
    let puffs: Puff[] = [];
    const fit = () => {
      const d = Math.min(window.devicePixelRatio, 2);
      for (const { c, g } of layers) {
        const r = c.getBoundingClientRect();
        c.width = Math.round(r.width * d);
        c.height = Math.round(r.height * d);
        g.setTransform(d, 0, 0, d, 0, 0);
      }
    };
    fit();
    const sizer = new ResizeObserver(fit);
    if (canvas) sizer.observe(canvas);
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const smoke = (w: Wheel) => {
      const S = W.smoke,
        sp = Math.abs(w.vel);
      if (!canvas || sp < S.from) return;
      const box = w.el.getBoundingClientRect(),
        c = canvas.getBoundingClientRect();
      if (box.right < c.left || box.left > c.right) return; // scrolled out of its row
      const k = Math.min(1, (sp - S.from) / (S.full - S.from));
      const n = Math.random() < 0.35 + k * 0.65 ? Math.max(1, Math.round(k * S.perFrame)) : 0;
      const sc = box.width / 84,
        dir = Math.sign(w.vel); // clockwise: the tread at the bottom moves left, so smoke is flung left
      for (let i = 0; i < n; i++) {
        // mostly thrown away from the tread, some curling back the other way
        const side = Math.random() < 0.78 ? -dir : dir;
        puffs.push({
          x: box.left - c.left + box.width / 2 + rnd(-0.2, 0.2) * box.width,
          y: box.bottom - c.top + rnd(-4, 6) * sc,
          vx: side * rnd(0.25, 1) * S.spread * sc * (0.5 + k * 0.5),
          vy: -rnd(0, 1) * S.lift * sc,
          r: rnd(8, 14) * sc,
          grow: rnd(24, 44) * sc * (0.7 + k * 0.5),
          life: 0,
          max: rnd(S.life[0], S.life[1]),
          front: Math.random() < S.front,
        });
      }
    };
    const draw = (dt: number) => {
      if (!back) return;
      for (const { c, g } of layers) g.clearRect(0, 0, c.width, c.height);
      puffs = puffs.filter((q) => (q.life += dt) < q.max);
      for (const q of puffs) {
        const f = q.life / q.max;
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        q.vx *= 0.95; // drag: it slows as it spreads
        q.vy *= 0.985;
        // soft haze: white core, a grey edge, fading out; thickest early, thinning as it grows
        const g = q.front && front ? front : back;
        // the front wisps are thinner so the wheels and labels stay readable through them
        const R = q.r + q.grow * Math.sqrt(f),
          a = (1 - f) * (1 - f) * 0.75 * (q.front ? 0.6 : 1);
        const grad = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, R);
        grad.addColorStop(0, rgba(colors.white, a));
        grad.addColorStop(0.5, rgba(colors.paper2, a * 0.7));
        grad.addColorStop(0.8, rgba(colors.muted, a * 0.12));
        grad.addColorStop(1, rgba(colors.muted, 0));
        g.fillStyle = grad;
        g.beginPath();
        // a little wider than tall: it hugs the floor
        g.ellipse(q.x, q.y, R * 1.25, R * 0.8, 0, 0, Math.PI * 2);
        g.fill();
      }
    };

    let raf = 0,
      last = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      let moving = false;
      for (const w of wheels) {
        if (w.delay > 0) {
          w.delay -= dt * 1000;
          moving = true;
          continue;
        }
        if (Math.abs(w.vel) < W.stopBelow) {
          w.vel = 0;
          continue;
        }
        w.vel *= Math.exp(-W.friction * dt);
        w.angle = (w.angle + w.vel * dt) % 360;
        w.el.style.transform = `rotate(${w.angle}deg)`;
        smoke(w);
        moving = true;
      }
      draw(dt);
      // keep going while anything spins or any smoke is still clearing
      raf = moving || puffs.length ? requestAnimationFrame(tick) : 0;
    };
    const run = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    // scroll speed and direction at the moment of entry
    let prevY = window.scrollY,
      prevT = performance.now(),
      speed = 0,
      dir = 1;
    const onScroll = () => {
      const now = performance.now(),
        dy = window.scrollY - prevY;
      speed = Math.abs(dy) / Math.max(1, now - prevT);
      if (dy) dir = Math.sign(dy);
      prevY = window.scrollY;
      prevT = now;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const kick = (w: Wheel, base: number, delay = 0) => {
      w.vel = (w.vel || 0) + dir * base * (1 + (Math.random() - 0.5) * W.jitter);
      w.delay = delay;
    };
    let inside = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !inside) {
          const base = W.entryKick + Math.min(W.speedBoostMax, speed * W.speedBoost);
          wheels.forEach((w, i) => kick(w, base, i * W.stagger));
          run();
        }
        inside = entry.isIntersecting;
      },
      { rootMargin: `-${W.enterAt * 100}% 0px -${W.enterAt * 100}% 0px` },
    ); // same two-edge rule as lib/useEnter
    io.observe(root);

    const onHover = (e: PointerEvent) => {
      const li = (e.target as Element).closest("li");
      if (!li || li.contains(e.relatedTarget as Node | null)) return; // only when entering a new wheel
      const g = li.querySelector<SVGGElement>("[data-spin]");
      const w = g && wheels.find((x) => x.el === g);
      if (w) {
        const dir = w.vel < 0 ? -1 : 1;
        w.vel = dir * Math.min(W.maxSpin, Math.abs(w.vel) + W.hoverKick);
        run();
      }
    };
    root.addEventListener("pointerover", onHover);

    // a row scrolled sideways: content moving left rolls the wheels counter-clockwise, 360° per circumference
    const rowX = new WeakMap<Element, { x: number; t: number }>();
    const onRowScroll = (e: Event) => {
      const row = e.target as Element;
      const now = performance.now(),
        prev = rowX.get(row) ?? { x: row.scrollLeft, t: now };
      rowX.set(row, { x: row.scrollLeft, t: now });
      const dx = row.scrollLeft - prev.x;
      if (!dx) return;
      const dt = Math.max(0.008, (now - prev.t) / 1000);
      for (const w of wheels) {
        if (w.row !== row) continue;
        const deg = (-dx * 360) / (Math.PI * w.el.getBoundingClientRect().width);
        w.angle = (w.angle + deg) % 360;
        const maxVel = W.entryKick + W.speedBoostMax;
        w.vel = Math.max(-maxVel, Math.min(maxVel, (deg / dt) * W.rollCoast));
        w.delay = 0;
        w.el.style.transform = `rotate(${w.angle}deg)`;
      }
      run();
    };
    root.addEventListener("scroll", onRowScroll, { capture: true, passive: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      root.removeEventListener("pointerover", onHover);
      root.removeEventListener("scroll", onRowScroll, { capture: true });
      sizer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
      <canvas ref={smokeRef} className={smokeClassName} aria-hidden="true" />
      <canvas ref={frontRef} className={smokeClassName} data-front="" aria-hidden="true" />
    </div>
  );
}
