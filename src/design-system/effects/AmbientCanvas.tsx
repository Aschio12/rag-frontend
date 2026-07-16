"use client";

/**
 * AmbientCanvas — the room's atmosphere.
 *
 * Composes:
 *   1. Canvas gradient base
 *   2. Slow color drift (Aurora)
 *   3. Cursor-reactive halo (CursorLight)
 *   4. Animated noise grain
 *
 * Mounts once at the application root. Pointer events disabled.
 * GPU-cheap. Honors prefers-reduced-motion via the underlying hooks.
 */

import * as React from "react";
import { Aurora } from "./Aurora";
import { CursorLight } from "./CursorLight";
import { Grain } from "./Grain";

interface AmbientCanvasProps {
  /** Cursor light enabled. Default true. */
  cursorLight?: boolean;
  /** Aurora speed multiplier. Default 1. */
  speed?: number;
  /** Grain opacity 0–1. Default 0.06. */
  grainOpacity?: number;
  /** Soft light source color. */
  halo?: string;
  className?: string;
}

export const AmbientCanvas = React.memo(function AmbientCanvas({
  cursorLight = true,
  speed = 1,
  grainOpacity = 0.06,
  halo,
  className,
}: AmbientCanvasProps) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: "var(--aether-bg-canvas-gradient)",
        overflow: "hidden",
        contain: "strict",
      }}
    >
      <Aurora speed={speed} />
      {cursorLight && <CursorLight color={halo} intensity={0.45} />}
      <Grain opacity={grainOpacity} />
    </div>
  );
});
