# Motion config and personality profiles

**Repo:** `girtonian/page-mascot`  
**Date:** 2026-09-17  
**Status:** Approved for implementation planning after user review of this spec

## Goal

Add a typed motion configuration layer and named personality profiles on top of the existing `Mascot` runtime, without changing default behavior. Leave a clean merge slot for optional per-character `motion.json` later.

## Non-goals (v1)

- Per-character `motion.json` loading (path reserved only)
- Custom sector layouts or non-3×3 sheets
- New sprite cells or new art pipeline
- Separate non-React motion runtime package
- Visual motion editor / playground UI

## Architecture

Keep `Mascot` as the public React component. Add a small motion layer beside it:

| File | Role |
| --- | --- |
| `src/motion/types.ts` | `MotionConfig` (fully resolved) and `MotionProfile` (`DeepPartial<MotionConfig>` + optional `id` / `label`) |
| `src/motion/defaults.ts` | `defaultMotion` — numbers copied from today’s hard-coded constants |
| `src/motion/profiles.ts` | Named profiles: `calm`, `bouncy`, `shy`, `hyper` |
| `src/motion/resolve.ts` | `resolveMotion({ personality?, motion?, characterMotion? })` |
| `src/mascot.tsx` | Reads only from a resolved `MotionConfig` |

### Public API

```tsx
<Mascot
  directions={…}
  reactions={…}
  personality="bouncy"      // optional named profile
  motion={{ idle: { … } }}  // optional partial override
/>
```

### Merge order

1. `defaultMotion`
2. Named `personality` profile (if valid)
3. Optional `characterMotion` (reserved for later JSON packs; unused in v1 callers)
4. Inline `motion` prop

Later, a loader can read `characters/<id>/motion.json` into `characterMotion` without changing the prop API.

### Idle and reduced motion

Idle runs in the same component via a config-driven timer. It may set a reaction only when no boop reaction is active, and optionally only when the head is centered (`idle.onlyWhenCentered`).

- Squash is skipped when `prefers-reduced-motion: reduce` or `squash.enabled` is false.
- Idle is skipped when `idle.enabled` is false, or when `idle.respectReducedMotion` is true (default) and reduced motion is preferred.
- Look-at and instant reaction swaps remain available under reduced motion.

No new runtime dependencies. Character art packs stay as-is; profiles are TypeScript in v1.

## Config shape

### `MotionConfig`

- **`lookAt`**
  - `deadZone` (px)
  - `hysteresis` (radians fraction of sector, same meaning as today’s `HYSTERESIS`)
  - Sectors stay 8 directions + center; not customizable in v1 beyond these feel knobs
- **`boop`**
  - `blinkMs` — delay before payoff reaction (`BOOP_PAYOFF`)
  - `endMs` — when the boop reaction clears (`BOOP_END`)
  - `dizzyAfter` — tap count threshold
  - `dizzyWindowMs` — window for counting taps
  - `dizzyHoldMs` — how long dizzy shows
  - `payoffs` — ordered reaction names from the sheet
- **`reactions`**
  - `allowed` — which of the nine sheet cells this personality may use (boop + idle pick from this set)
- **`squash`**
  - `enabled`
  - `durationMs`
  - `keyframes` — WAAPI `Keyframe[]` (same shape as today)
- **`idle`**
  - `enabled`
  - `minIntervalMs` / `maxIntervalMs`
  - `chance` — probability to fire when a tick lands
  - `reactions` — candidates
  - `holdMs`
  - `onlyWhenCentered`
  - `respectReducedMotion` (default `true`)

### `MotionProfile`

`DeepPartial<MotionConfig>` plus optional `id` and `label`.

### Defaults (no behavior change)

`defaultMotion` mirrors current hard-coded values in `src/mascot.tsx`:

- Look-at: `DEAD_ZONE = 70`, `HYSTERESIS = 0.12`
- Boop: `BOOP_PAYOFF = 120`, `BOOP_END = 560`, `DIZZY_AFTER = 4`, `DIZZY_WINDOW = 1600`, `DIZZY_END = 1100`, payoffs `heart` / `sparkle` / `delighted`
- Squash: current `SQUASH` keyframes, `SQUASH_MS = 420`, enabled
- Idle: **`enabled: false`** so omitting props is a true no-behavior-change refactor
- `reactions.allowed`: all nine current reactions

### Named profiles (v1 starting points)

| Id | Intent |
| --- | --- |
| `calm` | Larger dead zone, slower boop, soft squash, sparse idle blinks |
| `bouncy` | Snappier squash, shorter boop, more delighted/sparkle payoffs, idle on |
| `shy` | High hysteresis, bashful/wink heavy, gentle squash, rare idle |
| `hyper` | Small dead zone, fast boop, dizzy sooner, frequent idle sparkles |

Exact numbers are chosen during implementation to feel distinct while staying within the same sheet vocabulary; they must remain valid against `reactions.allowed`.

## Data flow

1. On render, `resolveMotion({ personality, motion })` produces one `MotionConfig`.
2. Look-at effect reads `lookAt.*` (still gated on fine pointer + hover).
3. Boop handler reads `boop.*`, filters `payoffs` through `reactions.allowed`, drives timers and optional squash.
4. Idle effect schedules the next tick from `idle.*`; no-ops while a boop reaction is active.
5. Unmount clears timers; squash animation is canceled or left to finish on the element going away.

## Error handling and edge cases

- Unknown `personality` → warn once in development, treat as no personality (still apply `motion`).
- Reaction names in `payoffs` / `idle.reactions` missing from the sheet or from `reactions.allowed` → filter out; if empty, use `blink` when allowed, else the first allowed reaction.
- Boop while idle is mid-hold → cancel idle timers, run boop.
- Rapid remount / unmount during squash or timeouts → clear timers on cleanup.
- No fine pointer → skip look-at; idle and boop still work.
- `prefers-reduced-motion` → skip squash; skip idle when `idle.respectReducedMotion` is true.

## Package exports

From the package entry:

- `Mascot`
- `defaultMotion`
- `profiles` (record of named `MotionProfile`s)
- `resolveMotion`
- Types: `MotionConfig`, `MotionProfile`, `MascotProps` (extended)

## Testing and success criteria

- Omitting `personality` and `motion` matches current behavior (including no idle).
- Each named profile resolves to a full config and runs without runtime errors.
- `tsc` / existing lint and build scripts pass.
- README documents `personality`, `motion`, and the four profiles.
- Manual demo check: default fox feels unchanged; `bouncy` and `shy` are obviously different.

## Path to per-character JSON (post-v1)

`resolveMotion` accepts optional `characterMotion?: MotionProfile` between personality and the inline prop. A future loader may read `characters/<id>/motion.json`. Not implemented in v1.

## Implementation notes

- Prefer deep-merge for nested objects; arrays in a profile replace (do not concat) the default array.
- Keep sprite cell indices and sheet layout unchanged.
- Sync skill copy of `mascot.tsx` via existing `sync:skill` / `check:skill` scripts after the refactor.

## Out of scope follow-ups

- Motion playground / design tools
- Richer choreography (direction transition easing beyond hysteresis, multi-step idle sequences)
- Authoring `motion.json` for existing character packs
