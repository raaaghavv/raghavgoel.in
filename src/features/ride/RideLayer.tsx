"use client";

import { useEffect, useRef } from "react";
import { checkpoints, labels } from "@/config/sections";
import { startRide } from "./engine/engine";
import type { RideElements } from "./engine/types";
import s from "./RideLayer.module.css";

type Part = Exclude<keyof RideElements, "railItems">;
const PARTS: Part[] = [
  "skaterCanvas",
  "fxCanvas",
  "rail",
  "track",
  "fill",
  "pct",
  "thumb",
  "bubble",
  "hint",
  "banner",
  "bannerNo",
  "bannerName",
  "toTop",
  "fallback",
];

/** Decorative overlay: the skater, effects canvas and the progress-bar scrollbar. */
export default function RideLayer() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const pick = (name: string) => root.querySelector<HTMLElement>(`[data-ride="${name}"]`);
    const found = Object.fromEntries(PARTS.map((k) => [k, pick(k)]));
    if (Object.values(found).some((v) => !v)) return;
    const railItems = new Map(
      [...root.querySelectorAll<HTMLElement>("[data-rail-cp]")].map((li) => [li.dataset.railCp!, li]),
    );
    return startRide({ ...(found as unknown as Omit<RideElements, "railItems">), railItems });
  }, []);

  const last = checkpoints.length - 1;
  return (
    <div ref={rootRef} className={s.root}>
      <canvas data-ride="fxCanvas" className={s.fx} aria-hidden="true" />
      <canvas data-ride="skaterCanvas" className={s.skater} aria-hidden="true" />
      <div data-ride="banner" className={s.banner} aria-hidden="true">
        <span className={s.trophy}>{labels.finishTrophy}</span>
        <small data-ride="bannerNo" />
        <b data-ride="bannerName" />
      </div>

      <nav data-ride="rail" className={s.rail} aria-label="Page progress">
        <div data-ride="fill" className={s.fill} />
        <div data-ride="track" className={s.track} />
        <ol className={s.cps}>
          {checkpoints.map((c, i) => (
            <li key={c.id} data-rail-cp={c.id} className={i === last ? s.fin : undefined}>
              <button type="button" tabIndex={-1} aria-label={`Go to ${c.title}`}>
                <span className={s.dot} data-dot="" />
                <span className={s.lbl}>{c.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className={s.readout}>
          {labels.runReadout} <span data-ride="pct">0</span>%
        </div>
        <button data-ride="toTop" className={s.toTop} type="button">
          {labels.backToStart}
        </button>
        <div data-ride="fallback" className={s.fallback} />
      </nav>

      <div
        data-ride="thumb"
        className={s.thumb}
        tabIndex={0}
        role="scrollbar"
        aria-orientation="vertical"
        aria-controls="main"
        aria-label="Scroll position, drag the skater"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
      />
      <div data-ride="bubble" className={s.bubble} aria-hidden="true" />
      <div data-ride="hint" className={s.hint} aria-hidden="true">
        {labels.railHint[0]}
        <br />
        {labels.railHint[1]}
      </div>
    </div>
  );
}
