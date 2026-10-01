"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "@/config/motion";
import { labels } from "@/config/sections";
import { layout } from "@/config/theme";
import { useEnter } from "@/lib/useEnter";
import s from "./Certificates.module.css";

const shine = (card: HTMLElement | null) => {
  if (!card) return;
  card.dataset.shine = "";
  window.setTimeout(() => delete card.dataset.shine, motion.holo.duration);
};

/**
 * The certificate binder. On entry, the holo foil sweeps across every card in a staggered wave, in the scroll
 * direction. On phones the grid is a fanned deck (CSS, from each card's --d depth): swipe the top card or use the
 * arrows; the card you swipe away flies off and tucks in at the back. Every card stays in the markup.
 */
export default function CardBinder({ children, count }: { children: ReactNode; count: number }) {
  const ref = useRef<HTMLUListElement>(null);
  const [top, setTop] = useState(0);
  const go = useRef<(step: 1 | -1) => void>(() => {});

  useEnter(ref, motion.holo.enterAt, (grid, dir) => {
    const H = motion.holo;
    const cards = [...grid.querySelectorAll<HTMLElement>("article")];
    if (dir < 0) cards.reverse(); // scrolling up: the wave starts from the last card
    const timers = cards.flatMap((card, i) => [
      window.setTimeout(() => {
        card.dataset.shine = "";
      }, i * H.stagger),
      window.setTimeout(
        () => {
          delete card.dataset.shine;
        },
        i * H.stagger + H.duration,
      ),
    ]);
    return () => {
      timers.forEach(clearTimeout);
      cards.forEach((c) => delete c.dataset.shine);
    };
  });

  // depth of every card from the top one; CSS turns it into the fan (phones only)
  useEffect(() => {
    const items = [...(ref.current?.children ?? [])] as HTMLElement[];
    items.forEach((li, i) => {
      const d = (i - top + count) % count;
      li.style.setProperty("--d", String(d));
      if (d === 0) li.dataset.top = "";
      else delete li.dataset.top;
    });
  }, [top, count]);

  useEffect(() => {
    const ul = ref.current;
    if (!ul) return;
    const D = motion.cardDeck;
    const phone = window.matchMedia(`(max-width: ${layout.mobileBreakpoint}px)`);
    const items = () => [...ul.children] as HTMLElement[];
    let current = 0,
      busy = false,
      timer = 0;

    go.current = (step) => {
      if (busy) return;
      busy = true;
      const list = items();
      const next = (current + step + count) % count;
      if (step === 1) {
        // the top card flies off to the left, then tucks in behind the deck
        const li = list[current];
        li.style.setProperty("--dx", String(-window.innerWidth));
        timer = window.setTimeout(() => {
          li.style.setProperty("--dx", "0");
          settle(next);
        }, D.toss);
      } else {
        // the card at the back flies in from the right onto the top
        const li = list[next];
        li.dataset.dragging = "";
        li.style.setProperty("--dx", String(window.innerWidth));
        void li.offsetWidth;
        delete li.dataset.dragging;
        li.style.setProperty("--dx", "0");
        settle(next);
      }
    };
    const settle = (next: number) => {
      current = next;
      setTop(next);
      shine(items()[next]?.querySelector("article") ?? null);
      busy = false;
    };

    let drag: { li: HTMLElement; id: number; x0: number; t0: number; dx: number } | null = null;
    const onDown = (e: PointerEvent) => {
      const li = (e.target as Element).closest("li");
      if (!phone.matches || busy || li?.parentElement !== ul || !("top" in li.dataset)) return;
      drag = { li, id: e.pointerId, x0: e.clientX, t0: performance.now(), dx: 0 };
      li.dataset.dragging = "";
      li.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.x0;
      drag.li.style.setProperty("--dx", String(drag.dx));
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const { li, dx, t0 } = drag;
      drag = null;
      delete li.dataset.dragging;
      const flick = Math.abs(dx) / Math.max(1, performance.now() - t0) > D.flickSpeed && Math.abs(dx) > 20;
      if (e.type === "pointerup" && (Math.abs(dx) > D.swipeAt || flick)) {
        if (dx > 0) li.style.setProperty("--dx", "0");
        go.current(dx < 0 ? 1 : -1);
      } else li.style.setProperty("--dx", "0");
    };
    ul.addEventListener("pointerdown", onDown);
    ul.addEventListener("pointermove", onMove);
    ul.addEventListener("pointerup", onUp);
    ul.addEventListener("pointercancel", onUp);
    return () => {
      clearTimeout(timer);
      ul.removeEventListener("pointerdown", onDown);
      ul.removeEventListener("pointermove", onMove);
      ul.removeEventListener("pointerup", onUp);
      ul.removeEventListener("pointercancel", onUp);
    };
  }, [count]);

  const D = motion.cardDeck;
  const deckVars = {
    "--count": count,
    "--fan-x": `${D.fan.x}px`,
    "--fan-y": `${D.fan.y}px`,
    "--fan-rotate": `${D.fan.rotate}deg`,
    "--deck-ms": `${D.settle}ms`,
    "--shine-ms": `${motion.holo.duration}ms`,
  } as CSSProperties;

  return (
    <div className={s.binder}>
      <ul ref={ref} className={s.cards} style={deckVars}>
        {children}
      </ul>
      <div className={s.deckNav}>
        <button type="button" className="btn" aria-label={labels.cardPrev} onClick={() => go.current(-1)}>
          ←
        </button>
        <span aria-live="polite">
          {top + 1} / {count}
        </span>
        <button type="button" className="btn" aria-label={labels.cardNext} onClick={() => go.current(1)}>
          →
        </button>
      </div>
    </div>
  );
}
