"use client";

import { useEffect, useRef, useState } from "react";
import { CLOCK } from "@/lib/config";

interface ClockProps {
  /** Opacity from the idle stage; the clock softens as the user settles. */
  opacity: number;
  reduceMotion: boolean;
}

function formatTime(now: Date): string {
  let h = now.getHours();
  const m = now.getMinutes();
  if (!CLOCK.hour24) {
    h = h % 12;
    if (h === 0) h = 12;
  }
  const hh = CLOCK.hour24 ? String(h).padStart(2, "0") : String(h);
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * The anchor: a large, quiet clock. Time reads in under a second. Seconds are a
 * thin sweeping ring rather than ticking digits, so there is ambient motion but
 * nothing to read. The whole thing pulses almost imperceptibly with the breath
 * (via the --breath CSS variable), never demanding attention.
 */
export default function Clock({ opacity, reduceMotion }: ClockProps) {
  const [time, setTime] = useState("");
  const ringRef = useRef<SVGCircleElement>(null);

  // Update the digits once per minute; no second-by-second text churn.
  useEffect(() => {
    const update = () => setTime(formatTime(new Date()));
    update();
    const id = window.setInterval(update, 1000 * 15);
    return () => window.clearInterval(id);
  }, []);

  // Sweep the seconds ring smoothly with requestAnimationFrame.
  useEffect(() => {
    if (!CLOCK.showSecondsRing) return;
    const circle = ringRef.current;
    if (!circle) return;
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = `${circumference}`;

    const apply = (frac: number) => {
      circle.style.strokeDashoffset = `${circumference * (1 - frac)}`;
    };

    if (reduceMotion) {
      const now = new Date();
      apply(now.getSeconds() / 60);
      return;
    }

    let raf = 0;
    const tick = () => {
      const now = new Date();
      const frac = (now.getSeconds() + now.getMilliseconds() / 1000) / 60;
      apply(frac);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  return (
    <div
      className="relative flex items-center justify-center transition-opacity"
      style={{
        opacity,
        transitionDuration: "1600ms",
        // Almost-imperceptible breath pulse on scale + glow.
        transform: "scale(calc(1 + var(--breath) * 0.006))",
      }}
    >
      {CLOCK.showSecondsRing && (
        <svg
          className="absolute"
          width="min(62vmin, 620px)"
          height="min(62vmin, 620px)"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <circle
            ref={ringRef}
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgb(var(--glow))"
            strokeWidth={CLOCK.ringStroke / 4}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{
              opacity: 0.35,
              filter: "drop-shadow(0 0 6px rgba(var(--glow), 0.4))",
            }}
          />
        </svg>
      )}
      <time
        className="select-none font-sans tabular-nums"
        style={{
          fontSize: "min(26vmin, 260px)",
          fontWeight: 200,
          letterSpacing: "-0.03em",
          color: "rgb(var(--glow))",
          opacity: 0.92,
          // The glow swells gently with the breath.
          textShadow:
            "0 0 calc(28px + var(--breath) * 26px) rgba(var(--glow), calc(0.18 + var(--breath) * 0.16))",
        }}
        suppressHydrationWarning
      >
        {time || " "}
      </time>
    </div>
  );
}
