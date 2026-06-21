/** Parse an "rgb(r, g, b)" string into an [r, g, b] triplet. */
export function parseRgb(value: string): [number, number, number] {
  const match = value.match(/(\d+)\D+(\d+)\D+(\d+)/);
  if (!match) return [150, 220, 235];
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Format an [r, g, b] triplet as the bare "r, g, b" used by CSS variables. */
export function rgbTriplet(value: string): string {
  return parseRgb(value).join(", ");
}
