"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MetricCardProps } from "@btc-chat/shared";

export function WebMetricCard({ label, value, trend, change }: MetricCardProps) {
  return (
    <div className="flex flex-col p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 shadow-md hover:border-zinc-700/70 transition-all min-w-[140px] flex-1">
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider truncate">
          {label}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              trend === "up"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : trend === "down"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="size-3 mr-0.5" />
            ) : trend === "down" ? (
              <TrendingDown className="size-3 mr-0.5" />
            ) : (
              <Minus className="size-3 mr-0.5" />
            )}
            {change || trend.toUpperCase()}
          </span>
        )}
      </div>
      <span className="text-base font-extrabold text-zinc-100 tracking-tight font-mono">
        {value}
      </span>
    </div>
  );
}
