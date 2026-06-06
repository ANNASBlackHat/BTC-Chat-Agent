import { streamText, stepCountIs, type ModelMessage, type ToolResultPart } from 'ai';
import { getLLMProvider } from '@/lib/llm';
import { allTools } from '@/lib/tools';
import { buildSystemPrompt } from '@/lib/prompts/system';
import { getUserPosition } from '@/lib/db/queries';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, position } = body;

    // Validate request parameter payload
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid "messages" array parameter in request body.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Resolve provider model dynamically using factory configuration
    const { model } = await getLLMProvider();

    // Context-Aware Position Resolution:
    // Fall back to querying the cached MongoDB user_position collection if no position is explicitly provided in the request body
    let positionContext = position;
    if (!positionContext) {
      try {
        const dbPosition = await getUserPosition();
        if (dbPosition) {
          positionContext = {
            direction: dbPosition.direction,
            entry_price: dbPosition.entry_price,
          };
        }
      } catch (dbError) {
        console.error('Error fetching active position from database:', dbError);
        // Fail-safe: proceed with null position context rather than crashing the route
      }
    }

    // Compile dynamic, position-relative system prompt
    const systemPrompt = buildSystemPrompt(positionContext ?? null);

    interface ClientMessage {
      id?: string;
      role: 'system' | 'user' | 'assistant' | 'tool';
      content?: string | Array<{ type: string; text?: string; image?: string }>;
      parts?: Array<{
        type: 'text' | 'tool-call' | 'tool-result';
        text?: string;
        toolCallId?: string;
        toolName?: string;
        args?: Record<string, unknown>;
        result?: unknown;
      }>;
      toolCalls?: Array<{
        type: 'function';
        id: string;
        name: string;
        args: Record<string, unknown>;
      }>;
      toolResults?: Array<{
        type: 'tool-result';
        toolCallId: string;
        toolName: string;
        result: unknown;
      }>;
      name?: string;
    }

    // Convert client-side message format to strict server-side ModelMessage schema
    const formattedMessages: ModelMessage[] = messages.map((msg: ClientMessage): ModelMessage => {
      const role = msg.role;

      // Extract content
      let content = msg.content;
      if (content === undefined && msg.parts && Array.isArray(msg.parts)) {
        const textParts = msg.parts.filter((p) => p.type === 'text');
        if (textParts.length > 0) {
          content = textParts.map((p) => ({
            type: 'text' as const,
            text: p.text || '',
          }));
        } else {
          content = '';
        }
      }

      console.log(`role: ${role}, toolResult: ${JSON.stringify(msg.toolResults)}, toolCall: ${JSON.stringify(msg.toolCalls)}`);
      // Handle tool messages (role === 'tool')
      if (role === 'tool') {
        const toolResults: ToolResultPart[] = (msg.toolResults || (msg.parts && Array.isArray(msg.parts)
          ? msg.parts
            .filter((p) => p.type === 'tool-result')
            .map((p) => ({
              type: 'tool-result' as const,
              toolCallId: p.toolCallId || '',
              toolName: p.toolName || '',
              output: p.result,
            }))
          : [])) as ToolResultPart[];

        return {
          role: 'tool',
          content: toolResults,
        };
      }

      // Extract tool calls for assistant messages
      let toolCalls: Array<{
        type: 'function';
        id: string;
        name: string;
        args: unknown;
      }> | undefined = undefined;

      if (role === 'assistant') {
        const extractedCalls = msg.toolCalls || (msg.parts && Array.isArray(msg.parts)
          ? msg.parts
            .filter((p) => p.type === 'tool-call')
            .map((p) => ({
              type: 'function' as const,
              id: p.toolCallId || '',
              name: p.toolName || '',
              args: p.args || {},
            }))
          : undefined);

        if (extractedCalls && extractedCalls.length > 0) {
          toolCalls = extractedCalls;
        }
      }

      if (role === 'assistant') {
        const assistantContent = typeof content === 'string'
          ? content
          : (Array.isArray(content)
            ? content.map((c) => {
              if (typeof c === 'object' && c !== null && 'text' in c) {
                return { type: 'text' as const, text: c.text || '' };
              }
              return { type: 'text' as const, text: '' };
            })
            : '');

        return {
          role: 'assistant',
          content: assistantContent,
          ...(toolCalls ? { toolCalls } : {}),
        };
      }

      if (role === 'system') {
        return {
          role: 'system',
          content: typeof content === 'string' ? content : '',
        };
      }

      // Default to user message
      const userContent = typeof content === 'string'
        ? content
        : (Array.isArray(content)
          ? content.map((c) => {
            if (typeof c === 'object' && c !== null && 'text' in c) {
              return { type: 'text' as const, text: c.text || '' };
            }
            return { type: 'text' as const, text: '' };
          })
          : '');

      return {
        role: 'user',
        content: userContent,
      };
    });

    // Stream text and tools with up to 5 steps for complex reasoning/chaining
    const result = streamText({
      model,
      system: systemPrompt,
      messages: formattedMessages,
      tools: allTools,
      stopWhen: stepCountIs(5),
    });

    // Return the Vercel AI SDK compatible UI message stream response
    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    const err = error as Error;
    console.error('API Chat Route encountered an error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Server Error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
