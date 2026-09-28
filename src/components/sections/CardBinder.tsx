"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "@/config/motion";
import { useEnter } from "@/lib/useEnter";

/** The certificate grid. On entry, the holo foil sweeps across every card in a staggered wave, in the scroll direction. */
export default function CardBinder({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  useEnter(ref, motion.holo.enterAt, (grid, dir) => {
    const H = motion.holo;
    const cards = [...grid.querySelectorAll<HTMLElement>("article")];
    if (dir < 0) cards.reverse(); // scrolling up: the wave starts from the last card
    grid.style.setProperty("--shine-ms", `${H.duration}ms`);
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
  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  );
}
