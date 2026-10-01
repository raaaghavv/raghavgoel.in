import type { SocialKind } from "@/types/content";

type IconName = SocialKind | "email" | "pin" | "send";

const paths: Partial<Record<IconName, { d: string; stroke?: boolean }>> = {
  email: {
    d: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm-.5 1L12 13l8.5-7",
    stroke: true,
  },
  linkedin: {
    d: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.6 4.77 6v5.45h-4v-4.83c0-1.15-.02-2.64-1.6-2.64-1.62 0-1.86 1.25-1.86 2.55v4.92h-4v-11Z",
  },
  github: {
    d: "M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z",
  },
  resume: { d: "M6 2.5h8l4.5 4.5v14.5h-12.5Zm8 0V7h4.5M9 12h6M9 15.5h6M9 19h3.5", stroke: true },
  pin: {
    d: "M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z",
  },
  send: { d: "M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z", stroke: true },
};

/** Small line/solid icons for the contact board (brand marks for LinkedIn and GitHub link to the profiles). */
export default function ParkIcon({ name }: { name: IconName }) {
  const p = paths[name];
  if (!p) return null;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {p.stroke ? (
        <path
          d={p.d}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path d={p.d} fill="currentColor" />
      )}
    </svg>
  );
}
