export type RGB = [number, number, number];
export type HSL = [number, number, number];

/** Parse an "rgb(r, g, b)" string into an [r, g, b] triplet. */
export function parseRgb(value: string): RGB {
  const match = value.match(/(\d+)\D+(\d+)\D+(\d+)/);
  if (!match) return [150, 220, 235];
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Format an [r, g, b] triplet as the bare "r, g, b" used by CSS variables. */
export function rgbTriplet(value: string): string {
  return parseRgb(value).join(", ");
}

/** Convert [r,g,b] (0..255) to [h (0..360), s (0..1), l (0..1)]. */
export function rgbToHsl([r, g, b]: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = ((gn - bn) / d) % 6;
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}

/** Convert [h (0..360), s (0..1), l (0..1)] to [r,g,b] (0..255). */
export function hslToRgb([h, s, l]: HSL): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}
