---
paths:
  - "src/**/*.css"
  - "src/components/**"
  - "src/features/ride/*.tsx"
---

# Styling

- **Vanilla CSS modules**, colocated with the component (`Hero.tsx` + `Hero.module.css`). Global CSS is only
  `styles/globals.css`: reset, base, halftone paper, Lenis rules, and shared primitives (`.wrap`, `.tape`, `.btn`, `.sr-only`).
- **Tokens only.** Colors, card tints and layout sizes are CSS variables generated from `config/theme.ts`
  (`themeCss()` in layout). Fonts are `--font-display`, `--font-body`, `--font-mono` and `--font-marker`. Don't write raw
  hex in components. If a new color is needed, add it to `theme.ts` so three.js and canvas code share it.
- **State via data attributes**, not class toggles. CSS module class names are hashed, so JS (the engine, entry
  effects) sets `data-live`, `data-cur`, `data-show`, `data-nudge`, `data-shine`, `data-flipped`… and CSS matches on
  them. Global states on `<html>` (`data-grabbing`, `data-no-gl`) are targeted with `:global(html[data-…])`.
- **Specificity:** when one module overrides another module's element, scope it (`.finish .section`) or pass a prop
  that sets a data attribute (`<Section size="xl">`). Don't rely on stylesheet load order.
- **Look:** thick ink borders, hard offset shadows (`var(--shadow)`), slight rotations for stickers and tape, Bowlby
  One for display, Archivo for body (use `font-stretch` for width), Plex Mono for labels, Permanent Marker for scribbles.
  Uppercase labels get letter-spacing.
- **Layout:** `.wrap` keeps a gutter and, on desktop, clears the rail on the right (`--content-right`). On phones
  (≤700px) the rail runs along the bottom, so content is full width. The page
  must never scroll horizontally. Only the deck row and the phone wheel rows scroll sideways, inside their own
  containers; a grid or flex child holding one needs `min-width: 0`. Check 390px.
- **Phone layouts:** the deck row runs edge to edge and `DeckRow` zooms the decks (within `layout.deckRow`) so the
  screen always ends partway through a deck. Wheels are 2-row sideways strips, certificates are a fanned deck (`CardBinder` sets `--d`
  depth and `--dx` drag; desktop ignores both).
- **Hover and entry share one pose.** If an entry effect replays a hover state, put both selectors on the same
  rule (e.g. `.flip:hover .inner, .deck[data-nudge] .inner`) so they can't drift apart.
- **Valid markup:** no block elements inside `<button>` (use spans with `display: block`), one `h1`, and an `h2` per section.
- Honor reduced motion: the global media query disables transitions and animations. JS effects check it themselves.
- **The finish (Contact):** a painted contact board standing in a skatepark that runs off the bottom of the page.
  The fence, trees and concrete are fixed-size CSS tiles that repeat to any width; the props (`ParkScene.tsx`) scale
  only up to 1440px. The board sits in the same content box as `.wrap`, so on desktop it stays clear of the rail.
  Scene and board colours are `--park-*` tokens (`parkColors` in theme.ts).
