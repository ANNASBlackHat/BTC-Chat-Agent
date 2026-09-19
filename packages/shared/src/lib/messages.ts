import type { ToolInvocation, UIMessage } from '../types';

/**
 * Interface describing the message shape produced by Vercel AI SDK's useChat,
 * modeled structurally (no SDK import needed) so this mapper stays decoupled
 * from a specific SDK major version.
 */
export interface SdkChatMessage {
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
    args: Record<string, unknown>;
    state?: 'call' | 'result';
    result?: unknown;
  }>;
}

/**
 * Converts AI SDK useChat messages (parts-based) into the app's UIMessage model
 * with consolidated ToolInvocation entries.
 *
 * Extracted verbatim from ChatClient.tsx (web) so the Expo app can reuse it.
 */
export function mapSdkMessageToUIMessage(msg: SdkChatMessage): UIMessage {
  let content = '';
  let toolInvocations: ToolInvocation[] | undefined = undefined;

  if (msg.parts && Array.isArray(msg.parts)) {
    const toolInvocationsMap: Record<string, ToolInvocation> = {};

    for (const part of msg.parts) {
      if (part.type === 'text') {
        content += part.text || '';
      } else if (part.type === 'tool-call' && part.toolCallId && part.toolName) {
        toolInvocationsMap[part.toolCallId] = {
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          args: part.args || {},
          state: 'call',
        };
      } else if (part.type === 'tool-result' && part.toolCallId) {
        const existing = toolInvocationsMap[part.toolCallId];
        toolInvocationsMap[part.toolCallId] = {
          toolCallId: part.toolCallId,
          toolName: existing ? existing.toolName : part.toolName || 'unknown',
          args: existing ? existing.args : part.args || {},
          state: 'result',
          result: part.result,
        };
      } else if (
        part.type.startsWith('tool-') &&
        part.type !== 'tool-call' &&
        part.type !== 'tool-result' &&
        part.toolCallId
      ) {
        // AI SDK v5+ streaming states (e.g. tool-<name> with input/output fields)
        const toolName = part.type.substring(5);
        const toolCallId = part.toolCallId as string;
        const state = (part as { state?: string }).state === 'output-available' ? 'result' : 'call';
        const args =
          (part as { input?: Record<string, unknown> }).input ||
          part.args ||
          {};
        const result = (part as { output?: unknown }).output !== undefined
          ? (part as { output?: unknown }).output
          : part.result;

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
    content = msg.content || '';
  }

  // Fallback: Check if toolInvocations are directly present on the message object
  const directToolInvocations = msg.toolInvocations;
  if (!toolInvocations && directToolInvocations && Array.isArray(directToolInvocations)) {
    toolInvocations = directToolInvocations.map((ti) => ({
      toolCallId: ti.toolCallId,
      toolName: ti.toolName,
      args: ti.args || {},
      state: ti.state || (ti.result !== undefined ? 'result' : 'call'),
      result: ti.result,
    }));
  }

  return {
    id: msg.id,
    role: msg.role === 'user' ? 'user' : 'assistant',
    content,
    createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
    toolInvocations,
  };
}
