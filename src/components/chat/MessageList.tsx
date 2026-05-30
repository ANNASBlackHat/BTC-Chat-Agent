"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { ToolCallIndicator } from "./ToolCallIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, UIMessage, ToolInvocation } from "@/types";

export interface MessageListProps {
  messages: UIMessage[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Map Vercel AI SDK message to our strict ChatMessage type
  const mapToChatMessage = (message: UIMessage): ChatMessage => {
    return {
      role: message.role === "user" ? "user" : "assistant",
      content: message.content,
      timestamp: message.createdAt 
        ? message.createdAt.toISOString() 
        : new Date().toISOString(),
    };
  };

  const scrollToBottom = React.useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Scroll to bottom on new messages, tool status changes, or loading state changes
  React.useEffect(() => {
    scrollToBottom();
    // A small fallback timer to ensure content-size changes trigger scroll correctly
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [messages, isLoading, scrollToBottom]);

  // Determine if the last message is from user and assistant hasn't sent any tokens
  const isAgentThinking = React.useMemo(() => {
    if (!isLoading || messages.length === 0) return false;
    const lastMsg = messages[messages.length - 1];
    return lastMsg.role === "user";
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1 w-full h-full">
      <div className="flex flex-col w-full max-w-4xl mx-auto px-4 py-6 md:px-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center select-none animate-fade-in">
            <div className="size-12 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-center mb-4 shadow-md shadow-black/40">
              <span className="font-sans font-extrabold text-xl text-emerald-400">₿</span>
            </div>
            <h2 className="text-zinc-200 font-semibold text-base tracking-tight">
              Bitcoin Intelligent Chat Agent
            </h2>
            <p className="text-zinc-500 text-xs mt-1.5 max-w-xs leading-relaxed">
              Your professional Bitcoin thinking partner. Ask about current prices, positions, or search pipeline analytics.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const hasContent = message.content.trim() !== "";
            const hasToolInvocations = 
              message.toolInvocations && message.toolInvocations.length > 0;

            return (
              <div key={message.id} className="w-full flex flex-col">
                {/* Render the text bubble only if content exists */}
                {hasContent && (
                  <MessageBubble message={mapToChatMessage(message)} />
                )}

                {/* Render tool invocations associated with this message */}
                {hasToolInvocations && (
                  <div className="flex flex-col pl-11 my-1">
                    {message.toolInvocations?.map((toolInv: ToolInvocation) => (
                      <ToolCallIndicator
                        key={toolInv.toolCallId}
                        toolCallId={toolInv.toolCallId}
                        toolName={toolInv.toolName}
                        args={toolInv.args as Record<string, unknown>}
                        state={toolInv.state}
                        result={toolInv.result}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Pulse thinking indicator */}
        {isAgentThinking && (
          <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-sans pl-11 py-3 select-none animate-pulse">
            <Loader2 className="size-3.5 animate-spin text-zinc-500" />
            <span className="font-medium tracking-tight">Agent is processing data...</span>
          </div>
        )}

        <div ref={messagesEndRef} className="h-2" />
      </div>
    </ScrollArea>
  );
}
