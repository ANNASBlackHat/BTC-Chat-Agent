"use client";

import React from "react";
import { WebMetricCard } from "./WebMetricCard";
import { MetricCardProps } from "@btc-chat/shared";

interface WebMetricGridProps {
  title?: string;
  metrics: Array<
    | MetricCardProps
    | {
        type: "element";
        typeName: string;
        props: MetricCardProps;
      }
  >;
}

export function WebMetricGrid({ title, metrics }: WebMetricGridProps) {
  if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
    return null;
  }

  return (
    <div className="my-3 p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 shadow-lg">
      {title && (
        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {title}
        </h4>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {metrics.map((item, idx) => {
          // Handle both raw props and nested element node structures from OpenUI Lang AST
          const props: MetricCardProps =
            typeof item === "object" && item !== null && "props" in item
              ? (item as { props: MetricCardProps }).props
              : (item as MetricCardProps);

          return <WebMetricCard key={idx} {...props} />;
        })}
      </div>
    </div>
  );
}
