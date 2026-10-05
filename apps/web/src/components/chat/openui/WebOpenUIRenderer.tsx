"use client";

import React from "react";
import { OpenUIElementNode } from "@btc-chat/shared";
import { WebTradeCard } from "./WebTradeCard";
import { WebMetricCard } from "./WebMetricCard";
import { WebMetricGrid } from "./WebMetricGrid";
import { WebAlertWidget } from "./WebAlertWidget";
import { WebRiskSimulator } from "./WebRiskSimulator";
import type {
  TradeCardProps,
  MetricCardProps,
  AlertWidgetProps,
  RiskSimulatorProps,
} from "@btc-chat/shared";

interface WebOpenUIRendererProps {
  node: OpenUIElementNode | null;
}

export function WebOpenUIRenderer({ node }: WebOpenUIRendererProps) {
  if (!node || node.type !== "element") {
    return null;
  }

  const { typeName, props } = node;

  switch (typeName) {
    case "TradeCard":
      return <WebTradeCard {...(props as unknown as TradeCardProps)} />;

    case "MetricCard":
      return <WebMetricCard {...(props as unknown as MetricCardProps)} />;

    case "MetricGrid":
      return (
        <WebMetricGrid
          title={props.title as string | undefined}
          metrics={(props.metrics || []) as any}
        />
      );

    case "AlertWidget":
      return <WebAlertWidget {...(props as unknown as AlertWidgetProps)} />;

    case "RiskSimulator":
      return <WebRiskSimulator {...(props as unknown as RiskSimulatorProps)} />;

    default:
      console.warn(`[WebOpenUI] Unknown component type "${typeName}"`);
      return null;
  }
}
