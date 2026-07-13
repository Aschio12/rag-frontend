"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ExpandablePanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export function ExpandablePanel({
  title,
  children,
  className,
  defaultOpen = false,
}: ExpandablePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-purple-500/10 rounded-xl overflow-hidden ${className || ""}`}>
      <motion.button
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-purple-200"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ backgroundColor: "rgba(124, 58, 237, 0.08)" }}
        whileTap={{ scale: 0.99 }}
      >
        <span>{title}</span>
        <motion.svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </motion.button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { type: "spring", stiffness: 200, damping: 25 },
                opacity: { duration: 0.2 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.2 },
                opacity: { duration: 0.15 },
              },
            }}
          >
            <div className="px-4 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
