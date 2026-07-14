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
      style={{ willChange: "border-color, box-shadow" }}
      animate={{
        borderColor: isExpanded
          ? "rgba(0, 242, 254, 0.4)"
          : "rgba(0, 242, 254, 0.08)",
        boxShadow: isExpanded
          ? "0 0 30px rgba(0, 242, 254, 0.1), 0 0 60px rgba(112, 0, 255, 0.08)"
          : "0 0 0px rgba(0, 242, 254, 0)",
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
