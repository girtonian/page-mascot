import { REACTION_NAMES } from './types.js'
import type { MotionConfig, ReactionName } from './types.js'

export const ALL_REACTIONS: ReactionName[] = [...REACTION_NAMES]

export const defaultMotion: MotionConfig = {
  lookAt: {
    deadZone: 70,
    hysteresis: 0.12,
  },
  boop: {
    blinkMs: 120,
    endMs: 560,
    dizzyAfter: 4,
    dizzyWindowMs: 1600,
    dizzyHoldMs: 1100,
    payoffs: ['heart', 'sparkle', 'delighted'],
  },
  reactions: {
    allowed: [...ALL_REACTIONS],
  },
  squash: {
    enabled: true,
    durationMs: 420,
    keyframes: [
      { transform: 'scale(1, 1)', easing: 'ease-in' },
      { transform: 'scale(1.10, 0.86)', offset: 0.18, easing: 'ease-out' },
      { transform: 'scale(0.95, 1.08)', offset: 0.45, easing: 'ease-in-out' },
      { transform: 'scale(1.03, 0.97)', offset: 0.72, easing: 'ease-in-out' },
      { transform: 'scale(1, 1)' },
    ],
  },
  idle: {
    enabled: false,
    minIntervalMs: 4000,
    maxIntervalMs: 12000,
    chance: 0.35,
    reactions: ['blink'],
    holdMs: 800,
    onlyWhenCentered: true,
    respectReducedMotion: true,
  },
}
