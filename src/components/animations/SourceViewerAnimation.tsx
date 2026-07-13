"use client";

import { motion, AnimatePresence } from "framer-motion";

interface SourceViewerAnimationProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
}

export function SourceViewerAnimation({
  children,
  isOpen,
  className,
}: SourceViewerAnimationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={className}
          initial={{ width: 0, opacity: 0 }}
          animate={{
            width: "auto",
            opacity: 1,
            transition: {
              width: { type: "spring", stiffness: 200, damping: 30 },
              opacity: { duration: 0.2 },
            },
          }}
          exit={{
            width: 0,
            opacity: 0,
            transition: {
              width: { duration: 0.2 },
              opacity: { duration: 0.1 },
            },
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: 0.15, duration: 0.2 },
            }}
            exit={{ opacity: 0, transition: { duration: 0.05 } }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
