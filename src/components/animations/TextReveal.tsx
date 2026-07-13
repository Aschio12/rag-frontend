"use client";

import { motion } from "framer-motion";

interface TextRevealProps {
  text: string;
  className?: string;
  mode?: "words" | "chars";
  delay?: number;
  duration?: number;
  once?: boolean;
}

export function TextReveal({
  text,
  className,
  mode = "words",
  delay = 0.2,
  duration = 0.04,
  once = true,
}: TextRevealProps) {
  const items = mode === "words" ? text.split(" ") : text.split("");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: duration,
        delayChildren: delay,
      },
    },
  };

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
      },
    },
  };

  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
    >
      {items.map((item, i) => (
        <motion.span
          key={i}
          variants={child}
          style={{ display: mode === "chars" ? "inline-block" : "inline" }}
          className={mode === "chars" ? "" : "inline-block mr-[0.25em]"}
        >
          {item}
          {mode === "chars" ? "\u00A0" : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}
