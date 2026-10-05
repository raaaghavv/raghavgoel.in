"use client";

import { useEffect } from "react";
import { site } from "@/config/site";

/**
 * The hero name is one inline-block per letter in a flex row, so a plain copy puts each letter on its own line.
 * This rewrites the clipboard when a selection touches the name: the whole name copies as "Raghav Goel", part of it
 * as the selected letters run together, and a selection spanning more of the page keeps its text with the name
 * fixed. Renders nothing.
 */
export default function NameCopy() {
  useEffect(() => {
    const root = document.querySelector("[data-reveal-root]");
    if (!root) return;
    const { first, last, full } = site.name;
    // the name as the browser serialises it: every letter, with any whitespace between them
    const spread = new RegExp([...(first + last).toUpperCase()].join("\\s*"));
    const onCopy = (e: ClipboardEvent) => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !e.clipboardData) return;
      const range = sel.getRangeAt(0);
      if (!range.intersectsNode(root)) return;
      const text = sel.toString();
      const fixed = spread.test(text)
        ? text.replace(spread, full)
        : root.contains(range.commonAncestorContainer)
          ? text.replace(/\s+/g, "")
          : text;
      e.clipboardData.setData("text/plain", fixed);
      e.preventDefault();
    };
    document.addEventListener("copy", onCopy);
    return () => document.removeEventListener("copy", onCopy);
  }, []);
  return null;
}
