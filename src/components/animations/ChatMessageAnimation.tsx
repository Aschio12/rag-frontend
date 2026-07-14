"use client";

import { motion } from "framer-motion";

interface ChatMessageAnimationProps {
  children: React.ReactNode;
  role: "user" | "assistant" | "system";
  className?: string;
}

export function ChatMessageAnimation({
  children,
  role,
  className,
}: ChatMessageAnimationProps) {
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: 15,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
