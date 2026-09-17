export const REACTION_NAMES = [
  'blink',
  'heart',
  'sparkle',
  'surprised',
  'wink',
  'bashful',
  'sleepy',
  'dizzy',
  'delighted',
] as const

export type ReactionName = (typeof REACTION_NAMES)[number]

export type MotionConfig = {
  lookAt: {
    deadZone: number
    hysteresis: number
  }
  boop: {
    blinkMs: number
    endMs: number
    dizzyAfter: number
    dizzyWindowMs: number
    dizzyHoldMs: number
    payoffs: ReactionName[]
  }
  reactions: {
    allowed: ReactionName[]
  }
  squash: {
    enabled: boolean
    durationMs: number
    keyframes: Keyframe[]
  }
  idle: {
    enabled: boolean
    minIntervalMs: number
    maxIntervalMs: number
    chance: number
    reactions: ReactionName[]
    holdMs: number
    onlyWhenCentered: boolean
    respectReducedMotion: boolean
  }
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K]
}

export type MotionProfile = DeepPartial<MotionConfig> & {
  id?: string
  label?: string
}

export type ResolveMotionInput = {
  personality?: string
  motion?: MotionProfile
  characterMotion?: MotionProfile
  profiles?: Record<string, MotionProfile>
}
