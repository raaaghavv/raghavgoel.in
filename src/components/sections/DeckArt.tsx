import type { DeckArt as Art } from "@/types/content";

/* Cover art for the deck fronts, one per project, drawn in the site palette with ink outlines. */

const ink = "var(--ink)";
const pink = "var(--pink)";
const acid = "var(--acid)";
const blue = "var(--blue)";
const white = "var(--white)";
const paper = "var(--paper)";
/* greys mixed from the palette for screens, grooves and dimmed text */
const shade = (pct: number) => `color-mix(in srgb, ${ink} ${pct}%, ${paper})`;
const mono = { fontFamily: "var(--font-mono)", fontWeight: 600 };
const body = { fontFamily: "var(--font-body)", fontWeight: 600 };
const line = { stroke: ink, strokeWidth: 3, strokeLinejoin: "round", strokeLinecap: "round" } as const;

/** UpStream: file chunks stacking up past an upload arrow, one marked as resuming */
function Upload() {
  return (
    <>
      <g {...line}>
        <rect x="30" y="150" width="70" height="26" fill={acid} />
        <rect x="30" y="118" width="70" height="26" fill={acid} />
        <rect x="30" y="86" width="70" height="26" fill={acid} />
        <rect x="30" y="54" width="70" height="26" fill={white} strokeDasharray="6 5" />
        <rect x="44" y="18" width="70" height="26" fill={acid} transform="rotate(8 79 31)" />
        <path d="M132 176 V40 M118 58 L132 40 L146 58" fill="none" strokeWidth="5" />
      </g>
      <g style={mono} fontSize="10" fill={ink}>
        <text x="38" y="167">
          0–1 MB
        </text>
        <text x="38" y="135">
          1–2 MB
        </text>
        <text x="38" y="103">
          2–3 MB
        </text>
        <text x="40" y="71">
          resume…
        </text>
      </g>
      <circle cx="132" cy="112" r="11" fill={white} {...line} />
      <path d="M127 112 h10 M132 107 v10" stroke={ink} strokeWidth="3" transform="rotate(45 132 112)" />
    </>
  );
}

/** Synth: a record with its tone arm, and an equaliser streaming out below */
function Stream() {
  // kept a few px below the "206 PARTIAL CONTENT" label
  const bars = [12, 22, 15, 29, 19, 32, 14, 24, 17, 10];
  return (
    <>
      <circle cx="84" cy="74" r="62" fill={ink} {...line} />
      <g fill="none" stroke={shade(80)} strokeWidth="2">
        <circle cx="84" cy="74" r="50" />
        <circle cx="84" cy="74" r="40" />
        <circle cx="84" cy="74" r="30" />
      </g>
      <circle cx="84" cy="74" r="18" fill={pink} {...line} />
      <circle cx="84" cy="74" r="4" fill={ink} />
      <path d="M150 14 L118 60" stroke={paper} strokeWidth="6" strokeLinecap="round" />
      <circle cx="150" cy="14" r="8" fill={paper} {...line} />
      <g {...line} fill={acid}>
        {bars.map((h, i) => (
          <rect key={i} x={16 + i * 14} y={190 - h} width="10" height={h} />
        ))}
      </g>
      <text x="84" y="150" textAnchor="middle" style={mono} fontSize="10" fill={white}>
        206 PARTIAL CONTENT
      </text>
    </>
  );
}

/** API Watch: a log monitor with a heartbeat line and live rows */
function Monitor() {
  return (
    <>
      <rect x="10" y="18" width="148" height="128" rx="8" fill={ink} {...line} />
      <path
        d="M18 70 H50 L60 48 L72 98 L84 36 L96 84 L104 70 H150"
        fill="none"
        stroke={pink}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <g style={mono} fontSize="9">
        <text x="20" y="116" fill={acid}>
          GET /orders 200
        </text>
        <text x="20" y="130" fill={white}>
          POST /auth 201
        </text>
      </g>
      <circle cx="146" cy="32" r="5" fill={pink} />
      <text x="138" y="35" textAnchor="end" style={mono} fontSize="8" fill={white}>
        LIVE
      </text>
      <path d="M70 146 L62 172 H106 L98 146" fill={paper} {...line} />
      <rect x="46" y="172" width="76" height="12" rx="3" fill={paper} {...line} />
    </>
  );
}

/** Pop Lyrics: a music tab behind, and the always-on-top lyrics window floating over it */
function Lyrics() {
  return (
    <>
      <rect x="8" y="30" width="112" height="86" rx="6" fill={shade(90)} stroke={paper} strokeWidth="2" />
      <g fill={shade(70)}>
        <rect x="18" y="46" width="40" height="40" rx="3" />
        <rect x="66" y="50" width="44" height="6" rx="3" />
        <rect x="66" y="64" width="30" height="6" rx="3" />
      </g>
      <g transform="rotate(-6 100 120)">
        <rect x="46" y="74" width="114" height="104" rx="8" fill={paper} {...line} />
        <rect x="46" y="74" width="114" height="18" rx="8" fill={acid} {...line} />
        <circle cx="58" cy="83" r="3" fill={ink} />
        <circle cx="68" cy="83" r="3" fill={ink} />
        <g style={body} fontSize="11">
          <text x="56" y="112" fill={shade(40)}>
            and the night
          </text>
          <rect x="52" y="120" width="102" height="18" fill={pink} />
          <text x="56" y="133" fill={ink}>
            goes on and on
          </text>
          <text x="56" y="156" fill={shade(40)}>
            under city lights
          </text>
        </g>
      </g>
      <path d="M30 150 v-30 l18 -6 v30" fill="none" stroke={acid} strokeWidth="4" strokeLinejoin="round" />
      <circle cx="25" cy="152" r="7" fill={acid} />
      <circle cx="43" cy="146" r="7" fill={acid} />
    </>
  );
}

/** AI CLI: a terminal running the clone, with the copied page popping out behind it */
function Terminal() {
  return (
    <>
      <g transform="rotate(5 110 70)">
        <rect x="70" y="10" width="90" height="72" rx="6" fill={white} {...line} />
        <rect x="70" y="10" width="90" height="14" rx="6" fill={pink} {...line} />
        <rect x="80" y="34" width="70" height="10" fill={ink} />
        <rect x="80" y="50" width="32" height="24" fill={blue} />
        <rect x="118" y="50" width="32" height="6" fill={ink} />
        <rect x="118" y="62" width="24" height="6" fill={ink} />
      </g>
      <rect x="6" y="74" width="150" height="108" rx="8" fill={ink} {...line} />
      <g fill={white}>
        <circle cx="18" cy="86" r="3" />
        <circle cx="28" cy="86" r="3" />
        <circle cx="38" cy="86" r="3" />
      </g>
      <g style={mono} fontSize="10">
        <text x="16" y="112" fill={acid}>
          &gt; clone the site
        </text>
        <text x="16" y="127" fill={acid}>
          {"  example.com"}
        </text>
        <text x="16" y="146" fill={white}>
          ✓ assets ✓ paths
        </text>
        <text x="16" y="166" fill={pink}>
          &gt;
        </text>
      </g>
      <rect x="28" y="157" width="8" height="12" fill={acid} />
    </>
  );
}

/** Persona AI: two masks (two voices) and a typing bubble */
function Masks() {
  return (
    <>
      <g {...line}>
        <path
          d="M14 40 Q14 22 40 22 H74 Q90 22 90 40 V86 Q90 124 52 128 Q14 124 14 86 Z"
          fill={white}
          transform="rotate(-10 52 75)"
        />
        <path
          d="M78 64 Q78 46 104 46 H138 Q154 46 154 64 V110 Q154 148 116 152 Q78 148 78 110 Z"
          fill={pink}
          transform="rotate(10 116 99)"
        />
      </g>
      <g fill={ink}>
        <path d="M30 62 q8 -8 16 0 q-8 4 -16 0Z M56 58 q8 -8 16 0 q-8 4 -16 0Z" transform="rotate(-10 52 75)" />
        <path d="M36 92 q16 16 32 0 q-16 6 -32 0Z" transform="rotate(-10 52 75)" />
        <path d="M96 88 q8 8 16 0 q-8 -4 -16 0Z M122 90 q8 8 16 0 q-8 -4 -16 0Z" transform="rotate(10 116 99)" />
        <path d="M100 128 q16 -14 32 0 q-16 -5 -32 0Z" transform="rotate(10 116 99)" />
      </g>
      <path
        d="M18 158 h62 a8 8 0 0 1 8 8 v12 a8 8 0 0 1 -8 8 h-40 l-12 10 v-10 h-10 a8 8 0 0 1 -8 -8 v-12 a8 8 0 0 1 8 -8Z"
        fill={acid}
        {...line}
      />
      <g fill={ink}>
        <circle cx="38" cy="172" r="3" />
        <circle cx="50" cy="172" r="3" />
        <circle cx="62" cy="172" r="3" />
      </g>
    </>
  );
}

const arts: Record<Art, () => React.JSX.Element> = {
  upload: Upload,
  stream: Stream,
  monitor: Monitor,
  lyrics: Lyrics,
  terminal: Terminal,
  masks: Masks,
};

export default function DeckArt({ art, className }: { art: Art; className?: string }) {
  const Art = arts[art];
  return (
    <svg className={className} viewBox="0 0 168 204" aria-hidden="true" focusable="false">
      <Art />
    </svg>
  );
}
