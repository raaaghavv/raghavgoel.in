import type { Publication, SiteConfig } from "@/types/content";

const url = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://raghavgoel.in").replace(/\/$/, "");

export const site: SiteConfig = {
  name: { first: "Raghav", last: "Goel", full: "Raghav Goel" },
  role: "Full-stack engineer",
  description:
    "Raghav Goel is a full-stack engineer at ManufApp building AI agents, real-time systems and the cloud infrastructure behind them.",
  url,
  locale: "en_IN",
  email: "work.raghav01@gmail.com",
  location: "Greater Noida, India",
  availability: "Open to work",
  employer: { name: "ManufApp" },
  education: {
    school: "Galgotias College of Engineering and Technology",
    degree: "B.Tech, Computer Science & Design",
    from: "2021",
    to: "2025",
  },
  hero: {
    tags: ["Full-stack engineer", "Agentic orchestration & systems", "Cloud & DevOps"],
    subheading:
      "I build AI products end to end: **the model calls, the product around them, and the infra** that keeps them up at 3am.",
    scribble: "scroll to drop in ↓",
    ctas: [
      { label: "See the projects", href: "#projects", primary: true },
      { label: "Contact", href: "#contact" },
    ],
  },
  contact: {
    pitch: "Building with AI agents or real-time systems? Tell me what you're working on.",
    copyLabel: "Copy email",
    copiedLabel: "Copied",
  },
  socials: [
    { kind: "github", label: "GitHub", handle: "raaaghavv", href: "https://github.com/raaaghavv", sticker: "tag" },
    {
      kind: "linkedin",
      label: "LinkedIn",
      handle: "raghav-goel01",
      href: "https://www.linkedin.com/in/raghav-goel01",
      sticker: "round",
    },
  ],
  resume: { href: "/resume/RaghavGoel_Resume.pdf", label: "one page · PDF" },
  footnote: "Skater, skates and every graphic on this page are drawn in code.",
};

export const publications: Publication[] = [
  {
    title: "A Comparative Analysis of CNN and Stacked LSTM Models for Solar Power Generation Forecasting",
    venue: "ICRTICC-2025, GCET Greater Noida (Taylor & Francis, CRC Press)",
    authors: ["R. Goel", "A. Fatima", "Abhilasha", "T. Shree"],
  },
];
