"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { Project, ThemeColor } from "@/types/content";
import { labels } from "@/config/sections";
import { motion } from "@/config/motion";
import DeckArt from "./DeckArt";
import s from "./Projects.module.css";

const kebab = (c: ThemeColor) => `var(--${c.replace(/[A-Z0-9]+/g, (m) => "-" + m.toLowerCase())})`;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A skateboard deck: cover art on the front (title, illustration, tag band), build notes on the grip-tape back.
 * Clicking it lifts the deck out of the row into a spotlight: it flies to the centre of the screen, grows to fit and
 * flips to its back over a dimmed page (a modal <dialog>, portalled to <body> so the row's scroll and zoom can't clip
 * or scale it). Esc, the close button or a click outside flies it back. Projects sizes each title to fit its deck.
 */
export default function Deck({
  project: p,
  lines,
  titleSize,
}: {
  project: Project;
  lines: string[];
  titleSize: number;
}) {
  const [open, setOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [closing, setClosing] = useState(false);
  const deckRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const hint = useId();
  const titleId = useId();
  const M = motion.deckSpotlight;

  const paint = {
    "--deck-bg": kebab(p.colors.bg),
    "--deck-title": kebab(p.colors.title),
    "--deck-shadow": kebab(p.colors.shadow),
    "--deck-band": kebab(p.colors.band),
    "--deck-band-text": kebab(p.colors.bandText),
    "--bolt": kebab(p.colors.bolt ?? "ink"),
  } as CSSProperties;
  // the result headline is sized to fit on one line where it can (20-30px); longer ones wrap evenly
  const resultSize = Math.max(20, Math.min(30, Math.floor(146 / (p.result.value.length * 0.66))));
  // the back title stays on one line: long names (a domain) step down from 18px
  const nameSize = Math.min(18, Math.floor(150 / (p.name.length * 0.74)));
  const [kProblem, kBuilt, kResult] = labels.deckResult;

  /** where the deck sits in the row, as a transform on the centred spotlight deck; and the centred, enlarged pose */
  const poses = () => {
    const r = deckRef.current!.getBoundingClientRect();
    const w = spotRef.current!.offsetWidth;
    const h = spotRef.current!.offsetHeight;
    const fit = Math.min(M.maxScale, (innerHeight * M.fill) / h, (innerWidth * M.fill) / w);
    const from = `translate(${r.left + r.width / 2 - innerWidth / 2}px, ${r.top + r.height / 2 - innerHeight / 2}px) scale(${r.width / w})`;
    return { from, to: `translate(0px, 0px) scale(${fit})` };
  };

  // opening: show the modal, fly the deck in from its spot in the row, flip it once it's moving
  useEffect(() => {
    if (!open) {
      // back in the row and visible again: hand focus back to the deck that was opened
      if (wasOpen.current) btnRef.current?.focus({ preventScroll: true });
      return;
    }
    wasOpen.current = true;
    const dialog = dialogRef.current!;
    const spot = spotRef.current!;
    dialog.showModal();
    document.documentElement.setAttribute("data-modal", "");
    const { from, to } = poses();
    spot.animate([{ transform: from }, { transform: to }], {
      duration: reduced() ? 0 : M.duration,
      easing: M.easing,
      fill: "forwards",
    });
    const t = requestAnimationFrame(() => setFlipped(true));
    return () => cancelAnimationFrame(t);
    // poses reads refs and the window at the moment of opening
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    if (closing) return;
    setClosing(true);
    setFlipped(false);
    const { from, to } = poses();
    const a = spotRef.current!.animate([{ transform: to }, { transform: from }], {
      duration: reduced() ? 0 : M.duration,
      easing: M.easing,
      fill: "forwards",
    });
    a.finished.then(() => {
      dialogRef.current?.close();
      document.documentElement.removeAttribute("data-modal");
      setOpen(false);
      setClosing(false);
    });
  };

  const links = (
    [
      ["live", p.live],
      ["demo", p.demo],
      ["repo", p.repo],
    ] as const
  ).filter(([, href]) => href);

  const front = (hidden?: boolean) => (
    <span className={`${s.face} ${s.front}`} style={paint} aria-hidden={hidden || undefined}>
      <span className={`${s.bolts} ${s.top}`} />
      <span className={s.title} style={{ fontSize: titleSize }}>
        {lines.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </span>
      <DeckArt art={p.art} className={s.art} />
      {p.live && <span className={s.live}>LIVE</span>}
      <span className={s.band}>
        <span className={s.tag}>{p.tag}</span>
      </span>
      <span className={`${s.bolts} ${s.bottom}`} />
    </span>
  );

  return (
    <article ref={deckRef} className={s.deck} data-lifted={open ? "" : undefined}>
      <h3 className="sr-only">
        {p.name}: {p.tag}. {p.problem} {p.built} {p.result.value} {p.result.unit}.
      </h3>
      <button
        ref={btnRef}
        type="button"
        className={s.flip}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={hint}
      >
        {/* the button is named by the front it shows (so voice control matches the screen); this is the hint */}
        <span id={hint} className="sr-only">
          {labels.flipHint}
        </span>
        <span className={s.inner}>{front()}</span>
      </button>

      {open &&
        createPortal(
          <dialog
            ref={dialogRef}
            className={s.spotlight}
            aria-labelledby={titleId}
            data-closing={closing ? "" : undefined}
            data-lenis-prevent=""
            onCancel={(e) => {
              e.preventDefault();
              close();
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <button type="button" className={s.spotClose} onClick={close}>
              ✕ {labels.deckClose}
            </button>
            <div ref={spotRef} className={s.spot} data-flipped={flipped ? "" : undefined}>
              <div className={s.inner}>
                {front(true)}
                <div className={`${s.face} ${s.back}`}>
                  <span className={s.backHead}>
                    <strong id={titleId} className={s.backTitle} style={{ fontSize: nameSize }}>
                      {p.name}
                    </strong>
                    <span className={s.category}>{p.category}</span>
                  </span>
                  <span>
                    <span className={s.k}>{kProblem}</span>
                    <span className={s.txt}>{p.problem}</span>
                  </span>
                  <span>
                    <span className={s.k}>{kBuilt}</span>
                    <span className={s.txt}>{p.built}</span>
                  </span>
                  <span className={s.result}>
                    <span className={s.k}>{kResult}</span>
                    <span className={s.num} style={{ fontSize: resultSize }}>
                      {p.result.value}
                    </span>
                    <span className={s.txt}>{p.result.unit}</span>
                  </span>
                  <span className={s.chips}>
                    {p.stack.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </span>
                  <span className={s.links}>
                    {links.map(([k, href]) => (
                      <a key={k} href={href} target="_blank" rel="noopener">
                        {labels.deckLinks[k]}
                        <span className="sr-only">: {p.name}</span> <span aria-hidden="true">↗</span>
                      </a>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </dialog>,
          document.body,
        )}
    </article>
  );
}
