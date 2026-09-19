"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import {
  usePosition,
  mapSdkMessageToUIMessage,
  type SdkChatMessage,
  type UserPosition,
  type ConversationStarter,
} from '@btc-chat/shared';
import { ChatWindow } from "./ChatWindow";

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

  // Message mapping lives in @btc-chat/shared so the Expo app reuses it.
  const mappedMessages = React.useMemo(() => {
    return messages.map((msg) =>
      mapSdkMessageToUIMessage(msg as unknown as SdkChatMessage)
    );
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
