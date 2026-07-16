"use client";

/**
 * Aurora — soft, slow-moving color fields.
 *
 * Two blurred radial blobs that drift at 24s and 32s respectively.
 * Lives behind CursorLight.
 */

import * as React from "react";

interface AuroraProps {
  className?: string;
  /** Slow down factor (multiplier on cycle). 1 = default. */
  speed?: number;
  opacity?: number;
}

export const Aurora = React.memo(function Aurora({ className, speed = 1, opacity = 1 }: AuroraProps) {
  const d1 = `${Math.round(24 / speed)}s`;
  const d2 = `${Math.round(32 / speed)}s`;

  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        opacity,
        zIndex: 0,
        contain: "strict",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-12%",
          right: "-10%",
          width: "55vw",
          height: "55vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(164,139,255,0.55) 0%, rgba(132,112,224,0.20) 50%, transparent 75%)",
          filter: "blur(80px)",
          mixBlendMode: "screen",
          animation: `aether-aurora ${d1} ease-in-out infinite`,
          willChange: "transform",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          left: "-12%",
          width: "65vw",
          height: "65vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(232,255,107,0.18) 0%, rgba(164,139,255,0.20) 35%, rgba(255,122,69,0.10) 60%, transparent 80%)",
          filter: "blur(110px)",
          mixBlendMode: "screen",
          animation: `aether-aurora-2 ${d2} ease-in-out infinite`,
          willChange: "transform",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "40%",
          width: "30vw",
          height: "30vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(122,224,162,0.10) 0%, transparent 70%)",
          filter: "blur(100px)",
          mixBlendMode: "screen",
          animation: `aether-aurora ${Math.round(40 / speed)}s ease-in-out infinite`,
          willChange: "transform",
        }}
      />
    </div>
  );
});
