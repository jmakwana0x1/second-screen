"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FOCUS_SESSION } from "@/lib/config";

export interface FocusSession {
  /** 0..1 progress through the current session; eases to 0 when stopped. */
  progress: number;
  running: boolean;
  /** Length of the active (or last-chosen) session, minutes. */
  minutes: number;
  start: (minutes: number) => void;
  stop: () => void;
}

/**
 * A focus session you SENSE rather than watch. There is no countdown here — the
 * hook only exposes a 0..1 progress that the ambient field turns into a slow
 * whole-screen cool. While running, progress advances once per second (tiny,
 * imperceptible steps). When stopped or completed, progress eases gently back
 * to warm over a few seconds rather than snapping.
 */
export function useFocusSession(): FocusSession {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [minutes, setMinutes] = useState<number>(FOCUS_SESSION.defaultMinutes);

  const endAtRef = useRef(0);
  const durationRef = useRef(0);
  const tickRef = useRef<number | null>(null);
  const releaseRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (tickRef.current !== null) window.clearInterval(tickRef.current);
    if (releaseRef.current !== null) cancelAnimationFrame(releaseRef.current);
    tickRef.current = null;
    releaseRef.current = null;
  };

  // Ease progress from its current value back to 0 (warm) over shiftEaseSeconds.
  const release = useCallback((from: number) => {
    const start = performance.now();
    const dur = FOCUS_SESSION.shiftEaseSeconds * 1000;
    const step = (now: number) => {
      const k = Math.min((now - start) / dur, 1);
      // ease-out so the warmth returns gently
      setProgress(from * (1 - k) * (1 - k));
      if (k < 1) releaseRef.current = requestAnimationFrame(step);
    };
    releaseRef.current = requestAnimationFrame(step);
  }, []);

  const stop = useCallback(() => {
    clearTimers();
    setRunning(false);
    setProgress((current) => {
      release(current);
      return current;
    });
  }, [release]);

  const start = useCallback(
    (mins: number) => {
      clearTimers();
      setMinutes(mins);
      durationRef.current = mins * 60 * 1000;
      endAtRef.current = performance.now() + durationRef.current;
      setRunning(true);
      setProgress(0);

      tickRef.current = window.setInterval(() => {
        const remaining = endAtRef.current - performance.now();
        const p = 1 - remaining / durationRef.current;
        if (p >= 1) {
          clearTimers();
          setRunning(false);
          setProgress(1);
          release(1);
        } else {
          setProgress(p);
        }
      }, 1000);
    },
    [release],
  );

  useEffect(() => () => clearTimers(), []);

  return { progress, running, minutes, start, stop };
}
