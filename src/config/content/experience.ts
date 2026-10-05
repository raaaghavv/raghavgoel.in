import type { ExperienceEntry } from "@/types/content";
import { publications, site } from "@/config/site";

export const experience: ExperienceEntry[] = [
  {
    from: "Oct 2025",
    title: "Full-Stack Engineer",
    org: site.employer.name,
    orgUrl: site.employer.url,
    badge: "OWNS 5 SYSTEMS IN PROD",
    stamp: { value: "−82%", caption: "deploy time", ring: "17 min → 3 min" },
    points: [
      "**Own the in-app support desk** as engineer, product owner and QA, from the ticket form to daily standups and triage. Resolution time fell from **weeks to 2–3 days** at ~600 tickets a month.",
      "Built its **AI agents**: they classify every ticket (**94% priority, 91% type accuracy**), trace the root cause through chat history, similar past tickets and the code, and open fix PRs for clear bugs, **~25 merged a month**.",
      "Co-maintain the **agent platform** with one other engineer: LangGraph agents on AWS Lambda calling ~160 ERP tools through an MCP server, **2,500+ runs a month across 45 companies** at 98.6% success.",
      "Built **per-client PDF templates** for 12 document types, used by 30–40 companies. Layout changes that took a **full sprint are now self-serve**, and **100 PDFs download in one click in under 18 s**.",
      "Cut the **deploy pipeline from 17 min to 3** (build alone: 1m 40s). Moved to ESM so Turbopack could replace webpack, dropped 30+ re-transpiled packages, and made 2,100+ lodash call sites tree-shakeable.",
      "Built the **WebSocket layer** behind agent chat, notifications and live ticket updates (~200 live connections), and **configurable reports** that replaced 22 fixed report types for 30–40 companies.",
    ],
  },
  {
    from: "Jan 2025",
    to: "Jul 2025",
    title: "Developer & Social Media Manager",
    org: "CraftyyDrafty",
    badge: "FREELANCE · REMOTE",
    stamp: { value: "2K", caption: "followers", ring: "organic · Instagram" },
    points: [
      "Gave the business its **first brand presence**: designed its website in Figma and built it in React.",
      "Managed its **social media**: grew Instagram to **2,000 organic followers**, recording and editing the clips myself.",
      "Co-ran **workshops and webinars**.",
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
