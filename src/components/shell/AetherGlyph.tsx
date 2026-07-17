"use client";

/**
 * AetherGlyph — the symbol of Aether.
 *
 * A small orb (concentric arcs) that echoes the AmbientCanvas orbs.
 * Used in the TopBar and Sidebar.
 */

import * as React from "react";

interface Props extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
  /** 0..1 — proportion of the arc that traces clockwise. */
  arc?: number;
  title?: string;
}

export const AetherGlyph = React.memo(function AetherGlyph({
  size = 22,
  arc = 0.6,
  title = "Aether",
  className,
  ...rest
}: Props) {
  const r = 9;
  const cx = 12;
  const cy = 12;
  const circ = 2 * Math.PI * r;
  const dash = circ * arc;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={title ? "img" : "presentation"}
      aria-label={title}
      className={className}
      {...rest}
    >
      <defs>
        <radialGradient id="aether-glyph-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--aether-bg-orb-halo)" />
          <stop offset="60%" stopColor="rgba(164,139,255,0.55)" />
          <stop offset="100%" stopColor="rgba(164,139,255,0)" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r + 2} fill="url(#aether-glyph-core)" />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--aether-border-default)"
        strokeWidth={1.2}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--aether-text-accent)"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 320ms ease" }}
      />
    </svg>
  );
});
