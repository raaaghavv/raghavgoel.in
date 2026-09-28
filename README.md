# Raghav Goel — Skate Run portfolio

A 90s skate-zine portfolio. A code-built 3D skater rolls in, reveals the name, drifts to a stop, then jumps onto a
progress-bar scrollbar that you can grab and ride through the checkpoints to a course-clear finish.

Next.js 16 (App Router, static export) · TypeScript · three.js · Lenis · vanilla CSS modules. No Tailwind, no GSAP.

## Scripts

| Command                              | What it does                         |
| ------------------------------------ | ------------------------------------ |
| `npm run dev`                        | Dev server on http://localhost:3000  |
| `npm run build`                      | Static export to `out/`              |
| `npm start`                          | Serve `out/` locally                 |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit`              |
| `npm run format`                     | Format everything with Prettier      |
| `npm run check`                      | Format check, lint, typecheck, build |

## Editing content

Everything the page shows comes from `src/config`. Components never contain copy.

| File                             | Controls                                                                 |
| -------------------------------- | ------------------------------------------------------------------------ |
| `config/site.ts`                 | Name, role, description, email, socials, résumé, hero copy, contact copy |
| `config/sections.ts`             | Checkpoint order, titles, skate aliases, blurbs, UI labels               |
| `config/content/projects.ts`     | Decks (projects)                                                         |
| `config/content/stack.ts`        | Wheels (skills), durometer tiers and scale                               |
| `config/content/experience.ts`   | Run log (experience)                                                     |
| `config/content/certificates.ts` | Card binder (certificates)                                               |
| `config/crawlers.ts`             | AI crawlers welcomed in robots.txt                                       |
| `config/seo.ts`                  | Share image and icon paths/sizes                                         |

Adding a section: add an entry to `checkpoints` in `sections.ts`, create a component that wraps its content in
`<Section id="…">`, and render it in `app/page.tsx`. The rail, checkpoint numbers, banners and anchors follow automatically.

`**bold**` in copy is rendered as emphasis (`lib/text.tsx`).

## Theme and motion

- `config/theme.ts` is the single source for colors, card tints, skater colors, lighting and layout sizes. It is rendered
  as CSS variables in `app/layout.tsx` and imported directly by the three.js skater and the effects canvas.
- `config/motion.ts` holds every animation tunable: intro timeline, stunt and glide durations, springs, skater scales,
  rail behavior, speed lines, drift, celebration.
- Fonts load through `next/font` and are exposed as `--font-display`, `--font-body`, `--font-mono`, `--font-marker`.

## How the ride works

`features/ride` is client-only (`Ride.tsx` → `next/dynamic` with `ssr: false`). `RideLayer.tsx` renders the overlay;
`engine/` is plain TypeScript driven by one `requestAnimationFrame` loop:

- `skaterRig.ts`: toon-shaded rig with inverted-hull outlines, pose application, cursor look-at
- `poses.ts`: pose library, push cycle and critically damped joint springs
- `stunt.ts`: hero ↔ rail state machine; scroll intent triggers it, Lenis holds and glides the scroll
- `rail.ts`: checkpoint layout, drag with preserved offset, snap, keyboard scrollbar
- `fx.ts`: 2D canvas for smoke, sparks, skid marks, speed lines, confetti and fireworks

Sections are server-rendered markup. The engine finds them through data attributes: `data-checkpoint`, `data-title`,
`data-alias`, `data-dock`, `data-reveal-root`, `data-reveal`. Engine state is written back as data attributes
(`data-live`, `data-cur`, `data-show`…) that the CSS modules style.

With `prefers-reduced-motion` or no WebGL, there is no scroll lock or particles, and Lenis is off.

## SEO and AI agents

- All content is in the static HTML, so crawlers don't need to run JS.
- Metadata, OpenGraph/Twitter and canonical tags are built from `site.ts`. `/og.png` and `/icon.png` are generated at build time.
- JSON-LD includes `Person` (with credentials and skills), `WebSite` and `ScholarlyArticle`.
- `robots.txt` names the AI crawlers, alongside `sitemap.xml` and `manifest.webmanifest`.
- `/llms.txt` and `/llms-full.txt` are markdown profiles generated from the same config, so they never drift from the page.

## Deploy

Set `NEXT_PUBLIC_SITE_URL` (see `.env.example`) and deploy `out/` to any static host: Vercel, Netlify, Cloudflare Pages or S3.
