import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../theme';
import { useBtcPriceMobile } from '../useBtcPriceMobile';
import { useChatStream } from '../useChatStream';
import {
  fetchPosition,
  fetchStarters,
  updatePosition,
  clearPosition,
  logout,
  type PositionPayload,
} from '../api';
import { PriceHeader } from './PriceHeader';
import { MessageRow } from './MessageRow';
import { StartersList, type Starter } from './StartersList';
import { PositionModal } from './PositionModal';

interface ChatScreenProps {
  onLogout: () => void;
}

export function ChatScreen({ onLogout }: ChatScreenProps) {
  const btc = useBtcPriceMobile();
  const [position, setPosition] = useState<PositionPayload | null>(null);
  const [starters, setStarters] = useState<Starter[]>([]);
  const [editorVisible, setEditorVisible] = useState(false);
  const [input, setInput] = useState('');
  const { messages, send, isLoading, error, stop } = useChatStream(position);

  // Load dynamic conversation starters once on mount (DB-driven, web parity)
  useEffect(() => {
    let cancelled = false;
    fetchStarters().then((s) => {
      if (!cancelled) setStarters(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep position in sync — refresh whenever the agent finishes a turn
  // (its tools may have updated/cleared the stored position).
  const prevLoading = React.useRef(isLoading);
  useEffect(() => {
    if (prevLoading.current && !isLoading) {
      fetchPosition()
        .then(setPosition)
        .catch(() => undefined);
    }
    prevLoading.current = isLoading;
  }, [isLoading]);

  const handleSend = useCallback(() => {
    send(input);
    setInput('');
  }, [send, input]);

  const handleSelectStarter = useCallback(
    (prompt: string) => {
      send(prompt);
    },
    [send]
  );

  const handleSavePosition = useCallback(
    async (direction: 'long' | 'short', entryPrice: number) => {
      const saved = await updatePosition(direction, entryPrice);
      if (saved) setPosition(saved);
    },
    []
  );

  const handleClearPosition = useCallback(async () => {
    await clearPosition();
    setPosition(null);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    onLogout();
  }, [onLogout]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <PriceHeader
        price={btc}
        position={position}
        onLogout={handleLogout}
        onOpenEditor={() => setEditorVisible(true)}
      />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageRow message={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        ListEmptyComponent={
          starters.length > 0 ? (
            <StartersList starters={starters} onSelect={handleSelectStarter} />
          ) : (
            <View style={{ alignItems: 'center', marginTop: 64 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                BTC Chat Terminal
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 12,
                  marginTop: 6,
                  textAlign: 'center',
                  lineHeight: 18,
                }}
              >
                Ask for market analysis, debate your thesis,
                {'\n'}or learn a technique.
              </Text>
            </View>
          )
        }
      />

      {(error || isLoading) && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={{ color: colors.textMuted, fontSize: 11, marginLeft: 8 }}>
                Agent is thinking…
              </Text>
            </>
          ) : (
            <Text style={{ color: colors.danger, fontSize: 11 }} numberOfLines={2}>
              {error?.message ?? 'Something went wrong.'}
            </Text>
          )}
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          padding: 12,
          paddingBottom: 28,
          borderTopWidth: 1,
          borderTopColor: colors.cardBorder,
          backgroundColor: colors.card,
          gap: 8,
        }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask anything…"
          placeholderTextColor={colors.textMuted}
          multiline
          style={{
            flex: 1,
            minHeight: 40,
            maxHeight: 120,
            backgroundColor: colors.bg,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            borderRadius: 12,
            color: colors.text,
            paddingHorizontal: 12,
            paddingTop: 10,
            fontSize: 14,
          }}
        />
        {isLoading ? (
          <TouchableOpacity
            onPress={stop}
            accessibilityRole="button"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.danger,
              borderRadius: 12,
              paddingHorizontal: 14,
              justifyContent: 'center',
              minHeight: 40,
            }}
          >
            <Text style={{ color: colors.danger, fontWeight: '800', fontSize: 12 }}>STOP</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim()}
            accessibilityRole="button"
            style={{
              backgroundColor: input.trim() ? colors.accent : colors.card,
              borderWidth: 1,
              borderColor: input.trim() ? colors.accent : colors.cardBorder,
              borderRadius: 12,
              paddingHorizontal: 14,
              justifyContent: 'center',
              minHeight: 40,
            }}
          >
            <Text
              style={{
                color: input.trim() ? '#04110b' : colors.textMuted,
                fontWeight: '800',
                fontSize: 12,
              }}
            >
              SEND
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <PositionModal
        visible={editorVisible}
        position={position}
        onClose={() => setEditorVisible(false)}
        onSave={handleSavePosition}
        onClear={handleClearPosition}
      />
    </KeyboardAvoidingView>
  );
}
