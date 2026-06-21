"use client";

import { useEffect, useMemo } from "react";
import AmbientField from "./AmbientField";
import Clock from "./Clock";
import FocusLine from "./FocusLine";
import SoundscapeMixer, { EMPTY_MIXER, MixerLevels } from "./SoundscapeMixer";
import { useBreath } from "@/hooks/useBreath";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePersistentState } from "@/hooks/usePersistentState";
import { ACCENT, IDLE, STORAGE_KEYS } from "@/lib/config";
import { parseRgb, rgbTriplet } from "@/lib/color";

/**
 * The Stage composes the ambient object: the breathing field underneath, the
 * clock above it, and (in later milestones) the focus line, soundscape mixer,
 * and felt focus ring. It owns the cross-cutting state — accent color, reduced
 * motion — and drives the global breath.
 */
export default function Stage() {
  const [accent] = usePersistentState<string>(
    STORAGE_KEYS.accent,
    ACCENT.default,
  );
  const [reduceMotionPref] = usePersistentState<boolean>(
    STORAGE_KEYS.reduceMotion,
    false,
  );
  const [focusLine, setFocusLine] = usePersistentState<string>(
    STORAGE_KEYS.focusLine,
    "",
  );
  const [mixer, setMixer] = usePersistentState<MixerLevels>(
    STORAGE_KEYS.mixer,
    EMPTY_MIXER,
  );
  const reduceMotion = useReducedMotion(reduceMotionPref);

  useBreath(reduceMotion);

  // Publish the accent to the --glow CSS variable so all surfaces share it.
  useEffect(() => {
    document.documentElement.style.setProperty("--glow", rgbTriplet(accent));
  }, [accent]);

  const accentRgb = useMemo(() => parseRgb(accent), [accent]);

  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center">
      <AmbientField
        accent={accentRgb}
        sessionProgress={0}
        reduceMotion={reduceMotion}
      />
      <Clock opacity={IDLE.clockOpacity.active} reduceMotion={reduceMotion} />
      <div className="mt-[2vmin]">
        <FocusLine
          value={focusLine}
          onChange={setFocusLine}
          opacity={IDLE.focusOpacity.active}
          reduceMotion={reduceMotion}
        />
      </div>

      <div className="fixed inset-x-0 bottom-[5vmin] flex justify-center">
        <SoundscapeMixer levels={mixer} onChange={setMixer} />
      </div>
    </main>
  );
}
