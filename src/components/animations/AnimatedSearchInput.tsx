"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface AnimatedSearchInputProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
}

export function AnimatedSearchInput({
  placeholder = "Search...",
  onSearch,
  className,
}: AnimatedSearchInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(value);
  };

  return (
    <motion.form
      className={`relative ${className || ""}`}
      onSubmit={handleSubmit}
      animate={{
        width: isExpanded ? 320 : 44,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-xl border border-purple-500/20 bg-purple-950/60 backdrop-blur-xl"
        whileHover={{ borderColor: "rgba(124, 58, 237, 0.5)" }}
      />
      <motion.button
        type="button"
        className="absolute left-0 top-0 flex items-center justify-center w-11 h-11 text-purple-300 z-10"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </motion.button>
      <motion.input
        className="absolute inset-0 bg-transparent pl-11 pr-4 text-sm text-white placeholder-purple-400/50 outline-none rounded-xl"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsExpanded(true)}
        onBlur={() => !value && setIsExpanded(false)}
        animate={{
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
      />
    </motion.form>
  );
}
