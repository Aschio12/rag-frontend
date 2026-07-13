"use client";

import { motion } from "framer-motion";

interface ScaleInViewProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
  delay?: number;
  once?: boolean;
}

export function ScaleInView({
  children,
  className,
  scale = 0.8,
  duration = 0.5,
  delay = 0,
  once = true,
}: ScaleInViewProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale }}
      whileInView={{
        opacity: 1,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 25,
          duration,
          delay,
        },
      }}
      viewport={{ once, margin: "-40px" }}
    >
      {children}
    </motion.div>
  );
}
