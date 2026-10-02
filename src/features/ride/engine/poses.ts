import { lerp } from "./math";

export const POSE_KEYS = [
  "tL",
  "kL",
  "tR",
  "kR",
  "sL",
  "eL",
  "sR",
  "eR",
  "lean",
  "nod",
  "lift",
  "yaw",
  "bodyLean",
  "hy",
  "hp",
  "front",
] as const;
export type PoseKey = (typeof POSE_KEYS)[number];
/**
 * Joint angles in radians. t = thigh, k = knee, s = shoulder, e = elbow, hy/hp = head yaw/pitch.
 * front (0..1): how far he turns to face the viewer. Only the standing pose uses it; every riding pose is the side
 * view he travels in.
 */
export type Pose = Record<PoseKey, number>;

export const full = (p: Partial<Pose>): Pose => {
  const o = {} as Pose;
  POSE_KEYS.forEach((k) => (o[k] = p[k] ?? 0));
  return o;
};

export const mix = (a: Pose, b: Pose, t: number): Pose => {
  const o = {} as Pose;
  POSE_KEYS.forEach((k) => (o[k] = lerp(a[k], b[k], t)));
  return o;
};

export const POSES = {
  /** standing at the hero, facing us: legs a little apart, the near skate toward us, arms loose at his sides */
  stance: full({
    tL: 0.1,
    kL: -0.04,
    tR: 0.06,
    kR: -0.03,
    sL: -0.12,
    eL: 0.28,
    sR: 0.2,
    eR: 0.12,
    lean: 0.03,
    yaw: -0.55,
    front: 1,
  }),
  glide: full({
    tL: 0.38,
    kL: -0.6,
    tR: 0.02,
    kR: -0.3,
    sL: 0.95,
    eL: 0.4,
    sR: -0.65,
    eR: 0.4,
    lean: 0.32,
    yaw: -0.08,
  }),
  drift: full({
    tL: 0.8,
    kL: -1.2,
    tR: 0.35,
    kR: -0.72,
    sL: 1.55,
    eL: 0.5,
    sR: -1.15,
    eR: 0.4,
    lean: 0.12,
    yaw: -1.25,
    bodyLean: 0.24,
  }),
  crouch: full({
    tL: 0.95,
    kL: -1.65,
    tR: 0.85,
    kR: -1.5,
    sL: -1.0,
    eL: 0.25,
    sR: -1.0,
    eR: 0.25,
    lean: 0.6,
    yaw: -0.25,
  }),
  tuck: full({ tL: 1.45, kL: -2.05, tR: 1.3, kR: -1.9, sL: 1.4, eL: 0.8, sR: 0.9, eR: 1.0, lean: 0.25, lift: 0.2 }),
  ride: full({ tL: 0.55, kL: -0.9, tR: 0.12, kR: -0.42, sL: 1.05, eL: 0.4, sR: -0.75, eR: 0.35, lean: 0.32 }),
  speed: full({ tL: 0.8, kL: -1.35, tR: 0.62, kR: -1.12, sL: -1.2, eL: 0.15, sR: -1.2, eR: 0.15, lean: 0.75 }),
  cheer: full({ tL: 0.35, kL: -0.6, tR: 0.1, kR: -0.3, sL: 2.95, eL: 0.35, sR: 2.6, eR: 0.5, lean: -0.1 }),
  grab: full({
    tL: 0.75,
    kL: -1.3,
    tR: 0.45,
    kR: -1.0,
    sL: 2.95,
    eL: 0.15,
    sR: 2.75,
    eR: 0.15,
    lean: -0.05,
    lift: 0.08,
  }),
} satisfies Record<string, Pose>;

/** One long push: the pushing leg extends back, the other carries the weight. */
export const push = (ph: number): Pose => {
  const a = Math.sin(ph),
    c = Math.cos(ph);
  return full({
    tL: 0.15 + 0.55 * a,
    kL: -(0.2 + 0.65 * Math.max(0, c)),
    tR: 0.15 - 0.55 * a,
    kR: -(0.2 + 0.65 * Math.max(0, -c)),
    sL: -0.7 * a,
    eL: 0.45,
    sR: 0.7 * a,
    eR: 0.45,
    lean: 0.32 + 0.06 * Math.abs(a),
    lift: -0.04 * Math.abs(a),
  });
};

/** Critically damped spring per joint: smooth, no overshoot, frame-rate independent. */
export function createPoseSpring() {
  const state = new Map<PoseKey, { x: number; v: number }>();
  return (target: Pose, dt: number, k: number): Pose => {
    const c = 2 * Math.sqrt(k),
      out = {} as Pose;
    const n = Math.max(1, Math.ceil(dt / 0.008)),
      h = dt / n;
    POSE_KEYS.forEach((key) => {
      let s = state.get(key);
      if (!s) state.set(key, (s = { x: target[key], v: 0 }));
      for (let i = 0; i < n; i++) {
        s.v += (k * (target[key] - s.x) - c * s.v) * h;
        s.x += s.v * h;
      }
      out[key] = s.x;
    });
    return out;
  };
}
