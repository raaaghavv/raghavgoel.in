import { motion } from "@/config/motion";
import { clamp, damp, lerp } from "./math";
import type { Pose } from "./poses";
import { RIDER_SVG } from "./riderArt";

/** 2D affine [a b c d e f], as in SVG matrix() */
type M = [number, number, number, number, number, number];

/**
 * Rig geometry, tied to the art in riderArt.ts (100 SVG units = 1 rig unit, y down, +x = where he faces).
 * Bone lengths, joint offsets and the wheels used to keep the skates on the ground.
 */
const RIG = {
  L1: 72,
  L2: 72,
  hipDrop: 5,
  spine: 8,
  torso: 92,
  upper: 55,
  hipX: { f: -9, b: 9 },
  shoulder: { f: [-26, 10], b: [26, 10] },
  neck: [-2, -16],
  wheels: [
    [-9, 41],
    [32, 41],
  ],
  wheelR: 9,
} as const;
/** eye centres and iris rest positions in the head art (pupils travel up to `max` units) */
const EYES = {
  n: { cx: 1.8, cy: 8.6, ix: 3, iy: 9.3, max: 2.6 },
  f: { cx: 22.6, cy: 9.2, ix: 23.6, iy: 9.9, max: 2 },
} as const;

const mul = (m: M, n: M): M => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];
const T = (x: number, y: number): M => [1, 0, 0, 1, x, y];
const R = (a: number): M => [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0];
const TR = (x: number, y: number, a: number): M => [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), x, y];
const ap = (m: M, x: number, y: number) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
const mstr = (m: M) => `matrix(${m.map((v) => Math.round(v * 1e4) / 1e4).join(" ")})`;

/**
 * Forward kinematics: pose angles (poses.ts, three.js convention: y up, counter-clockwise) to bone matrices in the
 * side-view plane (SVG: y down, clockwise), so each angle is negated. `plant` (0..1) bends the supporting knee until
 * the other skate touches too, so neither skate floats in side view; 0 in the air and on the push recovery.
 */
function solve(p: Pose, plant: number) {
  const spread = 1 + motion.skater.hipSpread * p.front;
  const leg = (side: "f" | "b", t: number, k: number) => {
    const thigh = TR(RIG.hipX[side] * spread, RIG.hipDrop, -t);
    const shin = mul(thigh, TR(0, RIG.L1, -k));
    return { thigh, shin, foot: mul(shin, TR(0, RIG.L2, (t + k) * 0.92)) };
  };
  const lowest = (m: M) => Math.max(...RIG.wheels.map(([x, y]) => ap(m, x, y)[1] + RIG.wheelR));
  let lf = leg("f", p.tL, p.kL),
    lb = leg("b", p.tR, p.kR);
  if (plant > 0.001) {
    const rot = R(-p.bodyLean);
    const dep = (l: ReturnType<typeof leg>) => lowest(mul(rot, l.foot));
    const df = dep(lf),
      db = dep(lb),
      front = df > db;
    const side = front ? "f" : "b";
    const t = front ? p.tL : p.tR,
      k0 = front ? p.kL : p.kR,
      target = Math.min(df, db);
    // bisect the knee angle that lifts the deeper skate to the other one's depth (only ever bends)
    let lo = Math.max(k0 - 1.6, -2.7 - t),
      hi = k0;
    if (dep(leg(side, t, lo)) > target) hi = lo;
    else
      for (let i = 0; i < 18; i++) {
        const mid = (lo + hi) / 2;
        if (dep(leg(side, t, mid)) > target) hi = mid;
        else lo = mid;
      }
    const k = lerp(k0, (lo + hi) / 2, plant);
    if (front) lf = leg("f", t, k);
    else lb = leg("b", t, k);
  }
  // bodyLean pivots on the ground; re-ground on the lowest wheel, then lift (never sink)
  const hips0 = mul(R(-p.bodyLean), T(0, -Math.max(lowest(lf.foot), lowest(lb.foot))));
  const low = Math.max(lowest(mul(hips0, lf.foot)), lowest(mul(hips0, lb.foot)));
  const hips = mul(T(0, -low - Math.max(0, p.lift) * 100), hips0);
  const spine = mul(hips, TR(0, -RIG.spine, p.lean));
  const chest = mul(spine, T(0, -RIG.torso));
  const head = mul(chest, TR(RIG.neck[0], RIG.neck[1], -(p.lean * 0.6 + p.nod + p.hp)));
  const arm = (side: "f" | "b", s: number, e: number) => {
    const up = mul(chest, TR(RIG.shoulder[side][0], RIG.shoulder[side][1], -s));
    return { up, fore: mul(up, TR(0, RIG.upper, -e)) };
  };
  const af = arm("f", p.sL, p.eL),
    ab = arm("b", p.sR, p.eR);
  return {
    hips,
    spine,
    head,
    "thigh-f": mul(hips, lf.thigh),
    "shin-f": mul(hips, lf.shin),
    "foot-f": mul(hips, lf.foot),
    "thigh-b": mul(hips, lb.thigh),
    "shin-b": mul(hips, lb.shin),
    "foot-b": mul(hips, lb.foot),
    "up-f": af.up,
    "fore-f": af.fore,
    "up-b": ab.up,
    "fore-b": ab.fore,
  } as Record<string, M>;
}

/**
 * The rider: layered SVG cut-out art (riderArt.ts) in the given overlay <svg>, posed per frame. Positions are CSS px
 * in the viewport, `scale` is px per rig unit (motion.skater.hero / rail).
 */
export function createSkater(svg: SVGSVGElement) {
  const S = motion.skater;
  const NS = "http://www.w3.org/2000/svg";
  const g = document.createElementNS(NS, "g");
  g.innerHTML = RIDER_SVG;
  const rider = g.firstElementChild as SVGGElement;
  // the hoodie hem is drawn twice: a clipped copy of the torso art sits over the front thigh
  rider.querySelectorAll<SVGElement>("[data-copy]").forEach((slot) => {
    const src = rider.querySelector(`#${slot.dataset.copy}`)!.cloneNode(true) as Element;
    src.removeAttribute("id");
    src.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    slot.appendChild(src);
  });
  // ids made unique to this mount (clip paths), in case an old instance is still in the document
  const tag = Math.random().toString(36).slice(2, 8);
  rider.querySelectorAll("[id]").forEach((el) => (el.id = `${el.id}-${tag}`));
  rider.querySelectorAll("[clip-path]").forEach((el) => {
    el.setAttribute("clip-path", el.getAttribute("clip-path")!.replace(/#([\w-]+)/, `#$1-${tag}`));
  });
  svg.appendChild(rider);

  const bones = new Map<string, (SVGElement & { _t?: string })[]>();
  rider.querySelectorAll<SVGElement>("[data-bone]").forEach((el) => {
    const k = el.dataset.bone!;
    if (!bones.has(k)) bones.set(k, []);
    bones.get(k)!.push(el);
  });
  const feat = rider.querySelector(".feat")!,
    farEye = rider.querySelector(".far-eye")!,
    spineEl = bones.get("spine")![0] as SVGGraphicsElement,
    headEl = bones.get("head")![0] as SVGGraphicsElement;
  const eyes = [...rider.querySelectorAll<SVGGElement>(".iris")].map((el) => {
    const id = el.dataset.eye as keyof typeof EYES;
    return { el, ref: rider.querySelector<SVGGraphicsElement>(`.eye-${id}`)!, ...EYES[id], x: 0, y: 0 };
  });
  // the printed 01 flips back when he is mirrored, so it still reads 01
  const prints = [...rider.querySelectorAll(".n01")].map((el) => ({ el, t: el.getAttribute("transform")! }));
  let mirrored = false,
    front = 0,
    isFront: boolean | null = null,
    pitch = 0,
    detail: boolean | null = null;

  function apply(p: Pose, plant: number) {
    const B = solve(p, plant);
    bones.forEach((els, k) => {
      const s = mstr(B[k]);
      els.forEach((el) => {
        if (el._t !== s) el.setAttribute("transform", (el._t = s));
      });
    });
    // facing us: features slide to the middle of the face, the far eye grows to match it
    front = clamp(p.front);
    const dx = clamp((p.yaw + 0.55) * 4.5, -3.5, 2.5) - 4.6 * front;
    feat.setAttribute("transform", `translate(${dx.toFixed(2)} 0)`);
    farEye.setAttribute(
      "transform",
      `translate(22.6 9.2) scale(${(1 + 0.18 * front).toFixed(3)} ${(1 + 0.05 * front).toFixed(3)}) translate(-22.6 -9.2)`,
    );
    // the near skate, leg prints and far ear swap to their front-facing art halfway through the turn
    if (front > 0.5 !== isFront) rider.classList.toggle("front", (isFront = front > 0.5));
  }

  /** pupils toward a viewport point (null = rest: forward, or at us when facing us); returns the eased head pitch */
  function look(px: number | null, py: number, dt: number, snap: boolean) {
    const L = S.look;
    for (const e of eyes) {
      let tx = (e.cx - e.ix) * front,
        ty = 0;
      const m = px != null ? e.ref.getScreenCTM() : null;
      if (m && px != null) {
        const i = m.inverse();
        const lx = i.a * px + i.c * py + i.e - e.cx,
          ly = i.b * px + i.d * py + i.f - e.cy;
        // reach in screen px, so the pupils travel the same at every size
        const d = Math.hypot(lx, ly) || 1,
          k = Math.min(1, (d * Math.hypot(m.a, m.b)) / L.eyeReach) * e.max;
        tx = e.cx + (lx / d) * k - e.ix;
        ty = e.cy + (ly / d) * k * 0.9 - e.iy;
      }
      const a = snap ? 1 : damp(L.eyeRate, dt);
      e.x = lerp(e.x, tx, a);
      e.y = lerp(e.y, ty, a);
      e.el.setAttribute("transform", `translate(${e.x.toFixed(2)} ${e.y.toFixed(2)})`);
    }
    let aim = 0;
    const m = px != null ? spineEl.getScreenCTM() : null;
    if (m && px != null) {
      const i = m.inverse();
      const lx = i.a * px + i.c * py + i.e - RIG.neck[0],
        ly = i.b * px + i.d * py + i.f - (RIG.neck[1] - RIG.torso);
      aim = clamp(Math.atan2(-ly - 20, Math.abs(lx) + 60), -L.pitch, L.pitch);
    }
    pitch = snap ? aim : lerp(pitch, aim, damp(L.headRate, dt));
    return pitch;
  }

  /** the face's middle on screen (for "is the pointer near the rail rider") */
  function headScreen() {
    const m = headEl.getScreenCTM();
    return m ? { x: m.a * 16 + m.c * -20 + m.e, y: m.b * 16 + m.d * -20 + m.f } : { x: -1e4, y: -1e4 };
  }

  /**
   * x, y: the ground point under the skates. flip: backflip angle (rad) about the middle of the body. roll: screen
   * rotation about the skates (rad, clockwise; π/2 = on his side for the wall ride). facing: 1 = toward +x, -1 =
   * turned around, values between squash him through edge-on.
   */
  function place(x: number, y: number, scale: number, flip: number, roll: number, facing: number) {
    const k = scale / 100,
      pv = S.flipPivot * scale;
    const deg = (a: number) => ((a * 180) / Math.PI).toFixed(3);
    rider.setAttribute(
      "transform",
      `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${deg(roll)}) scale(${facing.toFixed(4)} 1) ` +
        `translate(0 ${(-pv).toFixed(2)}) rotate(${deg(-flip)}) translate(0 ${pv.toFixed(2)}) scale(${k.toFixed(4)})`,
    );
    if (facing < 0 !== mirrored) {
      mirrored = facing < 0;
      prints.forEach(({ el, t }) =>
        el.setAttribute("transform", mirrored ? t.replace(/^(translate\([^)]*\))/, "$1 scale(-1 1)") : t),
      );
    }
    // outlines ~3px at 500px tall, never under 1px; small sizes drop the fine detail (stitches, laces, prints)
    const px = Math.max(1, (3 * S.height * scale) / 500);
    rider.style.setProperty("--ow", `${(px / k).toFixed(3)}px`);
    if (scale >= S.detailFrom !== detail) rider.classList.toggle("lod", !(detail = scale >= S.detailFrom));
  }

  return { apply, look, headScreen, place, dispose: () => rider.remove() };
}

export type Skater = ReturnType<typeof createSkater>;

/** the <g …>…</g> element starting at `at` in markup */
function outerG(s: string, at: number) {
  const re = /<g[\s>]|<\/g>/g;
  re.lastIndex = at;
  let depth = 0;
  for (let m = re.exec(s); m; m = re.exec(s)) {
    depth += m[0] === "</g>" ? -1 : 1;
    if (!depth) return s.slice(at, re.lastIndex);
  }
  throw new Error("riderArt: unbalanced <g>");
}

/**
 * The rider frozen in one side-view pose, as markup (no DOM), so static art can reuse the same character: the deck
 * cover (DeckArt.tsx). Mirrors createSkater's setup: bone transforms baked in, the hem copy filled, ids suffixed with
 * `tag`. Ground is y = 0 under the lowest wheel; 100 units = 1 rig unit. `ow` is the outline width in those units.
 */
export function riderMarkup(p: Pose, tag: string, ow: number, lod = false) {
  const B = solve(p, 0);
  const dx = clamp((p.yaw + 0.55) * 4.5, -3.5, 2.5);
  let svg = RIDER_SVG.replace(/data-bone="([\w-]+)"/g, (m, k: string) => `${m} transform="${mstr(B[k])}"`).replace(
    'class="feat"',
    `class="feat" transform="translate(${dx.toFixed(2)} 0)"`,
  );
  svg = svg.replace(/<g ([^>]*)data-copy="([\w-]+)"><\/g>/g, (_, attrs: string, id: string) => {
    const src = outerG(svg, svg.indexOf(`<g id="${id}"`)).replace(/ id="[\w-]+"/g, "");
    return `<g ${attrs}data-copy="${id}">${src}</g>`;
  });
  return svg
    .replace(/id="([\w-]+)"/g, `id="$1-${tag}"`)
    .replace(/url\(#([\w-]+)\)/g, `url(#$1-${tag})`)
    .replace('<g class="rider">', `<g class="rider${lod ? " lod" : ""}" style="--ow:${ow}px">`);
}
