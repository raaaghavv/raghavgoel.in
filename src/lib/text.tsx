import { Fragment, type ReactNode } from "react";

/** Renders `**bold**` segments from config copy as <b>. */
export function Rich({ text }: { text: string }): ReactNode {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith("**") ? <b key={i}>{part.slice(2, -2)}</b> : <Fragment key={i}>{part}</Fragment>,
    );
}

/** Same copy without markdown markers, for metadata and llms.txt. */
export const plain = (text: string) => text.replace(/\*\*/g, "");
