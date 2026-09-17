import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { nextIdleDelay, shouldPlayIdle } from './motion/idle.js'
import { pickReaction, profiles, REACTION_NAMES, resolveMotion } from './motion/index.js'
import type { MotionProfile, PersonalityId, ReactionName } from './motion/index.js'

const DIRECTIONS = [
  'up-left',
  'up',
  'up-right',
  'left',
  'center',
  'right',
  'down-left',
  'down',
  'down-right',
] as const

type Direction = (typeof DIRECTIONS)[number]

// Clockwise from the right, matching atan2 with y pointing down.
const CLOCKWISE: Direction[] = [
  'right',
  'down-right',
  'down',
  'down-left',
  'left',
  'up-left',
  'up',
  'up-right',
]
const SECTOR = (Math.PI * 2) / CLOCKWISE.length

// background-size 300% makes each cell a clean 0/50/100% step on both axes.
function cell(index: number): CSSProperties {
  return { backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 50}%` }
}

function wrap(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle))
}

const layer: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundSize: '300% 300%',
  backgroundRepeat: 'no-repeat',
}

export type MascotProps = {
  /** The 3x3 sheet of head directions. A served path, or an imported image. */
  directions: string
  /** The 3x3 sheet of expressions. */
  reactions: string
  size?: number
  className?: string
  /** What a screen reader calls it. */
  label?: string
  personality?: PersonalityId | (string & {})
  motion?: MotionProfile
}

export function Mascot(props: MascotProps) {
  const { directions, reactions, size = 140, className, label = 'mascot' } = props
  const config = useMemo(
    () => resolveMotion({ personality: props.personality, motion: props.motion, profiles }),
    [props.personality, props.motion],
  )

  const buttonRef = useRef<HTMLButtonElement>(null)
  const squashRef = useRef<HTMLSpanElement>(null)
  const timersRef = useRef<number[]>([])
  const boopsRef = useRef({ count: 0, at: 0 })
  const [direction, setDirection] = useState<Direction>('center')
  const [reaction, setReaction] = useState<ReactionName | null>(null)
  const directionRef = useRef(direction)
  const reactionRef = useRef(reaction)
  const scheduleIdleRef = useRef<(() => void) | null>(null)
  const idleHoldRef = useRef(0)

  useEffect(() => {
    directionRef.current = direction
    reactionRef.current = reaction
  }, [direction, reaction])

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return
    }

    let sector = -1
    let pointer: { x: number; y: number } | null = null
    const deadZone = config.lookAt.deadZone
    const hysteresis = config.lookAt.hysteresis

    const aim = () => {
      const button = buttonRef.current
      if (!button || !pointer) {
        return
      }

      const box = button.getBoundingClientRect()
      const dx = pointer.x - (box.left + box.width / 2)
      const dy = pointer.y - (box.top + box.height / 2)

      if (Math.hypot(dx, dy) < deadZone) {
        sector = -1
        setDirection('center')
        return
      }

      // Hold the current sector until the pointer is well past its edge.
      const angle = Math.atan2(dy, dx)
      if (sector !== -1 && Math.abs(wrap(angle - sector * SECTOR)) < SECTOR / 2 + hysteresis) {
        return
      }

      sector = (Math.round(angle / SECTOR) + CLOCKWISE.length) % CLOCKWISE.length
      setDirection(CLOCKWISE[sector])
    }

    const onPointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY }
      aim()
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', aim, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', aim)
    }
  }, [config.lookAt.deadZone, config.lookAt.hysteresis])

  useEffect(() => {
    return () => {
      timersRef.current.forEach(window.clearTimeout)
    }
  }, [])

  useEffect(() => {
    if (!config.idle.enabled) {
      scheduleIdleRef.current = null
      return
    }
    if (config.idle.respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      scheduleIdleRef.current = null
      return
    }

    const { minIntervalMs, maxIntervalMs, chance, reactions: idleReactions, holdMs, onlyWhenCentered } =
      config.idle
    const allowed = config.reactions.allowed

    const later = (ms: number, fn: () => void) => {
      timersRef.current.push(window.setTimeout(fn, ms))
    }

    const schedule = () => {
      later(nextIdleDelay(minIntervalMs, maxIntervalMs), () => {
        if (
          !shouldPlayIdle({
            reaction: reactionRef.current,
            direction: directionRef.current,
            onlyWhenCentered,
            chance,
          })
        ) {
          schedule()
          return
        }

        const next = pickReaction(idleReactions, allowed)
        const hold = ++idleHoldRef.current
        setReaction(next)
        later(holdMs, () => {
          if (idleHoldRef.current === hold) {
            setReaction(null)
          }
          schedule()
        })
      })
    }

    scheduleIdleRef.current = schedule
    schedule()

    return () => {
      scheduleIdleRef.current = null
      timersRef.current.forEach(window.clearTimeout)
      timersRef.current = []
    }
  }, [config.idle, config.reactions.allowed])

  const boop = () => {
    timersRef.current.forEach(window.clearTimeout)
    timersRef.current = []
    idleHoldRef.current += 1
    scheduleIdleRef.current?.()

    const later = (ms: number, next: ReactionName | null) => {
      timersRef.current.push(window.setTimeout(() => setReaction(next), ms))
    }

    const allowed = config.reactions.allowed
    const payoffs = config.boop.payoffs.filter((name) => allowed.includes(name))
    const now = Date.now()
    const boops = boopsRef.current
    boops.count = now - boops.at < config.boop.dizzyWindowMs ? boops.count + 1 : 1
    boops.at = now

    if (boops.count >= config.boop.dizzyAfter) {
      boops.count = 0
      setReaction(pickReaction(['dizzy'], allowed))
      later(config.boop.dizzyHoldMs, null)
    } else {
      setReaction(pickReaction(['blink'], allowed))
      later(
        config.boop.blinkMs,
        pickReaction(
          payoffs.length > 0 ? [payoffs[(boops.count - 1) % payoffs.length]] : config.boop.payoffs,
          allowed,
        ),
      )
      later(config.boop.endMs, null)
    }

    if (!config.squash.enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    // Per-keyframe easing with the effect itself linear: an easing on the effect
    // would reinterpret every offset and front-load the whole bounce.
    squashRef.current?.animate(config.squash.keyframes, {
      duration: config.squash.durationMs,
      easing: 'linear',
    })
  }

  // Inline styles so the file drops into any project without a CSS framework.
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={boop}
      aria-label={`Boop the ${label}`}
      className={className}
      style={{
        position: 'relative',
        display: 'block',
        flexShrink: 0,
        width: size,
        height: size,
        padding: 0,
        border: 0,
        background: 'transparent',
        appearance: 'none',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <span
        ref={squashRef}
        style={{ position: 'relative', display: 'block', width: '100%', height: '100%', transformOrigin: '50% 78%' }}
      >
        <span
          style={{
            ...layer,
            backgroundImage: `url(${directions})`,
            ...cell(DIRECTIONS.indexOf(direction)),
            opacity: reaction ? 0 : 1,
          }}
        />
        {/* Always mounted so the sheet is fetched up front, never on the first click. */}
        <span
          style={{
            ...layer,
            backgroundImage: `url(${reactions})`,
            ...cell(REACTION_NAMES.indexOf(reaction ?? 'blink')),
            opacity: reaction ? 1 : 0,
          }}
        />
      </span>
    </button>
  )
}
