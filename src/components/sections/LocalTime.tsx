"use client";

import { useEffect, useState } from "react";

/** "UTC +5:30 · 3:42 pm": the label server-renders; the live time is added in the browser and flips on the minute. */
export default function LocalTime({
  label,
  timeZone,
  className,
}: {
  label: string;
  timeZone: string;
  className?: string;
}) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone });
    const tick = () => setTime(fmt.format(new Date()).toLowerCase());
    tick();
    // line up with the start of each minute so the display flips when the clock does
    let id = 0;
    const start = window.setTimeout(
      () => {
        tick();
        id = window.setInterval(tick, 60_000);
      },
      60_000 - (Date.now() % 60_000),
    );
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [timeZone]);
  return (
    <span className={className}>
      {label}
      {time && ` · ${time}`}
    </span>
  );
}
