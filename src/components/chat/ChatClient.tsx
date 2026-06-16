"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { usePosition } from "@/hooks/usePosition";
import { ChatWindow } from "./ChatWindow";
import { UIMessage, UserPosition, ToolInvocation, ConversationStarter } from "@/types";

interface ChatClientProps {
  initialPosition: UserPosition | null;
  starters: ConversationStarter[];
  latestAnalysisDate: string | null;
}

export function ChatClient({ initialPosition, starters, latestAnalysisDate }: ChatClientProps) {
  const {
    position,
    fetchPosition,
    updatePosition,
    clearPosition,
  } = usePosition(initialPosition);

  // Manage chat input state locally since Vercel AI SDK 5.0+ decouples input state
  const [input, setInput] = React.useState("");

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  // Wire useChat from @ai-sdk/react. By default, it targets the '/api/chat' endpoint.
  const {
    messages,
    sendMessage,
    status,
  } = useChat();

  // Derive isLoading from the chat status
  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (input.trim() === "") return;

      // Pass the position context dynamically via body parameter on every message send
      sendMessage(
        { text: input },
        {
          body: {
            position: position
              ? {
                direction: position.direction,
                entry_price: position.entry_price,
              }
              : null,
          },
        }
      );
      setInput("");
    },
    [input, sendMessage, position]
  );

  const handleSelectStarter = React.useCallback(
    (prompt: string) => {
      sendMessage(
        { text: prompt },
        {
          body: {
            position: position
              ? {
                direction: position.direction,
                entry_price: position.entry_price,
              }
              : null,
          },
        }
      );
    },
    [sendMessage, position]
  );

  // Position context sync mechanism:
  // When isLoading transitions from true to false (i.e. streaming has completed),
  // refresh the position state from the database. This ensures any changes
  // made by the AI agent's tool invocations (updateUserPosition / clearActivePosition)
  // are immediately synced and reflected in the frontend UI.
  const prevIsLoading = React.useRef(isLoading);
  React.useEffect(() => {
    if (prevIsLoading.current && !isLoading) {
      fetchPosition();
    }
    prevIsLoading.current = isLoading;
  }, [isLoading, fetchPosition]);

  const handleClearPosition = React.useCallback(async () => {
    try {
      await clearPosition();
    } catch (err) {
      console.error("Failed to clear position:", err);
    }
  }, [clearPosition]);

  const handleUpdatePosition = React.useCallback(
    async (direction: "long" | "short", entryPrice: number) => {
      try {
        await updatePosition(direction, entryPrice);
      } catch (err) {
        console.error("Failed to update position:", err);
      }
    },
    [updatePosition]
  );

  const mappedMessages = React.useMemo(() => {
    return messages.map((msg) => {
      const sdkMsg = msg as unknown as {
        id: string;
        role: string;
        content?: string;
        createdAt?: Date | string | number;
        parts?: Array<{
          type: string;
          text?: string;
          toolCallId?: string;
          toolName?: string;
          args?: Record<string, unknown>;
          result?: unknown;
        }>;
        toolInvocations?: Array<{
          toolCallId: string;
          toolName: string;
          args?: Record<string, unknown>;
          state?: "call" | "result";
          result?: unknown;
        }>;
      };

      let content = "";
      let toolInvocations: ToolInvocation[] | undefined = undefined;

      if (sdkMsg.parts && Array.isArray(sdkMsg.parts)) {
        sdkMsg.parts.forEach((part, idx) => {
          // console.log(`[PART ${idx}]`, {
          //   type: part.type,
          //   keys: Object.keys(part),
          //   toolCallId: (part as any).toolCallId,
          //   toolName: (part as any).toolName,
          // });
        });
        const toolInvocationsMap: Record<string, ToolInvocation> = {};
        for (const part of sdkMsg.parts) {
          console.log(`partType: ${part.type}`)
          if (part.type === "tool-call" || part.type === "tool-result" || part.type.startsWith("tool")) {
            console.log(`part: ${JSON.stringify(part)} || toolDirect: ${sdkMsg.toolInvocations}`)
          }

          if (part.type === "text") {
            content += part.text || "";
          } else if (part.type === "tool-call" && part.toolCallId && part.toolName) {
            toolInvocationsMap[part.toolCallId] = {
              toolCallId: part.toolCallId,
              toolName: part.toolName,
              args: part.args || {},
              state: "call",
            };
          } else if (part.type === "tool-result" && part.toolCallId) {
            const existing = toolInvocationsMap[part.toolCallId];
            toolInvocationsMap[part.toolCallId] = {
              toolCallId: part.toolCallId,
              toolName: existing ? existing.toolName : (part.toolName || "unknown"),
              args: existing ? existing.args : (part.args || {}),
              state: "result",
              result: part.result,
            };
          } else if (part.type.startsWith("tool-") && part.type !== "tool-call" && part.type !== "tool-result" && (part as any).toolCallId) {
            const castPart = part as any;
            const toolName = part.type.substring(5);
            const toolCallId = castPart.toolCallId;
            const state = castPart.state === "output-available" ? "result" : "call";
            const args = castPart.input || castPart.args || {};
            const result = castPart.output !== undefined ? castPart.output : castPart.result;

            toolInvocationsMap[toolCallId] = {
              toolCallId,
              toolName,
              args,
              state,
              result,
            };
          }
        }
        const extractedTools = Object.values(toolInvocationsMap);
        if (extractedTools.length > 0) {
          toolInvocations = extractedTools;
        }
      } else {
        content = sdkMsg.content || "";
      }

      // Fallback: Check if toolInvocations are directly present on the sdkMsg object
      const directToolInvocations = sdkMsg.toolInvocations;
      if (!toolInvocations && directToolInvocations && Array.isArray(directToolInvocations)) {
        toolInvocations = directToolInvocations.map((ti) => ({
          toolCallId: ti.toolCallId,
          toolName: ti.toolName,
          args: ti.args || {},
          state: ti.state || (ti.result !== undefined ? "result" : "call"),
          result: ti.result,
        }));
      }

      // console.log("[DEBUG ChatClient mapped]", {
      //   id: sdkMsg.id,
      //   role: sdkMsg.role,
      //   partsJson: JSON.stringify(sdkMsg.parts),
      //   toolInvocationsJson: JSON.stringify(sdkMsg.toolInvocations),
      //   parsedInvocationsJson: JSON.stringify(toolInvocations),
      // });

      return {
        id: sdkMsg.id,
        role: sdkMsg.role === "user" ? "user" : "assistant",
        content,
        createdAt: sdkMsg.createdAt ? new Date(sdkMsg.createdAt) : new Date(),
        toolInvocations,
      } as UIMessage;
    });
  }, [messages]);

  return (
    <ChatWindow
      messages={mappedMessages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      setInput={setInput}
      isLoading={isLoading}
      activePosition={position}
      onClearPosition={handleClearPosition}
      onUpdatePosition={handleUpdatePosition}
      starters={starters}
      onSelect={handleSelectStarter}
      latestAnalysisDate={latestAnalysisDate}
    />
  );
}
