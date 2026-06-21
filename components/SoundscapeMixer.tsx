"use client";

import { useEffect, useRef } from "react";
import { LAYERS, LayerId, SoundscapeEngine } from "@/lib/audio";

export type MixerLevels = Record<LayerId, number>;

export const EMPTY_MIXER: MixerLevels = {
  rain: 0,
  wind: 0,
  brown: 0,
  fire: 0,
};

interface SoundscapeMixerProps {
  levels: MixerLevels;
  onChange: (next: MixerLevels) => void;
}

/**
 * The soundscape mixer: one slow-fade volume slider per blendable layer. Layers
 * mix freely; the actual crossfades happen in the audio engine. Eyes-free by
 * design — a quiet frosted strip you adjust by feel, not something to look at.
 * The audio graph is built lazily on first interaction and resumes on any user
 * gesture (browser autoplay policy).
 */
export default function SoundscapeMixer({
  levels,
  onChange,
}: SoundscapeMixerProps) {
  const engineRef = useRef<SoundscapeEngine | null>(null);
  if (engineRef.current === null) engineRef.current = new SoundscapeEngine();

  // Push every level change into the engine (which eases each one slowly).
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    for (const { id } of LAYERS) engine.setLevel(id, levels[id]);
  }, [levels]);

  // Restored levels can't sound until a gesture; resume on the first one.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const resume = () => {
      for (const { id } of LAYERS) engine.setLevel(id, levels[id]);
    };
    window.addEventListener("pointerdown", resume, { once: true });
    return () => window.removeEventListener("pointerdown", resume);
    // Intentionally run once on mount with the initial levels.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => engineRef.current?.dispose(), []);

  const set = (id: LayerId, value: number) =>
    onChange({ ...levels, [id]: value });

  return (
    <div
      className="flex items-end gap-5 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-3 backdrop-blur-md"
      style={{ boxShadow: "0 0 40px rgba(0,0,0,0.4)" }}
    >
      {LAYERS.map(({ id, label }) => (
        <label
          key={id}
          className="flex flex-col items-center gap-2"
          title={label}
        >
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={levels[id]}
            onChange={(e) => set(id, Number(e.target.value))}
            aria-label={label}
            className="ss-slider"
          />
          <span
            className="text-[10px] uppercase tracking-[0.18em]"
            style={{
              color: "rgb(var(--glow))",
              opacity: levels[id] > 0 ? 0.7 : 0.3,
              transition: "opacity 600ms",
            }}
          >
            {label}
          </span>
        </label>
      ))}
    </div>
  );
}
