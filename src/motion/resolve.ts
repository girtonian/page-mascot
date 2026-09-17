import { defaultMotion } from './defaults.js'
import { deepMergeMotion } from './merge.js'
import { REACTION_NAMES } from './types.js'
import type { MotionConfig, MotionProfile, ReactionName, ResolveMotionInput } from './types.js'

const REACTION_NAME_SET = new Set<string>(REACTION_NAMES)
const warnedPersonalities = new Set<string>()

function asMotionPartial(profile: MotionProfile): MotionProfile {
  const rest = { ...profile }
  delete rest.id
  delete rest.label
  return rest
}

function isDevelopment() {
  const env = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
  return env?.NODE_ENV !== 'production'
}

function warnUnknownPersonality(name: string) {
  if (!isDevelopment() || warnedPersonalities.has(name)) {
    return
  }
  warnedPersonalities.add(name)
  console.warn(`Unknown personality "${name}"`)
}

export function resolveMotion(input: ResolveMotionInput = {}): MotionConfig {
  const { personality, motion, characterMotion, profiles } = input
  let config = deepMergeMotion(defaultMotion)

  if (personality !== undefined) {
    const profile = profiles?.[personality]
    if (profile) {
      config = deepMergeMotion(config, asMotionPartial(profile))
    } else {
      warnUnknownPersonality(personality)
    }
  }

  if (characterMotion) {
    config = deepMergeMotion(config, asMotionPartial(characterMotion))
  }

  if (motion) {
    config = deepMergeMotion(config, asMotionPartial(motion))
  }

  return config
}

export function pickReaction(
  candidates: readonly string[],
  allowed: readonly ReactionName[],
): ReactionName {
  const allowedSet = new Set(allowed)
  const valid = candidates.filter(
    (name): name is ReactionName => REACTION_NAME_SET.has(name) && allowedSet.has(name as ReactionName),
  )

  if (valid[0]) {
    return valid[0]
  }
  if (allowedSet.has('blink')) {
    return 'blink'
  }
  return allowed[0] ?? 'blink'
}
