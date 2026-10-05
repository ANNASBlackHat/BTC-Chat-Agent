import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import type { RiskSimulatorProps } from '@btc-chat/shared';

export function NativeRiskSimulator({
  entryPrice,
  stopLoss,
  targetPrice,
  riskRewardRatio,
  potentialLossUsd,
  potentialGainUsd,
  liquidationPrice,
}: RiskSimulatorProps) {
  const isGoodRatio = riskRewardRatio >= 2.0;
  const isFairRatio = riskRewardRatio >= 1.5 && riskRewardRatio < 2.0;

  const ratioColor = isGoodRatio ? colors.up : isFairRatio ? '#f59e0b' : colors.down;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Risk / Reward Ratio</Text>
        <View style={[styles.ratioBadge, { borderColor: ratioColor }]}>
          <Text style={[styles.ratioText, { color: ratioColor }]}>
            1 : {riskRewardRatio.toFixed(2)} R:R
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Entry</Text>
          <Text style={styles.statValue}>${entryPrice.toLocaleString()}</Text>
        </View>
        <View style={[styles.statBox, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
          <Text style={[styles.statLabel, { color: colors.down }]}>Stop Loss</Text>
          <Text style={[styles.statValue, { color: colors.down }]}>${stopLoss.toLocaleString()}</Text>
        </View>
        <View style={[styles.statBox, { borderColor: 'rgba(34, 197, 94, 0.3)' }]}>
          <Text style={[styles.statLabel, { color: colors.up }]}>Target</Text>
          <Text style={[styles.statValue, { color: colors.up }]}>${targetPrice.toLocaleString()}</Text>
        </View>
        {liquidationPrice ? (
          <View style={[styles.statBox, { borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
            <Text style={[styles.statLabel, { color: '#f59e0b' }]}>Est. Liq</Text>
            <Text style={[styles.statValue, { color: '#f59e0b' }]}>${liquidationPrice.toLocaleString()}</Text>
          </View>
        ) : null}
      </View>

      {(potentialLossUsd || potentialGainUsd) ? (
        <View style={styles.footer}>
          {potentialLossUsd ? (
            <Text style={styles.riskLoss}>Risk: -${potentialLossUsd.toLocaleString()}</Text>
          ) : null}
          {potentialGainUsd ? (
            <Text style={styles.riskGain}>Reward: +${potentialGainUsd.toLocaleString()}</Text>
          ) : null}
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
  title: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  ratioBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  ratioText: {
    fontSize: 11,
    fontWeight: '900',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  riskLoss: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.down,
  },
  riskGain: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.up,
  },
});
