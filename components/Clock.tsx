"use client";

import { useEffect, useRef, useState } from "react";
import { CLOCK } from "@/lib/config";

interface ClockProps {
  /** Opacity from the idle stage; the clock softens as the user settles. */
  opacity: number;
  reduceMotion: boolean;
}

function parts(now: Date): { hh: string; mm: string } {
  let h = now.getHours();
  const m = now.getMinutes();
  if (!CLOCK.hour24) {
    h = h % 12;
    if (h === 0) h = 12;
  }
  const hh = CLOCK.hour24 ? String(h).padStart(2, "0") : String(h);
  const mm = String(m).padStart(2, "0");
  return { hh, mm };
}

/**
 * The anchor: a large, quiet, ultra-thin clock that reads in under a second.
 * Seconds are a single soft point of light sweeping a faint ring — ambient
 * motion with nothing to read, and no hard tick or once-a-minute snap. The
 * whole thing pulses almost imperceptibly with the breath (via --breath).
 */
export default function Clock({ opacity, reduceMotion }: ClockProps) {
  const [time, setTime] = useState<{ hh: string; mm: string } | null>(null);
  const sweepRef = useRef<SVGGElement>(null);

  // Update the digits each minute; no second-by-second text churn.
  useEffect(() => {
    const update = () => setTime(parts(new Date()));
    update();
    const id = window.setInterval(update, 1000 * 15);
    return () => window.clearInterval(id);
  }, []);

  // Sweep the seconds point smoothly around the ring.
  useEffect(() => {
    if (!CLOCK.showSecondsRing) return;
    const g = sweepRef.current;
    if (!g) return;

    const apply = (frac: number) =>
      g.setAttribute("transform", `rotate(${frac * 360} 50 50)`);

    if (reduceMotion) {
      apply(new Date().getSeconds() / 60);
      return;
    }
    let raf = 0;
    const tick = () => {
      const now = new Date();
      apply((now.getSeconds() + now.getMilliseconds() / 1000) / 60);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        opacity,
        transition: "opacity 1600ms ease",
        transform: "scale(calc(1 + var(--breath) * 0.005))",
      }}
    >
      {CLOCK.showSecondsRing && (
        <svg
          className="pointer-events-none absolute"
          width="min(78vmin, 760px)"
          height="min(78vmin, 760px)"
          viewBox="0 0 100 100"
          aria-hidden
        >
          {/* Faint halo track the light travels along. */}
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="rgb(var(--glow))"
            strokeWidth="0.15"
            style={{ opacity: 0.12 }}
          />
          {/* The sweeping point of light. */}
          <g ref={sweepRef}>
            <circle
              cx="50"
              cy="3"
              r="0.9"
              fill="rgb(var(--glow))"
              style={{
                filter:
                  "drop-shadow(0 0 2px rgba(var(--glow), 0.9)) drop-shadow(0 0 5px rgba(var(--glow), 0.6))",
              }}
            />
          </g>
        </svg>
      )}

      <time
        className="select-none tabular-nums"
        style={{
          fontSize: "min(23vmin, 270px)",
          fontWeight: 100,
          letterSpacing: "0.02em",
          lineHeight: 1,
          color: "rgb(var(--glow))",
          opacity: 0.96,
          textShadow:
            "0 0 1px rgba(var(--glow), 0.5), 0 0 calc(34px + var(--breath) * 22px) rgba(var(--glow), calc(0.12 + var(--breath) * 0.1))",
        }}
        suppressHydrationWarning
      >
        {time ? (
          <>
            {time.hh}
            <span style={{ opacity: 0.32, margin: "0 0.02em" }}>:</span>
            {time.mm}
          </>
        ) : (
          " "
        )}
      </time>
    </div>
  );
}
