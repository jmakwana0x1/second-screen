/**
 * config.ts — the one place the FEEL of Second Screen lives.
 *
 * Every duration, delay, fade, and color that shapes the mood is here so the
 * app can be tuned without hunting through components. If you want it slower,
 * calmer, dimmer — change a number here, nowhere else.
 *
 * Guiding principle: REWARD A GLANCE, PUNISH A STARE. Nothing here should make
 * the screen more interesting to watch. When unsure, choose the calmer value.
 */

/** The signature 6-second breathing rhythm. The soul of the app. */
export const BREATH = {
  /** Full inhale→exhale cycle, in seconds. ~6s entrains calm breathing. */
  periodSeconds: 6,
  /**
   * How far the breath swings, 0..1. The ambient glow swells/recedes and the
   * clock pulses *almost imperceptibly* — this stays low on purpose.
   */
  glowDepth: 0.5,
  clockDepth: 0.06,
} as const;

/** The slow-flowing ambient field drifting under everything. */
export const FIELD = {
  /** Frame rate cap for the ambient renderer. Low = quiet fans all day. */
  fps: 30,
  /** Number of soft drifting blobs. More than a handful starts to feel busy. */
  blobCount: 5,
  /** Base blob radius as a fraction of the smaller viewport dimension. */
  blobRadius: 0.55,
  /** How far blobs drift from their home, fraction of viewport. */
  driftRange: 0.18,
  /** Seconds for a blob to complete one slow drift loop. Minutes, not seconds. */
  driftPeriodSeconds: 90,
} as const;

/** Idle intelligence: quietest exactly when the user has settled into work. */
export const IDLE = {
  /** No input for this long → fade controls out, soften clock + focus line. */
  dimAfterSeconds: 120,
  /** No input for this long → settle all the way toward pure wallpaper. */
  deepAfterSeconds: 300,
  /** Seconds for controls to fade up on lean-in / fade down on settle. */
  fadeSeconds: 1.6,
  /** Opacity of the focus line and clock at each idle stage. */
  clockOpacity: { active: 1, dim: 0.8, deep: 0.55 },
  focusOpacity: { active: 0.7, dim: 0.5, deep: 0.32 },
} as const;

/** The oversized clock — the anchor. */
export const CLOCK = {
  /** Use 24-hour time. Set false for 12-hour. */
  hour24: false,
  /** Seconds shown as a thin sweeping ring, not ticking digits. */
  showSecondsRing: true,
  /** Ring stroke width in px. */
  ringStroke: 2,
} as const;

/**
 * Felt pomodoro / focus ring — a session you SENSE, not a countdown you watch.
 * Progress is the whole screen slowly cooling, not a ticking number.
 */
export const FOCUS_SESSION = {
  /** Default session length in minutes. */
  defaultMinutes: 25,
  /** Selectable session lengths, minutes. */
  presets: [25, 50, 90],
  /**
   * Background color-temperature shift across a session, in hue degrees.
   * Starts warm-ish, cools as focus deepens. Subtle on purpose.
   */
  hueStart: 210,
  hueEnd: 250,
  /** Seconds for the whole-screen temperature to ease as progress updates. */
  shiftEaseSeconds: 4,
} as const;

/** The soundscape mixer. Layers blend freely; eyes-free by design. */
export const AUDIO = {
  /** Seconds for any layer to fade in/out — slow crossfades, no abrupt starts. */
  fadeSeconds: 2.5,
  /** Master ceiling so nothing is ever harsh. */
  masterGain: 0.6,
} as const;

/** A single accent glow color, the only color identity of the app. */
export const ACCENT = {
  /** Default: soft cyan-white. Swap for warm amber by changing this one value. */
  default: "rgb(150, 220, 235)",
  presets: {
    cyan: "rgb(150, 220, 235)",
    amber: "rgb(240, 200, 150)",
  },
} as const;

/** localStorage keys for the (backend-free) persistence layer. */
export const STORAGE_KEYS = {
  focusLine: "ss.focusLine",
  mixer: "ss.mixerLevels",
  accent: "ss.accent",
  reduceMotion: "ss.reduceMotion",
} as const;
