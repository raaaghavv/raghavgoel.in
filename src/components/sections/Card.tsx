"use client";

import type { PointerEvent } from "react";
import type { Certificate } from "@/types/content";
import { motion } from "@/config/motion";
import { issuerLogos, type LogoArt } from "@/config/issuerLogos";

/** an issuer's mark in its own colours: filled shapes, and lines for the parts drawn as outlines */
function Logo({ art }: { art: LogoArt }) {
  return (
    <svg viewBox={art.viewBox} aria-hidden="true" focusable="false">
      {/* a fixed list (a shape can repeat, e.g. a fill and its outline), so the index is the key */}
      {art.parts.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={p.fill ?? "none"}
          fillRule="evenodd"
          stroke={p.stroke}
          strokeWidth={p.width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
import s from "./Certificates.module.css";

/** Holo trading card that tilts toward the pointer. Writes CSS vars directly: no re-render per move. */
export default function Card({ cert: c, number }: { cert: Certificate; number: string }) {
  const onMove = (e: PointerEvent<HTMLElement>) => {
    // tilt follows a mouse only; on touch the finger is swiping the deck
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = e.currentTarget,
      r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width,
      py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(px - 0.5) * 18}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * 14}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
  };
  // touch screens have no hover tilt: a touch replays the entry foil sweep on this card instead (it never blocks
  // the scroll, the finger is free to keep swiping)
  const onTouch = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = e.currentTarget as HTMLElement & { _shine?: number };
    clearTimeout(el._shine);
    delete el.dataset.shine;
    void el.offsetWidth; // restart the sweep if it's mid-play
    el.dataset.shine = "";
    el._shine = window.setTimeout(() => delete el.dataset.shine, motion.holo.duration);
  };
  const onLeave = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };
  return (
    <article
      className={s.card}
      data-type={c.type}
      data-rare={c.rare ? "" : undefined}
      onPointerDown={onTouch}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className={s.in}>
        <header className={s.top}>
          <h3>{c.name}</h3>
          <span>{c.hours ?? c.type.toUpperCase()}</span>
        </header>
        <div className={s.art} aria-hidden="true">
          {c.art}
        </div>
        <p className={s.move}>
          <b>{c.move}</b>
          {c.desc}
        </p>
        <footer className={s.foot}>
          <span className={s.meta}>
            <span className={s.issuer}>
              {c.logo && <Logo art={issuerLogos[c.logo]} />}
              {c.issuer}
            </span>
            <span>{c.date}</span>
          </span>
          <span>{number}</span>
        </footer>
      </div>
    </article>
  );
}
