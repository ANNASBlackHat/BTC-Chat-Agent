import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import type { TradeCardProps } from '@btc-chat/shared';

export function NativeTradeCard({
  direction,
  entryPrice,
  targetPrice,
  stopLoss,
  currentPrice,
  leverage,
  thesis,
}: TradeCardProps) {
  const isLong = direction === 'long';

  const pnlPercent = currentPrice
    ? isLong
      ? ((currentPrice - entryPrice) / entryPrice) * 100 * (leverage || 1)
      : ((entryPrice - currentPrice) / entryPrice) * 100 * (leverage || 1)
    : null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.dirBadge,
              { backgroundColor: isLong ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)' },
            ]}
          >
            <Text
              style={[
                styles.dirText,
                { color: isLong ? colors.up : colors.down },
              ]}
            >
              {isLong ? '↗ ' : '↘ '}
              {direction.toUpperCase()}
            </Text>
          </View>
          {leverage ? (
            <View style={styles.levBadge}>
              <Text style={styles.levText}>{leverage}x</Text>
            </View>
          ) : null}
        </View>

        {pnlPercent !== null ? (
          <Text
            style={[
              styles.pnlText,
              { color: pnlPercent >= 0 ? colors.up : colors.down },
            ]}
          >
            {pnlPercent >= 0 ? '+' : ''}
            {pnlPercent.toFixed(2)}% P&L
          </Text>
        ) : null}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Entry</Text>
          <Text style={styles.statValue}>
            ${entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </View>

        {targetPrice ? (
          <View style={[styles.statBox, styles.targetBox]}>
            <Text style={[styles.statLabel, { color: colors.up }]}>Target</Text>
            <Text style={[styles.statValue, { color: colors.up }]}>
              ${targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>
        ) : null}

        {stopLoss ? (
          <View style={[styles.statBox, styles.stopBox]}>
            <Text style={[styles.statLabel, { color: colors.down }]}>Stop Loss</Text>
            <Text style={[styles.statValue, { color: colors.down }]}>
              ${stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>
        ) : null}
      </View>

      {thesis ? (
        <View style={styles.thesisBox}>
          <Text style={styles.thesisText}>
            <Text style={styles.thesisLabel}>Thesis: </Text>
            {thesis}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 12,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dirBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dirText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  levBadge: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  pnlText: {
    fontSize: 12,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    gap: 6,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    padding: 8,
  },
  targetBox: {
    borderColor: 'rgba(34, 197, 94, 0.3)',
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  stopBox: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  thesisBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  thesisLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
  },
  thesisText: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
