---
paths:
  - "src/features/ride/**"
  - "src/lib/useEnter.ts"
  - "src/components/sections/WheelSpin.tsx"
  - "src/components/sections/DeckRow.tsx"
  - "src/components/sections/CardBinder.tsx"
  - "src/config/motion.ts"
---

# Ride engine and motion

- **Loading:** `RideLayer.tsx` server-renders its markup (everything starts hidden) and imports the engine statically,
  so the engine chunk is in the HTML and downloads alongside React. Measured on a throttled phone, `ssr: false` or a
  lazy `import()` fetches it only after hydration and starts the intro ~300 ms later. The engine must touch
  `window`/`document` only inside `startRide`, never at module scope.
- **Intro gate:** `bootScript.ts` sets `html[data-intro-wait]` before first paint (not for reduced motion or
  deep links), and the hero CSS hides the name while it is set. `startRide` clears it in the same task as it sets
  `data-intro="pre"`. After `motion.intro.waitFor`, the script shows the name and sets `data-intro-late`, and
  the engine then skips the intro.
- **Shape:** `RideLayer.tsx` renders overlay markup and calls `startRide()` once in an effect. Everything else is plain
  TypeScript in `engine/`:
  - `engine.ts`: the single rAF loop and orchestration
  - `skaterRig.ts`: three.js toon rig, inverted-hull outlines, `apply(pose)`, `lookAt`
  - `poses.ts`: poses and critically damped springs
  - `stunt.ts`: hero ↔ rail state machine and scroll intent
  - `rail.ts`: checkpoints, drag, snap, keyboard
  - `fx.ts`: 2D canvas particles
- **DOM contract:** the engine finds page anchors only through data attributes (`data-checkpoint`, `data-title`,
  `data-alias`, `data-dock`, `data-reveal-root`, `data-reveal`, `data-ride="…"`, `data-rail-cp`). Never query by id or
  hashed class. Adding a checkpoint must not require engine changes.
- **Numbers live in `config/motion.ts`,** colors and lighting in `config/theme.ts`. Code reads them. Don't inline magic numbers.
- **Start clean, clean up fully.** `startRide` must reset any state a previous run left (letters, data attributes),
  and its cleanup must restore the server-rendered markup and remove every listener, timer, observer, Lenis and WebGL
  resource. Dev StrictMode mounts twice, and production can remount.
- **Scroll:** Lenis owns smooth scrolling. Lock with `lenis.stop()`/`start()`, and glide with `lenis.scrollTo(..., { force, lock })`.
  Intercept wheel intent via Lenis's `virtualScroll` hook; touch and keys have their own handlers. Leave
  `history.scrollRestoration` alone, because the browser's native restore is what makes reloads land correctly.
- **One anchor per checkpoint** (`rail.ts`): the section's exact top, capped at the page bottom. The rail dot,
  "current" detection, the URL hash and every navigation path (stunt glide, dot click, `hashchange`, deep link, hero
  links) use it. Never scroll to a different offset, or the rider and dot fall out of sync.
- **The banner is the only thing that fires early:** `motion.banner.lead` (a fraction of the viewport) before the
  anchor, when scrolling down. A refresh or deep link shows the landed section's banner once.
- **URL hash** mirrors the current checkpoint via `history.replaceState` (no history spam). Deep links skip the intro
  and start in rail mode. `hashchange` navigates with the right move for the current mode.
- **Feel:** big transitions are triggered by intent and play on a timer, then glide. Continued input fast-forwards
  rather than being ignored. Joint poses go through springs. Spins use kick plus exponential friction. Speed effects
  scale with Lenis velocity.
- **Entry effects** use `useEnter(ref, enterAt, (el, dir) => cleanup)`. `enterAt` is a fraction of the _viewport_,
  applied to both edges. Tall grids on mobile still trigger, and a sliver at an edge counts as outside, so effects
  replay when scrolling back up. Directional effects follow `dir` (the card wave reverses, the wheels spin backwards).
  Each effect returns a cleanup that clears its timers.
- **Per-frame work:** write styles or data attributes directly. No React state per frame or per pointer move. Loops
  run only while something is moving.
- **Accessibility:** canvases are `aria-hidden`. The rider handle is a real `role="scrollbar"` with keyboard support.
  Under reduced motion or without WebGL (`ctx.simple`) there's no scroll hijacking and no particles.
