"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "@/config/motion";
import { layout } from "@/config/theme";
import { useEnter } from "@/lib/useEnter";

/**
 * The scrollable deck row. On phones the decks are scaled (zoom) so the screen always ends partway through a deck,
 * a cue that the row scrolls. On every entry, one visible deck (see motion.decks.pick) plays the hover tilt
 * (lift, hold, settle) as a hint that the decks are interactive.
 */
export default function DeckRow({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);

  // phones: pick the scale closest to 1 that leaves part of a deck (within layout.deckRow.peek) at the screen edge
  useEffect(() => {
    const row = ref.current;
    if (!row) return;
    const phone = window.matchMedia(`(max-width: ${layout.mobileBreakpoint}px)`);
    const fit = () => {
      if (!phone.matches) return row.style.removeProperty("--deck-zoom");
      const css = getComputedStyle(row);
      const base = parseFloat(css.getPropertyValue("--deck-w")),
        gap = parseFloat(css.columnGap) || 0;
      const view = row.clientWidth - parseFloat(css.paddingLeft);
      const { peek, zoom } = layout.deckRow;
      let best = 1,
        off = Infinity;
      for (let k = 1; k <= row.children.length; k++) {
        // k whole decks, a gap after each, then a fraction f of the next: k·(base·s) + k·gap + f·base·s = view
        const at = (f: number) => (view - k * gap) / (base * (k + f));
        const lo = Math.max(zoom.min, at(peek.max)),
          hi = Math.min(zoom.max, at(peek.min));
        if (lo > hi) continue;
        const s = Math.min(hi, Math.max(lo, 1));
        if (Math.abs(s - 1) < off) {
          best = s;
          off = Math.abs(s - 1);
        }
      }
      row.style.setProperty("--deck-zoom", best.toFixed(3));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(row);
    return () => ro.disconnect();
  }, []);

  useEnter(ref, motion.decks.enterAt, (row) => {
    const D = motion.decks;

    const box = row.getBoundingClientRect();
    const visible = [...row.children].filter((li) => {
      const r = li.getBoundingClientRect();
      const shown = Math.min(r.right, box.right, window.innerWidth) - Math.max(r.left, box.left, 0);
      return shown >= r.width * D.visibleFraction;
    });
    const deck = visible[D.pick(visible.length)]?.querySelector<HTMLElement>("article");
    if (!deck || deck.dataset.flipped !== undefined) return;
    const on = window.setTimeout(() => {
      deck.dataset.nudge = "";
    }, D.delay);
    const off = window.setTimeout(() => {
      delete deck.dataset.nudge;
    }, D.delay + D.hold);
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
