"use client";

import { motion } from "framer-motion";

interface SpringCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  tapScale?: number;
  lift?: number;
  springStiffness?: number;
  springDamping?: number;
  onClick?: () => void;
}

export function SpringCard({
  children,
  className,
  hoverScale = 1.02,
  tapScale = 0.98,
  lift = -6,
  springStiffness = 250,
  springDamping = 20,
  onClick,
}: SpringCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: hoverScale,
        y: lift,
        transition: {
          type: "spring",
          stiffness: springStiffness,
          damping: springDamping,
        },
      }}
      whileTap={{
        scale: tapScale,
        transition: { type: "spring", stiffness: 400, damping: 15 },
      }}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : undefined }}
    >
      {children}
    </motion.div>
  );
}
