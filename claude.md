# Project: [name TBD — e.g. Ambient, Void, Stillpoint, Second Screen]

## What we're building
A standalone ambient focus display for a second monitor. Not an app you check —
an object you work next to. It fills the empty-screen void that pulls attention
toward distraction (X, novelty tabs) and bounces that glance back to work. It is
calm, alive, and content-free. It runs fullscreen on a secondary monitor all day.

## The one principle everything is judged against
REWARD A GLANCE, PUNISH A STARE. Anything interesting to look at for more than
~2 seconds has become a feed and has failed. The design is "alive but content-
free": atmosphere and gentle motion with nothing to chase, click, or read for
long. When a feature is ambiguous, choose the version with LESS to engage with.

## What it refuses to show (this is a feature, not a gap)
No notifications. No feeds. No message previews. No clickable lists. No calendar
agenda. No badges, no counts, nothing chaseable. The restraint IS the product.
Do not add "helpful" widgets that reintroduce distraction. If in doubt, leave
it out.

## Aesthetic direction
Liquid-ambient: deep near-black base, a slow-flowing gradient mesh / soft blob
field drifting underneath, frosted-glass surfaces, one soft glow accent. The
"expensive screensaver" look — premium, dark, tranquil. Carries dark-glass DNA
from my other apps but is its own thing: slower, softer, no hard data UI.
- Motion is always SLOW. Nothing snaps. Transitions measured in seconds, not ms.
- One accent glow color as a CSS variable. Default: soft cyan-white or warm amber.
- Respect prefers-reduced-motion: degrade to a near-static gradient gracefully.

## Signature element
A 6-second BREATHING pulse across the whole interface (inhale/exhale rhythm tuned
for calm breathing). The ambient glow swells and recedes, the gradient drifts, the
clock pulses almost imperceptibly. It should subtly entrain the viewer's breathing
and co-regulate calm. This is the soul of the app — everything else moves in
sympathy with it.

## Core elements (v1 scope — build exactly these, nothing more)
1. OVERSIZED CLOCK — the anchor. Large, quiet, centered-ish. Show seconds as a
   thin SWEEPING RING, not ticking digits, so there's ambient motion with nothing
   to read. Time itself should be glanceable in <1s.
2. ONE FOCUS LINE — a single self-set intention the user types in the morning
   (e.g. "Shipping the calendar sync"). Big, quiet, low-contrast. The only real
   "content." It occasionally breathes slightly brighter as a soft, non-nagging
   reminder of intent — never a notification.
3. AMBIENT SOUNDSCAPE MIXER — blendable layers (e.g. rain, cafe, brown noise,
   wind, fire) each with its own slow-fade volume slider. Layers mix freely.
   Eyes-free by design. Slow crossfades, no abrupt starts. Controls stay hidden
   until the user leans in (see idle intelligence).
4. FELT POMODORO / FOCUS RING — a focus session you SENSE peripherally, not a
   countdown you watch. Progress is expressed as the WHOLE SCREEN slowly shifting
   (e.g. a gradual color-temperature cool over the session, or the ambient field
   slowly clearing), not a ticking number. Minimal start/stop only; no big timer
   digits dominating the screen.
5. IDLE INTELLIGENCE — after a few minutes of no mouse/keyboard, the UI dims
   further and simplifies toward pure wallpaper (controls fade out, focus line
   and clock soften). On mouse move / lean-in, minimal controls gently fade up.
   It is QUIETEST exactly when the user has settled into deep work.

## Optional v1.5 (only after the five above feel perfect)
- A single "next thing at 3:00" line that appears ONLY ~10 min before an event
  and vanishes after — at most one, never a list. (Calendar read optional/later.)
- Daylight-true background: base color temperature tracks real sun position for
  the user's location (warm dawn → bright noon → amber dusk → deep night).

## Stack (non-negotiable unless I say otherwise)
- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS
- Framer Motion for the slow ambient motion + breathing pulse
- Web Audio API for the soundscape mixer (gain nodes per layer for true blending
  + smooth fades). Loop royalty-free ambient audio files; no external streaming.
- Canvas or CSS for the gradient mesh / blob field (prefer GPU-friendly; watch
  battery/CPU — this runs all day).
- localStorage for persistence (focus line, mixer levels, settings). NO backend,
  NO Supabase, NO auth — this is a local, standalone, single-user object.
- Deploy: static export, runnable as a local file / Vercel. Should also work
  mounted as an animated wallpaper (e.g. Lively Wallpaper) pointed at the URL.

## Performance rules (it runs all day on a second monitor)
- Idle CPU/GPU must be low. Throttle or pause animation when the tab/window is
  hidden or idle. Use requestAnimationFrame, cap frame rate for the ambient
  field, avoid layout thrash. Test that it doesn't spin fans after an hour.
- Pause/suspend the audio graph cleanly when muted; no audible clicks on fade.

## Engineering rules
- TypeScript strict. No `any` without a justifying comment.
- Small, composable components. Keep the ambient renderer isolated from UI.
- Everything tunable (breath duration, dim delays, fade times, colors) lives in
  one clearly-commented config/constants file so the feel is easy to adjust.
- prefers-reduced-motion and a manual "reduce motion" toggle both respected.

## How to work with me
- Be direct, no hedging. If an idea fights the "glance not stare" principle, say
  so and push back.
- Build incrementally; keep it runnable at every step. Commit after each step.
- Get the ambient FEEL right before adding features — a beautiful breathing
  gradient + clock with nothing else is a valid, shippable first milestone.
- When a design choice is ambiguous, pick the calmer, quieter, more restrained
  option and tell me what you chose.