"use client";

import { useState } from "react";
import type { Project } from "@/types/content";
import { labels } from "@/config/sections";
import s from "./Projects.module.css";

/** A skateboard deck: graphic on the front, build notes on the grip-tape back. */
export default function Deck({ project: p }: { project: Project }) {
  const [flipped, setFlipped] = useState(false);
  const titleSize = Math.min(54, Math.floor(330 / p.name.length));
  const [kProblem, kBuilt, kResult] = labels.deckResult;
  return (
    <article className={s.deck} data-flipped={flipped ? "" : undefined}>
      <h3 className="sr-only">
        {p.name}: {p.tag}. {p.problem} {p.built} {p.result.value} {p.result.unit}.
      </h3>
      <button
        type="button"
        className={s.flip}
        onClick={() => setFlipped((f) => !f)}
        aria-pressed={flipped}
        aria-label={`${p.name}: ${p.tag}. ${labels.flipHint}`}
      >
        <span className={s.inner}>
          <span className={`${s.face} ${s.front}`} data-graphic={p.graphic} aria-hidden={flipped}>
            <span className={`${s.bolts} ${s.top}`} />
            {p.live && <span className={s.live}>LIVE</span>}
            <span className={s.name} style={{ fontSize: titleSize }}>
              {p.name}
            </span>
            <span className={s.spec}>
              {p.meta}
              <br />
              {p.tag}
            </span>
            <span className={`${s.bolts} ${s.bottom}`} />
          </span>
          <span className={`${s.face} ${s.back}`} aria-hidden={!flipped}>
            <strong className={s.backTitle}>{p.name}</strong>
            <span>
              <span className={s.k}>{kProblem}</span>
              <span className={s.txt}>{p.problem}</span>
            </span>
            <span>
              <span className={s.k}>{kBuilt}</span>
              <span className={s.txt}>{p.built}</span>
            </span>
            <span>
              <span className={s.k}>{kResult}</span>
              <span className={s.num}>{p.result.value}</span>
              <span className={s.txt}>{p.result.unit}</span>
            </span>
            <span className={s.chips}>
              {p.stack.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </span>
          </span>
        </span>
      </button>
    </article>
  );
}
