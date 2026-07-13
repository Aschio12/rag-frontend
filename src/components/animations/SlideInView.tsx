"use client";

import { motion } from "framer-motion";

interface SlideInViewProps {
  children: React.ReactNode;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
  duration?: number;
  delay?: number;
  distance?: number;
  once?: boolean;
}

const directionMap = {
  left: { x: -60 },
  right: { x: 60 },
  up: { y: 60 },
  down: { y: -60 },
};

export function SlideInView({
  children,
  className,
  direction = "up",
  duration = 0.6,
  delay = 0,
  distance = 60,
  once = true,
}: SlideInViewProps) {
  const initial = {
    opacity: 0,
    ...directionMap[direction],
  };
  initial[direction === "left" || direction === "right" ? "x" : "y"] =
    direction === "up" || direction === "left" ? -distance : distance;

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 120,
          damping: 20,
          duration,
          delay,
        },
      }}
      viewport={{ once, margin: "-30px" }}
    >
      {children}
    </motion.div>
  );
}
