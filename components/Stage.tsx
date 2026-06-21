"use client";

import { useEffect, useMemo } from "react";
import AmbientField from "./AmbientField";
import Clock from "./Clock";
import FocusLine from "./FocusLine";
import SoundscapeMixer, { EMPTY_MIXER, MixerLevels } from "./SoundscapeMixer";
import FocusRing from "./FocusRing";
import Settings from "./Settings";
import { useBreath } from "@/hooks/useBreath";
import { useFocusSession } from "@/hooks/useFocusSession";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useIdle } from "@/hooks/useIdle";
import { ACCENT, IDLE, STORAGE_KEYS } from "@/lib/config";
import { parseRgb, rgbTriplet } from "@/lib/color";

/**
 * The Stage composes the ambient object: the breathing field underneath, the
 * clock, the one focus line, the soundscape mixer, and the felt focus ring. It
 * owns the cross-cutting state — accent color, reduced motion, idle stage — and
 * drives the global breath. As the user settles into deep work the controls
 * fade away and the clock and focus line soften toward pure wallpaper.
 */
export default function Stage() {
  const [accent, setAccent] = usePersistentState<string>(
    STORAGE_KEYS.accent,
    ACCENT.default,
  );
  const [reduceMotionPref, setReduceMotionPref] = usePersistentState<boolean>(
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
  const session = useFocusSession();
  const idle = useIdle();

  useBreath(reduceMotion);

  // Publish the accent to the --glow CSS variable so all surfaces share it.
  useEffect(() => {
    document.documentElement.style.setProperty("--glow", rgbTriplet(accent));
  }, [accent]);

  const accentRgb = useMemo(() => parseRgb(accent), [accent]);

  // Controls are fully present only when active; they fade out as the user
  // settles and become non-interactive once hidden.
  const controlsVisible = idle === "active";
  const controlStyle: React.CSSProperties = {
    opacity: controlsVisible ? 1 : 0,
    transitionProperty: "opacity",
    transitionDuration: `${IDLE.fadeSeconds * 1000}ms`,
    pointerEvents: controlsVisible ? "auto" : "none",
  };

  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center">
      <AmbientField
        accent={accentRgb}
        sessionProgress={session.progress}
        reduceMotion={reduceMotion}
      />

      <div
        className="fixed inset-x-0 top-[5vmin] flex justify-center"
        style={controlStyle}
      >
        <FocusRing session={session} />
      </div>

      <Clock opacity={IDLE.clockOpacity[idle]} reduceMotion={reduceMotion} />

      <div className="mt-[2vmin]">
        <FocusLine
          value={focusLine}
          onChange={setFocusLine}
          opacity={IDLE.focusOpacity[idle]}
          reduceMotion={reduceMotion}
        />
      </div>

      <div
        className="fixed inset-x-0 bottom-[5vmin] flex justify-center"
        style={controlStyle}
      >
        <SoundscapeMixer levels={mixer} onChange={setMixer} />
      </div>

      <div
        className="fixed bottom-[5vmin] right-[4vmin] flex justify-center"
        style={controlStyle}
      >
        <Settings
          accent={accent}
          onAccentChange={setAccent}
          reduceMotion={reduceMotionPref}
          onReduceMotionChange={setReduceMotionPref}
        />
      </div>
    </main>
  );
}
