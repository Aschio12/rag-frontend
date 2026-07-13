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
  const isUser = role === "user";

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: 20,
        scale: 0.95,
        x: isUser ? 20 : -20,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        x: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        mass: 1,
      }}
    >
      {children}
    </motion.div>
  );
}
