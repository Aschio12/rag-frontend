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
    border: "border-[#00ff87]/30",
    bg: "bg-black/90",
    icon: Check,
    iconColor: "text-[#00ff87]",
    glow: "shadow-[0_0_20px_rgba(0,255,135,0.15)]",
  },
  info: {
    border: "border-[#00f2fe]/30",
    bg: "bg-black/90",
    icon: Info,
    iconColor: "text-[#00f2fe]",
    glow: "shadow-[0_0_20px_rgba(0,242,254,0.15)]",
  },
  error: {
    border: "border-red-500/30",
    bg: "bg-black/90",
    icon: AlertTriangle,
    iconColor: "text-red-400",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.15)]",
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
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none font-mono">
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
                  "pointer-events-auto flex items-center gap-2.5 rounded-none border px-4 py-2.5 text-xs tracking-wider shadow-lg backdrop-blur-xl min-w-[260px] cursor-pointer cyber-glass bg-black/90 text-white",
                  styles.border,
                  styles.glow,
                )}
                onClick={() => removeToast(toast.id)}
              >
                <Icon className={cn("h-4 w-4 shrink-0", styles.iconColor)} />
                <span className="text-xs tracking-wider text-white/80 flex-1">{toast.message}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
                  className="rounded-none p-0.5 opacity-50 hover:opacity-100 hover:bg-white/5 transition-all border border-white/10"
                >
                  <X className="h-3 w-3 text-white/50" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
