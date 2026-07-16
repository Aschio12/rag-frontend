"use client";

/**
 * Aura — A mouse-reactive light that softens the room.
 *
 * Computes normalized cursor coordinates inside its parent (must be `position: relative` or fixed)
 * and applies the result as CSS variables to a halo so that GPU can animate it cheaply.
 *
 * Hooks into `useAetherMotion()` to disable when reduced-motion is preferred.
 */

import * as React from "react";
import { useAetherMotion } from "@/design-system/motion";

interface CursorLightProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Halo radius in px. Default 480. */
  size?: number;
  /** Idle-time ambient loop when cursor stays still. */
  idle?: boolean;
  /** Light intensity multiplier (0–1). Default 0.55. */
  intensity?: number;
  /** Color of the light (token-driven, recommended `var(--aether-bg-orb-halo)`). */
  color?: string;
}

export const CursorLight = React.forwardRef<HTMLDivElement, CursorLightProps>(function CursorLight(
  { size = 520, idle = true, intensity = 0.55, color, className, style, children, ...rest },
  ref,
) {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const target = React.useRef({ x: 0.5, y: 0.5 });
  const current = React.useRef({ x: 0.5, y: 0.5 });
  const rafId = React.useRef<number | null>(null);
  const lastMoveAt = React.useRef<number>(Date.now());
  const { reduced } = useAetherMotion();

  React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

  React.useEffect(() => {
    if (reduced) return;
    const node = innerRef.current?.parentElement;
    if (!node) return;

    const onMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (e.clientX - rect.left) / Math.max(1, rect.width);
      const y = (e.clientY - rect.top) / Math.max(1, rect.height);
      target.current.x = Math.min(1, Math.max(0, x));
      target.current.y = Math.min(1, Math.max(0, y));
      lastMoveAt.current = Date.now();
    };

    const onLeave = () => {
      target.current.x = 0.5;
      target.current.y = 0.5;
    };

    node.addEventListener("mousemove", onMove);
    node.addEventListener("mouseleave", onLeave);
    return () => {
      node.removeEventListener("mousemove", onMove);
      node.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced]);

  React.useEffect(() => {
    if (reduced) return;
    const tick = (t: number) => {
      const node = innerRef.current;
      if (!node) return;

      // Lerp at 60fps; 0.08 easing → ~80ms to converge.
      current.current.x += (target.current.x - current.current.x) * 0.06;
      current.current.y += (target.current.y - current.current.y) * 0.06;

      // Idle drift: slow circular motion when no recent movement.
      let ox = current.current.x;
      let oy = current.current.y;
      if (idle && Date.now() - lastMoveAt.current > 1800) {
        const a = (t / 6000) * Math.PI * 2;
        ox = 0.5 + Math.cos(a) * 0.32;
        oy = 0.5 + Math.sin(a) * 0.18;
      }

      node.style.setProperty("--aether-cursor-x", `${ox * 100}%`);
      node.style.setProperty("--aether-cursor-y", `${oy * 100}%`);
      node.style.setProperty("--aether-cursor-pct", `${(intensity * 100).toFixed(0)}`);
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [intensity, idle, reduced]);

  return (
    <div
      ref={innerRef}
      className={["aether-cursor-light", className].filter(Boolean).join(" ")}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        background: color ?? "var(--aether-bg-orb-halo)",
        WebkitMaskImage: `radial-gradient(${size}px circle at var(--aether-cursor-x, 50%) var(--aether-cursor-y, 50%), #000 calc(var(--aether-cursor-pct, 55) * 1%), transparent 100%)`,
        maskImage: `radial-gradient(${size}px circle at var(--aether-cursor-x, 50%) var(--aether-cursor-y, 50%), #000 calc(var(--aether-cursor-pct, 55) * 1%), transparent 100%)`,
        opacity: reduced ? 0.6 : 1,
        willChange: "transform, opacity",
        contain: "strict",
        ...style,
      }}
      aria-hidden
      {...rest}
    >
      {children}
    </div>
  );
});
