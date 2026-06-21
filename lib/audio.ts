import { AUDIO } from "./config";

/**
 * audio.ts — the soundscape mixer engine.
 *
 * Every layer is SYNTHESIZED procedurally with the Web Audio API (filtered
 * noise + slow LFOs), so the app ships with zero binary assets and nothing ever
 * streams. Each layer owns its own gain node for true blending, and every level
 * change is a slow crossfade — no abrupt starts, no clicks. The whole graph is
 * suspended when everything is silent so it costs nothing on a second monitor.
 *
 * Layers are deliberately textural, not musical: there is nothing to listen
 * *to*, only an atmosphere to sit inside. Recorded loops could be swapped in
 * per layer later without changing the mixer UI.
 */

export type LayerId = "rain" | "wind" | "brown" | "fire";

export interface LayerMeta {
  id: LayerId;
  label: string;
}

export const LAYERS: readonly LayerMeta[] = [
  { id: "rain", label: "Rain" },
  { id: "wind", label: "Wind" },
  { id: "brown", label: "Brown noise" },
  { id: "fire", label: "Fire" },
] as const;

/** Per-layer ceiling so equal slider positions feel roughly balanced. */
const LAYER_MAX_GAIN: Record<LayerId, number> = {
  rain: 0.5,
  wind: 0.75,
  brown: 0.4,
  fire: 0.7,
};

interface LayerNodes {
  gain: GainNode;
  level: number;
}

function makeNoiseBuffer(ctx: AudioContext, kind: "white" | "brown"): AudioBuffer {
  const seconds = 3;
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (kind === "white") {
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  // Brown noise: integrate white noise with a small leak, then normalize.
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}

export class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private layers = new Map<LayerId, LayerNodes>();

  /** Lazily build the audio graph on the first real interaction. */
  private ensure(): AudioContext {
    if (this.ctx) return this.ctx;

    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctor();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = AUDIO.masterGain;
    master.connect(ctx.destination);
    this.master = master;

    const white = makeNoiseBuffer(ctx, "white");
    const brown = makeNoiseBuffer(ctx, "brown");

    const loopSource = (buffer: AudioBuffer): AudioBufferSourceNode => {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      src.start();
      return src;
    };

    const slowLfo = (freq: number, depth: number, center: number) => {
      const osc = ctx.createOscillator();
      osc.frequency.value = freq;
      const amp = ctx.createGain();
      amp.gain.value = depth;
      osc.connect(amp);
      osc.start();
      return { osc, amp, center };
    };

    // Each layer ends in its own gain node (starts silent) → master.
    const buildLayer = (id: LayerId, head: AudioNode) => {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      head.connect(gain);
      gain.connect(master);
      this.layers.set(id, { gain, level: 0 });
    };

    // Rain: high-passed white noise — a fine, airy hiss with a touch of body.
    {
      const src = loopSource(white);
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 600;
      const peak = ctx.createBiquadFilter();
      peak.type = "peaking";
      peak.frequency.value = 3200;
      peak.gain.value = 4;
      src.connect(hp);
      hp.connect(peak);
      buildLayer("rain", peak);
    }

    // Wind: low-passed brown noise with the cutoff and level gusting slowly.
    {
      const src = loopSource(brown);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 500;
      const lfo = slowLfo(0.08, 260, 500);
      lfo.amp.connect(lp.frequency); // gust the cutoff ±260Hz around 500Hz
      src.connect(lp);
      buildLayer("wind", lp);
    }

    // Brown noise: the raw warm rumble, lightly tamed.
    {
      const src = loopSource(brown);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2000;
      src.connect(lp);
      buildLayer("brown", lp);
    }

    // Fire: a low brown rumble with a slow amplitude wobble — felt warmth.
    {
      const src = loopSource(brown);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 380;
      const wobble = ctx.createGain();
      wobble.gain.value = 1;
      const lfo = slowLfo(0.3, 0.35, 1);
      lfo.amp.connect(wobble.gain); // gentle crackle-like swell
      src.connect(lp);
      lp.connect(wobble);
      buildLayer("fire", wobble);
    }

    return ctx;
  }

  /** Set a layer's level (0..1) with a slow crossfade. */
  setLevel(id: LayerId, level: number): void {
    const ctx = this.ensure();
    void ctx.resume();
    const layer = this.layers.get(id);
    if (!layer) return;
    layer.level = level;
    const target = level * LAYER_MAX_GAIN[id];
    layer.gain.gain.setTargetAtTime(
      target,
      ctx.currentTime,
      AUDIO.fadeSeconds / 3,
    );
    this.scheduleSilenceCheck();
  }

  /** When every layer is silent, suspend the context after the fades settle. */
  private silenceTimer: number | null = null;
  private scheduleSilenceCheck(): void {
    if (this.silenceTimer !== null) window.clearTimeout(this.silenceTimer);
    this.silenceTimer = window.setTimeout(
      () => {
        const anyAudible = [...this.layers.values()].some((l) => l.level > 0);
        if (!anyAudible && this.ctx && this.ctx.state === "running") {
          void this.ctx.suspend();
        }
      },
      AUDIO.fadeSeconds * 1000 + 300,
    );
  }

  dispose(): void {
    if (this.silenceTimer !== null) window.clearTimeout(this.silenceTimer);
    void this.ctx?.close();
    this.ctx = null;
    this.layers.clear();
  }
}
