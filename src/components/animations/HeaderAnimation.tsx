"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

interface HeaderAnimationProps {
  children: React.ReactNode;
  className?: string;
  scrollThreshold?: number;
}

export function HeaderAnimation({
  children,
  className,
  scrollThreshold = 50,
}: HeaderAnimationProps) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > scrollThreshold);
  });

  return (
    <motion.header
      className={className}
      initial={{ y: -60, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        boxShadow: isScrolled
          ? "0 0 25px -5px rgba(0, 242, 254, 0.08), 0 4px 12px rgba(0, 0, 0, 0.15)"
          : "0 0 0px rgba(0, 0, 0, 0)",
      }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.header>
  );
}
