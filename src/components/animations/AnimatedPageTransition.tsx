"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface AnimatedPageTransitionProps {
  children: React.ReactNode;
  mode?: "wait" | "sync" | "popLayout";
}

export function AnimatedPageTransition({
  children,
  mode = "wait",
}: AnimatedPageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode={mode}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.96, rotateX: -8 }}
        animate={{
          opacity: 1,
          scale: 1,
          rotateX: 0,
          transition: {
            duration: 0.6,
            ease: [0.33, 1.53, 0.53, 0.88],
            type: "spring",
            bounce: 0.15,
          },
        }}
        exit={{
          opacity: 0,
          scale: 0.92,
          rotateX: 12,
          transition: {
            duration: 0.4,
            ease: [0.68, 0, 0.32, 0.95],
          },
        }}
        className="origin-center h-full"
        style={{ perspective: 1200 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
