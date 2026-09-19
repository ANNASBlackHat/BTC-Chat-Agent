import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../theme';
import type { UIMessage } from '@btc-chat/shared';

/**
 * Minimal inline-markdown renderer: renders text line-by-line, converting
 * `**bold**` segments into styled text. Avoids a full markdown dependency
 * while keeping the agent's terminal-style output readable.
 */
function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <View>
      {lines.map((line, i) => {
        if (line.trim() === '') return <View key={i} style={{ height: 6 }} />;
        const segments = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
        return (
          <Text key={i} style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
            {segments.map((seg, j) => {
              if (seg.startsWith('**') && seg.endsWith('**')) {
                return (
                  <Text key={j} style={{ fontWeight: '800' }}>
                    {seg.slice(2, -2)}
                  </Text>
                );
              }
              return seg;
            })}
          </Text>
        );
      })}
    </View>
  );
}

export function MessageRow({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';

  return (
    <View
      style={{
        alignSelf: isUser ? 'flex-end' : 'stretch',
        maxWidth: isUser ? '85%' : '100%',
        backgroundColor: isUser ? colors.accentDim : colors.card,
        borderWidth: 1,
        borderColor: isUser ? colors.accent : colors.cardBorder,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginVertical: 4,
      }}
    >
      {message.toolInvocations?.map((tool) => (
        <View
          key={tool.toolCallId}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.bg,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginBottom: 6,
            alignSelf: 'flex-start',
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              marginRight: 6,
              backgroundColor: tool.state === 'result' ? colors.accent : colors.textMuted,
            }}
          />
          <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }} numberOfLines={1}>
            {tool.toolName}
          </Text>
        </View>
      ))}

      {message.content ? <MarkdownText text={message.content} /> : null}
    </View>
  );
}
