"use client";

import { motion } from "framer-motion";

interface AnimatedSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export function AnimatedSpinner({
  size = 24,
  color = "#7C3AED",
  className,
}: AnimatedSpinnerProps) {
  return (
    <motion.div
      className={`relative ${className || ""}`}
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent"
        style={{ borderTopColor: color, borderRightColor: color }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute inset-1 rounded-full border-2 border-transparent"
        style={{ borderBottomColor: color, borderLeftColor: color }}
        animate={{ rotate: -360 }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}
