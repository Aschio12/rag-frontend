"use client";

import { motion } from "framer-motion";

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
  delay?: number;
  rotate?: number;
}

export function FloatingElement({
  children,
  className,
  amplitude = 10,
  duration = 3,
  delay = 0,
  rotate = 3,
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-amplitude / 2, amplitude / 2, -amplitude / 2],
        rotate: [-rotate / 2, rotate / 2, -rotate / 2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
