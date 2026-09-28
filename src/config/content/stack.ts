import type { DurometerTier, WheelGroup } from "@/types/content";

/** Highest `min` that a wheel's durometer reaches wins. */
export const durometerTiers: DurometerTier[] = [
  { min: 99, label: "daily" },
  { min: 92, label: "shipped" },
  { min: 0, label: "built with" },
];

/** Marks drawn on the durometer legend bar (scale runs from `range[0]` to `range[1]`). */
export const durometerScale = { range: [78, 101] as const, marks: [84, 92, 99] };

export const tierFor = (duro: number) => durometerTiers.find((t) => duro >= t.min)?.label ?? "";

export const wheelGroups: WheelGroup[] = [
  {
    name: "AI & agents",
    color: "pink",
    text: "ink",
    items: [
      { name: "Agents", duro: 99 },
      { name: "Claude SDK", duro: 99 },
      { name: "RAG", duro: 95 },
      { name: "OpenAI SDK", duro: 95 },
      { name: "Python", duro: 92 },
      { name: "LangChain", duro: 92 },
      { name: "Embeddings", duro: 92 },
      { name: "LLM memory", duro: 92 },
      { name: "MCP", duro: 92 },
      { name: "Gemini ADK", duro: 84 },
    ],
  },
  {
    name: "Backend & data",
    color: "acid",
    text: "ink",
    items: [
      { name: "Node.js", duro: 99 },
      { name: "Express", duro: 99 },
      { name: "WebSockets", duro: 99 },
      { name: "REST APIs", duro: 99 },
      { name: "SSE", duro: 95 },
      { name: "PostgreSQL", duro: 95 },
      { name: "Redis", duro: 92 },
      { name: "SQL", duro: 92 },
      { name: "GraphQL", duro: 88 },
      { name: "Qdrant", duro: 88 },
      { name: "Firestore", duro: 88 },
      { name: "Django", duro: 84 },
      { name: "Neo4j", duro: 84 },
    ],
  },
  {
    name: "Frontend",
    color: "white",
    text: "ink",
    items: [
      { name: "JavaScript", duro: 99 },
      { name: "React", duro: 99 },
      { name: "Next.js", duro: 99 },
      { name: "Tailwind", duro: 99 },
      { name: "Web Workers", duro: 95 },
      { name: "i18n / l10n", duro: 95 },
      { name: "Redux", duro: 92 },
    ],
  },
  {
    name: "DevOps & tools",
    color: "blue",
    text: "white",
    items: [
      { name: "Git", duro: 99 },
      { name: "Claude Code", duro: 99 },
      { name: "Docker", duro: 92 },
      { name: "GitHub Actions", duro: 92 },
      { name: "Linux / Bash", duro: 92 },
      { name: "AWS", duro: 88 },
      { name: "C++", duro: 84 },
    ],
  },
];
