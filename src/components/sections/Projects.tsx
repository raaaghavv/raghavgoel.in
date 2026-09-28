import { projects } from "@/config/content/projects";
import Deck from "./Deck";
import DeckRow from "./DeckRow";
import Section from "./Section";
import s from "./Projects.module.css";

export default function Projects() {
  return (
    <Section id="projects">
      <div className="wrap">
        <DeckRow className={s.decks}>
          {projects.map((p) => (
            <li key={p.name}>
              <Deck project={p} />
            </li>
          ))}
        </DeckRow>
      </div>
    </Section>
  );
}
