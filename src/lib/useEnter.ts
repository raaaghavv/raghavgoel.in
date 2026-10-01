"use client";

import { useEffect, type RefObject } from "react";

/**
 * Calls `onEnter` each time the element scrolls into view (after having left it), from either direction.
 * `enterAt` is a fraction of the viewport height, applied to both edges: the element counts as inside once it
 * reaches that far into the screen from the bottom (scrolling down) or from the top (scrolling up). A sliver at an
 * edge counts as outside, so effects replay on the way back. Works for elements taller than the screen.
 * `dir` is 1 when it entered scrolling down, -1 scrolling up.
 * The callback may return a cleanup, run on the next entry or on unmount.
 * Skipped entirely under prefers-reduced-motion.
 */
export function useEnter<T extends Element>(
  ref: RefObject<T | null>,
  enterAt: number,
  onEnter: (el: T, dir: 1 | -1) => void | (() => void),
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let inside = false;
    let cleanup: void | (() => void);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !inside) {
          cleanup?.();
          // entering through the top edge means the visitor is scrolling up
          const dir = entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0) ? -1 : 1;
          cleanup = onEnter(el, dir);
        }
        inside = entry.isIntersecting;
      },
      { rootMargin: `-${enterAt * 100}% 0px -${enterAt * 100}% 0px` },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cleanup?.();
    };
    // onEnter is read once per mount on purpose: entry effects are fire-and-forget
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, enterAt]);
}

/**
 * True while any part of the element is in the viewport. Delayed entry effects that leave a mark (stamps, stickers)
 * check it when their timer fires: a quick fling can carry the element off screen first, and a mark made off screen
 * would greet the next visit already in place instead of being animated.
 */
export function onScreen(el: Element) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}
