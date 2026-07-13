"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface StreamingTextProps {
  text: string;
  className?: string;
  speed?: number;
  onComplete?: () => void;
}

export function StreamingText({
  text,
  className,
  speed = 15,
  onComplete,
}: StreamingTextProps) {
  const [displayedChars, setDisplayedChars] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedChars(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (displayedChars >= text.length) {
      if (!isComplete) {
        setIsComplete(true);
        onComplete?.();
      }
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedChars((prev) => Math.min(prev + 1, text.length));
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedChars, text.length, speed, onComplete, isComplete]);

  return (
    <span className={className}>
      {text.split("").map((char, i) => (
        <motion.span
          key={`${i}-${char}`}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={
            i < displayedChars
              ? { opacity: 1, filter: "blur(0px)" }
              : { opacity: 0, filter: "blur(4px)" }
          }
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {char}
        </motion.span>
      ))}
      {displayedChars < text.length && (
        <motion.span
          className="inline-block w-[2px] h-[1em] bg-purple-400 ml-[1px] align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </span>
  );
}
