import type { DeepPartial } from './types.js'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as T
  }
  if (isPlainObject(value)) {
    const copy: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) {
      copy[key] = cloneValue(item)
    }
    return copy as T
  }
  return value
}

function mergeUnknown(base: unknown, partial: unknown): unknown {
  if (partial === undefined) {
    return cloneValue(base)
  }
  if (Array.isArray(partial)) {
    return cloneValue(partial)
  }
  if (!isPlainObject(base) || !isPlainObject(partial)) {
    return cloneValue(partial)
  }

  const result: Record<string, unknown> = {}
  const keys = new Set([...Object.keys(base), ...Object.keys(partial)])
  for (const key of keys) {
    if (!(key in partial) || partial[key] === undefined) {
      result[key] = cloneValue(base[key])
      continue
    }
    const next = partial[key]
    const current = base[key]
    if (Array.isArray(next)) {
      result[key] = cloneValue(next)
    } else if (isPlainObject(next) && isPlainObject(current)) {
      result[key] = mergeUnknown(current, next)
    } else {
      result[key] = cloneValue(next)
    }
  }
  return result
}

export function deepMergeMotion<T>(base: T, partial?: DeepPartial<T>): T {
  if (partial === undefined) {
    return cloneValue(base)
  }
  return mergeUnknown(base, partial) as T
}
