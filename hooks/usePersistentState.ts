"use client";

import { useEffect, useState } from "react";

/**
 * useState backed by localStorage. No backend, no auth — this is a local,
 * standalone, single-user object. Reads the stored value on mount (after
 * hydration to stay SSR-safe) and writes back on every change.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // Corrupt or unavailable storage — fall back to the initial value.
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked — the app still works, just won't persist.
    }
  }, [key, value, hydrated]);

  return [value, setValue];
}
