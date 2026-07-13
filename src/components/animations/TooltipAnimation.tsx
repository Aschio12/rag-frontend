"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface TooltipAnimationProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const positionStyles = {
  top: { bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
  bottom: { top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
  left: { right: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
  right: { left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
};

export function TooltipAnimation({
  content,
  children,
  position = "top",
  className,
}: TooltipAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout>>();

  const handleMouseEnter = () => {
    const id = setTimeout(() => setIsVisible(true), 300);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutId);
    setIsVisible(false);
  };

  return (
    <div
      className={`relative inline-flex ${className || ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="absolute z-50 px-2.5 py-1.5 text-xs text-purple-100 bg-purple-950/90 backdrop-blur-xl border border-purple-500/20 rounded-lg whitespace-nowrap pointer-events-none"
            style={positionStyles[position] as React.CSSProperties}
            initial={{ opacity: 0, scale: 0.85, y: position === "top" ? 4 : position === "bottom" ? -4 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: position === "top" ? 4 : 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
