import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';
import type { BtcPriceState } from '../useBtcPriceMobile';
import type { PositionPayload } from '../api';

interface PriceHeaderProps {
  price: BtcPriceState;
  position: PositionPayload | null;
  onLogout: () => void;
  onOpenEditor?: () => void;
}

export function PriceHeader({ price, position, onLogout, onOpenEditor }: PriceHeaderProps) {
  const direction = price.prevPrice !== null && price.price !== null
    ? price.price >= price.prevPrice ? '▲' : '▼'
    : '';
  const priceColor =
    price.prevPrice !== null && price.price !== null && price.price < price.prevPrice
      ? colors.down
      : colors.up;

  let pnl = '';
  if (position && price.price !== null) {
    const pct =
      position.direction === 'long'
        ? ((price.price - position.entry_price) / position.entry_price) * 100
        : ((position.entry_price - price.price) / position.entry_price) * 100;
    pnl = `  ${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
  }

  return (
    <View
      style={{
        paddingTop: 48,
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>
          BTC / USDT
        </Text>
        <Text style={{ color: priceColor, fontSize: 20, fontWeight: '800', marginTop: 2 }}>
          {price.price !== null
            ? `$${price.price.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${direction}`
            : price.loading
              ? '…'
              : '—'}
          {pnl}
        </Text>
        {price.error ? (
          <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }} numberOfLines={1}>
            {price.error}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={onOpenEditor}
        disabled={!onOpenEditor}
        accessibilityRole="button"
        accessibilityLabel="Edit position"
        activeOpacity={0.7}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        style={{
          backgroundColor: position ? colors.accentDim : 'transparent',
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: position ? colors.accent : colors.cardBorder,
          borderRadius: 8,
          paddingHorizontal: 8,
          paddingVertical: 4,
          marginRight: 8,
        }}
      >
        <Text
          style={{
            color: position ? colors.accent : colors.textMuted,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.5,
          }}
        >
          {position
            ? `${position.direction.toUpperCase()} @ $${position.entry_price.toLocaleString('en-US')} ✎`
          : '+ SET'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onLogout}
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{
          borderWidth: 1,
          borderColor: colors.cardBorder,
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 6,
        }}
      >
        <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700' }}>EXIT</Text>
      </TouchableOpacity>
    </View>
  );
}
