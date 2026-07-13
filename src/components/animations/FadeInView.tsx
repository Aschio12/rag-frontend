"use client";

import { motion } from "framer-motion";

interface FadeInViewProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  once?: boolean;
}

export function FadeInView({
  children,
  className,
  duration = 0.6,
  delay = 0,
  once = true,
}: FadeInViewProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{
        opacity: 1,
        transition: {
          duration,
          delay,
          ease: "easeOut",
        },
      }}
      viewport={{ once, margin: "-50px" }}
    >
      {children}
    </motion.div>
  );
}
