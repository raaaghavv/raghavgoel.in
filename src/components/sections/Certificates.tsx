import { certificates } from "@/config/content/certificates";
import Card from "./Card";
import CardBinder from "./CardBinder";
import Section from "./Section";

export default function Certificates() {
  const total = String(certificates.length).padStart(3, "0");
  return (
    <Section id="certificates">
      <div className="wrap">
        <CardBinder>
          {certificates.map((c, i) => (
            <li key={c.name}>
              <Card cert={c} number={`${String(i + 1).padStart(3, "0")}/${total}`} />
            </li>
          ))}
        </CardBinder>
      </div>
    </Section>
  );
}
