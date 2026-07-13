"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "info" | "error") => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let toastCounter = 0;

const typeStyles = {
  success: {
    border: "border-emerald-500/20",
    bg: "bg-emerald-950/40",
    icon: Check,
    iconColor: "text-emerald-400",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.1)]",
  },
  info: {
    border: "border-purple-500/20",
    bg: "bg-purple-950/40",
    icon: Info,
    iconColor: "text-purple-400",
    glow: "shadow-[0_0_20px_rgba(124,58,237,0.1)]",
  },
  error: {
    border: "border-red-500/20",
    bg: "bg-red-950/40",
    icon: AlertTriangle,
    iconColor: "text-red-400",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.1)]",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "info" | "error" = "success") => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast, i) => {
            const styles = typeStyles[toast.type];
            const Icon = styles.icon;
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    delay: i * 0.03,
                  },
                }}
                exit={{
                  opacity: 0,
                  x: 80,
                  scale: 0.95,
                  transition: { duration: 0.15, ease: "easeIn" },
                }}
                className={cn(
                  "pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm shadow-lg backdrop-blur-xl min-w-[260px] cursor-pointer",
                  styles.border,
                  styles.bg,
                  styles.glow,
                )}
                onClick={() => removeToast(toast.id)}
              >
                <Icon className={cn("h-4 w-4 shrink-0", styles.iconColor)} />
                <span className="text-xs text-purple-100/80 flex-1">{toast.message}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
                  className="rounded-lg p-0.5 opacity-50 hover:opacity-100 hover:bg-white/5 transition-all"
                >
                  <X className="h-3 w-3 text-purple-300/50" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
