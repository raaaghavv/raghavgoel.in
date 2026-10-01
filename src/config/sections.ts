import type { Checkpoint } from "@/types/content";

/**
 * The course, in order. The rail, checkpoint numbers (#01…), banners and
 * in-page anchors are all derived from this list. The first entry is the
 * hero start line and the last entry is the finish line.
 */
export const checkpoints: Checkpoint[] = [
  { id: "start", title: "Start", alias: "start" },
  {
    id: "projects",
    title: "Projects",
    alias: "the decks",
    blurb:
      "Four systems I built at ManufApp and two side projects running live. Tap a deck to flip it: the problem, what I built, and the result.",
  },
  {
    id: "stack",
    title: "Stack",
    alias: "wheels",
    blurb:
      "Durometer is how hard a skate wheel is. Here it's how much I've ridden each tool: 99A is daily at work, 92A has shipped in real projects, 84A I've built with.",
  },
  { id: "experience", title: "Experience", alias: "run log", blurb: "Where I've skated and what landed." },
  {
    id: "certificates",
    title: "Certificates",
    alias: "card binder",
    blurb: "Courses I've finished, collected like trading cards. Starred cards are from Anthropic.",
  },
  { id: "contact", title: "Contact", alias: "finish line" },
];

export const checkpointNumber = (id: string) => {
  const i = checkpoints.findIndex((c) => c.id === id);
  return "#" + String(i).padStart(2, "0");
};

export const getCheckpoint = (id: string) => {
  const c = checkpoints.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown checkpoint "${id}"`);
  return c;
};

export const labels = {
  checkpoint: "Checkpoint",
  finishBanner: "Course clear!",
  finishTrophy: "🏆",
  backToStart: { icon: "↑", text: "Back to start" },
  railHint: ["grab me", "& ride ↓"],
  runReadout: "Run",
  experienceColumns: ["When", "Where", "What landed"],
  now: "Now",
  rangeSeparator: " — ",
  flipHint: "Flip for build notes",
  deckResult: ["Problem", "Built", "Result"],
};
