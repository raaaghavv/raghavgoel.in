import { site } from "@/config/site";
import CopyEmail from "./CopyEmail";
import Section from "./Section";
import s from "./Finish.module.css";

export default function Finish() {
  return (
    <div className={s.finish}>
      <div className={s.checker} aria-hidden="true" />
      <Section id="contact" className={s.section} size="xl">
        <div className={`wrap ${s.body}`}>
          <p className={s.pitch}>{site.contact.pitch}</p>
          <CopyEmail email={site.email} label={site.contact.copyLabel} done={site.contact.copiedLabel} />
          <ul className={s.stickers}>
            {site.socials.map((so) => (
              <li key={so.kind}>
                <a className={s.sticker} data-shape={so.sticker} href={so.href} target="_blank" rel="me noopener">
                  {so.label}
                  <small>{so.handle}</small>
                </a>
              </li>
            ))}
            <li>
              <a className={s.sticker} data-shape="block" href={site.resume.href} target="_blank" rel="noopener">
                Résumé<small>{site.resume.label}</small>
              </a>
            </li>
          </ul>
          <p className={s.foot}>{site.footnote}</p>
        </div>
      </Section>
    </div>
  );
}
