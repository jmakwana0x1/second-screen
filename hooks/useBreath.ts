"use client";

import { useEffect } from "react";
import { breathAt } from "@/lib/breath";

/**
 * Installs a single requestAnimationFrame loop that writes the live breath
 * value (0..1) to the `--breath` CSS variable on :root every frame. Visual
 * elements (glow, clock pulse, frosted surfaces) read it via CSS, so the whole
 * interface breathes in sympathy without React re-rendering each frame.
 *
 * When motion is reduced, the breath is parked at mid-swell and the loop stops.
 */
export function useBreath(reduceMotion: boolean): void {
  useEffect(() => {
    const root = document.documentElement;

    if (reduceMotion) {
      root.style.setProperty("--breath", "0.5");
      return;
    }

    let raf = 0;
    const tick = (t: number) => {
      root.style.setProperty("--breath", breathAt(t).toFixed(4));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Pause the breath when the window is hidden — no work in the background.
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduceMotion]);
}
