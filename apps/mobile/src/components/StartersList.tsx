import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';

export interface Starter {
  icon: string;
  title: string;
  description: string;
  prompt: string;
}

interface StartersListProps {
  starters: Starter[];
  onSelect: (prompt: string) => void;
}

/** 2-column grid of DB-driven conversation starters (web parity). */
export function StartersList({ starters, onSelect }: StartersListProps) {
  return (
    <View style={{ marginTop: 12, paddingHorizontal: 16 }}>
      <Text
        style={{
          color: colors.text,
          fontSize: 17,
          fontWeight: '800',
          letterSpacing: 0.5,
          textAlign: 'center',
        }}
      >
        ₿ BTC Analysis Agent
      </Text>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 12,
          textAlign: 'center',
          marginTop: 4,
        }}
      >
        Your personal Bitcoin analyst
      </Text>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
          marginTop: 16,
        }}
      >
        {starters.map((starter, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onSelect(starter.prompt)}
            activeOpacity={0.7}
            style={{
              flexGrow: 1,
              flexBasis: '47%',
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              borderRadius: 14,
              padding: 14,
            }}
          >
            <Text style={{ fontSize: 22, marginBottom: 6 }}>{starter.icon}</Text>
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
              {starter.title}
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                marginTop: 3,
                lineHeight: 16,
              }}
            >
              {starter.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
