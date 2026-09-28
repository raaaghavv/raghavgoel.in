import type { ReactNode } from "react";
import { checkpointNumber, getCheckpoint, labels } from "@/config/sections";
import s from "./Section.module.css";

/** A checkpoint section: the real title big, the skate alias as a sticker. */
export default function Section({
  id,
  children,
  className = "",
  size,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  size?: "xl";
}) {
  const c = getCheckpoint(id);
  return (
    <section
      id={c.id}
      data-checkpoint={c.id}
      data-title={c.title}
      data-alias={c.alias}
      aria-labelledby={`${c.id}-title`}
      className={`${s.section} ${className}`}
      data-size={size}
    >
      <div className="wrap">
        <div className={s.head}>
          <span className="tape">
            {labels.checkpoint} {checkpointNumber(c.id)}
          </span>
          <div className={s.title}>
            <h2 id={`${c.id}-title`}>{c.title}</h2>
            <span className={s.alias} aria-hidden="true">
              {c.alias}
            </span>
          </div>
          {c.blurb && <p>{c.blurb}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
