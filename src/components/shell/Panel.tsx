"use client";

/**
 * Panel — the only chrome primitive in AETHER.
 *
 * Variants map to the manifesto language:
 *   chrome      — UI chrome resting above the desk (header/footer)
 *   ink         — restrained utility surface
 *   glass       — translucent floating (sidebar, dock, inspector)
 *   floating    — top of z-stack, modal-like
 *   inset       — recessed; reads as part of the desk
 *   transparent — invisible frame, used when only border matters
 *
 * Soft shadow + 1px hairline border are applied via tokens.
 */

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { aetherSpring } from "@/design-system/motion";
import { useAetherMotion } from "@/design-system/motion";

type Variant = "chrome" | "ink" | "glass" | "floating" | "inset" | "transparent";

type Level = "rest" | "raised" | "lift";

interface PanelProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: Variant;
  level?: Level;
  inset?: boolean;
  lift?: boolean;
  /** Renders a hairline accent (1px lime edge) just inside the radius. */
  rim?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  chrome: {
    background: "var(--aether-glass-default)",
    borderColor: "var(--aether-border-subtle)",
  },
  ink: {
    background: "var(--aether-surface-panel)",
    borderColor: "var(--aether-border-subtle)",
  },
  glass: {
    background: "var(--aether-glass-default)",
    borderColor: "var(--aether-border-subtle)",
    backdropFilter: "blur(20px) saturate(160%)",
    WebkitBackdropFilter: "blur(20px) saturate(160%)",
  },
  floating: {
    background: "var(--aether-glass-strong)",
    borderColor: "var(--aether-border-default)",
    backdropFilter: "blur(28px) saturate(180%)",
    WebkitBackdropFilter: "blur(28px) saturate(180%)",
  },
  inset: {
    background: "var(--aether-surface-inset)",
    borderColor: "var(--aether-border-subtle)",
  },
  transparent: {
    background: "transparent",
    borderColor: "var(--aether-border-subtle)",
  },
};

const shadowForLevel: Record<Level, string> = {
  rest:
    "0 1px 0 0 rgba(255,255,255,0.02) inset, 0 12px 28px -16px rgba(0,0,0,0.45), 0 6px 16px -6px rgba(0,0,0,0.32)",
  raised:
    "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 22px 50px -18px rgba(0,0,0,0.55), 0 10px 24px -10px rgba(0,0,0,0.40)",
  lift:
    "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 36px 70px -16px rgba(0,0,0,0.65), 0 18px 36px -12px rgba(0,0,0,0.45)",
};

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(function Panel(
  {
    variant = "glass",
    level = "rest",
    lift = false,
    inset: insetProp,
    rim = false,
    className,
    children,
    style,
    ...rest
  },
  ref,
) {
  const { reduced } = useAetherMotion();

  const isSubtle = lift || level !== "rest";

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        position: "relative",
        border: "1px solid",
        borderRadius: 20,
        boxShadow: shadowForLevel[level],
        ...variantStyles[variant],
        ...(insetProp ? { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" } : null),
        ...style,
      }}
      transition={reduced ? { duration: 0.2 } : aetherSpring.panel}
      {...rest}
    >
      {rim && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 6,
            borderRadius: 14,
            border: "1px solid var(--aether-border-accent)",
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />
      )}
      {/* ambient edge highlight */}
      {!isSubtle && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 18%, transparent 90%, rgba(255,255,255,0.02) 100%)",
          }}
        />
      )}
      {children}
    </motion.div>
  );
});
