import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import type { AlertWidgetProps } from '@btc-chat/shared';

export function NativeAlertWidget({
  symbol,
  targetPrice,
  direction,
  note,
}: AlertWidgetProps) {
  const [active, setActive] = useState(false);

  const isUp = direction === 'up';

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <View style={styles.symbolRow}>
          <Text style={styles.symbol}>{symbol}</Text>
          <View
            style={[
              styles.dirBadge,
              { backgroundColor: isUp ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)' },
            ]}
          >
            <Text
              style={[
                styles.dirText,
                { color: isUp ? colors.up : colors.down },
              ]}
            >
              {isUp ? '↑ ' : '↓ '}
              {direction.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.targetPrice}>
            ${targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </View>
        {note ? <Text style={styles.note} numberOfLines={1}>{note}</Text> : null}
      </View>

      <Pressable
        onPress={() => setActive(true)}
        disabled={active}
        style={({ pressed }) => [
          styles.button,
          active ? styles.buttonActive : null,
          pressed && !active ? styles.buttonPressed : null,
        ]}
      >
        <Text style={[styles.buttonText, active ? styles.buttonTextActive : null]}>
          {active ? '✓ Set' : 'Set Alert'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 10,
    marginVertical: 4,
    gap: 8,
  },
  info: {
    flex: 1,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  symbol: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  dirBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  dirText: {
    fontSize: 9,
    fontWeight: '900',
  },
  targetPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  note: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.bg,
  },
  buttonTextActive: {
    color: colors.accent,
  },
});
