import { useCallback, useMemo, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import {
  mapSdkMessageToUIMessage,
  getApiBaseUrl,
  getAuthToken,
  type SdkChatMessage,
  type UIMessage,
} from '@btc-chat/shared';

interface ChatRequestBody {
  position: { direction: 'long' | 'short'; entry_price: number } | null;
}

/**
 * Chat hook for React Native.
 *
 * React Native's fetch cannot consume streaming response bodies, so we supply
 * Expo's streaming-capable fetch (expo/fetch, SDK 52+) to the AI SDK transport,
 * following the documented Expo + AI SDK integration pattern.
 */
export function useChatStream(position: { direction: 'long' | 'short'; entry_price: number } | null) {
  const positionRef = useRef(position);
  positionRef.current = position;

  const transport = useMemo(() => {
    // Lazily require expo/fetch so this module also loads under plain
    // TypeScript typecheck environments without the Expo runtime.
    const expoFetch = require('expo/fetch').fetch as typeof fetch;
    return new DefaultChatTransport({
      api: `${getApiBaseUrl()}/api/chat`,
      fetch: async (input, init) => {
        const token = await getAuthToken();
        const headers = new Headers(init?.headers);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return expoFetch(input, { ...init, headers });
      },
      body: () =>
        ({
          position: positionRef.current,
        }) satisfies ChatRequestBody,
    });
  }, []);

  const { messages, sendMessage, status, error, stop } = useChat({ transport });

  const isLoading = status === 'streaming' || status === 'submitted';

  const mapped: UIMessage[] = useMemo(
    () => messages.map((m) => mapSdkMessageToUIMessage(m as unknown as SdkChatMessage)),
    [messages]
  );

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      sendMessage({ text: trimmed });
    },
    [sendMessage]
  );

  return { messages: mapped, send, isLoading, error, stop };
}
