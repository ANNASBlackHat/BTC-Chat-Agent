import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { NativeMetricCard } from './NativeMetricCard';
import type { MetricCardProps } from '@btc-chat/shared';

interface NativeMetricGridProps {
  title?: string;
  metrics: Array<
    | MetricCardProps
    | {
        type: 'element';
        typeName: string;
        props: MetricCardProps;
      }
  >;
}

export function NativeMetricGrid({ title, metrics }: NativeMetricGridProps) {
  if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {title ? (
        <View style={styles.titleRow}>
          <View style={styles.dot} />
          <Text style={styles.title}>{title}</Text>
        </View>
      ) : null}
      <View style={styles.grid}>
        {metrics.map((item, idx) => {
          const props: MetricCardProps =
            typeof item === 'object' && item !== null && 'props' in item
              ? (item as { props: MetricCardProps }).props
              : (item as MetricCardProps);

          return <NativeMetricCard key={idx} {...props} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    padding: 10,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 6,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
