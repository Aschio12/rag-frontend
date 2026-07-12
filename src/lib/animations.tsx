"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isInitial, setIsInitial] = useState(true);

  useEffect(() => {
    setIsInitial(false);
  }, []);

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={isInitial ? { duration: 0.3 } : { duration: 0.4, ease: [0.33, 1.53, 0.53, 0.88] }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

// Kinetic Brutalism page transitions
export function KineticPageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.95, rotateX: -10 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.9, rotateX: 5 }}
        transition={{ 
          duration: 0.6, 
          ease: [0.33, 1.53, 0.53, 0.88],
          type: 'spring',
          bounce: 0.2
        }}
        className="origin-center h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Premium hover animations
export const premiumHover = {
  button: {
    hover: {
      scale: 1.02,
      y: -2,
      transition: { duration: 0.3, type: 'spring', stiffness: 300 }
    },
    tap: { scale: 0.98 }
  },
  card: {
    hover: {
      y: -8,
      scale: 1.01,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
    tap: { scale: 0.99 }
  },
  glass: {
    hover: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.3 }
    }
  }
};

// Infinite marquee animations (Reanimated-style)
export const infiniteMarquee = {
  container: {
    initial: { x: 0 },
    animate: { 
      x: '-100%', 
      transition: { 
        duration: 30, 
        repeat: Infinity,
        ease: 'linear',
        repeatDelay: 0
      }
    }
  },
  reverse: {
    animate: { 
      x: '0%', 
      transition: { 
        duration: 30, 
        repeat: Infinity,
        ease: 'linear',
        repeatDelay: 0
      }
    }
  }
};

// Stagger container animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: 'easeOut',
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

// Streaming animation for AI responses
export const streamingText = {
  container: {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  },
  character: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.02, repeat: 1 }
    }
  }
};

// Loading animations
export const loadingAnimations = {
  pulse: {
    initial: { opacity: 1 },
    animate: { 
      opacity: [1, 0.5, 1],
      transition: { duration: 1.5, repeat: Infinity }
    }
  },
  wave: {
    animate: {
      scaleY: [1, 1.2, 1],
      transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
    }
  }
};

// Floating animations
export const floatingElement = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  }
};

// Blur transition animations
export const blurTransition = {
  in: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(10px)' }
  },
  out: {
    initial: { opacity: 1, filter: 'blur(0px)' },
    animate: { opacity: 0, filter: 'blur(10px)' }
  }
};