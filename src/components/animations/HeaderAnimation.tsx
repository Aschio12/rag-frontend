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
          ? "rgba(15, 23, 42, 0.85)"
          : "rgba(15, 23, 42, 0)",
        backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
        borderBottom: isScrolled
          ? "1px solid rgba(124, 58, 237, 0.1)"
          : "1px solid rgba(124, 58, 237, 0)",
        y: isScrolled ? 0 : 0,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.header>
  );
}
