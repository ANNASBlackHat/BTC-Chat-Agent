import { createParser } from '@openuidev/lang-core';
import { createBtcOpenUILibrary } from './definitions';

export interface OpenUIElementNode {
  type: 'element';
  typeName: string;
  props: Record<string, unknown>;
  partial?: boolean;
  statementId?: string;
}

export interface ParsedOpenUIBlock {
  hasOpenUI: boolean;
  cleanText: string;
  rawOpenUI?: string;
  rootNode: OpenUIElementNode | null;
  error?: string;
}

// Cached parser instance to avoid recompiling JSON schema on every message render
let cachedParser: ReturnType<typeof createParser> | null = null;

function getParser() {
  if (!cachedParser) {
    const library = createBtcOpenUILibrary();
    cachedParser = createParser(library.toJSONSchema());
  }
  return cachedParser;
}

const OPENUI_BLOCK_REGEX = /```(?:openui)\s*\n([\s\S]*?)```/i;

/**
 * Extracts and parses OpenUI Lang content from assistant message text.
 * 
 * If a ```openui code block is found, it extracts and compiles the DSL AST,
 * returning the clean markdown text (with the block stripped) and the parsed root AST node.
 * 
 * If no OpenUI block is present, it returns hasOpenUI = false and the original text unchanged.
 */
export function parseOpenUIMessage(content: string): ParsedOpenUIBlock {
  if (!content || typeof content !== 'string') {
    return {
      hasOpenUI: false,
      cleanText: content || '',
      rootNode: null,
    };
  }

  const match = content.match(OPENUI_BLOCK_REGEX);
  if (!match) {
    return {
      hasOpenUI: false,
      cleanText: content,
      rootNode: null,
    };
  }

  const rawOpenUI = match[1].trim();
  const cleanText = content.replace(match[0], '').trim();

  try {
    const parser = getParser();
    const result = parser.parse(rawOpenUI);

    if (result && result.root && result.root.type === 'element') {
      return {
        hasOpenUI: true,
        cleanText,
        rawOpenUI,
        rootNode: result.root as unknown as OpenUIElementNode,
      };
    }

    return {
      hasOpenUI: true,
      cleanText,
      rawOpenUI,
      rootNode: null,
      error: result?.meta?.errors?.[0]?.message || 'Failed to parse root element',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      hasOpenUI: true,
      cleanText,
      rawOpenUI,
      rootNode: null,
      error: errorMsg,
    };
  }
}
