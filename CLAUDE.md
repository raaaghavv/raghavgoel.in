@AGENTS.md

# Skate Run — Raghav Goel's portfolio

A 90s skate-zine portfolio. A code-built 3D skater rolls in and reveals the name, then jumps onto a progress-bar
scrollbar that visitors ride through checkpoints (Projects → Stack → Experience → Certificates → Contact) to a
course-clear finish. The theme frames the content; the content itself reads like a senior engineer wrote it:
outcomes, numbers, systems.

Reference prototypes (single HTML files) live in `~/code/animations/skate-run*.html`. When porting or matching
behavior, measure against them rather than eyeballing.

## Stack

Next.js 16 App Router as a **static export** (`out/`), TypeScript (strict), three.js, Lenis. Vanilla CSS modules.
No Tailwind, no GSAP, no UI kits. Keep dependencies minimal: ask before adding one, and prefer a few lines of our own code.

## Architecture

- `src/config/`: **all content and every tunable.** Site copy, checkpoints, content lists, theme tokens (`theme.ts`),
  animation numbers (`motion.ts`), crawler list, SEO asset paths. Components never hard-code copy, colors or timings.
- `src/types/content.ts`: typed schemas for the config.
- `src/components/sections/`: server-rendered sections. Interactivity lives in small `'use client'` leaves
  (Deck, Card, CopyEmail, WheelSpin, DeckRow, CardBinder).
- `src/features/ride/`: the client-only animation layer (skater, rail scrollbar, effects), mounted via
  `next/dynamic({ ssr: false })` from a client file. `engine/` is framework-free TypeScript.
- `src/app/`: layout (fonts, metadata, theme CSS vars, JSON-LD), page composition, SEO/agent routes.
- `src/lib/`: shared helpers (`seo.ts`, `text.tsx` for `**bold**` copy, `useEnter.ts` for entry effects).

## Principles

1. **Config-driven.** New copy, sections, colors or timings go in `src/config`, typed in `types/content.ts`.
   Adding a checkpoint to `config/sections.ts` should be enough for the rail, numbering, banners and hash to follow.
2. **One visual language.** Everything is drawn in code (CSS, SVG, three.js toon shading, canvas) in the zine style:
   paper, thick ink outlines, pink/acid/blue accents. No stock images or icon packs.
3. **Content first, motion second.** Every word is in the static HTML and readable without JS. Animation is
   progressive enhancement and must respect `prefers-reduced-motion` and the no-WebGL fallback.
4. **Motion feels physical.** Prefer springs, friction and scroll-velocity-driven effects over fixed keyframes.
   Scroll _intent_ triggers big moments; never trap the user (extra input fast-forwards).
5. **Performance.** Per-frame work stays out of React state: write DOM styles or data attributes directly, and run rAF
   loops only while something moves.

## Commands

- `npm run dev`: dev server (StrictMode double-mounts effects, so code must survive start → cleanup → start)
- `npm run format`: Prettier over the repo (config in `.prettierrc.json`: 120 cols, double quotes, trailing commas)
- `npm run check`: format check, lint, typecheck and static build. This must pass before calling work done.
- `npm run build` then `npm start`: serve the static export locally

## Verifying changes

- `npm run check`, then a real browser pass (Playwright against the dev server or `out/`). Check: intro reveal and drift,
  scroll-triggered stunt and glide, rail drag and snap, checkpoint banners, hash deep links and reload, wheel spin,
  deck nudge, holo wave, course clear, Back to start, and a 390px viewport. There must be no console errors.
- For visual parity or layout questions, measure sizes and positions in the browser instead of guessing.

## Scoped rules

Deeper practices load automatically when you work on matching files (`.claude/rules/`):

- `styling.md`: CSS modules, tokens, data-attribute state, zine look
- `ride-engine.md`: engine shape, DOM contract, Lenis and scroll, entry effects, StrictMode-safe lifecycle
- `content-config.md`: config as the single source, typing, copy voice, structured values
- `seo-routes.md`: static-export constraints, metadata, JSON-LD, robots and llms.txt

## Working agreements

- Don't commit or push unless asked.
- Before using a Next.js API, check the bundled docs (`node_modules/next/dist/docs/`), because v16 differs from older versions.
- Keep the README's "Editing content" section in sync when config files or their meaning change.
