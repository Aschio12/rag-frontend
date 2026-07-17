"use client";

/**
 * BottomDock — visionOS-style floating chat input.
 *
 * The existing <ChatInput /> component is wrapped here WITHOUT modification.
 * The dock provides the floating glass, blur, and lift animations.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Panel } from "./Panel";
import { useAetherMotion } from "@/design-system/motion";
import ChatInput from "@/components/ChatInput";

interface BottomDockProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  hybrid?: boolean;
  onToggleHybrid?: () => void;
  agentic?: boolean;
  onToggleAgentic?: () => void;
}

export default function BottomDock(props: BottomDockProps) {
  const { reduced } = useAetherMotion();

  return (
    <motion.div
      initial={{ y: 32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={reduced ? { duration: 0.2 } : { type: "spring", stiffness: 220, damping: 24, delay: 0.12 }}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 24,
        zIndex: 40,
        pointerEvents: "none",
        display: "flex",
        justifyContent: "center",
        padding: "0 24px",
      }}
    >
      <Panel
        variant="floating"
        level="lift"
        style={{
          pointerEvents: "auto",
          width: "min(880px, 100%)",
          padding: 8,
          borderRadius: 32,
        }}
      >
        <div style={{ padding: 4 }}>
          <ChatInput {...props} />
        </div>
      </Panel>
    </motion.div>
  );
}
