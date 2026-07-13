"use client";

import { motion } from "framer-motion";

interface AnimatedGradientProps {
  className?: string;
  colors?: string[];
  duration?: number;
  children?: React.ReactNode;
}

export function AnimatedGradient({
  className,
  colors = [
    "rgba(124, 58, 237, 0.15)",
    "rgba(99, 102, 241, 0.1)",
    "rgba(236, 72, 153, 0.12)",
    "rgba(124, 58, 237, 0.15)",
  ],
  duration = 8,
  children,
}: AnimatedGradientProps) {
  return (
    <motion.div
      className={className}
      style={{
        background: `linear-gradient(135deg, ${colors.join(", ")})`,
        backgroundSize: "400% 400%",
      }}
      animate={{
        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {children}
    </motion.div>
  );
}
