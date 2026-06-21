import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The void. Deep near-black base.
        base: "var(--base)",
        // The single accent glow, driven by one CSS variable (see globals.css).
        glow: "var(--glow)",
      },
      fontFamily: {
        // System UI stack kept deliberately quiet; no loud display fonts.
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
