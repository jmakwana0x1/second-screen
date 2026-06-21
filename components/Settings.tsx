"use client";

import { ACCENT } from "@/lib/config";

interface SettingsProps {
  accent: string;
  onAccentChange: (next: string) => void;
  reduceMotion: boolean;
  onReduceMotionChange: (next: boolean) => void;
}

/**
 * The only real settings: which accent glow, and whether to reduce motion.
 * Deliberately tiny and tucked away — part of the controls that fade out when
 * the user settles. Nothing here is chaseable.
 */
export default function Settings({
  accent,
  onAccentChange,
  reduceMotion,
  onReduceMotionChange,
}: SettingsProps) {
  return (
    <div className="flex items-center gap-3">
      {Object.entries(ACCENT.presets).map(([name, value]) => (
        <button
          key={name}
          type="button"
          onClick={() => onAccentChange(value)}
          aria-label={`${name} accent`}
          aria-pressed={accent === value}
          className="h-3.5 w-3.5 rounded-full transition-transform hover:scale-125"
          style={{
            background: value,
            boxShadow:
              accent === value ? `0 0 8px ${value}` : "none",
            outline:
              accent === value ? "1px solid rgba(255,255,255,0.35)" : "none",
            outlineOffset: "2px",
            opacity: accent === value ? 1 : 0.5,
          }}
        />
      ))}
      <button
        type="button"
        onClick={() => onReduceMotionChange(!reduceMotion)}
        aria-pressed={reduceMotion}
        className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors hover:border-white/25"
        style={{
          color: "rgb(var(--glow))",
          opacity: reduceMotion ? 0.8 : 0.45,
        }}
      >
        {reduceMotion ? "motion off" : "motion on"}
      </button>
    </div>
  );
}
