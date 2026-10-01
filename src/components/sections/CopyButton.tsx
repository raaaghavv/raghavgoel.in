"use client";

import { useState } from "react";
import s from "./Finish.module.css";

/** Copies `text` and pops a tooltip. If the clipboard is refused, selects the text shown in `selectId` instead. */
export default function CopyButton({
  text,
  label,
  done,
  selectId,
}: {
  text: string;
  label: string;
  done: string;
  selectId: string;
}) {
  const [shown, setShown] = useState(false);
  const select = () => {
    const el = document.getElementById(selectId);
    if (!el) return;
    const r = document.createRange();
    r.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(r);
  };
  const copy = () => {
    if (!navigator.clipboard) return select();
    navigator.clipboard.writeText(text).then(() => {
      setShown(true);
      window.setTimeout(() => setShown(false), 1500);
    }, select);
  };
  return (
    <button className={`${s.act} ${s.copy}`} type="button" onClick={copy}>
      {label}
      <span className={s.tip} data-show={shown ? "" : undefined} role="status" aria-live="polite">
        {shown ? done : ""}
      </span>
    </button>
  );
}
