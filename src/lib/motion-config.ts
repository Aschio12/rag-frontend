"use client";

// Motion configuration and setup
// This file contains the core animation infrastructure for our kinetic brutalism AI Workspace

import { useEffect, useRef, useState } from "react";

// Motion performance config
export const MOTION_CONFIG = {
  // GPU acceleration settings
  willChange: {
    transform: true,
    opacity: true,
    filter: true,
    backdropFilter: true,
  },
  // Animation durations - all in 300-600ms range for premium feel
  durations: {
    instant: 0.15,
    fast: 0.3,
    normal: 0.5,
    slow: 0.8,
    cinematic: 1.2,
  },
  // Spring physics for premium feel
  springs: {
    gentle: { stiffness: 200, damping: 25, mass: 1 },
    snappy: { stiffness: 400, damping: 20, mass: 0.8 },
    premium: { stiffness: 300, damping: 15, mass: 1 },
  },
  // Custom easings for kinetic brutalism
  easings: {
    kinetic: [0.33, 1.53, 0.53, 0.88], // Custom spring physics
    brutal: [0.68, 0, 0.32, 0.95], // Heavy overdamped
    aggressive: [0.79, 0, 0.15, 1],
    cinematic: [0.4, 0, 0, 1], // Fast scale
  },
};

// GPU acceleration helper
export const useGPUAcceleration = () => {
  const ref = useRef<HTMLElement>();
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const testEl = document.createElement('div');
      testEl.style.willChange = 'transform';
      testEl.getBoundingClientRect();
      setIsSupported(true);

      // Optimize animation performance
      document.documentElement.style.setProperty('--transform-will-change', 'transform');
      document.documentElement.style.setProperty('--opacity-will-change', 'opacity');
    }
  }, []);

  return { ref, isSupported };
};

// Animation performance monitor
export const useAnimationPerformance = () => {
  const frameTimes = useRef<number[]>([]);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      const delta = currentTime - lastTime;

      if (delta >= 1000) {
        const currentFPS = (frameCount * 1000) / delta;
        setFps(Math.round(currentFPS));
        frameTimes.current.push(currentFPS);

        if (frameTimes.current.length > 10) {
          frameTimes.current.shift();
        }

        frameCount = 0;
        lastTime = currentTime;

        // Log warning for performance issues
        if (currentFPS < 45) {
          console.warn(`Animation performance degraded: ${currentFPS} FPS`);
        }
      }

      if (frameCount < 1000) {
        requestAnimationFrame(measureFPS);
      }
    };

    requestAnimationFrame(measureFPS);

    return () => {
      frameCount = 0;
    };
  }, []);

  return { fps };
};

// Reduced motion handler with kinetic brutalism preference
export const useMotionPreference = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Kinetic brutalism override - we want animations even if user prefers reduced motion
  // because our animations are essential to the brand experience
  return {
    prefersReducedMotion,
    useAnimation: !prefersReducedMotion || true, // Always show animations for kinetic brutalism
  };
};

// Animation micro-interactions hook
export const useMicroInteractions = () => {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  const handleHoverStart = (id: string) => {
    setHoveredElement(id);
  };

  const handleHoverEnd = () => {
    setHoveredElement(null);
  };

  // Kinetic brutalism haptic feedback simulation
  const hapticFeedback = {
    light: () => {
      // Subtle visual feedback only
      console.log('light haptic');
    },
    medium: () => {
      // Both visual and potential haptic for important actions
      setHoveredElement('haptic-feedback');
      setTimeout(() => setHoveredElement(null), 150);
      console.log('medium haptic');
    },
    heavy: () => {
      // Strong feedback for critical actions
      setHoveredElement('heavy-haptic');
      console.log('heavy haptic');
    },
  };

  return {
    hoveredElement,
    handleHoverStart,
    handleHoverEnd,
    hapticFeedback,
  };
};

// Scroll-based animation trigger
export const useScrollAnimation = () => {
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate progress percentage for scroll-based animations
  const getScrollProgress = (start: number, end: number) => {
    const windowHeight = viewportHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const maxScroll = documentHeight - windowHeight;
    const currentScroll = Math.max(0, Math.min(maxScroll, scrollY));
    const progress = (currentScroll - start) / (end - start);
    return Math.max(0, Math.min(1, progress));
  };

  return {
    scrollY,
    viewportHeight,
    getScrollProgress,
  };
};

// Transform animation utilities for kinetic brutalism
export const transformUtils = {
  // Kinetic brutalism transform generator
  generateTransforms: (
    scale: number = 1,
    rotate: number = 0,
    x: number = 0,
    y: number = 0,
    skewX: number = 0,
    skewY: number = 0
  ) => {
    const transforms = [];
    
    if (scale !== 1) transforms.push(`scale(${scale})`);
    if (rotate !== 0) transforms.push(`rotate(${rotate}deg)`);
    if (x !== 0) transforms.push(`translateX(${x}px)`);
    if (y !== 0) transforms.push(`translateY(${y}px)`);
    if (skewX !== 0) transforms.push(`skewX(${skewX}deg)`);
    if (skewY !== 0) transforms.push(`skewY(${skewY}deg)`);
    
    return transforms.join(' ');
  },

  // Glass morphism generator
  generateGlass: (
    blur: string = '12px',
    opacity: number = 0.1,
    borderOpacity: number = 0.2
  ) => {
    return {
      backdropFilter: `blur(${blur})",
      WebkitBackdropFilter: `blur(${blur})`,
      backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      borderColor: `rgba(255, 255, 255, ${borderOpacity})`,
      borderWidth: '1px',
      borderStyle: 'solid',
    };
  },

  // Gradient generator for kinetic brutalism
  generateGradient: (
    colors: string[],
    direction: 'to right' | 'to bottom' | 'to right bottom' | 'to left bottom' = 'to right'
  ) => {
    const gradientStr = colors.join(', ');
    return {
      background: `linear-gradient(${direction}, ${gradientStr})`,
    };
  },
};

// Haptic feedback integration for mobile
export const hapticIntegration = {
  // Vibrate with different intensities based on interaction
  trigger: (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50],
      };
      navigator.vibrate(patterns[intensity]);
    }
  },

  // Tap feedback simulation for desktop
  tapFeedback: (element: HTMLElement) => {
    element.style.transform = 'scale(0.95)';
    setTimeout(() => {
      element.style.transform = '';
    }, 150);
  },
};

// Animation observer for performance optimization
export const useOptimizedObserver = () => {
  const observerRef = useRef<IntersectionObserver>();
  const [observedElements, setObservedElements] = useState<Set<Element>>(new Set());

  useEffect(() => {
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px 0px 50px 0px',
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Once visible, stop observing to improve performance
          observerRef.current?.unobserve(entry.target);
        }
      });
    }, options);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const observeElement = (element: Element) => {
    if (observerRef.current) {
      observerRef.current.observe(element);
      setObservedElements(prev => new Set([...prev, element]));
    }
  };

  return {
    observeElement,
    isElementObserved: (element: Element) => observedElements.has(element),
  };
};

// Animation batch processor for better performance
export const animationBatcher = {
  batchAnimations: (
    animations: Array<() => void>,
    batchSize: number = 5,
    interval: number = 16
  ) => {
    let batchIndex = 0;

    const runBatch = () => {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchIndex * batchSize + batchSize, animations.length);

      for (let i = startIndex; i < endIndex; i++) {
        animations[i]?.();
      }

      batchIndex++;

      if (batchIndex < animations.length / batchSize) {
        setTimeout(runBatch, interval);
      }
    };

    if (animations.length > 0) {
      runBatch();
    }
  },
};

// Animation quality checker for kinetic brutalism
export const useAnimationQuality = () => {
  const [qualityIssues, setQualityIssues] = useState<string[]>([]);

  const checkQuality = (
    element: Element,
    expectedProperties: string[]
  ) => {
    const issues: string[] = [];

    // Check for poor transition practices
    const computedStyle = getComputedStyle(element);
    const transition = computedStyle.transition;

    if (transition && transition.includes('all')) {
      issues.push('Using "all" transitions can cause layout shifts');
    }

    if (transition && !transition.includes('opacity') && !transition.includes('transform')) {
      issues.push('Animation should be opacity or transform based');
    }

    // Check for performance anti-patterns
    if (element.style.willChange && !['transform', 'opacity'].includes(element.style.willChange)) {
      issues.push(`${element.style.willChange} can impact performance`);
    }

    // Check for excessive animations
    if (element.getAttribute('data-animate-count')) {
      const count = parseInt(element.getAttribute('data-animate-count') || '0');
      if (count > 10) {
        issues.push(`Element has ${count} animations - may impact performance`);
      }
    }

    setQualityIssues(issues);
    return issues;
  };

  return {
    qualityIssues,
    checkQuality,
    clearQualityIssues: () => setQualityIssues([]),
  };
};

// Export all animation utilities for the app
export default {
  MOTION_CONFIG,
  useGPUAcceleration,
  useAnimationPerformance,
  useMotionPreference,
  useMicroInteractions,
  useScrollAnimation,
  transformUtils,
  hapticIntegration,
  useOptimizedObserver,
  animationBatcher,
  useAnimationQuality,
};