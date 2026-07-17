"use client";

/**
 * ComposerMessage — single runtime-neutral wrapper that exists only at
 * the visual layer. The page.tsx decides user/assistant based on role and
 * delegates to either a UserMessageChip (right) or an AssistantMessageSurface.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { AssistantMessageSurface } from "./AssistantMessageSurface";
import { UserMessageChip } from "./UserMessageChip";
import { AgentStepsFrame } from "./AgentStepsFrame";
import type { Source, AgentStepEvent } from "@/lib/api";

interface ComposerMessageProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentSteps?: AgentStepEvent[];
  sources?: Source[];
  isStreaming?: boolean;
  bookmarked?: boolean;
  copied?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onSpeak?: () => void;
  onPin?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  onOpenSource?: (i: number) => void;
}

export const ComposerMessage = React.memo(function ComposerMessage(
  props: ComposerMessageProps,
) {
  const isUser = props.role === "user";

  return (
    <motion.li
      layout="position"
      style={{
        listStyle: "none",
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        width: "100%",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginTop: 6,
        marginBottom: 18,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
        {isUser ? (
          <UserMessageChip
            content={props.content}
            onEdit={props.onEdit}
            onDelete={props.onDelete}
          />
        ) : (
          <>
            <AssistantMessageSurface
              id={props.id}
              content={props.content}
              sources={props.sources}
              isStreaming={!!props.isStreaming}
              bookmarked={props.bookmarked}
              copied={props.copied}
              onCopy={props.onCopy}
              onRegenerate={props.onRegenerate}
              onSpeak={props.onSpeak}
              onPin={props.onPin}
              onShare={props.onShare}
              onExport={props.onExport}
              onOpenSource={props.onOpenSource}
            />
            {props.agentSteps && props.agentSteps.length > 0 && (
              <AgentStepsFrame steps={props.agentSteps} />
            )}
          </>
        )}
      </div>
    </motion.li>
  );
});
