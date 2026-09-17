import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultMotion } from './defaults.js'
import { pickReaction, resolveMotion } from './resolve.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('resolveMotion', () => {
  it('returns defaultMotion when input is empty', () => {
    expect(resolveMotion()).toEqual(defaultMotion)
    expect(resolveMotion({})).toEqual(defaultMotion)
    expect(defaultMotion.idle.enabled).toBe(false)
  })

  it('deep-merges nested objects and replaces arrays', () => {
    const result = resolveMotion({
      motion: {
        lookAt: { deadZone: 12 },
        boop: { payoffs: ['wink'] },
      },
    })

    expect(result.lookAt.deadZone).toBe(12)
    expect(result.lookAt.hysteresis).toBe(defaultMotion.lookAt.hysteresis)
    expect(result.boop.payoffs).toEqual(['wink'])
    expect(result.boop.blinkMs).toBe(defaultMotion.boop.blinkMs)
    expect(result.boop.payoffs).not.toEqual(defaultMotion.boop.payoffs)
  })

  it('applies personality then motion, and motion wins on conflicts', () => {
    const result = resolveMotion({
      personality: 'calm',
      profiles: {
        calm: {
          lookAt: { deadZone: 90, hysteresis: 0.4 },
          boop: { blinkMs: 240 },
        },
      },
      motion: {
        lookAt: { deadZone: 15 },
      },
    })

    expect(result.lookAt.deadZone).toBe(15)
    expect(result.lookAt.hysteresis).toBe(0.4)
    expect(result.boop.blinkMs).toBe(240)
  })

  it('warns once for an unknown personality and still applies motion', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const first = resolveMotion({
      personality: 'totally-unknown',
      motion: { lookAt: { deadZone: 33 } },
    })
    const second = resolveMotion({
      personality: 'totally-unknown',
      motion: { lookAt: { deadZone: 44 } },
    })

    expect(first.lookAt.deadZone).toBe(33)
    expect(first.lookAt.hysteresis).toBe(defaultMotion.lookAt.hysteresis)
    expect(second.lookAt.deadZone).toBe(44)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]?.[0])).toMatch(/unknown personality/i)
  })

  it('merges characterMotion between personality and motion', () => {
    const result = resolveMotion({
      personality: 'shy',
      profiles: {
        shy: {
          lookAt: { deadZone: 80, hysteresis: 0.5 },
          boop: { blinkMs: 300, endMs: 900 },
        },
      },
      characterMotion: {
        lookAt: { deadZone: 55 },
        boop: { blinkMs: 180 },
        idle: { enabled: true },
      },
      motion: {
        lookAt: { deadZone: 20 },
      },
    })

    expect(result.lookAt.deadZone).toBe(20)
    expect(result.lookAt.hysteresis).toBe(0.5)
    expect(result.boop.blinkMs).toBe(180)
    expect(result.boop.endMs).toBe(900)
    expect(result.idle.enabled).toBe(true)
  })
})

describe('pickReaction', () => {
  it('filters candidates to allowed reactions', () => {
    expect(pickReaction(['heart', 'nope', 'sparkle'], ['sparkle', 'wink'])).toBe('sparkle')
  })

  it('falls back to blink when nothing allowed remains and blink is allowed', () => {
    expect(pickReaction(['heart', 'sparkle'], ['blink', 'dizzy'])).toBe('blink')
  })

  it('falls back to the first allowed reaction when blink is not allowed', () => {
    expect(pickReaction(['heart'], ['sleepy', 'wink'])).toBe('sleepy')
  })
})
