"use client";

import { useEffect, useRef } from "react";
import { FIELD } from "@/lib/config";
import { breathAt } from "@/lib/breath";

type RGB = readonly [number, number, number];

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
}

/**
 * The slow-flowing gradient mesh: a handful of soft radial blobs drifting under
 * everything, their collective glow swelling and receding with the breath. This
 * is the ambient renderer and is deliberately isolated from all UI. It caps its
 * frame rate and pauses when hidden so it stays quiet on a second monitor all
 * day. With reduced motion it paints a single near-static frame.
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

    const blobs: Blob[] = Array.from({ length: FIELD.blobCount }, (_, i) => {
      const golden = 0.618033988749895;
      return {
        hx: (0.18 + ((i * golden) % 1) * 0.64),
        hy: (0.2 + ((i * golden * 1.7) % 1) * 0.6),
        px: i * 1.3,
        py: i * 2.1 + 0.5,
        radius: FIELD.blobRadius * (0.7 + ((i * 0.37) % 1) * 0.6),
      };
    });

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

    const draw = (timeMs: number) => {
      const breath = reduceMotion ? 0.5 : breathAt(timeMs);
      const [r, g, b] = accentRef.current;

      // Cool the field over a focus session: lerp accent toward a deeper,
      // bluer tone as progress climbs (color-temperature shift, felt not read).
      const cool = progressRef.current;
      const cr = Math.round(r * (1 - cool * 0.45));
      const cg = Math.round(g * (1 - cool * 0.25));
      const cb = Math.round(b * (1 - cool * 0.02));

      // Base wash.
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#060709";
      ctx.fillRect(0, 0, width, height);

      // Additive soft blobs.
      ctx.globalCompositeOperation = "lighter";
      const t = timeMs / 1000;
      const baseAlpha = 0.1 + breath * 0.07;

      for (const blob of blobs) {
        const drift = reduceMotion ? 0 : FIELD.driftRange;
        const wx = (t / FIELD.driftPeriodSeconds) * Math.PI * 2 + blob.px;
        const wy =
          (t / (FIELD.driftPeriodSeconds * 1.3)) * Math.PI * 2 + blob.py;
        const cx = (blob.hx + Math.sin(wx) * drift) * width;
        const cy = (blob.hy + Math.cos(wy) * drift) * height;
        const radius = blob.radius * minDim();

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${baseAlpha})`);
        grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Gentle vignette to seat everything in the void.
      ctx.globalCompositeOperation = "source-over";
      const vig = ctx.createRadialGradient(
        width / 2,
        height / 2,
        minDim() * 0.3,
        width / 2,
        height / 2,
        minDim() * 0.9,
      );
      vig.addColorStop(0, "rgba(6, 7, 9, 0)");
      vig.addColorStop(1, "rgba(6, 7, 9, 0.55)");
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
    // FOCUS_SESSION is constant; reduceMotion restarts the loop intentionally.
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
