import type { ExperienceEntry } from "@/types/content";
import { publications, site } from "@/config/site";

export const experience: ExperienceEntry[] = [
  {
    from: "Oct 2025",
    title: "Full Stack Engineer",
    org: "ManufApp",
    badge: "LEVEL UP · intern → full stack",
    stamp: { value: "−82%", caption: "build time", ring: "17 min → 3 min" },
    points: [
      "Cut production build time from **17 minutes to 3** by migrating to Turbopack, converting CommonJS to ESM, enabling tree-shaking and lazy loading.",
      "Built the chat infrastructure for the in-product **AI agent**: cron job creation, CSV order import, user onboarding and machine downtime logging.",
      "Owned the ticket system, financial document system and **AI localization** pipeline end to end. Build notes are on the decks.",
    ],
  },
  {
    from: site.education.from,
    to: site.education.to,
    stamp: { value: "PUBLISHED", caption: "ICRTICC 2025", ring: "Taylor & Francis · CRC Press" },
    title: site.education.degree,
    org: site.education.school,
    points: publications.map((p) => `Published **“${p.title}”** at ${p.venue}.`),
  },
];
