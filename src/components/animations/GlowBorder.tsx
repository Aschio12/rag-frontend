"use client";

import { motion } from "framer-motion";

interface GlowBorderProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  duration?: number;
  borderWidth?: number;
  blur?: number;
}

export function GlowBorder({
  children,
  className,
  colors = ["#7C3AED", "#6366F1", "#EC4899", "#7C3AED"],
  duration = 3,
  borderWidth = 2,
  blur = 10,
}: GlowBorderProps) {
  return (
    <div className={`relative ${className || ""}`}>
      <motion.div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: `conic-gradient(from 0deg, ${colors.join(", ")})`,
          padding: borderWidth,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          filter: `blur(${blur}px)`,
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: `conic-gradient(from 0deg, ${colors.join(", ")})`,
          padding: borderWidth,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
