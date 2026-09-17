import { describe, expect, it } from 'vitest'
import { defaultMotion } from './defaults.js'
import { personalityIds, profiles } from './profiles.js'
import { resolveMotion } from './resolve.js'
import { REACTION_NAMES } from './types.js'

const SHEET = new Set<string>(REACTION_NAMES)

function assertSheetReactions(names: readonly string[] | undefined) {
  if (!names) {
    return
  }
  for (const name of names) {
    expect(SHEET.has(name), `${name} is not a sheet reaction`).toBe(true)
  }
}

describe('profiles', () => {
  it('has exactly calm, bouncy, shy, and hyper', () => {
    expect(Object.keys(profiles)).toEqual(['calm', 'bouncy', 'shy', 'hyper'])
    expect(personalityIds).toEqual(['calm', 'bouncy', 'shy', 'hyper'])
  })

  it.each(personalityIds)(
    'resolves %s with idle enabled and a different feel from defaults',
    (id) => {
      const resolved = resolveMotion({ personality: id, profiles })
      const profile = profiles[id]

      expect(profile.id).toBe(id)
      expect(profile.label).toBeTruthy()
      expect(profile.idle?.enabled).toBe(true)
      expect(resolved.idle.enabled).toBe(true)
      expect(resolved).not.toEqual(defaultMotion)

      assertSheetReactions(profile.boop?.payoffs)
      assertSheetReactions(profile.idle?.reactions)
      assertSheetReactions(profile.reactions?.allowed)
      assertSheetReactions(resolved.boop.payoffs)
      assertSheetReactions(resolved.idle.reactions)
      assertSheetReactions(resolved.reactions.allowed)
    },
  )
})
