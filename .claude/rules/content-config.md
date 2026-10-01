---
paths:
  - "src/config/**"
  - "src/types/**"
  - "src/lib/text.tsx"
---

# Content and config

- `src/config` is the single source for the page, `llms.txt`, `llms-full.txt`, JSON-LD and metadata. A fact should
  exist in one place (e.g. education lives in `site.ts` and `experience.ts` references it).
- Every config shape has a type in `types/content.ts`. Extend the type first, then the data, then the component.
- **Copy voice:** plain, specific, outcome-first ("Cut production build time from 17 minutes to 3"). No filler, no
  hype, no em-dash asides. Skate vocabulary (decks, wheels, run log, card binder, checkpoints) is for labels and
  aliases. The substance stays professional.
- **Real content only.** If a fact isn't known (dates, stack, results), ask Raghav rather than inventing it, or mark
  it clearly as a placeholder.
- `**bold**` in copy renders as emphasis via `<Rich>`, and `plain()` strips it for text outputs.
- **Structured values over formatted strings.** Use date ranges as `from`/`to`, with an open end rendering the NOW badge.
  Use results as `{ value, unit }`, and durometer ratings as numbers mapped to tiers in `stack.ts`.
- UI labels (checkpoint word, banners, button text, column headers) live in `labels` in `config/sections.ts`.
- `site.url` comes from `NEXT_PUBLIC_SITE_URL`. Keep `.env.example` in sync with the default.
- **Contact form:** `site.contact.form.endpoint` comes from `NEXT_PUBLIC_CONTACT_ENDPOINT` (JSON POST of name, email,
  message, e.g. Formspree). Without it the form opens the visitor's email app with the message filled in. Never show
  "sent" unless the endpoint answered OK.
