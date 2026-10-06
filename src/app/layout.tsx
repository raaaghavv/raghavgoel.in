import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Archivo, Bowlby_One, IBM_Plex_Mono, Permanent_Marker } from "next/font/google";
import { site } from "@/config/site";
import { colors, themeCss } from "@/config/theme";
import { personJsonLd } from "@/lib/seo";
import { iconImage, ogImage } from "@/config/seo";
import { rideBootScript } from "@/features/ride/bootScript";
import "@/styles/globals.css";

const bowlby = Bowlby_One({ weight: "400", subsets: ["latin"], variable: "--font-bowlby", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const plexMono = IBM_Plex_Mono({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
});
const marker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-permanent-marker",
  display: "swap",
});

const title = `${site.name.full} — ${site.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s · ${site.name.full}` },
  description: site.description,
  applicationName: site.name.full,
  authors: [{ name: site.name.full, url: site.url }],
  creator: site.name.full,
  keywords: [site.name.full, site.role, "AI agents", "RAG", "Next.js", "Node.js", "portfolio", site.employer.name],
  alternates: { canonical: "/" },
  icons: { icon: [{ url: iconImage.path, type: "image/png", sizes: `${iconImage.size}x${iconImage.size}` }] },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: site.name.full,
    title,
    description: site.description,
    locale: site.locale,
    firstName: site.name.first,
    lastName: site.name.last,
    images: [{ url: ogImage.path, width: ogImage.width, height: ogImage.height, alt: title }],
  },
  twitter: { card: "summary_large_image", title, description: site.description, images: [ogImage.path] },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = { themeColor: colors.paper, colorScheme: "light" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // the ride boot script sets data-intro-wait on <html> before hydration (this element's attributes only)
    <html
      lang="en"
      className={`${bowlby.variable} ${archivo.variable} ${plexMono.variable} ${marker.variable}`}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
        {/* runs before first paint: hides the hero name until the intro takes over (features/ride/bootScript.ts) */}
        <script dangerouslySetInnerHTML={{ __html: rideBootScript() }} />
        {/* without JS nothing arms the entry effects, so show anything that waits to be revealed */}
        <noscript>
          <style>{"[data-armed]{opacity:.9!important}"}</style>
        </noscript>
        <link rel="alternate" type="text/markdown" href="/llms.txt" title="LLM-readable profile" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()).replace(/</g, "\\u003c") }}
        />
      </head>
      {/* browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes to <body> before hydration */}
      <body suppressHydrationWarning>
        {children}
        {/* Vercel Web Analytics: cookieless page views; its script is served by Vercel, so it only runs there */}
        <Analytics />
      </body>
    </html>
  );
}
