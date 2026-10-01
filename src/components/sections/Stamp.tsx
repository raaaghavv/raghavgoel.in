"use client";

import { useEffect, useId, useRef } from "react";
import type { Stamp as StampData } from "@/types/content";
import { colors } from "@/config/theme";
import { motion } from "@/config/motion";
import { onScreen, useEnter } from "@/lib/useEnter";
import s from "./Experience.module.css";

/**
 * Rubber ink stamp: rim text, big value, small caption. Hidden (data-armed) until its row scrolls in, then pressed
 * onto the paper; it clears again once fully off screen so the next visit starts blank. Visible without JS
 * (noscript rule in layout) and under reduced motion (CSS).
 */
export default function Stamp({ stamp }: { stamp: StampData }) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  const ink = colors[stamp.color ?? "pink"];
  const ring = stamp.ring.toUpperCase();
  const valueSize = Math.min(26, Math.floor(120 / Math.max(stamp.value.length, 3))); // fits inside the inner ring

  useEnter(ref, motion.stamps.enterAt, (el) => {
    if (el.dataset.stamped !== undefined) return; // already on the paper
    const S = motion.stamps;
    const row = el.closest<HTMLTableRowElement>("tr");
    const wait = S.delay + (row?.sectionRowIndex ?? 0) * S.stagger;
    const press = window.setTimeout(() => {
      if (onScreen(el)) el.dataset.stamped = ""; // flung past it: stay blank and stamp on the next visit
    }, wait);
    // the moment rubber meets paper: the row takes a small damped thud and a faint ink ring spreads out
    const hit = window.setTimeout(
      () => {
        if (el.dataset.stamped === undefined) return;
        const { distance: d, rotate: r, duration } = S.thud;
        // damped wobble: each swing smaller and opposite to the last
        const swings = [-1, 0.75, -0.45, 0.25, -0.1];
        row?.animate(
          [
            { transform: "none" },
            ...swings.map((k, i) => ({
              transform: `translate(${d * k}px, ${-d * k * 0.6}px) rotate(${r * k}deg)`,
              offset: 0.14 + i * 0.16,
            })),
            { transform: "none" },
          ],
          { duration, easing: "linear" },
        );
        el.animate(
          [
            { opacity: 0.35, transform: "scale(0.95)" },
            { opacity: 0, transform: `scale(${S.ripple.scale})` },
          ],
          { duration: S.ripple.duration, easing: "ease-out", pseudoElement: "::after" },
        );
      },
      wait + S.duration * S.impactAt,
    );
    return () => [press, hit].forEach(clearTimeout);
  });

  // lift the ink once the stamp is completely off screen, so it is stamped again on the next visit
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) delete el.dataset.stamped;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={s.stamp}
      data-armed=""
      style={
        {
          "--stamp-ms": `${motion.stamps.duration}ms`,
          color: ink,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <svg viewBox="0 0 140 140">
        <defs>
          {/* rough, uneven ink edge */}
          <filter id={`${uid}-ink`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
          </filter>
          <path id={`${uid}-rim`} d="M70,70 m-55,0 a55,55 0 1,1 110,0 a55,55 0 1,1 -110,0" fill="none" />
        </defs>
        <g filter={`url(#${uid}-ink)`} fill={ink} stroke={ink}>
          <circle cx="70" cy="70" r="66" fill="none" strokeWidth="4" />
          <circle cx="70" cy="70" r="46" fill="none" strokeWidth="2" />
          <text stroke="none" fontFamily="var(--font-mono)" fontWeight="600" fontSize="10" letterSpacing="1.5">
            <textPath href={`#${uid}-rim`} textLength="340" lengthAdjust="spacingAndGlyphs">
              {`${ring} · ${ring} · `}
            </textPath>
          </text>
          <text
            stroke="none"
            x="70"
            y={stamp.caption ? 74 : 81}
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontSize={valueSize}
          >
            {stamp.value}
          </text>
          {stamp.caption && (
            <text
              stroke="none"
              x="70"
              y="92"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontWeight="600"
              fontSize="9"
              letterSpacing="1.2"
            >
              {stamp.caption.toUpperCase()}
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
