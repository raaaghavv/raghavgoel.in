"use client";

import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "@/config/motion";
import { labels } from "@/config/sections";
import { useEnter } from "@/lib/useEnter";
import s from "./Certificates.module.css";

/** a card's layout width; narrower pockets scale the whole card down instead */
const CARD_W = 196;

/** a closed binder ring through a punched hole: solid outside the sheet and over the plastic, faint underneath */
function Ring() {
  const loop = "M40 31.55 A44 12 0 0 1 8 20 A44 12 0 0 1 69 9.08";
  return (
    <svg className={s.ring} viewBox="0 0 104 40" aria-hidden="true" focusable="false">
      <path
        d="M71 9.17 A44 12 0 0 1 96 20 A44 12 0 0 1 40 31.55"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="4.5"
        strokeOpacity="0.1"
        strokeLinecap="round"
      />
      <circle cx="71" cy="9.17" r="5" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2.2" />
      <path d={loop} fill="none" stroke="var(--ink)" strokeWidth="8" strokeLinecap="round" />
      <path
        d={loop}
        fill="none"
        stroke="color-mix(in srgb, var(--paper) 72%, var(--ink))"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M14 15 A44 12 0 0 1 50 8.3"
        fill="none"
        stroke="var(--white)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

/** the open page's turned-up corner: grab it and drag toward the rings to turn the page */
function Corner() {
  return (
    <span className={s.corner} aria-hidden="true">
      <svg viewBox="0 0 52 52" focusable="false">
        {/* the page's corner folded back: the cut-away corner shows the section behind, the flap shows the sleeve's back */}
        <path d="M14 46 L14 52 L52 52 L52 14 L46 14 Z" fill="var(--paper)" />
        <path
          d="M14 46 L46 14 L14 14 Z"
          fill="var(--paper-2)"
          stroke="var(--ink)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M14 46 L46 14" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
        <g fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path className={s.up} d="M22 30 V20 M18 24 L22 20 L26 24" />
          <path className={s.left} d="M30 22 H20 M24 18 L20 22 L24 26" />
        </g>
      </svg>
    </span>
  );
}

/**
 * The certificate binder: a clear plastic sheet of card pockets held by three rings. The cards (the <li> children) are
 * grouped into pages of `perPage`. Wide, the pages are the sheet's rows; narrow (a container query in the CSS), they
 * stack and turn around the rings: sideways like a book on tablets, up like a calendar on phones (the CSS picks, and sets
 * --turn for the drag axis). They loop: drag the corner toward the rings, or use the arrows. On entry the holo foil sweeps
 * across every card in a staggered wave, in the scroll direction. Every card stays in the markup.
 */
export default function CardBinder({ children, perPage = 4 }: { children: ReactNode; perPage?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  // the page being turned to: the label shows it as soon as a turn starts (page catches up when the turn lands)
  const [shown, setShown] = useState(0);
  const [paged, setPaged] = useState(false);
  // how the pages turn: "y" a book (rings left), "x" a calendar (rings on top); the CSS decides via --turn
  const [turn, setTurn] = useState<"x" | "y">("y");
  const pageRef = useRef(0);
  const items = Children.toArray(children);
  const pages = Array.from({ length: Math.ceil(items.length / perPage) }, (_, i) =>
    items.slice(i * perPage, (i + 1) * perPage),
  );
  const B = motion.binder;

  useEnter(ref, motion.holo.enterAt, (root, dir) => {
    const H = motion.holo;
    const cards = [...root.querySelectorAll<HTMLElement>("article")];
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

  // fit the cards to their pockets, and notice when the layout switches between the sheet and the flippable pages
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const fit = () => {
      setPaged(!!navRef.current && getComputedStyle(navRef.current).display !== "none");
      const sheet = root.querySelector<HTMLElement>(`.${s.sheet}`);
      setTurn(sheet && getComputedStyle(sheet).getPropertyValue("--turn").trim() === "x" ? "x" : "y");
      root.querySelectorAll<HTMLElement>("ul").forEach((ul) => {
        const li = ul.firstElementChild as HTMLElement | null;
        if (!li) return;
        const cs = getComputedStyle(li);
        const inner = li.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        // too narrow for a card: lay it out at CARD_W and scale it down; otherwise up to 250px
        const z = inner < CARD_W ? inner / CARD_W : 1;
        ul.style.setProperty("--cz", z.toFixed(3));
        ul.style.setProperty("--cw", `${z < 1 ? CARD_W : Math.min(250, Math.floor(inner))}px`);
      });
    };
    const ro = new ResizeObserver(fit);
    ro.observe(root);
    fit();
    return () => ro.disconnect();
  }, []);

  // Pages loop: they only ever turn forward, and turning the last brings the first back on top, like a flip calendar.
  // Depth (--d) runs from the open page, so the next page is always the one underneath. A turned page snaps flat again
  // at the bottom of the stack. Drag the open page's corner toward the rings to turn it (it follows the finger; past
  // turnAt of the way it finishes, else falls back), or use the arrows; ← brings the previous page back down.
  const actions = useRef({ next: () => {}, prev: () => {} });
  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>(`.${s.pages}`);
    if (!el || !paged) return;
    const book = turn === "y";
    const n = pages.length;
    const list = () => [...el.querySelectorAll<HTMLElement>(`.${s.page}`)];
    const depthFrom = (top: number) =>
      list().forEach((pg, i) => pg.style.setProperty("--d", String((i - top + n) % n)));
    let busy = false;
    // arrow presses during a turn wait their turn instead of being dropped (net steps: + forward, - back)
    let queued = 0;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const done = () => {
      busy = false;
      if (!queued) return;
      const step = Math.sign(queued);
      queued -= step;
      if (step > 0) next();
      else prev();
    };

    function next() {
      if (n < 2) return;
      if (busy) {
        queued++;
        return;
      }
      busy = true;
      const now = pageRef.current,
        to = (now + 1) % n,
        pg = list()[now];
      setShown(to);
      pg.dataset.gone = ""; // turns over the rings, from wherever a drag left it
      later(() => {
        // turned: drop it to the bottom of the stack and lay it flat there, unseen
        pg.dataset.snap = "";
        depthFrom(to);
        delete pg.dataset.gone;
        setPage(to);
        pageRef.current = to;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            delete pg.dataset.snap;
            done();
          }),
        );
      }, B.flip);
    }
    function prev() {
      if (n < 2) return;
      if (busy) {
        queued--;
        return;
      }
      busy = true;
      const to = (pageRef.current - 1 + n) % n,
        pg = list()[to];
      setShown(to);
      // put it on top already turned over the rings, then let it swing back down
      pg.dataset.snap = "";
      pg.dataset.gone = "";
      depthFrom(to);
      setPage(to);
      pageRef.current = to;
      void pg.offsetWidth;
      delete pg.dataset.snap;
      requestAnimationFrame(() => {
        delete pg.dataset.gone;
        later(done, B.flip);
      });
    }
    actions.current = { next, prev };

    type Drag = { id: number; at0: number; page: HTMLElement; span: number; p: number };
    let drag: Drag | null = null;
    const at = (e: PointerEvent) => (book ? e.clientX : e.clientY);
    // 0 = open on the sheet, 1 = turned over the rings
    const tilt = (d: Drag) => (book ? `rotateY(${-d.p * 180}deg)` : `rotateX(${d.p * 180}deg)`);
    const down = (e: PointerEvent) => {
      if (busy || !(e.target as Element).closest(`.${s.corner}`)) return;
      const pg = list()[pageRef.current];
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      const size = book ? pg.offsetWidth : pg.offsetHeight;
      drag = { id: e.pointerId, at0: at(e), page: pg, span: size * B.dragSpan, p: 0 };
      pg.dataset.dragging = "";
      pg.style.transform = tilt(drag);
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      // toward the rings (left on a book, up on a calendar)
      drag.p = Math.max(0, Math.min(1, (drag.at0 - at(e)) / drag.span));
      drag.page.style.transform = tilt(drag);
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      // hand the page back to CSS: it transitions from where the finger left it, to turned or back to open
      delete d.page.dataset.dragging;
      d.page.style.transform = "";
      if (e.type === "pointerup" && d.p > B.turnAt) next();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      timers.forEach(clearTimeout);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [paged, turn, pages.length, B.flip, B.dragSpan, B.turnAt]);

  const vars = {
    "--pages": pages.length,
    "--flip-ms": `${B.flip}ms`,
    "--shine-ms": `${motion.holo.duration}ms`,
  } as CSSProperties;

  return (
    <div ref={ref} className={s.binder} style={vars}>
      <div className={s.sheet}>
        <Ring />
        <Ring />
        <Ring />
        <div className={s.pages}>
          {pages.map((cards, i) => (
            <div
              key={i}
              className={s.page}
              // depth below the open page: 0 is on top
              style={{ "--d": (i - page + pages.length) % pages.length } as CSSProperties}
              // flippable pages: only the open one is reachable; the sheet shows (and lets you reach) every page
              inert={paged && i !== page}
            >
              <ul className={s.pockets}>{cards}</ul>
              <Corner />
            </div>
          ))}
        </div>
      </div>
      <div ref={navRef} className={s.pageNav}>
        <button type="button" className="btn" aria-label={labels.binderPrev} onClick={() => actions.current.prev()}>
          ←
        </button>
        <span aria-live="polite">
          {labels.binderPage} {shown + 1} / {pages.length}
        </span>
        <button type="button" className="btn" aria-label={labels.binderNext} onClick={() => actions.current.next()}>
          →
        </button>
      </div>
    </div>
  );
}
