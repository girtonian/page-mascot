import { describe, expect, it } from 'vitest'
import { nextIdleDelay, shouldPlayIdle } from './idle.js'

describe('nextIdleDelay', () => {
  it('returns a delay in [min, max] using the random unit interval', () => {
    expect(nextIdleDelay(1000, 1000, () => 0)).toBe(1000)
    expect(nextIdleDelay(1000, 5000, () => 0)).toBe(1000)
    expect(nextIdleDelay(1000, 5000, () => 1)).toBe(5000)
    expect(nextIdleDelay(1000, 5000, () => 0.5)).toBe(3000)
  })
})

describe('shouldPlayIdle', () => {
  it('skips when a boop reaction is active', () => {
    expect(
      shouldPlayIdle({
        reaction: 'blink',
        direction: 'center',
        onlyWhenCentered: true,
        chance: 1,
      }),
    ).toBe(false)
  })

  it('skips when onlyWhenCentered and the head is not centered', () => {
    expect(
      shouldPlayIdle({
        reaction: null,
        direction: 'left',
        onlyWhenCentered: true,
        chance: 1,
      }),
    ).toBe(false)
  })

  it('skips when the random roll misses chance', () => {
    expect(
      shouldPlayIdle({
        reaction: null,
        direction: 'center',
        onlyWhenCentered: true,
        chance: 0.4,
        random: () => 0.4,
      }),
    ).toBe(false)
  })

  it('plays when free, centered if required, and the roll hits', () => {
    expect(
      shouldPlayIdle({
        reaction: null,
        direction: 'left',
        onlyWhenCentered: false,
        chance: 0.4,
        random: () => 0.399,
      }),
    ).toBe(true)
  })
})
