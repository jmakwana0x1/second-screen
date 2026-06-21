"use client";

import { useEffect, useRef } from "react";
import { FIELD } from "@/lib/config";
import { breathAt } from "@/lib/breath";
import { hslToRgb, rgbToHsl, type RGB } from "@/lib/color";

interface AmbientFieldProps {
  /** Accent glow color as an [r,g,b] triplet. */
  accent: RGB;
  /** 0..1 focus-session progress; cools the whole field as it climbs. */
  sessionProgress: number;
  reduceMotion: boolean;
}

interface Blob {
  /** Home position, fraction of viewport (0..1). */
  hx: number;
  hy: number;
  /** Phase offsets so blobs drift independently. */
  px: number;
  py: number;
  radius: number;
  /** Hue offset from the accent, degrees — gives the mesh depth, not a smear. */
  hueShift: number;
  /** Per-blob brightness weight. */
  weight: number;
}

/**
 * The slow-flowing gradient mesh: a handful of large, soft, multi-hued light
 * pools drifting under everything, their collective glow swelling and receding
 * with the breath. Each pool sits a little off the accent hue so the field
 * reads as light with depth rather than a flat single-color wash. This is the
 * ambient renderer and is deliberately isolated from all UI. It caps its frame
 * rate and pauses when hidden so it stays quiet on a second monitor all day.
 * With reduced motion it paints a single near-static frame.
 */
export default function AmbientField({
  accent,
  sessionProgress,
  reduceMotion,
}: AmbientFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Live values read by the rAF loop without restarting it.
  const accentRef = useRef(accent);
  const progressRef = useRef(sessionProgress);
  accentRef.current = accent;
  progressRef.current = sessionProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const golden = 0.618033988749895;
    const blobs: Blob[] = Array.from({ length: FIELD.blobCount }, (_, i) => ({
      hx: 0.16 + ((i * golden) % 1) * 0.68,
      hy: 0.18 + ((i * golden * 1.7) % 1) * 0.64,
      px: i * 1.3,
      py: i * 2.1 + 0.5,
      radius: FIELD.blobRadius * (0.85 + ((i * 0.37) % 1) * 0.7),
      // Spread hues across a ~70° arc centered on the accent.
      hueShift: (i / Math.max(FIELD.blobCount - 1, 1) - 0.5) * 70,
      weight: 0.8 + ((i * 0.53) % 1) * 0.5,
    }));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const minDim = () => Math.min(width, height);
    const maxDim = () => Math.max(width, height);

    const draw = (timeMs: number) => {
      const breath = reduceMotion ? 0.5 : breathAt(timeMs);
      const cool = progressRef.current;
      const [ah, asat, al] = rgbToHsl(accentRef.current);

      // Deep base wash with the faintest hint of the accent hue, so the void
      // isn't a dead flat black (which bands badly).
      ctx.globalCompositeOperation = "source-over";
      const base = ctx.createLinearGradient(0, 0, 0, height);
      base.addColorStop(0, "#080a10");
      base.addColorStop(1, "#04050a");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      // Additive soft light pools.
      ctx.globalCompositeOperation = "lighter";
      const t = timeMs / 1000;
      const baseAlpha = 0.08 + breath * 0.06;

      for (const blob of blobs) {
        const drift = reduceMotion ? 0 : FIELD.driftRange;
        const wx = (t / FIELD.driftPeriodSeconds) * Math.PI * 2 + blob.px;
        const wy =
          (t / (FIELD.driftPeriodSeconds * 1.3)) * Math.PI * 2 + blob.py;
        const cx = (blob.hx + Math.sin(wx) * drift) * width;
        const cy = (blob.hy + Math.cos(wy) * drift) * height;
        const radius = blob.radius * maxDim();

        // As a focus session deepens, pull every hue toward indigo and desat-
        // urate slightly — the whole field cools without changing brightness.
        const hue = ah + blob.hueShift + cool * (250 - (ah + blob.hueShift)) * 0.6;
        const sat = Math.min(0.85, asat * 0.95) * (1 - cool * 0.2);
        const light = Math.min(0.72, al + 0.13);
        const [r, g, b] = hslToRgb([hue, sat, light]);
        const alpha = baseAlpha * blob.weight * (1 - cool * 0.18);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.45})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Gentle vignette to seat everything in the void — soft, not a hard frame.
      ctx.globalCompositeOperation = "source-over";
      const vig = ctx.createRadialGradient(
        width / 2,
        height * 0.46,
        minDim() * 0.35,
        width / 2,
        height * 0.46,
        maxDim() * 0.78,
      );
      vig.addColorStop(0, "rgba(4, 5, 10, 0)");
      vig.addColorStop(1, "rgba(3, 4, 8, 0.6)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
    };

    // Reduced motion: paint once and stop.
    if (reduceMotion) {
      draw(0);
      return () => window.removeEventListener("resize", resize);
    }

    let raf = 0;
    let last = 0;
    const frameInterval = 1000 / FIELD.fps;

    const loop = (timeMs: number) => {
      raf = requestAnimationFrame(loop);
      if (timeMs - last < frameInterval) return; // cap frame rate
      last = timeMs;
      draw(timeMs);
    };
    raf = requestAnimationFrame(loop);

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
