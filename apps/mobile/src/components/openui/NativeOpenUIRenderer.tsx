import React from 'react';
import { View } from 'react-native';
import type {
  OpenUIElementNode,
  TradeCardProps,
  MetricCardProps,
  AlertWidgetProps,
  RiskSimulatorProps,
} from '@btc-chat/shared';
import { NativeTradeCard } from './NativeTradeCard';
import { NativeMetricCard } from './NativeMetricCard';
import { NativeMetricGrid } from './NativeMetricGrid';
import { NativeAlertWidget } from './NativeAlertWidget';
import { NativeRiskSimulator } from './NativeRiskSimulator';

interface NativeOpenUIRendererProps {
  node: OpenUIElementNode | null;
}

export function NativeOpenUIRenderer({ node }: NativeOpenUIRendererProps) {
  if (!node || node.type !== 'element') {
    return null;
  }

  const { typeName, props } = node;

  switch (typeName) {
    case 'TradeCard':
      return <NativeTradeCard {...(props as unknown as TradeCardProps)} />;

    case 'MetricCard':
      return <NativeMetricCard {...(props as unknown as MetricCardProps)} />;

    case 'MetricGrid':
      return (
        <NativeMetricGrid
          title={props.title as string | undefined}
          metrics={(props.metrics || []) as any}
        />
      );

    case 'AlertWidget':
      return <NativeAlertWidget {...(props as unknown as AlertWidgetProps)} />;

    case 'RiskSimulator':
      return <NativeRiskSimulator {...(props as unknown as RiskSimulatorProps)} />;

    default:
      return null;
  }
}
