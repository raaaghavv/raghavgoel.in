import { experience } from "@/config/content/experience";
import { labels } from "@/config/sections";
import { Rich } from "@/lib/text";
import Section from "./Section";
import Stamp from "./Stamp";
import s from "./Experience.module.css";

export default function Experience() {
  const [cWhen, cWhere, cWhat] = labels.experienceColumns;
  return (
    <Section id="experience">
      <div className="wrap">
        <table className={s.log}>
          <thead>
            <tr className={s.head}>
              <th scope="col">{cWhen}</th>
              <th scope="col">{cWhere}</th>
              <th scope="col">{cWhat}</th>
            </tr>
          </thead>
          <tbody>
            {experience.map((e) => (
              <tr key={e.from + e.org} className={s.row}>
                <td className={s.when}>
                  {e.from}
                  {labels.rangeSeparator}
                  {e.to ?? <span className={s.now}>{labels.now}</span>}
                </td>
                <td className={s.where}>
                  <b>{e.title}</b>
                  <span>{e.org}</span>
                  {e.badge && <span className={s.lvl}>{e.badge}</span>}
                </td>
                <td className={s.what}>
                  <ul>
                    {e.points.map((pt) => (
                      <li key={pt}>
                        <Rich text={pt} />
                      </li>
                    ))}
                  </ul>
                  {e.stamp && <Stamp stamp={e.stamp} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
