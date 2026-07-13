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
      animate={{
        backgroundColor: isScrolled
          ? "rgba(15, 23, 42, 0.8)"
          : "rgba(15, 23, 42, 0)",
        backdropFilter: isScrolled ? "blur(24px) saturate(1.2)" : "blur(0px)",
        WebkitBackdropFilter: isScrolled ? "blur(24px) saturate(1.2)" : "blur(0px)",
        borderBottom: isScrolled
          ? "1px solid rgba(124, 58, 237, 0.08)"
          : "1px solid rgba(124, 58, 237, 0)",
        boxShadow: isScrolled
          ? "0 1px 20px rgba(0, 0, 0, 0.2)"
          : "0 1px 0px rgba(0, 0, 0, 0)",
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
