"use client";

import { useEffect, useRef, useState } from "react";

interface FocusLineProps {
  value: string;
  onChange: (next: string) => void;
  /** Opacity from the idle stage; the line softens as the user settles. */
  opacity: number;
  reduceMotion: boolean;
}

/**
 * One focus line — a single self-set intention typed in the morning. Big,
 * quiet, low-contrast. The only real "content." It occasionally breathes
 * slightly brighter as a soft, non-nagging reminder of intent — never a
 * notification. Click it to edit; it persists to localStorage via the parent.
 */
export default function FocusLine({
  value,
  onChange,
  opacity,
  reduceMotion,
}: FocusLineProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    onChange(draft.trim());
    setEditing(false);
  };

  const shared =
    "w-[min(80vw,900px)] bg-transparent text-center font-sans outline-none";
  const typography = {
    fontSize: "min(4.2vmin, 40px)",
    fontWeight: 300,
    letterSpacing: "0.01em",
    color: "rgb(var(--glow))",
  } as const;

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        placeholder="what matters today"
        maxLength={80}
        className={`${shared} caret-glow placeholder:opacity-30`}
        style={{ ...typography, opacity: 0.85 }}
      />
    );
  }

  const empty = value.trim().length === 0;

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`${shared} cursor-text whitespace-nowrap overflow-hidden text-ellipsis transition-opacity ${
        reduceMotion ? "" : "focus-line-pulse"
      }`}
      style={{
        ...typography,
        opacity: empty ? opacity * 0.4 : opacity,
        transitionDuration: "1600ms",
        textShadow:
          "0 0 calc(14px + var(--breath) * 10px) rgba(var(--glow), 0.12)",
      }}
      aria-label={empty ? "Set your focus for today" : `Focus: ${value}`}
    >
      {empty ? "what matters today" : value}
    </button>
  );
}
