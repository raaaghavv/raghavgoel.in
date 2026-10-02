/** Every animation tunable in one place. Durations are ms, distances px. */
export const motion = {
  intro: {
    duration: 2100,
    startDelay: 150,
    /** exponent of the ease-out on the roll-in; higher = more of the slide happens at the end */
    easePower: 2.2,
    /** x start, in skater scale units left of the viewport */
    startOffset: 3,
    pushes: 3,
    /** fractions of the intro timeline */
    phases: { pushEnd: 0.52, glideEnd: 0.76, driftEnd: 0.95 },
    /** letters reveal once the skater's toe (this many scale units ahead of center) passes 25% into them */
    revealLead: 0.55,
    failsafe: 5000,
    /** the name is hidden from first paint while the engine loads; past this it shows without the roll-in */
    waitFor: 4000,
  },
  stunt: {
    toRail: 1250,
    toHero: 1000,
    /** multiplier applied when the visitor keeps scrolling during the stunt */
    fastForward: 2.2,
    /** fractions of the stunt: crouch, then flight */
    crouchEnd: 0.15,
    tuckEnd: 0.45,
    arcHeight: 0.12,
    /** never let the top of the skater get closer than this to the viewport top */
    topClearance: 80,
    /** gentle 360 during the flight */
    spins: 1,
  },
  glide: {
    toProjects: 850,
    /** scroll-to-top duration = distance / pxPerMs, clamped */
    homePxPerMs: 4,
    homeMin: 650,
    homeMax: 1500,
    /** touch swipe distance that counts as intent */
    touchIntent: 10,
  },
  skater: {
    /** px per scale unit in the hero: clamp(width * vw, min, max) */
    hero: { vw: 0.062, min: 42, max: 86 },
    heroMobile: { vw: 0.09, min: 30, max: 40 },
    rail: { desktop: 17, mobile: 14 },
    height: 3.75,
    springs: { push: 260, glide: 120, stance: 170, stunt: 200 },
    /**
     * Pointer follow, kept calm: pupils ease over at eyeRate (1/s) and only reach the rim once the pointer is
     * eyeReach px away; the head eases slower (headRate) and tips at most `pitch` rad. It only starts after the
     * visitor moves the pointer while he is standing (or near the rail rider, within railRadius px).
     */
    look: { pitch: 0.26, eyeRate: 5, eyeReach: 320, headRate: 2.8, railRadius: 260 },
    nodPeriod: 280,
    /** standing head: a slight tilt toward his right shoulder (screen left) with a small idle nod around it */
    stanceHead: { tilt: 0.07, nod: 0.025 },
    /** facing us, the hips read wider: hip spacing × (1 + hipSpread) */
    hipSpread: 0.75,
    /** how fast the skates settle onto the ground when he lands (1/s) */
    plantRate: 12,
    /** the backflip turns about this point, in rig units above the skates */
    flipPivot: 1.5,
    /** px per rig unit below which fine detail (stitches, laces, prints) is left out */
    detailFrom: 26,
  },
  rail: {
    /** top and bottom insets as fractions of the viewport */
    top: 0.1,
    bottom: 0.14,
    snapWithin: 0.03,
    keyStep: 0.15,
    /** always shown past this progress (the finish) */
    backToStartFrom: 0.96,
    /** shown while scrolling up once past this progress */
    backToStartOnUpFrom: 0.12,
    hintFor: 9000,
  },
  wheels: {
    /** base spin (deg/s) each wheel gets when the Stack section rolls into view */
    entryKick: 720,
    /** extra deg/s per px/ms of scroll speed at entry, capped */
    speedBoost: 260,
    speedBoostMax: 900,
    /** exponential friction per second; higher stops sooner (~2s coast at 1.6) */
    friction: 1.6,
    stopBelow: 4,
    /** ms between wheels, so the rows ripple */
    stagger: 22,
    /** ±fraction of random variation per wheel */
    jitter: 0.3,
    hoverKick: 540,
    /** swiping a wheel row (phones) rolls its wheels by the distance travelled; this fraction of that speed coasts on */
    rollCoast: 0.35,
    /** inside once this fraction of the viewport into view, from the bottom or top edge */
    enterAt: 0.15,
    /** no wheel spins faster than this (deg/s), however much it's flicked */
    maxSpin: 3600,
    /** burnout: above `from` deg/s a wheel throws smoke off its contact patch, up to `perFrame` puffs at `full` */
    smoke: {
      from: 1100,
      full: 3000,
      perFrame: 3,
      life: [0.9, 1.7],
      /** px/s at full burnout: how far it rolls out sideways, and how much it blows up behind the wheel */
      spread: 150,
      lift: 42,
      /** share of puffs drawn in front of the wheels (the rest stay behind) */
      front: 0.25,
    },
  },
  decks: {
    /** inside once this fraction of the viewport into view, from the bottom or top edge */
    enterAt: 0.35,
    /** a deck counts as visible when at least this much of its width is on screen */
    visibleFraction: 0.6,
    delay: 250,
    hold: 850,
    /** which visible deck nudges (0-based): floor(visible / 2) - 1, never below the first → 6 visible = 3rd, 5 = 2nd */
    pick: (visible: number) => Math.max(0, Math.floor(visible / 2) - 1),
  },
  stamps: {
    /** inside once this fraction of the viewport into view, from the bottom or top edge */
    enterAt: 0.25,
    delay: 150,
    /** extra delay per run-log row, so rows arriving together are stamped one after another */
    stagger: 220,
    /** incoming-stamp animation length, ms (passed to CSS as --stamp-ms) */
    duration: 650,
    /** fraction of the animation where the stamp touches paper (the 60% keyframe in stamp-in) */
    impactAt: 0.6,
    /** the row's damped wobble on impact */
    thud: { distance: 1.6, rotate: 0.15, duration: 380 },
    /** faint ink ring spreading from the stamp on impact */
    ripple: { scale: 1.35, duration: 520 },
  },
  holo: {
    /** inside once this fraction of the viewport into view, from the bottom or top edge */
    enterAt: 0.12,
    /** ms between cards in the shimmer wave */
    stagger: 110,
    /** one foil sweep, ms (passed to CSS as --shine-ms) */
    duration: 1000,
  },
  cardDeck: {
    /** phones: each card behind the top one sits this much further right (px), down (px) and turned (deg) */
    fan: { x: 8, y: 4, rotate: 1.3 },
    /** a swipe past this many px, or a flick faster than flickSpeed px/ms, changes the card */
    swipeAt: 70,
    flickSpeed: 0.45,
    /** the swiped card flies off this long before it tucks in at the back */
    toss: 260,
    /** card move transition (passed to CSS as --deck-ms) */
    settle: 460,
  },
  park: {
    /** inside once this fraction of the viewport into view, from the bottom or top edge */
    enterAt: 0.2,
    /** the deck swings in and comes to rest against the board */
    lean: { delay: 150, duration: 700 },
    /** the "let's build" sticker slaps onto the board's edge */
    sticker: { delay: 600, duration: 460 },
  },
  speedLines: { threshold: 5, whoosh: 16, maxPerFrame: 3, life: 0.26 },
  drift: { smoke: 0.9, sparks: 0.5 },
  celebration: {
    confetti: 90,
    bannerFor: 2400,
    cheerFor: 1800,
    fireworksEvery: 260,
    /** landscape: course clear fires at this progress (the very bottom) and re-arms below resetBelow */
    triggerAt: 0.995,
    resetBelow: 0.9,
    /**
     * portrait screens: course clear fires at the finish's banner point instead, like every other checkpoint banner,
     * and re-arms once the visitor is this fraction of the viewport back above it
     */
    portraitReset: 0.1,
  },
  banner: {
    showFor: 1300,
    /**
     * the checkpoint banner fires this fraction of the viewport before a section's top reaches the viewport top
     * (scrolling down). Only the banner is early; dots, "current" and the URL hash use the exact section top.
     * Picked by screen shape: portrait screens (phones, upright tablets) get more, because on a tall narrow screen
     * a heading has already crossed most of the screen by then.
     */
    lead: { landscape: 0.15, portrait: 0.35 },
  },
  lenis: { lerp: 0.1, wheelMultiplier: 1 },
} as const;
