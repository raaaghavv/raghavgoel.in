import { site, publications } from "@/config/site";
import { wheelGroups } from "@/config/content/stack";
import { certificates } from "@/config/content/certificates";
import { experience } from "@/config/content/experience";
import { projects } from "@/config/content/projects";
import { checkpoints, labels } from "@/config/sections";
import { plain } from "./text";

/** schema.org graph for the home page. */
export function personJsonLd() {
  const person = {
    "@type": "Person",
    "@id": `${site.url}/#person`,
    name: site.name.full,
    url: site.url,
    email: `mailto:${site.email}`,
    jobTitle: site.role,
    description: site.description,
    worksFor: {
      "@type": "Organization",
      name: site.employer.name,
      ...(site.employer.url ? { url: site.employer.url } : {}),
    },
    alumniOf: { "@type": "CollegeOrUniversity", name: site.education.school },
    homeLocation: { "@type": "Place", name: site.location },
    sameAs: site.socials.map((s) => s.href),
    knowsAbout: wheelGroups.flatMap((g) => g.items.map((i) => i.name)),
    hasCredential: certificates.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      name: c.name,
      credentialCategory: "certificate",
      recognizedBy: { "@type": "Organization", name: c.issuer },
    })),
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      person,
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name.full,
        author: { "@id": `${site.url}/#person` },
      },
      ...publications.map((p) => ({
        "@type": "ScholarlyArticle",
        headline: p.title,
        author: p.authors.map((name) => ({ "@type": "Person", name })),
        publisher: p.venue,
      })),
    ],
  };
}

/** Short markdown index for AI agents (llms.txt convention). */
export function llmsTxt() {
  const sec = (id: string) => checkpoints.find((c) => c.id === id)!;
  return [
    `# ${site.name.full}`,
    "",
    `> ${site.description}`,
    "",
    `${site.role} · ${site.location} · ${site.availability}. Contact: ${site.email}`,
    "",
    "## Pages",
    `- [Portfolio](${site.url}/): ${checkpoints
      .slice(1)
      .map((c) => c.title)
      .join(", ")}`,
    `- [Full profile for LLMs](${site.url}/llms-full.txt): every project, skill, role and certificate as markdown`,
    `- [Résumé](${site.resume.href})`,
    "",
    `## ${sec("experience").title}`,
    ...experience.map((e) => `- ${e.title}, ${e.org} (${e.from}${labels.rangeSeparator}${e.to ?? "present"})`),
    "",
    `## ${sec("projects").title}`,
    ...projects.map((p) => `- ${p.name}: ${p.tag}. ${p.result.value} ${p.result.unit}.`),
    "",
    "## Links",
    ...site.socials.map((s) => `- [${s.label}](${s.href})`),
    "",
  ].join("\n");
}

/** Full markdown dump of the page content for AI agents. */
export function llmsFullTxt() {
  const out: string[] = [
    `# ${site.name.full} — ${site.role}`,
    "",
    site.description,
    "",
    `- Location: ${site.location}`,
    `- Status: ${site.availability}`,
    `- Email: ${site.email}`,
    `- Website: ${site.url}`,
    ...site.socials.map((s) => `- ${s.label}: ${s.href}`),
    "",
  ];
  out.push("## Experience", "");
  experience.forEach((e) => {
    out.push(
      `### ${e.title}, ${e.org} (${e.from}${labels.rangeSeparator}${e.to ?? "present"})`,
      "",
      ...(e.orgUrl ? [`- Website: ${e.orgUrl}`] : []),
      ...e.points.map((pt) => `- ${plain(pt)}`),
      "",
    );
  });
  out.push("## Projects", "");
  projects.forEach((p) => {
    out.push(
      `### ${p.name} (${p.meta})`,
      "",
      `- ${p.tag}`,
      `- Problem: ${p.problem}`,
      `- Built: ${p.built}`,
      `- Result: ${p.result.value}, ${p.result.unit}`,
      `- Stack: ${p.stack.join(", ")}`,
      ...(p.live ? [`- Live: ${p.live}`] : []),
      ...(p.demo ? [`- Demo: ${p.demo}`] : []),
      `- Code: ${p.repo}`,
      "",
    );
  });
  out.push(
    "## Skills",
    "",
    "Durometer rating: 99 = daily use at work, 92 = shipped in real projects, 84 = built with.",
    "",
  );
  wheelGroups.forEach((g) => out.push(`- ${g.name}: ${g.items.map((i) => `${i.name} (${i.duro})`).join(", ")}`));
  out.push(
    "",
    "## Certificates",
    "",
    ...certificates.map((c) => `- ${c.name} — ${c.issuer}, ${c.date}${c.hours ? `, ${c.hours.toLowerCase()}` : ""}`),
    "",
  );
  out.push("## Publications", "", ...publications.map((p) => `- ${p.title}. ${p.authors.join(", ")}. ${p.venue}.`), "");
  return out.join("\n");
}
