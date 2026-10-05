import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import type { MetricCardProps } from '@btc-chat/shared';

export function NativeMetricCard({ label, value, trend, change }: MetricCardProps) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';

  const badgeBg = isUp ? 'rgba(34, 197, 94, 0.15)' : isDown ? 'rgba(239, 68, 68, 0.15)' : colors.cardBorder;
  const badgeColor = isUp ? colors.up : isDown ? colors.down : colors.textMuted;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {trend && (
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>
              {change || trend.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 10,
    marginVertical: 3,
    minWidth: 120,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  value: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
});
