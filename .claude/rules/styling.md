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
- **Layout:** `.wrap` keeps a gutter and clears the rail on the right (`--content-right`). The page must never scroll
  horizontally. Only the deck row scrolls sideways, inside its own container. Check 390px.
- **Hover and entry share one pose.** If an entry effect replays a hover state, put both selectors on the same
  rule (e.g. `.flip:hover .inner, .deck[data-nudge] .inner`) so they can't drift apart.
- **Valid markup:** no block elements inside `<button>` (use spans with `display: block`), one `h1`, and an `h2` per section.
- Honor reduced motion: the global media query disables transitions and animations. JS effects check it themselves.
