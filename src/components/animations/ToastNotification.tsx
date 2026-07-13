"use client";

import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastNotificationProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  className?: string;
}

const typeColors: Record<ToastType, { border: string; bg: string; icon: string }> = {
  success: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-950/60",
    icon: "🟢",
  },
  error: {
    border: "border-red-500/30",
    bg: "bg-red-950/60",
    icon: "🔴",
  },
  info: {
    border: "border-purple-500/30",
    bg: "bg-purple-950/60",
    icon: "🟣",
  },
  warning: {
    border: "border-amber-500/30",
    bg: "bg-amber-950/60",
    icon: "🟡",
  },
};

export function ToastNotification({
  toasts,
  onDismiss,
  className,
}: ToastNotificationProps) {
  return (
    <div className={`fixed bottom-4 right-4 z-50 flex flex-col gap-2 ${className || ""}`}>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const colors = typeColors[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className={`${colors.bg} ${colors.border} border rounded-xl px-4 py-3 backdrop-blur-xl min-w-[280px] cursor-pointer`}
              onClick={() => onDismiss(toast.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="text-sm text-purple-100">{toast.message}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
