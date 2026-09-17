# Motion Config and Personality Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a typed `MotionConfig` layer and named personality profiles (`calm`, `bouncy`, `shy`, `hyper`) on top of the existing `Mascot` runtime, with default behavior unchanged and a reserved merge slot for future per-character `motion.json`.

**Architecture:** Extract motion constants into `defaultMotion`, merge named profiles and optional inline `motion` via `resolveMotion`, then drive look-at / boop / squash / idle from the resolved config inside `src/mascot.tsx`. Keep sprite sheets and cell layout unchanged.

**Tech Stack:** React 18+, TypeScript, Vite, WAAPI for squash, Vitest for motion-unit tests (new).

**Spec:** `docs/superpowers/specs/2026-09-17-motion-config-personality-design.md`

## Global Constraints

- Omitting `personality` and `motion` must match current hard-coded behavior; `defaultMotion.idle.enabled` is `false`.
- No new runtime dependencies beyond a dev test runner.
- Deep-merge nested objects; arrays in a profile **replace** (do not concat) default arrays.
- Unknown `personality` → warn once in development, ignore personality, still apply `motion`.
- Filter invalid reaction names; if empty, use `blink` when allowed, else first allowed.
- `prefers-reduced-motion`: skip squash; skip idle when `idle.respectReducedMotion` is true (default).
- Keep `sync:skill` / `check:skill` green after changing `src/mascot.tsx`.
- Do not implement `motion.json` loading in v1; only accept optional `characterMotion` in `resolveMotion` for the future slot.

## File map

| File | Responsibility |
| --- | --- |
| `src/motion/types.ts` | `ReactionName`, `MotionConfig`, `MotionProfile`, `ResolveMotionInput` |
| `src/motion/defaults.ts` | `defaultMotion`, `ALL_REACTIONS`, current squash keyframes |
| `src/motion/merge.ts` | `deepMergeMotion(base, partial)` |
| `src/motion/resolve.ts` | `resolveMotion`, `pickReaction` |
| `src/motion/profiles.ts` | Named profiles record |
| `src/motion/index.ts` | Public re-exports for motion |
| `src/mascot.tsx` | Component reads resolved config; props `personality?`, `motion?` |
| `src/index.ts` | Package exports |
| `src/motion/*.test.ts` | Vitest unit tests |
| `vitest.config.ts` | Test config |
| `package.json` | `test` script + vitest devDependency |
| `README.md` | Document props and profiles |
| `skills/page-mascot/mascot.tsx` | Synced copy via `npm run sync:skill` |

---

### Task 1: Motion types, defaults, merge, resolve + Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `src/motion/types.ts`
- Create: `src/motion/defaults.ts`
- Create: `src/motion/merge.ts`
- Create: `src/motion/resolve.ts`
- Create: `src/motion/resolve.test.ts`
- Modify: `package.json` (add vitest, `test` script)

**Interfaces:**
- Produces: `MotionConfig`, `MotionProfile`, `ResolveMotionInput`, `defaultMotion`, `deepMergeMotion`, `resolveMotion`, `pickReaction`, `ALL_REACTIONS`

- [ ] **Step 1: Add Vitest** — add vitest devDependency; scripts `test` / `test:watch`; create `vitest.config.ts` with `environment: 'node'` and `include: ['src/**/*.test.ts']`.

- [ ] **Step 2: Write failing tests** in `src/motion/resolve.test.ts` covering: empty input equals `defaultMotion`; deep merge + array replace; personality then motion (motion wins); unknown personality warns and still applies motion; `characterMotion` between personality and motion; `pickReaction` fallbacks.

- [ ] **Step 3: Run `npm test`** — expect FAIL (missing modules).

- [ ] **Step 4: Implement `src/motion/types.ts`** with `REACTION_NAMES`, `ReactionName`, `MotionConfig` (lookAt, boop, reactions, squash, idle), `DeepPartial`, `MotionProfile`, `ResolveMotionInput` as in the approved spec.

- [ ] **Step 5: Implement `defaults.ts`, `merge.ts`, `resolve.ts`** — copy current mascot constants into `defaultMotion` with `idle.enabled: false`; `deepMergeMotion` replaces arrays; `resolveMotion` merge order defaults → personality → characterMotion → motion; `pickReaction` filters allowed.

- [ ] **Step 6: Run `npm test`** — expect PASS.

- [ ] **Step 7: Commit** — `feat(motion): add MotionConfig types, defaults, and resolveMotion`

---

### Task 2: Named personality profiles

**Files:**
- Create: `src/motion/profiles.ts`, `src/motion/profiles.test.ts`, `src/motion/index.ts`

**Interfaces:**
- Produces: `profiles`, `personalityIds`, `PersonalityId`

- [ ] **Step 1: Failing tests** — keys are calm/bouncy/shy/hyper; each resolves with `idle.enabled: true` and differs from defaults on at least one feel knob.

- [ ] **Step 2: Run `npm test`** — expect FAIL.

- [ ] **Step 3: Implement profiles** — calm (larger dead zone, slower boop, soft squash, sparse centered idle); bouncy (snappier squash, shorter boop, delighted/sparkle, idle on); shy (high hysteresis, bashful/wink, gentle squash, rare idle); hyper (small dead zone, fast boop, dizzy sooner, frequent idle). Export via `src/motion/index.ts`.

- [ ] **Step 4: Run `npm test`** — expect PASS.

- [ ] **Step 5: Commit** — `feat(motion): add calm, bouncy, shy, and hyper personality profiles`

---

### Task 3: Refactor Mascot to consume resolved motion (parity, no idle yet)

**Files:**
- Modify: `src/mascot.tsx`

**Interfaces:**
- Consumes: `resolveMotion`, `profiles`, `pickReaction`
- Produces: `MascotProps` with optional `personality` and `motion`

- [ ] **Step 1: Extend props** — `personality?: PersonalityId | (string & {})`, `motion?: MotionProfile`; call `resolveMotion({ personality, motion, profiles })`.

- [ ] **Step 2: Replace hard-coded look-at / boop / squash** with `config.*`; keep DIRECTIONS and sheet cell math; filter payoffs via `pickReaction` / `reactions.allowed`; skip squash when disabled or reduced motion.

- [ ] **Step 3: `npm run typecheck`** — expect PASS.

- [ ] **Step 4: Commit** — `refactor(mascot): drive look-at, boop, and squash from MotionConfig`

---

### Task 4: Idle ambience from config

**Files:**
- Modify: `src/mascot.tsx`
- Optional: `src/motion/idle.ts` helper

- [ ] **Step 1: Idle effect** — if disabled or reduced-motion (when respectReducedMotion), no-op; schedule uniform delay in [min,max]; skip if boop reaction active or onlyWhenCentered and not centered; with `chance` set reaction via `pickReaction`, hold `holdMs`, reschedule; boop clears idle timers; cleanup on unmount.

- [ ] **Step 2: `npm run typecheck && npm test`** — expect PASS.

- [ ] **Step 3: Commit** — `feat(mascot): add config-driven idle reactions`

---

### Task 5: Package exports, README, skill sync

**Files:**
- Modify: `src/index.ts`, `README.md`, `skills/page-mascot/mascot.tsx`

- [ ] **Step 1: Export** `Mascot`, `defaultMotion`, `profiles`, `personalityIds`, `resolveMotion`, `pickReaction`, and motion types from `src/index.ts`.

- [ ] **Step 2: README** — document `personality` / `motion`, four profiles, example usage, default parity, reduced-motion notes.

- [ ] **Step 3: Verify** — `npm run sync:skill && npm run check:skill && npm run typecheck && npm test && npm run build` all PASS.

- [ ] **Step 4: Commit** — `docs: export motion API and document personality profiles`

---

### Task 6: Manual verification checklist

- [ ] Default fox unchanged (no idle)
- [ ] `personality="bouncy"` obviously snappier with idle
- [ ] `personality="shy"` obviously different
- [ ] Reduced motion: squash off, idle off
- [ ] Open implementation PR against `main`

---

## Spec coverage self-review

| Spec item | Task |
| --- | --- |
| Types + defaults + resolve + characterMotion slot | 1 |
| Named profiles | 2 |
| Mascot look-at/boop/squash from config | 3 |
| Idle | 4 |
| Errors / reduced motion | 1, 3, 4 |
| Exports + README + skill sync | 5 |
| Manual success criteria | 6 |
| No motion.json loader in v1 | Global constraint |
