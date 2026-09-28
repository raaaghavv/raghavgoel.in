"use client";

import { useRef, useState } from "react";
import s from "./Finish.module.css";

export default function CopyEmail({ email, label, done }: { email: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);
  const select = () => {
    if (!ref.current) return;
    const r = document.createRange();
    r.selectNodeContents(ref.current);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(r);
  };
  const copy = () => {
    if (!navigator.clipboard) return select();
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }, select);
  };
  return (
    <div className={s.mail}>
      <a ref={ref} className={s.address} href={`mailto:${email}`}>
        {email}
      </a>
      <button className="btn" data-primary="" type="button" onClick={copy}>
        {copied ? done : label}
      </button>
    </div>
  );
}
