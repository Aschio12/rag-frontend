/**
 * AETHER — Motion Tokens
 *
 * One source for duration, easing, spring, distance, and stagger.
 * Every animated component MUST use these.
 */

export const semanticDuration = {
  instant:  60,   // color/border only
  quick:    160,  // micro interactions, hovers
  medium:   240,  // panel reveals, dock lift
  cinematic:480,  // page transition, scene change
} as const;

export const semanticEasing = {
  /** in: arrives gently */
  enter:    [0.32, 0.72, 0, 1] as const,
  /** out: leaves quickly */
  exit:     [0.65, 0, 0.35, 1] as const,
  /** inOut: symmetric */
  inOut:    [0.83, 0, 0.17, 1] as const,
  /** carry: long, calm, organic */
  carry:    [0.25, 0.46, 0.45, 0.94] as const,
  /** snap: tiny, decisive */
  snap:     [0.4, 0, 0.2, 1] as const,
} as const;

export const semanticSpring = {
  /** UI items — small, snappy */
  ui:    { stiffness: 320, damping: 28, mass: 0.9 },
  /** Panels / drawers */
  panel: { stiffness: 180, damping: 22, mass: 1 },
  /** Layout shifts (orbs, layoutId) */
  layout:{ stiffness: 140, damping: 18, mass: 1.1 },
  /** Soft idle (orbs) */
  orb:   { stiffness: 90,  damping: 14, mass: 1.2 },
} as const;

export const semanticStagger = {
  /** UI cascade (lists) */
  list:      { step: 60,  initial: 80 },
  /** Sources / chips drop */
  sources:   { step: 40,  initial: 100 },
  /** Page entrance choreography */
  scene:     { step: 80,  initial: 160 },
  /** Hero entrance (longer, breathing) */
  hero:      { step: 120, initial: 240 },
} as const;

export const semanticDistance = {
  micro:   4,
  small:   8,
  medium:  16,
  large:   24,
  hero:    64,
  recede:  -120,
} as const;

/* ─── Frames per second floor (declared for engine accounting) ────────── */
export const semanticFPS = {
  floor: 60,
  budget: 16, // ms per frame
} as const;
