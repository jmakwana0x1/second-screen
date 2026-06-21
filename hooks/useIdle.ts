"use client";

import { useEffect, useState } from "react";
import { IDLE } from "@/lib/config";

export type IdleStage = "active" | "dim" | "deep";

/**
 * Idle intelligence. Watches for any input and reports how settled the user is:
 *   active → recently interacting
 *   dim    → no input for IDLE.dimAfterSeconds
 *   deep   → no input for IDLE.deepAfterSeconds (settle toward pure wallpaper)
 *
 * It is quietest exactly when the user has settled into deep work. The current
 * stage is also mirrored onto <body data-idle> so CSS can, e.g., hide the
 * cursor in deep idle.
 */
export function useIdle(): IdleStage {
  const [stage, setStage] = useState<IdleStage>("active");

  useEffect(() => {
    let dimTimer = 0;
    let deepTimer = 0;

    const arm = () => {
      window.clearTimeout(dimTimer);
      window.clearTimeout(deepTimer);
      dimTimer = window.setTimeout(
        () => setStage("dim"),
        IDLE.dimAfterSeconds * 1000,
      );
      deepTimer = window.setTimeout(
        () => setStage("deep"),
        IDLE.deepAfterSeconds * 1000,
      );
    };

    const wake = () => {
      setStage("active");
      arm();
    };

    const events = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"];
    for (const e of events) window.addEventListener(e, wake, { passive: true });
    arm();

    return () => {
      window.clearTimeout(dimTimer);
      window.clearTimeout(deepTimer);
      for (const e of events) window.removeEventListener(e, wake);
    };
  }, []);

  useEffect(() => {
    document.body.dataset.idle = stage;
  }, [stage]);

  return stage;
}
