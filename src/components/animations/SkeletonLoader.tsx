"use client";

import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  count?: number;
  lines?: number;
}

export function SkeletonLoader({
  className,
  variant = "text",
  width,
  height,
  count = 1,
  lines = 3,
}: SkeletonLoaderProps) {
  const baseClass =
    "bg-gradient-to-r from-purple-900/20 via-purple-700/30 to-purple-900/20 bg-[length:200%_100%]";

  const variants: Record<string, string> = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-xl h-40",
  };

  const pulseAnimation = {
    backgroundPosition: ["200% 0%", "-200% 0%"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  };

  const items = variant === "text" ? lines : count;

  return (
    <div className={className}>
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          className={`${baseClass} ${variants[variant]} mb-2`}
          style={{
            width: variant === "text" ? `${70 + Math.random() * 30}%` : width,
            height: height,
          }}
          animate={pulseAnimation}
        />
      ))}
    </div>
  );
}
