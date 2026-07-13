"use client";

import { motion } from "framer-motion";

interface BlurRevealProps {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  duration?: number;
  delay?: number;
  once?: boolean;
}

export function BlurReveal({
  children,
  className,
  blur = 8,
  duration = 0.7,
  delay = 0,
  once = true,
}: BlurRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: `blur(${blur}px)` }}
      whileInView={{
        opacity: 1,
        filter: "blur(0px)",
        transition: {
          duration,
          delay,
          ease: [0.33, 1.53, 0.53, 0.88],
        },
      }}
      viewport={{ once, margin: "-40px" }}
    >
      {children}
    </motion.div>
  );
}
