import type { MotionProfile } from './types.js'

export const personalityIds = ['calm', 'bouncy', 'shy', 'hyper'] as const
export type PersonalityId = (typeof personalityIds)[number]

export const profiles: Record<PersonalityId, MotionProfile> = {
  calm: {
    id: 'calm',
    label: 'Calm',
    lookAt: {
      deadZone: 95,
      hysteresis: 0.18,
    },
    boop: {
      blinkMs: 180,
      endMs: 720,
    },
    squash: {
      durationMs: 560,
      keyframes: [
        { transform: 'scale(1, 1)', easing: 'ease-in' },
        { transform: 'scale(1.05, 0.94)', offset: 0.2, easing: 'ease-out' },
        { transform: 'scale(0.98, 1.03)', offset: 0.5, easing: 'ease-in-out' },
        { transform: 'scale(1.01, 0.99)', offset: 0.78, easing: 'ease-in-out' },
        { transform: 'scale(1, 1)' },
      ],
    },
    idle: {
      enabled: true,
      minIntervalMs: 9000,
      maxIntervalMs: 18000,
      chance: 0.18,
      reactions: ['blink', 'sleepy'],
      holdMs: 900,
      onlyWhenCentered: true,
    },
  },
  bouncy: {
    id: 'bouncy',
    label: 'Bouncy',
    lookAt: {
      deadZone: 55,
    },
    boop: {
      blinkMs: 80,
      endMs: 420,
      payoffs: ['delighted', 'sparkle', 'heart'],
    },
    squash: {
      durationMs: 280,
      keyframes: [
        { transform: 'scale(1, 1)', easing: 'ease-in' },
        { transform: 'scale(1.18, 0.78)', offset: 0.16, easing: 'ease-out' },
        { transform: 'scale(0.9, 1.14)', offset: 0.42, easing: 'ease-in-out' },
        { transform: 'scale(1.07, 0.94)', offset: 0.7, easing: 'ease-in-out' },
        { transform: 'scale(1, 1)' },
      ],
    },
    idle: {
      enabled: true,
      minIntervalMs: 2500,
      maxIntervalMs: 6000,
      chance: 0.55,
      reactions: ['sparkle', 'delighted'],
      holdMs: 700,
    },
  },
  shy: {
    id: 'shy',
    label: 'Shy',
    lookAt: {
      hysteresis: 0.22,
    },
    boop: {
      blinkMs: 150,
      endMs: 640,
      payoffs: ['bashful', 'wink', 'heart'],
    },
    squash: {
      durationMs: 520,
      keyframes: [
        { transform: 'scale(1, 1)', easing: 'ease-in' },
        { transform: 'scale(1.04, 0.95)', offset: 0.22, easing: 'ease-out' },
        { transform: 'scale(0.98, 1.03)', offset: 0.52, easing: 'ease-in-out' },
        { transform: 'scale(1.01, 0.99)', offset: 0.8, easing: 'ease-in-out' },
        { transform: 'scale(1, 1)' },
      ],
    },
    idle: {
      enabled: true,
      minIntervalMs: 10000,
      maxIntervalMs: 20000,
      chance: 0.12,
      reactions: ['bashful', 'wink', 'blink'],
      holdMs: 850,
      onlyWhenCentered: true,
    },
  },
  hyper: {
    id: 'hyper',
    label: 'Hyper',
    lookAt: {
      deadZone: 40,
    },
    boop: {
      blinkMs: 70,
      endMs: 380,
      dizzyAfter: 3,
    },
    idle: {
      enabled: true,
      minIntervalMs: 1600,
      maxIntervalMs: 4000,
      chance: 0.7,
      reactions: ['sparkle', 'surprised', 'delighted'],
      holdMs: 550,
    },
  },
}
