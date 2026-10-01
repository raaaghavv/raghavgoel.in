import Lenis from "lenis";
import { motion } from "@/config/motion";
import { colors, layout } from "@/config/theme";
import { labels } from "@/config/sections";
import { clamp, damp, easeInOut as ease, lerp, rnd } from "./math";
import { createPoseSpring, mix, POSES, push, type Pose } from "./poses";
import { createSkater, type Skater } from "./skaterRig";
import { createFx } from "./fx";
import { createRail } from "./rail";
import { createStunt } from "./stunt";
import type { RideContext, RideElements } from "./types";

const flag = (el: Element, name: string, on: boolean) => {
  const e = el as HTMLElement;
  if (on) e.dataset[name] = "";
  else delete e.dataset[name];
};

/** Boots the whole ride. Returns a cleanup function. */
export function startRide(els: RideElements): () => void {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let skater: Skater | null = null;
  try {
    skater = createSkater(els.skaterCanvas);
  } catch (err) {
    console.warn("WebGL unavailable", err);
  }
  if (!skater) root.dataset.noGl = "";

  const ctx: RideContext = { els, lenis: null, simple: reduce || !skater, reduce, root };
  const fx = createFx(els.fxCanvas);
  const rail = createRail(ctx);

  /* ---------- intro: roll in, reveal the name, drift to a stop ---------- */
  const I = motion.intro;
  const revealRoot = document.querySelector<HTMLElement>("[data-reveal-root]");
  const letters = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
  const dock = document.querySelector<HTMLElement>("[data-dock]");
  const intro = { start: Infinity, running: false };
  const revealAll = () => letters.forEach((l) => flag(l, "on", true));
  /** back to the server-rendered markup: no intro state, every letter visible */
  const resetReveal = () => {
    if (revealRoot) delete revealRoot.dataset.intro;
    letters.forEach((l) => flag(l, "on", false));
  };
  // start clean: a previous run (React StrictMode mounts twice in dev) may have left letters revealed
  resetReveal();
  // the boot script hid the name before first paint; take over (same task, so no frame shows it), or, if it
  // already gave up waiting and showed the name, skip the intro rather than hide it again
  const late = root.dataset.introLate !== undefined;
  delete root.dataset.introWait;
  // opened on a checkpoint (#projects…): skip the intro and start on the rail
  const deepLink = rail.cps.slice(1).find((c) => c.id === decodeURIComponent(window.location.hash.slice(1)));
  let failsafe = 0;
  if (deepLink || late) revealAll();
  else if (!ctx.simple && revealRoot) {
    revealRoot.dataset.intro = "pre";
    intro.running = true;
    document.fonts.ready.then(() => {
      intro.start = performance.now() + I.startDelay;
    });
    failsafe = window.setTimeout(revealAll, I.failsafe);
  }
  const finishIntro = () => {
    if (intro.running) intro.start = performance.now() - I.duration;
  };

  const stunt = createStunt(ctx, rail, { finishIntro });

  /* ---------- smooth scroll ---------- */
  if (!reduce) {
    ctx.lenis = new Lenis({
      autoRaf: false,
      lerp: motion.lenis.lerp,
      wheelMultiplier: motion.lenis.wheelMultiplier,
      virtualScroll: (d) => stunt.onVirtualScroll(d),
    });
  }

  /* ---------- URL hash follows the checkpoint; refresh and links restore it ----------
   * Scroll restoration stays with the browser: a fresh load jumps to the anchor and a reload
   * restores the exact offset, both before first paint. The engine only switches to rail mode. */
  let hashId: string | null = null,
    hashReady = !deepLink;
  const writeHash = (id: string) => {
    if (id === hashId) return;
    hashId = id;
    const url = window.location.pathname + window.location.search + (id === rail.cps[0].id ? "" : `#${id}`);
    window.history.replaceState(window.history.state, "", url);
  };
  if (deepLink) {
    stunt.jumpToRail();
    hashId = deepLink.id;
    let landed = false;
    const land = () => {
      rail.measure();
      // browser already placed us (native #hash jump or reload restore); otherwise place ourselves
      if (window.scrollY <= 1) {
        const top = deepLink.top;
        if (ctx.lenis) ctx.lenis.scrollTo(top, { immediate: true, force: true });
        else window.scrollTo({ top, behavior: "instant" });
      }
      hashReady = true;
      if (landed) return;
      landed = true;
      // on refresh or a direct link, greet the section we landed in (the finish has its own celebration)
      const i = rail.cps.indexOf(rail.current(rail.progress()));
      lastBanner = bannerIndex(window.scrollY);
      if (i > 0 && i < rail.cps.length - 1) showBanner(i);
    };
    requestAnimationFrame(land);
    document.fonts.ready.then(land);
  }
  const onHashChange = () => stunt.navigate(decodeURIComponent(window.location.hash.slice(1)) || rail.cps[0].id);
  window.addEventListener("hashchange", onHashChange);

  /* ---------- pointer for the skater's eyes ---------- */
  const mouse = { x: 0, y: 0, on: false };
  const onPointer = (e: PointerEvent) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.on = true;
  };
  const onLeave = () => {
    mouse.on = false;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("pointerleave", onLeave);

  /* ---------- banners + course clear ---------- */
  let bannerTimer = 0,
    celebrated = false,
    cheerUntil = 0;
  const cpNo = (i: number) => `${labels.checkpoint.toUpperCase()} #${String(i).padStart(2, "0")}`;
  function showBanner(i: number) {
    if (reduce) return;
    els.bannerNo.textContent = cpNo(i);
    els.bannerName.textContent = rail.cps[i].alias.toUpperCase();
    flag(els.banner, "show", true);
    clearTimeout(bannerTimer);
    bannerTimer = window.setTimeout(() => flag(els.banner, "show", false), motion.banner.showFor);
  }
  function celebrate() {
    celebrated = true;
    const last = rail.cps.length - 1,
      fin = rail.cps[last];
    flag(fin.li, "party", false);
    void fin.li.offsetWidth;
    flag(fin.li, "party", true);
    window.setTimeout(() => flag(fin.li, "party", false), motion.celebration.bannerFor);
    els.bannerNo.textContent = `${cpNo(last)} · ${fin.alias.toUpperCase()}`;
    els.bannerName.textContent = labels.finishBanner.toUpperCase();
    flag(els.banner, "clear", true);
    flag(els.banner, "show", true);
    clearTimeout(bannerTimer);
    bannerTimer = window.setTimeout(() => {
      flag(els.banner, "show", false);
      window.setTimeout(() => flag(els.banner, "clear", false), 300);
    }, motion.celebration.bannerFor);
    if (reduce) return;
    cheerUntil = performance.now() + motion.celebration.cheerFor;
    const r = fin.li.querySelector(".dot, [data-dot]")?.getBoundingClientRect() ?? fin.li.getBoundingClientRect();
    fx.confetti(r.left + r.width / 2, r.top + r.height / 2, motion.celebration.confetti);
    const W = window.innerWidth,
      H = window.innerHeight;
    [
      [0.3, 0.3],
      [0.55, 0.2],
      [0.78, 0.34],
      [0.42, 0.45],
    ].forEach(([x, y], i) =>
      window.setTimeout(() => fx.firework(W * x, H * y), 120 + i * motion.celebration.fireworksEvery),
    );
  }
  const onToTop = () => {
    rail.state.used = true;
    if (ctx.simple) rail.goTo(0);
    else stunt.goHome();
  };
  els.toTop.addEventListener("click", onToTop);

  /* ---------- resize ---------- */
  const onResize = () => {
    rail.measure();
    fx.resize();
    skater?.resize();
    ctx.lenis?.resize();
  };
  window.addEventListener("resize", onResize);
  window.addEventListener("load", onResize);
  const measureLater = window.setTimeout(onResize, 800);
  // the page can change height without a resize (fonts landing, the phone deck zoom, form errors, a hot reload);
  // re-measure then too, or the rail's page length goes stale and the end stops short of 100%
  let remeasure = 0;
  const pageSize = new ResizeObserver(() => {
    cancelAnimationFrame(remeasure);
    remeasure = requestAnimationFrame(() => {
      rail.measure();
      ctx.lenis?.resize();
    });
  });
  pageSize.observe(document.body);

  /* ---------- per-frame state ---------- */
  const spring = createPoseSpring();
  const S = motion.skater;
  let raf = 0,
    last = performance.now(),
    prevY = window.scrollY,
    vel = 0,
    face = 0,
    faceDir = 1,
    dragW = 0,
    hintAt = 0;
  let pr = rail.progress(),
    lastBanner = 0;
  /** last checkpoint whose banner point (section top minus motion.banner.lead of the viewport) is at or above y */
  const bannerIndex = (y: number) => {
    const L = motion.banner.lead;
    const early = window.innerHeight * (window.innerHeight > window.innerWidth ? L.portrait : L.landscape);
    let idx = 0;
    rail.cps.forEach((c, k) => {
      if (k > 0 && y >= c.top - early - 1) idx = k;
    });
    return idx;
  };

  function frame(now: number) {
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    ctx.lenis?.raf(now);

    const w = window.innerWidth,
      h = window.innerHeight,
      small = w <= layout.mobileBreakpoint;
    const y = ctx.lenis?.scroll ?? window.scrollY;
    const dy = y - prevY;
    prevY = y;
    const dyN = ctx.lenis ? ctx.lenis.velocity : (dy * (1 / 60)) / dt;
    vel = lerp(vel, dyN, damp(10, dt));
    if (Math.abs(dy) > 0.5) faceDir = dy > 0 ? 1 : -1;

    const p = rail.progress();
    const ts = stunt.update(dt);
    pr = reduce ? p : lerp(pr, p, damp(16, dt));
    const cur = rail.current(p),
      curI = rail.cps.indexOf(cur),
      lastI = rail.cps.length - 1;
    const bI = bannerIndex(y);
    if (bI > lastBanner && dy > 0 && ts >= 0.99 && bI > 0 && bI < lastI) showBanner(bI);
    lastBanner = bI;
    if (hashReady && !rail.state.drag) writeHash(ts >= 0.99 || curI > 0 ? cur.id : rail.cps[0].id);
    // course clear: on portrait screens at the finish's banner point (like the other banners), else at the very bottom
    const C = motion.celebration,
      portrait = h > w;
    const atFinish = portrait ? bI === lastI : p >= C.triggerAt;
    const awayFromFinish = portrait ? bannerIndex(y + h * C.portraitReset) < lastI : p < C.resetBelow;
    if (!celebrated && atFinish && ts >= 0.99) celebrate();
    if (celebrated && awayFromFinish) celebrated = false;

    /* rail UI */
    const { geo } = rail;
    const railOn = clamp((ts - 0.7) / 0.25);
    els.rail.style.opacity = String(railOn);
    const live = railOn > 0.9;
    flag(els.rail, "live", live);
    flag(els.thumb, "live", live);
    els.fill.style.setProperty("--fill", pr * geo.length + "px");
    const pct = Math.round(p * 100);
    els.pct.textContent = String(pct);
    els.thumb.setAttribute("aria-valuenow", String(pct));
    els.thumb.setAttribute("aria-valuetext", `${cur.title}, ${pct}%`);
    rail.cps.forEach((c) => {
      flag(c.li, "hit", p >= c.p - 0.003);
      flag(c.li, "cur", c === cur);
    });
    const scrollingUp = faceDir < 0 && p > motion.rail.backToStartOnUpFrom;
    flag(els.toTop, "show", ts >= 0.99 && !stunt.state.locked && (p > motion.rail.backToStartFrom || scrollingUp));
    // the rider's spot on the rail. Desktop: wall ride down the right side, body sideways to the left of the line.
    // Phones (flat): grinding along the bottom, standing upright on the line.
    const flat = geo.flat;
    const { x: railX, y: railY } = rail.at(pr);
    els.fallback.style.setProperty("--at", pr * geo.length + "px");

    const Sr = small ? S.rail.mobile : S.rail.desktop;
    const riderLen = S.height * Sr;
    const T = els.thumb.style;
    if (flat) {
      T.transform = `translate(${railX - 22}px, ${railY - riderLen - 10}px)`;
      T.width = "44px";
      T.height = riderLen + 18 + "px";
    } else {
      T.transform = `translate(${railX - 14}px, ${railY - 28}px)`;
      T.width = riderLen + 26 + "px";
      T.height = "";
    }
    const drag = rail.state.drag;
    const showBubble = !!drag || els.thumb.matches(":hover") || document.activeElement === els.thumb;
    flag(els.bubble, "show", live && showBubble);
    if (showBubble) {
      els.bubble.textContent = `${cur.title} · ${pct}%`;
      const bw = els.bubble.offsetWidth;
      els.bubble.style.transform = flat
        ? `translate(${clamp(railX - bw / 2, 8, w - bw - 8)}px, ${railY - riderLen - 40}px)`
        : `translate(${railX - bw - 22}px, ${railY - 13}px)`;
    }
    if (live && !hintAt) hintAt = now;
    flag(els.hint, "show", live && !rail.state.used && now - hintAt < motion.rail.hintFor && !small);
    els.hint.style.transform = `translate(${railX - 110}px, ${railY + 22}px) rotate(-6deg)`;

    /* speed lines */
    const SL = motion.speedLines;
    if (!reduce && ts >= 1 && Math.abs(vel) > SL.threshold) {
      const sp = Math.abs(vel),
        dir = Math.sign(vel);
      const n = Math.min(SL.maxPerFrame, Math.floor(sp / 7));
      const axis = flat ? "x" : "y";
      for (let i = 0; i < n; i++) {
        const pink = Math.random() < 0.3;
        fx.streak(
          flat ? railX + rnd(-10, 10) : rnd(railX + 6, railX + riderLen),
          flat ? rnd(railY - riderLen, railY - 6) : railY + rnd(-10, 10),
          clamp(sp * 4, 24, 150),
          dir,
          pink ? colors.pink : colors.ink,
          pink ? 3 : 2,
          SL.life,
          false,
          axis,
        );
      }
      if (sp > SL.whoosh && Math.random() < 0.6) {
        if (flat) {
          fx.streak(rnd(0, w), railY + rnd(8, 16), rnd(80, 200), dir, colors.ink, 1.5, 0.35, true, axis);
          fx.streak(rnd(0, w), railY - riderLen - rnd(10, 30), rnd(80, 200), dir, colors.ink, 1.5, 0.35, true, axis);
        } else {
          fx.streak(rnd(railX - 60, railX - 18), rnd(0, h), rnd(80, 260), dir, colors.ink, 1.5, 0.35, true, axis);
          fx.streak(rnd(w - 16, w - 4), rnd(0, h), rnd(80, 260), dir, colors.ink, 1.5, 0.35, true, axis);
        }
      }
    }

    /* skater */
    if (skater && dock) {
      const hs = small ? S.heroMobile : S.hero;
      const Sh = clamp(w * hs.vw, hs.min, hs.max);
      const d = dock.getBoundingClientRect();
      const groundY = d.top;
      let hx = d.left;
      let target: Pose = POSES.stance,
        stiff: number = S.springs.stance;

      if (intro.running) {
        const k = clamp((now - intro.start) / I.duration);
        hx = lerp(-Sh * I.startOffset, d.left, 1 - Math.pow(1 - k, I.easePower));
        const ph = I.phases;
        if (k < ph.pushEnd) target = push((k / ph.pushEnd) * I.pushes * Math.PI * 2);
        else if (k < ph.glideEnd) target = POSES.glide;
        else if (k < ph.driftEnd) {
          target = POSES.drift;
          fx.skid(hx - Sh * 0.3, hx + Sh * 0.3, groundY - 3);
          if (Math.random() < motion.drift.smoke) fx.puff(hx + rnd(-0.4, 0.4) * Sh, groundY - 6, 1, Sh / S.hero.max);
          if (Math.random() < motion.drift.sparks) fx.spark(hx + rnd(-0.3, 0.3) * Sh, groundY - 4, 1);
        }
        stiff = k < ph.pushEnd ? S.springs.push : S.springs.glide;
        const front = hx + Sh * I.revealLead;
        letters.forEach((l) => {
          if (l.dataset.on !== undefined) return;
          const r = l.getBoundingClientRect();
          if (front > r.left + r.width * 0.25) flag(l, "on", true);
        });
        if (k >= 1) {
          intro.running = false;
          revealAll();
        }
      } else if (!reduce) {
        target = {
          ...POSES.stance,
          nod: Math.sin(now / S.nodPeriod) * 0.06,
          sL: POSES.stance.sL + Math.sin(now / 560) * 0.04,
        };
      }

      // stunt: crouch, jump with a 360, land on the rail (a wall ride on desktop, a grind on phones)
      const M = motion.stunt;
      const e1 = clamp(ts / M.crouchEnd),
        e2 = clamp((ts - M.crouchEnd) / (1 - M.crouchEnd)),
        ef = ease(e2);
      dragW = lerp(dragW, drag ? 1 : 0, damp(10, dt));
      const speed = clamp(Math.abs(vel) / 40);
      const railPose = mix(mix(POSES.ride, POSES.speed, speed), POSES.grab, dragW);
      if (!reduce && !drag) railPose.nod = Math.sin(now / S.nodPeriod) * 0.05 * (1 - speed);
      if (now < cheerUntil && !drag) {
        Object.assign(railPose, mix(railPose, POSES.cheer, 0.9));
        railPose.lift = Math.abs(Math.sin(now / 130)) * 0.35;
      }
      if (ts > 0.001) {
        if (ts < M.crouchEnd) target = mix(target, POSES.crouch, ease(e1));
        else if (e2 < M.tuckEnd) target = mix(POSES.crouch, POSES.tuck, ease(e2 / M.tuckEnd));
        else target = mix(POSES.tuck, railPose, ease((e2 - M.tuckEnd) / (1 - M.tuckEnd)));
        stiff = S.springs.stunt;
      }

      const scale = lerp(Sh, Sr, ef);
      const x = lerp(hx, flat ? railX : railX + 2, ef);
      let yy = lerp(groundY, flat ? railY - 2 : railY, ef) - Math.sin(Math.PI * e2) * h * M.arcHeight;
      const roll = flat ? 0 : ef; // how far he has turned onto his side
      const top = yy - S.height * scale * Math.cos((roll * Math.PI) / 2) * 0.95;
      if (top < M.topClearance) yy += M.topClearance - top;

      // head + eyes follow the cursor (hero, or rail when the pointer is close)
      if (mouse.on && !reduce) {
        const L = skater.lookAt(mouse.x, mouse.y);
        const near = Math.hypot(mouse.x - L.headScreen.x, mouse.y - L.headScreen.y) < S.look.railRadius;
        if ((ts < 0.12 && !intro.running) || (ts >= 1 && near)) {
          target = {
            ...target,
            hy: clamp(L.yaw, -S.look.yaw, S.look.yaw),
            hp: clamp(L.pitch, -S.look.pitch, S.look.pitch),
            nod: target.nod * 0.3,
          };
          skater.setPupils(clamp(L.dir.y * 1.6, -1, 1), clamp(L.dir.z * 1.6, -1, 1));
        } else skater.setPupils(0, 0);
      } else skater.setPupils(0, 0);

      const pz = reduce ? target : spring(target, dt, stiff);
      skater.apply(pz);
      face = lerp(face, faceDir < 0 && ts >= 1 ? Math.PI : 0, damp(7, dt));
      const lean = ts >= 1 && !reduce ? clamp(vel * 0.003, -0.15, 0.15) : 0;
      skater.place(
        x,
        yy,
        scale,
        reduce ? 0 : ef * Math.PI * 2 * M.spins,
        (-Math.PI / 2) * roll + lean,
        lerp(0.15, 0.1, ef),
        lerp(S.heroYaw + pz.yaw, flat ? S.grindYaw : S.railYaw, ef) + face,
      );
      skater.render();
    }
    fx.draw(dt);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(failsafe);
    clearTimeout(bannerTimer);
    clearTimeout(measureLater);
    pageSize.disconnect();
    cancelAnimationFrame(remeasure);
    window.removeEventListener("pointermove", onPointer);
    document.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("load", onResize);
    window.removeEventListener("hashchange", onHashChange);
    els.toTop.removeEventListener("click", onToTop);
    stunt.destroy();
    rail.destroy();
    ctx.lenis?.destroy();
    skater?.dispose();
    resetReveal();
    delete root.dataset.noGl;
  };
}
