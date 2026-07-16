/**
 * AETHER — Motion Engine
 *
 * Single module for the motion grammar defined in the manifesto.
 * Components must use these utilities — never inline framer-motion variants.
 */

"use client";

import * as React from "react";
import { useReducedMotion as useFMReducedMotion } from "framer-motion";
import {
  semanticDuration,
  semanticEasing,
  semanticSpring,
  semanticStagger,
} from "@/design-system/tokens/motion";

export const aetherDuration = semanticDuration;
export const aetherEasing = semanticEasing;
export const aetherSpring = semanticSpring;
export const aetherStagger = semanticStagger;

/**
 * Single source for reduced motion. Returns null when motion is allowed,
 * a stripped variant when not. Always use this, never framer's hook directly.
 */
export function useAetherMotion(): { reduced: boolean } {
  const reduced = useFMReducedMotion();
  return { reduced: !!reduced };
}

/**
 * Returns the duration that downward-switches to a tiny value if reduced.
 *   useAetherDuration("medium") → 240 normally, 200 if reduced
 */
export function useAetherDuration(key: keyof typeof semanticDuration): number {
  const { reduced } = useAetherMotion();
  const base = semanticDuration[key];
  return reduced ? Math.min(base, 200) : base;
}

/**
 * Easing tuples are fine to read in render — they're plain arrays.
 * Reduced motion: easing is ignored when duration is already low.
 */
export function useAetherEasing(kind: keyof typeof semanticEasing = "enter") {
  return semanticEasing[kind] as unknown as readonly [number, number, number, number];
}

/**
 * Spring presets — picked by use case, not by destructure.
 * Returns the right config based on motion preference.
 */
export function useAetherSpring(kind: keyof typeof semanticSpring = "ui") {
  const { reduced } = useAetherMotion();
  const cfg = semanticSpring[kind];
  if (reduced) {
    return {
      type: "tween" as const,
      duration: Math.min(semanticDuration.medium, 200),
      ease: semanticEasing.snap,
    };
  }
  return { type: "spring" as const, ...cfg };
}

/**
 * Returns stagger config themed for the current motion preference.
 */
export function useAetherStagger(kind: keyof typeof semanticStagger = "list") {
  const { reduced } = useAetherMotion();
  const cfg = semanticStagger[kind];
  if (reduced) return { staggerChildren: 0, delayChildren: 0 };
  return { staggerChildren: cfg.step / 1000, delayChildren: cfg.initial / 1000 };
}
