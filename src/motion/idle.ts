export function nextIdleDelay(
  minIntervalMs: number,
  maxIntervalMs: number,
  random: () => number = Math.random,
) {
  const lo = Math.min(minIntervalMs, maxIntervalMs)
  const hi = Math.max(minIntervalMs, maxIntervalMs)
  return lo + (hi - lo) * random()
}

export function shouldPlayIdle(input: {
  reaction: string | null
  direction: string
  onlyWhenCentered: boolean
  chance: number
  random?: () => number
}) {
  if (input.reaction !== null) {
    return false
  }
  if (input.onlyWhenCentered && input.direction !== 'center') {
    return false
  }
  return (input.random ?? Math.random)() < input.chance
}
