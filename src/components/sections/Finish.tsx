import { site } from "@/config/site";
import ContactForm from "./ContactForm";
import CopyButton from "./CopyButton";
import LocalTime from "./LocalTime";
import ParkEntry from "./ParkEntry";
import ParkIcon from "./ParkIcon";
import { LeanDeck, ParkProps } from "./ParkScene";
import Section from "./Section";
import s from "./Finish.module.css";

/**
 * The finish line: a painted contact board standing in a skatepark, its posts running off the bottom of the page.
 * Links and location on the left, a message form on the right.
 */
export default function Finish() {
  const c = site.contact;
  const place = site.location.split(", ").at(-1);
  const links = [
    ...site.socials.map((so) => ({ kind: so.kind, label: so.label, value: so.handle, href: so.href, me: true })),
    { kind: "resume" as const, label: site.resume.title, value: site.resume.label, href: site.resume.href, me: false },
  ];
  return (
    <div className={s.finish}>
      <div className={s.checker} aria-hidden="true" />
      <Section id="contact" className={s.section} size="xl">
        <div className={`wrap ${s.headRow}`}>
          <p className={s.pitch}>{c.pitch}</p>
          <p className={s.foot}>{site.footnote}</p>
        </div>

        <div className={s.park}>
          <div className={s.scene} aria-hidden="true">
            <div className={s.trees} />
            <div className={s.fence} />
            <div className={s.ground} />
            <ParkProps className={s.props} />
          </div>

          <ParkEntry className={s.rig}>
            <div className={s.stand}>
              <div className={s.posts} aria-hidden="true">
                <i />
                <i />
              </div>
              <div className={s.board}>
                <div className={s.bulbs} aria-hidden="true">
                  {Array.from({ length: 16 }, (_, i) => (
                    <i key={i} />
                  ))}
                </div>

                <div className={s.reach}>
                  <h3 className={s.tagHead}>{c.reachTitle} →</h3>
                  <ul className={s.contacts}>
                    <li>
                      <span className={s.ico}>
                        <ParkIcon name="email" />
                      </span>
                      <span className={s.who}>
                        <b>{c.emailLabel}</b>
                        <span id="contact-address">{site.email}</span>
                      </span>
                      <CopyButton
                        text={site.email}
                        label={c.copyLabel}
                        done={c.copiedLabel}
                        selectId="contact-address"
                      />
                    </li>
                    {links.map((l) => (
                      <li key={l.kind}>
                        <span className={s.ico}>
                          <ParkIcon name={l.kind} />
                        </span>
                        <span className={s.who}>
                          <b>{l.label}</b>
                          <span>{l.value}</span>
                        </span>
                        <a
                          className={s.act}
                          href={l.href}
                          target="_blank"
                          rel={l.me ? "me noopener" : "noopener"}
                          aria-label={`${c.openLabel} ${l.label}`}
                        >
                          {c.openLabel} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className={s.based}>
                    <span className={s.lab}>{c.basedIn}</span>
                    <div className={s.place}>
                      <ParkIcon name="pin" />
                      {place}
                      <LocalTime className={s.chip} label={site.timezone.label} timeZone={site.timezone.iana} />
                    </div>
                  </div>
                </div>

                <span className={s.rule} aria-hidden="true" />

                <div className={s.msg}>
                  <h3 className={s.msgHead}>↪ {c.form.title}</h3>
                  <ContactForm />
                </div>

                <span className={s.sticker} data-slap="" aria-hidden="true">
                  {c.sticker}
                </span>
              </div>
              <span className={s.lean} data-lean="">
                <LeanDeck />
              </span>
            </div>
          </ParkEntry>
        </div>
      </Section>
    </div>
  );
}
