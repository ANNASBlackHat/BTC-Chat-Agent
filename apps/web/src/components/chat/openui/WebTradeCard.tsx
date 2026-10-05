"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, ShieldAlert, Target, Compass } from "lucide-react";
import { TradeCardProps } from "@btc-chat/shared";

export function WebTradeCard({
  direction,
  entryPrice,
  targetPrice,
  stopLoss,
  currentPrice,
  leverage,
  thesis,
}: TradeCardProps) {
  const isLong = direction === "long";

  // Calculate live P&L if spot price is present
  const pnlPercent = currentPrice
    ? isLong
      ? ((currentPrice - entryPrice) / entryPrice) * 100 * (leverage || 1)
      : ((entryPrice - currentPrice) / entryPrice) * 100 * (leverage || 1)
    : null;

  // Target profit %
  const targetPercent = targetPrice
    ? isLong
      ? ((targetPrice - entryPrice) / entryPrice) * 100
      : ((entryPrice - targetPrice) / entryPrice) * 100
    : null;

  // Stop loss risk %
  const stopLossPercent = stopLoss
    ? isLong
      ? ((entryPrice - stopLoss) / entryPrice) * 100
      : ((stopLoss - entryPrice) / entryPrice) * 100
    : null;

  return (
    <div className="my-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header bar */}
      <div className="px-4 py-3 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
              isLong
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
            }`}
          >
            {isLong ? (
              <ArrowUpRight className="size-3.5 stroke-[3]" />
            ) : (
              <ArrowDownRight className="size-3.5 stroke-[3]" />
            )}
            {direction.toUpperCase()}
          </span>

          {leverage && (
            <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[11px] font-mono font-bold border border-zinc-700">
              {leverage}x
            </span>
          )}
        </div>

        {pnlPercent !== null && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-400 font-medium">Est. P&L:</span>
            <span
              className={`text-xs font-mono font-black ${
                pnlPercent >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {pnlPercent >= 0 ? "+" : ""}
              {pnlPercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Entry Price */}
        <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium mb-1">
            <Compass className="size-3 text-zinc-400" />
            <span>Entry</span>
          </div>
          <span className="text-sm font-bold font-mono text-zinc-100">
            ${entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Target Price */}
        {targetPrice && (
          <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
            <div className="flex items-center justify-between text-[11px] text-emerald-400/90 font-medium mb-1">
              <div className="flex items-center gap-1">
                <Target className="size-3 text-emerald-400" />
                <span>Take Profit</span>
              </div>
              {targetPercent !== null && (
                <span className="font-mono text-[10px] font-bold text-emerald-400">
                  +{targetPercent.toFixed(2)}%
                </span>
              )}
            </div>
            <span className="text-sm font-bold font-mono text-emerald-300">
              ${targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Stop Loss */}
        {stopLoss && (
          <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/40">
            <div className="flex items-center justify-between text-[11px] text-rose-400/90 font-medium mb-1">
              <div className="flex items-center gap-1">
                <ShieldAlert className="size-3 text-rose-400" />
                <span>Stop Loss</span>
              </div>
              {stopLossPercent !== null && (
                <span className="font-mono text-[10px] font-bold text-rose-400">
                  -{stopLossPercent.toFixed(2)}%
                </span>
              )}
            </div>
            <span className="text-sm font-bold font-mono text-rose-300">
              ${stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* Thesis note if provided */}
      {thesis && (
        <div className="px-4 pb-3.5 text-xs text-zinc-400 italic flex items-center gap-1.5 border-t border-zinc-800/40 pt-2.5">
          <span className="text-zinc-500 font-bold uppercase not-italic text-[10px]">Rationale:</span>
          <span>{thesis}</span>
        </div>
      )}
    </div>
  );
}
