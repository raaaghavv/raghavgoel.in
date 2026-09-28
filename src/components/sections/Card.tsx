"use client";

import type { PointerEvent } from "react";
import type { Certificate } from "@/types/content";
import s from "./Certificates.module.css";

/** Holo trading card that tilts toward the pointer. Writes CSS vars directly: no re-render per move. */
export default function Card({ cert: c, number }: { cert: Certificate; number: string }) {
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = e.currentTarget,
      r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width,
      py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(px - 0.5) * 18}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * 14}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
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
            <span>{c.issuer}</span>
            <span>{c.date}</span>
          </span>
          <span>{number}</span>
        </footer>
      </div>
    </article>
  );
}
