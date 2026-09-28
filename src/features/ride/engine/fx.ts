import { colors, partyColors } from "@/config/theme";
import { clamp, rnd } from "./math";

type Particle =
  | { k: "smoke"; x: number; y: number; vx: number; vy: number; r: number; g: number; life: number; max: number }
  | { k: "spark" | "fw"; x: number; y: number; vx: number; vy: number; c: string; life: number; max: number }
  | {
      k: "conf";
      x: number;
      y: number;
      vx: number;
      vy: number;
      rot: number;
      vr: number;
      w: number;
      h: number;
      c: string;
      life: number;
      max: number;
    }
  | { k: "ring"; x: number; y: number; life: number; max: number }
  | {
      k: "streak";
      x: number;
      y: number;
      len: number;
      dir: number;
      c: string;
      wd: number;
      faint: boolean;
      life: number;
      max: number;
    };

/** 2D overlay: drift smoke, sparks, skid marks, speed lines, confetti and fireworks. */
export function createFx(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  let parts: Particle[] = [];
  let skid: { x0: number; x1: number; y: number; age: number } | null = null;

  function resize() {
    const d = Math.min(window.devicePixelRatio, 2);
    canvas.width = window.innerWidth * d;
    canvas.height = window.innerHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  resize();

  const api = {
    resize,
    puff(x: number, y: number, dir: number, sc = 1) {
      parts.push({
        k: "smoke",
        x,
        y,
        vx: -dir * rnd(30, 90) * sc,
        vy: -rnd(10, 40) * sc,
        r: rnd(6, 12) * sc,
        g: rnd(40, 72) * sc,
        life: 0,
        max: rnd(0.7, 1.1),
      });
    },
    spark(x: number, y: number, dir: number) {
      parts.push({
        k: "spark",
        x,
        y,
        vx: -dir * rnd(90, 260),
        vy: -rnd(70, 190),
        life: 0,
        max: rnd(0.3, 0.55),
        c: Math.random() < 0.5 ? colors.acid : colors.pink,
      });
    },
    streak(x: number, y: number, len: number, dir: number, c: string, wd: number, max: number, faint = false) {
      parts.push({ k: "streak", x, y, len, dir, c, wd, faint, life: 0, max });
    },
    skid(x0: number, x1: number, y: number) {
      if (!skid) skid = { x0, x1, y, age: 0 };
      skid.x1 = x1;
      skid.age = 0;
    },
    confetti(x: number, y: number, n: number) {
      for (let i = 0; i < n; i++) {
        const a = rnd(Math.PI * 0.95, Math.PI * 1.6),
          v = rnd(280, 720);
        parts.push({
          k: "conf",
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          rot: rnd(0, 6),
          vr: rnd(-12, 12),
          w: rnd(6, 11),
          h: rnd(3, 6),
          c: partyColors[i % partyColors.length],
          life: 0,
          max: rnd(1.6, 2.6),
        });
      }
    },
    firework(x: number, y: number) {
      const c = partyColors[Math.floor(rnd(0, 3))],
        n = 26;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2,
          v = rnd(220, 300);
        parts.push({
          k: "fw",
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          c: i % 3 ? c : colors.white,
          life: 0,
          max: rnd(0.8, 1.1),
        });
      }
      parts.push({ k: "ring", x, y, life: 0, max: 0.45 });
    },
    draw(dt: number) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.lineCap = "round";
      if (skid) {
        const a = clamp(1 - (skid.age - 0.5) / 1.2);
        ctx.globalAlpha = a * 0.45;
        ctx.strokeStyle = colors.ink;
        [-4, 2].forEach((o, i) => {
          ctx.lineWidth = i ? 2 : 3;
          ctx.beginPath();
          ctx.moveTo(skid!.x0, skid!.y + o);
          ctx.lineTo(skid!.x1, skid!.y + o);
          ctx.stroke();
        });
        skid.age += dt;
        if (a <= 0) skid = null;
      }
      parts = parts.filter((q) => (q.life += dt) < q.max);
      for (const q of parts) {
        const f = q.life / q.max;
        switch (q.k) {
          case "smoke":
            q.x += q.vx * dt;
            q.y += q.vy * dt;
            q.vx *= 0.97;
            ctx.globalAlpha = (1 - f) * 0.95;
            ctx.beginPath();
            ctx.arc(q.x, q.y, q.r + q.g * f, 0, Math.PI * 2);
            ctx.fillStyle = colors.white;
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = colors.ink;
            ctx.stroke();
            break;
          case "spark":
          case "fw": {
            if (q.k === "spark") {
              q.vy += 700 * dt;
            } else {
              q.vx *= 0.95;
              q.vy = q.vy * 0.95 + 90 * dt;
            }
            q.x += q.vx * dt;
            q.y += q.vy * dt;
            const tail = q.k === "spark" ? 0.035 : 0.06;
            ctx.globalAlpha = 1 - f;
            ctx.beginPath();
            ctx.moveTo(q.x, q.y);
            ctx.lineTo(q.x - q.vx * tail, q.y - q.vy * tail);
            ctx.lineWidth = q.k === "spark" ? 5 : 6;
            ctx.strokeStyle = colors.ink;
            ctx.stroke();
            ctx.lineWidth = q.k === "spark" ? 2.5 : 3;
            ctx.strokeStyle = q.c;
            ctx.stroke();
            break;
          }
          case "conf": {
            q.vy += 520 * dt;
            q.vx *= 0.985;
            q.vy *= 0.985;
            q.x += q.vx * dt;
            q.y += q.vy * dt;
            q.rot += q.vr * dt;
            ctx.globalAlpha = clamp((1 - f) * 2);
            ctx.save();
            ctx.translate(q.x, q.y);
            ctx.rotate(q.rot);
            const sw = q.w * Math.abs(Math.cos(q.rot * 1.7)) + 1;
            ctx.fillStyle = q.c;
            ctx.strokeStyle = colors.ink;
            ctx.lineWidth = 1.5;
            ctx.fillRect(-sw / 2, -q.h / 2, sw, q.h);
            ctx.strokeRect(-sw / 2, -q.h / 2, sw, q.h);
            ctx.restore();
            break;
          }
          case "ring":
            ctx.globalAlpha = 1 - f;
            ctx.beginPath();
            ctx.arc(q.x, q.y, 10 + f * 70, 0, Math.PI * 2);
            ctx.lineWidth = 4 * (1 - f) + 1;
            ctx.strokeStyle = colors.ink;
            ctx.stroke();
            break;
          case "streak": {
            ctx.globalAlpha = (1 - f) * (q.faint ? 0.3 : 0.9);
            ctx.lineWidth = q.wd;
            ctx.strokeStyle = q.c;
            const len = q.len * (1 - f * 0.5);
            ctx.beginPath();
            ctx.moveTo(q.x, q.y);
            ctx.lineTo(q.x, q.y - q.dir * len);
            ctx.stroke();
            break;
          }
        }
      }
      ctx.globalAlpha = 1;
    },
  };
  return api;
}

export type Fx = ReturnType<typeof createFx>;
