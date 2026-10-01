import { durometerScale, tierFor, wheelGroups } from "@/config/content/stack";
import { colors } from "@/config/theme";
import Section from "./Section";
import WheelSpin from "./WheelSpin";
import s from "./Stack.module.css";

function Wheel({
  id,
  name,
  duro,
  color,
  text,
}: {
  id: string;
  name: string;
  duro: number;
  color: string;
  text: string;
}) {
  const label = `${name.toUpperCase()} · ${duro}A · `;
  return (
    <li className={s.wheel}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <g className={s.spin} data-spin="">
          <circle cx="60" cy="60" r="56" fill={color} stroke={colors.ink} strokeWidth="3" />
          <circle cx="60" cy="60" r="38" fill="rgb(0 0 0 / .12)" />
          <path id={id} d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" fill="none" />
          <text fontFamily="var(--font-mono)" fontWeight="600" fontSize="10" letterSpacing="1" fill={text}>
            <textPath href={`#${id}`} textLength="290" lengthAdjust="spacingAndGlyphs">
              {label + label}
            </textPath>
          </text>
          <circle cx="60" cy="60" r="24" fill={colors.paper} stroke={colors.ink} strokeWidth="3" />
          {[0, 60, 120].map((a) => (
            <rect
              key={a}
              x="57"
              y="42"
              width="6"
              height="36"
              rx="2"
              fill={colors.ink}
              transform={`rotate(${a} 60 60)`}
            />
          ))}
          <circle cx="60" cy="60" r="7" fill={colors.paper} stroke={colors.ink} strokeWidth="3" />
        </g>
      </svg>
      <b>{name}</b>
      <small>
        {duro}A · {tierFor(duro)}
      </small>
    </li>
  );
}

export default function Stack() {
  const [lo, hi] = durometerScale.range;
  const at = (v: number) => ((v - lo) / (hi - lo)) * 100;
  return (
    <Section id="stack">
      <div className="wrap">
        <div className={s.duro} aria-hidden="true">
          <span>{lo}A</span>
          <div className={s.bar}>
            {durometerScale.marks.map((m) => (
              <span key={m} style={{ left: `${at(m)}%` }}>
                {m}A
              </span>
            ))}
          </div>
          <span>{hi}A</span>
        </div>
        <WheelSpin className={s.groups} smokeClassName={s.smoke}>
          {wheelGroups.map((g, gi) => (
            <div key={g.name}>
              <h3>{g.name}</h3>
              <ul className={s.wheels}>
                {g.items.map((it, i) => (
                  <Wheel
                    key={it.name}
                    id={`wheel-${gi}-${i}`}
                    name={it.name}
                    duro={it.duro}
                    color={colors[g.color]}
                    text={colors[g.text]}
                  />
                ))}
              </ul>
            </div>
          ))}
        </WheelSpin>
      </div>
    </Section>
  );
}
