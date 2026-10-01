import { site } from "@/config/site";

/**
 * Props in the skatepark behind the contact board, drawn in code. They scale with the screen up to 1440px and
 * then stop; the fence, trees and concrete around them are CSS tiles that repeat to any width (Finish.module.css).
 */
export function ParkProps({ className }: { className?: string }) {
  // 4 × 3 lamp housings centred in the head (frame centre 1216, 69)
  const lamps = [0, 1, 2, 3].flatMap((c) => [0, 1, 2].map((r) => [1216 + (c - 1.5) * 18, 69 + (r - 1) * 14] as const));
  return (
    <svg className={className} viewBox="0 0 1440 560" aria-hidden="true">
      <defs>
        <radialGradient id="park-lens" cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#FFFEF6" />
          <stop offset="0.6" stopColor="#F3EED6" />
          <stop offset="1" stopColor="#BDB596" />
        </radialGradient>
        <linearGradient id="park-pole" x1="0" x2="1">
          <stop offset="0" stopColor="#4F4D47" />
          <stop offset="0.45" stopColor="#8E8B83" />
          <stop offset="1" stopColor="#4F4D47" />
        </linearGradient>
      </defs>

      {/* far quarter-pipe: small, so it sits back at the fence line */}
      <path
        d="M10 440 H86 Q100 536 262 556 V560 H10 Z"
        fill="var(--park-ramp)"
        stroke="var(--park-steel)"
        strokeWidth="2.5"
      />
      <path d="M10 440 H88" stroke="var(--pink)" strokeWidth="5" />
      <path d="M10 436 V560" stroke="var(--park-steel)" strokeWidth="2.5" />
      <text
        x="22"
        y="512"
        fontFamily="var(--font-marker)"
        fontSize="20"
        fill="var(--pink)"
        transform="rotate(-8 50 505)"
      >
        {site.contact.tag}
      </text>

      {/* far floodlight between the board and the rail: tapered pole with a ladder and cable, a catwalk, and a
          head of lamp housings tipped toward the park */}
      {/* shifted down so the head stays inside the scene; the pole runs on past the ground line and is clipped */}
      <g transform="translate(0 210)">
        <path d="M1211 108 H1219 L1224 560 H1206 Z" fill="url(#park-pole)" stroke="#3E3C37" strokeWidth="1.5" />
        <path d="M1226 106 V554 M1231 106 V554" stroke="#3E3C37" strokeWidth="1.2" />
        <path
          d={Array.from({ length: 34 }, (_, i) => `M1226 ${114 + i * 12} H1231`).join(" ")}
          stroke="#3E3C37"
          strokeWidth="1"
        />
        <path d="M1210 116 C1205 260 1208 420 1203 558" stroke="#2A2A2E" strokeWidth="1.2" fill="none" />
        <path d="M1177 106 H1255" stroke="#3E3C37" strokeWidth="4" />
        <path
          d="M1177 98 H1255 M1179 98 V106 M1197 98 V106 M1216 98 V106 M1235 98 V106 M1253 98 V106"
          stroke="#3E3C37"
          strokeWidth="1.2"
        />
        <path d="M1189 106 L1211 126 M1243 106 L1219 126" stroke="#3E3C37" strokeWidth="1.5" />
        {/* head, level on its catwalk; the frame narrows toward the bottom, tipped toward the park */}
        <g>
          <path
            d="M1172 42 H1260 L1254 96 H1178 Z"
            fill="#2A2A2E"
            stroke="var(--ink)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M1190 96 V106 M1242 96 V106" stroke="#3E3C37" strokeWidth="3" />
          {lamps.map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <rect x={x - 7} y={y - 6} width="14" height="12" rx="1.5" fill="#18181B" />
              <circle cx={x} cy={y} r="4.6" fill="url(#park-lens)" />
              <path d={`M${x - 6} ${y - 5} H${x + 6}`} stroke="#0E0E10" strokeWidth="1.6" />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}

/** The deck resting against the board: grip side out, trucks and pink wheels peeking from behind. */
export function LeanDeck({ className }: { className?: string }) {
  const bolts = [88, 110, 330, 352].flatMap((y) => [52, 78].map((x) => [x, y] as const));
  return (
    <svg className={className} viewBox="0 0 130 440" aria-hidden="true">
      <defs>
        <filter id="lean-grit" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.35" numOctaves="2" seed="5" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 13 -8.2" />
        </filter>
        <filter id="lean-wear" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.012" numOctaves="3" seed="9" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.93  0 0 0 0 0.92  0 0 0 0 0.9  0 0 0 4 -2.7" />
        </filter>
        <linearGradient id="lean-concave" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.07" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
        <clipPath id="lean-clip">
          <rect x="20" y="6" width="90" height="428" rx="45" />
        </clipPath>
      </defs>
      <path d="M14 99 H116 M14 341 H116" stroke="#8D8A82" strokeWidth="9" />
      <g fill="var(--pink)" stroke="var(--ink)" strokeWidth="4">
        <rect x="2" y="84" width="22" height="30" rx="8" />
        <rect x="106" y="84" width="22" height="30" rx="8" />
        <rect x="2" y="326" width="22" height="30" rx="8" />
        <rect x="106" y="326" width="22" height="30" rx="8" />
      </g>
      <rect x="20" y="6" width="90" height="428" rx="45" fill="var(--park-wood)" />
      <rect x="24" y="10" width="82" height="420" rx="41" fill="var(--grip)" />
      <g clipPath="url(#lean-clip)">
        <rect x="20" y="6" width="90" height="428" filter="url(#lean-grit)" opacity="0.4" />
        <rect x="20" y="6" width="90" height="428" filter="url(#lean-wear)" opacity="0.16" />
        <rect x="20" y="6" width="90" height="428" fill="url(#lean-concave)" />
        <path
          d="M40 150 l26 -6 M48 176 l34 -8 M44 270 l30 -6 M38 300 l20 -4"
          stroke="var(--paper)"
          strokeOpacity="0.16"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
      <rect x="20" y="6" width="90" height="428" rx="45" fill="none" stroke="var(--ink)" strokeWidth="5" />
      <path d="M44 9 q20 -2 40 0" stroke="#E6CFA8" strokeWidth="3" strokeLinecap="round" fill="none" />
      <g fill="#4A4A4D" stroke="var(--ink)" strokeWidth="2">
        {bolts.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="5" />
        ))}
      </g>
    </svg>
  );
}
