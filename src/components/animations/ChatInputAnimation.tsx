"use client";

import { motion } from "framer-motion";

interface ChatInputAnimationProps {
  children: React.ReactNode;
  isExpanded?: boolean;
  className?: string;
}

export function ChatInputAnimation({
  children,
  isExpanded = false,
  className,
}: ChatInputAnimationProps) {
  return (
    <motion.div
      className={className}
      animate={{
        borderColor: isExpanded
          ? "rgba(124, 58, 237, 0.6)"
          : "rgba(124, 58, 237, 0.15)",
        boxShadow: isExpanded
          ? "0 0 30px rgba(124, 58, 237, 0.15), 0 0 60px rgba(99, 102, 241, 0.1)"
          : "0 0 0px rgba(124, 58, 237, 0)",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
    >
      <motion.div
        animate={{
          height: isExpanded ? "auto" : 48,
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 20,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
