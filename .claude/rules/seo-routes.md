---
paths:
  - "src/app/**"
  - "src/lib/seo.ts"
  - "src/config/crawlers.ts"
  - "src/config/seo.ts"
  - "next.config.ts"
---

# SEO, AI agents and routes

- **Static export constraints:** every route handler and code-generated metadata file declares
  `export const dynamic = "force-static"`. There are no request-time APIs, rewrites or server actions.
- **Images need extensions.** Generated images are route handlers at `app/og.png/route.tsx` and `app/icon.png/route.tsx`
  returning `ImageResponse`, not extensionless `opengraph-image`/`icon` files. That way any static host sends `image/png`.
- **Content in HTML:** everything a recruiter or crawler needs is server-rendered. Client-only layers are decorative
  (`aria-hidden`) and never hold unique content.
- **Metadata** is built from `site.ts` in `layout.tsx`: title template, canonical, OpenGraph/Twitter with `/og.png`,
  robots directives. Use the `viewport` export for theme color, not `metadata`.
- **JSON-LD** (`lib/seo.ts`): a `Person` graph with credentials, skills, employer, alumni and `sameAs`, plus `WebSite` and
  `ScholarlyArticle`. Inject it with a native `<script type="application/ld+json">` and escape `<`.
- **AI agents:** `robots.ts` allows `*` and names the AI crawlers from `config/crawlers.ts`. `/llms.txt` (index) and
  `/llms-full.txt` (full profile) are generated from config and linked from `<head>` and the sitemap. When content
  types change, update both generators.
- **Hydration:** `suppressHydrationWarning` is on `<body>` (browser-extension attributes) and `<html>` (the ride boot
  script's `data-intro-*` attributes) only. Don't use it anywhere else to hide real mismatches. Avoid `Date.now()`,
  `Math.random()` and locale formatting in server-rendered output.
- `next/dynamic` with `ssr: false` must be called from a `'use client'` file. The ride doesn't use it; see the
  ride-engine rule for why.
