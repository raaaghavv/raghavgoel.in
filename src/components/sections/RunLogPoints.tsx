"use client";

import { useId, useState } from "react";
import { labels } from "@/config/sections";
import { Rich } from "@/lib/text";
import s from "./Experience.module.css";

/**
 * A run-log row's bullets. Every bullet is always in the markup (crawlers and llms.txt read them all); on phones the
 * CSS shows the first `labels.pointsShown` until the toggle opens the rest. Wide screens show everything and hide
 * the toggle.
 */
export default function RunLogPoints({ points }: { points: string[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const extra = points.length - labels.pointsShown;
  return (
    <>
      <ul id={id} className={s.points} data-open={open ? "" : undefined}>
        {points.map((pt, i) => (
          <li key={pt} data-extra={i >= labels.pointsShown ? "" : undefined}>
            <Rich text={pt} />
          </li>
        ))}
      </ul>
      {extra > 0 && (
        <button
          type="button"
          className={s.more}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? labels.fewerPoints : labels.morePoints(extra)}
        </button>
      )}
    </>
  );
}
