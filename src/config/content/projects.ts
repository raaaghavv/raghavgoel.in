import type { Project } from "@/types/content";

export const projects: Project[] = [
  {
    name: "AGENT CHAT",
    graphic: "dot",
    meta: "ManufApp · 2025–26",
    tag: "Chat infra for an AI agent",
    problem: "Ops teams used separate screens to schedule jobs, create orders and log machine downtime.",
    built:
      "Chat infrastructure for an AI agent that creates cron jobs, turns CSVs into orders, onboards users and logs downtime.",
    result: { value: "4 flows", unit: "handled by one agent chat" },
    stack: ["Agents", "Node.js", "React"],
  },
  {
    name: "TICKETS",
    graphic: "stripes",
    meta: "ManufApp · 2025–26",
    tag: "Support desk",
    problem: "Customer support ran on Excel sheets.",
    built:
      "Ticket management with attachments, prioritization, admin workflows and live WebSocket chat. Owned end to end.",
    result: { value: "Excel → app", unit: "support workflow replaced" },
    stack: ["WebSockets", "Node.js", "React"],
  },
  {
    name: "DOCGEN",
    graphic: "checker",
    meta: "ManufApp · 2026",
    tag: "Financial documents",
    problem: "Financial documents were produced one at a time.",
    built: "12 customizable document types with bulk generation and download, parallelized in Web Workers.",
    result: { value: "~18s", unit: "for 100+ documents" },
    stack: ["Web Workers", "React", "Node.js"],
  },
  {
    name: "LOCALIZE",
    graphic: "star",
    meta: "ManufApp · 2026",
    tag: "AI localization infra",
    problem: "Every translation round took days.",
    built: "AI-powered localization pipeline for 5 languages. It supported the product’s expansion into Vietnam.",
    result: { value: "days → min", unit: "translation turnaround" },
    stack: ["LLMs", "i18n", "Next.js"],
  },
  {
    name: "API WATCH",
    graphic: "halftone",
    meta: "Side project · Jan 2026",
    tag: "Live API logs over SSE",
    live: true,
    problem: "Watching API logs meant refreshing a page.",
    built:
      "SSE server with keep-alive streams and multi-client broadcast, plus a useSSE React hook with auto-reconnect and rolling log buffers.",
    result: { value: "SSE", unit: "real-time, auto-reconnecting" },
    stack: ["Express", "SSE", "React"],
  },
  {
    name: "PERSONA AI",
    graphic: "split",
    meta: "Side project · Sep 2025",
    tag: "Chat with creator personas",
    live: true,
    problem: "Generic assistants all sound the same.",
    built:
      "Persona chat that mimics the tone and style of creators and fictional characters, with streaming replies, multilingual support and rich markdown.",
    result: { value: "Streaming", unit: "multilingual persona chat" },
    stack: ["OpenAI SDK", "Gemini", "Next.js"],
  },
];
