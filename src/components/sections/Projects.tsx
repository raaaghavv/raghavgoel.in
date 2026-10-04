import { projects } from "@/config/content/projects";
import Deck from "./Deck";
import DeckRow from "./DeckRow";
import Section from "./Section";
import s from "./Projects.module.css";

/** title lines on a deck front, each title as big as its own longest line allows, up to a ceiling */
const TITLE_MAX = 38;
const titleLines = (p: (typeof projects)[number]) => p.lines ?? [p.name];
const titleSize = (lines: string[]) =>
  Math.min(TITLE_MAX, Math.floor(150 / (Math.max(...lines.map((l) => l.length)) * 0.74)));

export default function Projects() {
  return (
    <Section id="projects">
      <div className="wrap">
        <DeckRow className={s.decks}>
          {projects.map((p) => (
            <li key={p.name}>
              <Deck project={p} lines={titleLines(p)} titleSize={titleSize(titleLines(p))} />
            </li>
          ))}
        </DeckRow>
      </div>
    </Section>
  );
}
