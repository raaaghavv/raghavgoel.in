import { site } from "@/config/site";
import { checkpoints } from "@/config/sections";
import { Rich } from "@/lib/text";
import s from "./Hero.module.css";

/** Start line. The ride engine reads data-dock / data-reveal to choreograph the intro. */
export default function Hero() {
  const start = checkpoints[0];
  const { hero, name } = site;
  return (
    <section
      id={start.id}
      data-checkpoint={start.id}
      data-title={start.title}
      data-alias={start.alias}
      className={`wrap ${s.hero}`}
    >
      <div className={s.sky} aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <header className={s.topbar}>
        <span>
          {name.full} / portfolio &apos;{String(new Date().getFullYear()).slice(2)}
        </span>
        <span className={s.pill}>
          <i aria-hidden="true" />
          {site.availability}
        </span>
      </header>

      <div className={s.stage}>
        <ul className={s.tags} aria-label="Focus areas">
          {hero.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <h1 className={s.name} data-reveal-root="">
          <span className="sr-only">{name.full}</span>
          <span className={s.first} aria-hidden="true">
            {[...name.first.toUpperCase()].map((c, i) => (
              <span key={i} className={s.ch} data-reveal="">
                {c}
              </span>
            ))}
            <span className={s.last} data-reveal="">
              {name.last.toUpperCase()}
            </span>
          </span>
        </h1>
        <div className={s.ground}>
          <div className={s.dock} data-dock="" />
        </div>

        <div className={s.intro}>
          <div>
            <p className={s.sub}>
              <Rich text={hero.subheading} />
            </p>
            <span className={s.scribble} aria-hidden="true">
              {hero.scribble}
            </span>
          </div>
          <div className={s.ctas}>
            {hero.ctas.map((c) => (
              <a key={c.href} className="btn" href={c.href} data-primary={c.primary ? "" : undefined}>
                {c.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
