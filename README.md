# Second Screen

A standalone ambient focus display for a second monitor. Not an app you check —
an object you work next to. It fills the empty-screen void that pulls attention
toward distraction and bounces that glance back to work. Calm, alive, and
content-free. It runs fullscreen on a secondary monitor all day.

> **The one principle:** REWARD A GLANCE, PUNISH A STARE. Anything interesting
> to look at for more than ~2 seconds has become a feed and has failed.

## What it shows

- **Oversized clock** — the anchor. Seconds are a thin sweeping ring, not
  ticking digits, so there's ambient motion with nothing to read.
- **One focus line** — a single self-set intention you type in the morning. The
  only real content. Breathes slightly brighter now and then; never nags.
- **Soundscape mixer** — blendable ambient layers (rain, wind, brown noise,
  fire) with slow-fade volume sliders. Synthesized procedurally via Web Audio,
  so there are no external assets and nothing streams.
- **Felt focus ring** — a focus session you *sense* peripherally: the whole
  screen slowly cools as the session progresses. No countdown to watch.
- **Idle intelligence** — after a few minutes of no input the UI dims toward
  pure wallpaper; it's quietest exactly when you've settled into deep work.

## What it refuses to show

No notifications. No feeds. No message previews. No clickable lists. No badges,
no counts, nothing chaseable. The restraint **is** the product.

## Stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS · Framer Motion ·
Web Audio API. Static export, `localStorage` only — no backend, no auth.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
npm run typecheck
```

## Run it as a second screen

After `npm run build`, the static `out/` directory can be:

- Opened directly from the filesystem, or served anywhere static.
- Deployed to Vercel.
- Pointed at by an animated-wallpaper tool (e.g. Lively Wallpaper) for a true
  always-on ambient monitor.

Put the window fullscreen on your secondary display and leave it.

## Tuning the feel

Everything that shapes the mood — breath duration, dim delays, fade times,
colors, session length — lives in [`lib/config.ts`](lib/config.ts). Change a
number there and nowhere else. `prefers-reduced-motion` and a manual reduce-
motion toggle are both respected, degrading to a near-static gradient.
