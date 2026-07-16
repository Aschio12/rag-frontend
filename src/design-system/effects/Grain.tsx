"use client";

/**
 * Grain — token-driven animated noise overlay.
 *
 * Lightweight: a single inline SVG turbulence element is rendered once,
 * composited through a mask, and animated via CSS variables. No PNGs,
 * no network requests, GPU-cheap (a single composited layer).
 */

import * as React from "react";
import { useAetherMotion } from "@/design-system/motion";

interface GrainProps {
  /** 0–1; default 0.04 */
  opacity?: number;
  /** Animation cycle in seconds; default 6. Sets drift speed. */
  cycle?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Grain = React.memo(function Grain({
  opacity = 0.05,
  cycle = 6,
  className,
  style,
}: GrainProps) {
  const { reduced } = useAetherMotion();
  const id = React.useId();

  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        mixBlendMode: "overlay",
        opacity,
        zIndex: 0,
        contain: "strict",
        willChange: reduced ? undefined : "transform",
        animation: reduced ? undefined : `aether-grain ${cycle}s steps(8) infinite`,
        ...style,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: "100%" }}
      >
        <filter id={`aether-noise-${id}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
            seed="7"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.6" intercept="0" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter={`url(#aether-noise-${id})`} />
      </svg>
    </div>
  );
});
