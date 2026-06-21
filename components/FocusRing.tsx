"use client";

import { FOCUS_SESSION } from "@/lib/config";
import type { FocusSession } from "@/hooks/useFocusSession";

interface FocusRingProps {
  session: FocusSession;
}

/**
 * The felt focus ring — minimal start/stop only. When idle it offers a few
 * session lengths as small pills. While running it shows only a tiny peripheral
 * ring that fills as the session progresses (the real signal is the whole
 * screen slowly cooling, handled by the ambient field). No big timer digits.
 */
export default function FocusRing({ session }: FocusRingProps) {
  const { running, progress, start, stop } = session;

  if (!running) {
    return (
      <div className="flex items-center gap-3">
        <span
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "rgb(var(--glow))", opacity: 0.4 }}
        >
          focus
        </span>
        {FOCUS_SESSION.presets.map((mins) => (
          <button
            key={mins}
            type="button"
            onClick={() => start(mins)}
            className="rounded-full border border-white/10 px-3 py-1 text-xs tabular-nums transition-colors hover:border-white/25"
            style={{ color: "rgb(var(--glow))", opacity: 0.55 }}
            aria-label={`Start a ${mins} minute focus session`}
          >
            {mins}
          </button>
        ))}
      </div>
    );
  }

  const r = 9;
  const circ = 2 * Math.PI * r;

  return (
    <button
      type="button"
      onClick={stop}
      className="group flex items-center gap-2"
      aria-label="End focus session"
      title="End focus session"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke="rgb(var(--glow))"
          strokeWidth="1.5"
          style={{ opacity: 0.15 }}
        />
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke="rgb(var(--glow))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          transform="rotate(-90 12 12)"
          style={{ opacity: 0.7, transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <span
        className="text-[10px] uppercase tracking-[0.2em] opacity-0 transition-opacity group-hover:opacity-60"
        style={{ color: "rgb(var(--glow))" }}
      >
        end
      </span>
    </button>
  );
}
