"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "@/config/motion";
import { useEnter } from "@/lib/useEnter";

/** Wraps the contact board. On entry the deck swings in to rest against it and the sticker slaps on. */
export default function ParkEntry({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEnter(ref, motion.park.enterAt, (el) => {
    const P = motion.park;
    const lean = el
      .querySelector("[data-lean]")
      ?.animate(
        [
          { transform: "translateX(70px) rotate(14deg)", opacity: 0 },
          { transform: "rotate(-3deg)", opacity: 1, offset: 0.7 },
          { transform: "none" },
        ],
        { duration: P.lean.duration, delay: P.lean.delay, easing: "ease-out", fill: "backwards" },
      );
    const sticker = el.querySelector("[data-slap]")?.animate(
      [
        { opacity: 0, transform: "translateY(-30px) scale(1.5) rotate(-8deg)" },
        { opacity: 1, offset: 0.45 },
        { opacity: 1, transform: "none" },
      ],
      {
        duration: P.sticker.duration,
        delay: P.sticker.delay,
        easing: "cubic-bezier(0.2, 1.5, 0.4, 1)",
        fill: "backwards",
      },
    );
    return () => {
      lean?.cancel();
      sticker?.cancel();
    };
  });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
