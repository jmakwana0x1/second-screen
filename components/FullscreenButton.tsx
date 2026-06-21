"use client";

import { useEffect, useState } from "react";

/**
 * A quiet toggle to send the ambient object fullscreen — how you'd actually run
 * it on a second monitor. Tucked in with the other controls; fades away with
 * them when the user settles.
 */
export default function FullscreenButton() {
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isFull ? "Exit fullscreen" : "Enter fullscreen"}
      title={isFull ? "Exit fullscreen" : "Enter fullscreen"}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 transition-colors hover:border-white/25"
      style={{ color: "rgb(var(--glow))", opacity: 0.55 }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
        {isFull ? (
          <path
            d="M9 4v3a2 2 0 0 1-2 2H4M15 4v3a2 2 0 0 0 2 2h3M9 20v-3a2 2 0 0 0-2-2H4M15 20v-3a2 2 0 0 1 2-2h3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M4 9V6a2 2 0 0 1 2-2h3M20 9V6a2 2 0 0 0-2-2h-3M4 15v3a2 2 0 0 0 2 2h3M20 15v3a2 2 0 0 1-2 2h-3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}
