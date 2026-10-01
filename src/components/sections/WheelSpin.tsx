"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "@/config/motion";

type Wheel = { el: SVGGElement; row: Element | null; angle: number; vel: number; delay: number };

/**
 * Wheels roll into the section: each gets a spin kick when the section enters the viewport
 * (scaled by how fast you scrolled in), then friction brings it to a natural stop.
 * Hovering a wheel flicks it with the same physics, and swiping a sideways row (phones) rolls
 * its wheels like they're on the ground. Targets elements marked [data-spin].
 */
export default function WheelSpin({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

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
        moving = true;
      }
      raf = moving ? requestAnimationFrame(tick) : 0;
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
        w.vel += W.hoverKick * (w.vel < 0 ? -1 : 1);
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
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
