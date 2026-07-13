"use client";

import { motion } from "framer-motion";
import React from "react";

interface SidebarAnimationProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
}

const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  closed: {
    x: "-100%",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 35,
    },
  },
};

const itemVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
  closed: {
    opacity: 0,
    x: -30,
    transition: { duration: 0.15 },
  },
};

export function SidebarAnimation({
  children,
  className,
  isOpen = true,
}: SidebarAnimationProps) {
  return (
    <motion.nav
      className={className}
      variants={sidebarVariants}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants}>{child}</motion.div>
      ))}
    </motion.nav>
  );
}

export { itemVariants as sidebarItemVariants };
