import { BREATH } from "./config";

/**
 * The breath waveform. Given a timestamp (ms), returns 0..1 following a calm
 * inhale→exhale curve. A raised-cosine gives smooth, equal-eased swings with no
 * hard edges — nothing snaps. 0 = full exhale (rest), 1 = full inhale (swell).
 */
export function breathAt(timeMs: number): number {
  const phase = (timeMs / 1000 / BREATH.periodSeconds) % 1;
  return (1 - Math.cos(phase * Math.PI * 2)) / 2;
}
