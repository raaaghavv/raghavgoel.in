"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "@/config/motion";
import { useEnter } from "@/lib/useEnter";

/**
 * The scrollable deck row. On entry, one visible deck (see motion.decks.pick) plays the hover tilt
 * (lift, hold, settle) as a hint that the decks are interactive.
 */
export default function DeckRow({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  useEnter(ref, motion.decks.enterAt, (row) => {
    const box = row.getBoundingClientRect();
    const visible = [...row.children].filter((li) => {
      const r = li.getBoundingClientRect();
      const shown = Math.min(r.right, box.right, window.innerWidth) - Math.max(r.left, box.left, 0);
      return shown >= r.width * motion.decks.visibleFraction;
    });
    const deck = visible[motion.decks.pick(visible.length)]?.querySelector<HTMLElement>("article");
    if (!deck || deck.dataset.flipped !== undefined) return;
    const on = window.setTimeout(() => {
      deck.dataset.nudge = "";
    }, motion.decks.delay);
    const off = window.setTimeout(() => {
      delete deck.dataset.nudge;
    }, motion.decks.delay + motion.decks.hold);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
      delete deck.dataset.nudge;
    };
  });
  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  );
}
