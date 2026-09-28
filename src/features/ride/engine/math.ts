export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const rnd = (a: number, b: number) => a + Math.random() * (b - a);
/** frame-rate independent smoothing factor */
export const damp = (rate: number, dt: number) => 1 - Math.exp(-dt * rate);
