"use client";

/**
 * LazyCard — defers mounting of expensive children until they enter the
 * viewport (via IntersectionObserver). Once mounted, the substitute is
 * rendered with a soft fade. Useful for the impressionistic preview
 * computations in DocumentCard v2.
 */

import * as React from "react";
import { motion } from "framer-motion";

interface LazyCardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** When true, never observe — mount on first render. */
  eager?: boolean;
  rootMargin?: string;
}

export const LazyCard = React.memo(function LazyCard({
  children,
  fallback,
  eager,
  rootMargin = "200px",
}: LazyCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(!!eager);

  React.useEffect(() => {
    if (eager) return;
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [eager, rootMargin]);

  return (
    <div ref={ref}>
      {!visible && (
        fallback ?? (
          <div
            style={{
              padding: 14,
              minHeight: 120,
              borderRadius: 14,
              background: "var(--aether-surface-recessed)",
              border: "1px solid var(--aether-border-subtle)",
              opacity: 0.4,
            }}
          />
        )
      )}
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
});
