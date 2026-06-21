"use client";

import { useEffect, useState } from "react";

/**
 * Resolves whether motion should be reduced, combining the OS-level
 * prefers-reduced-motion preference with a manual override toggle. Either one
 * being true degrades the app to a near-static gradient.
 */
export function useReducedMotion(manualOverride: boolean): boolean {
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return systemReduced || manualOverride;
}
