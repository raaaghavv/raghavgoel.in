import type { Publication, SiteConfig } from "@/types/content";

const url = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://raghavgoel.in").replace(/\/$/, "");
const email = "work.raghav01@gmail.com";

export const site: SiteConfig = {
  name: { first: "Raghav", last: "Goel", full: "Raghav Goel" },
  role: "Full-stack engineer",
  description:
    "Raghav Goel is a full-stack engineer at ManufApp building AI agents, real-time systems and the cloud infrastructure behind them.",
  url,
  locale: "en_IN",
  email,
  location: "Greater Noida, India",
  timezone: { label: "UTC +5:30", iana: "Asia/Kolkata" },
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
    reachTitle: "Reach me",
    emailLabel: "Email",
    copyLabel: "Copy",
    copiedLabel: "Copied!",
    openLabel: "Open",
    basedIn: "Based in",
    sticker: "Let's build something!",
    tag: "RG '26",
    form: {
      title: "Send a message",
      web3formsKey: process.env.NEXT_PUBLIC_WEB3FORMS_KEY || undefined,
      endpoint: "https://api.web3forms.com/submit",
      fromName: "Portfolio contact form",
      fields: {
        name: { label: "Name", placeholder: "Your name", error: "Name is required" },
        email: { label: "Email", placeholder: "you@company.com", error: "Enter an email I can reply to" },
        message: { label: "Message", placeholder: "What are you building?", error: "Tell me a little about it" },
      },
      send: "Send message",
      sending: "Sending…",
      sent: "Sent. I'll get back to you soon.",
      failed: "That didn't go through. Email me directly:",
      opening: "Opening your email app with the message filled in.",
      subject: "Portfolio: message from {name}",
    },
  },
  socials: [
    { kind: "linkedin", label: "LinkedIn", handle: "raghav-goel01", href: "https://www.linkedin.com/in/raghav-goel01" },
    { kind: "github", label: "GitHub", handle: "raaaghavv", href: "https://github.com/raaaghavv" },
  ],
  resume: { title: "Résumé", href: "/resume/RaghavGoel_Resume.pdf", label: "one page · PDF" },
  footnote: "Skater, skates and every graphic on this page are drawn in code.",
};

export const publications: Publication[] = [
  {
    title: "A Comparative Analysis of CNN and Stacked LSTM Models for Solar Power Generation Forecasting",
    venue: "ICRTICC-2025, GCET Greater Noida (Taylor & Francis, CRC Press)",
    authors: ["R. Goel", "A. Fatima", "Abhilasha", "T. Shree"],
  },
];
