"use client";

import React from "react";
import { Scale, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { RiskSimulatorProps } from "@btc-chat/shared";

export function WebRiskSimulator({
  direction,
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

  return (
    <div className="my-3 p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/70 mb-3">
        <div className="flex items-center gap-2">
          <Scale className="size-4 text-emerald-400" />
          <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Risk / Reward Simulator
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1 text-xs font-mono font-black px-2 py-0.5 rounded-lg border ${
            isGoodRatio
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : isFairRatio
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
          }`}
        >
          {isGoodRatio ? (
            <CheckCircle2 className="size-3" />
          ) : isFairRatio ? (
            <AlertTriangle className="size-3" />
          ) : (
            <XCircle className="size-3" />
          )}
          1 : {riskRewardRatio.toFixed(2)} R:R
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center mb-3">
        <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
          <span className="text-[10px] text-zinc-400 block uppercase font-medium">Entry</span>
          <span className="text-xs font-mono font-bold text-zinc-200">
            ${entryPrice.toLocaleString()}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-900/40">
          <span className="text-[10px] text-rose-400/90 block uppercase font-medium">Stop Loss</span>
          <span className="text-xs font-mono font-bold text-rose-300">
            ${stopLoss.toLocaleString()}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
          <span className="text-[10px] text-emerald-400/90 block uppercase font-medium">Target</span>
          <span className="text-xs font-mono font-bold text-emerald-300">
            ${targetPrice.toLocaleString()}
          </span>
        </div>

        {liquidationPrice && (
          <div className="p-2 rounded-xl bg-amber-950/20 border border-amber-900/40">
            <span className="text-[10px] text-amber-400/90 block uppercase font-medium">Est. Liq (10x)</span>
            <span className="text-xs font-mono font-bold text-amber-300">
              ${liquidationPrice.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {(potentialLossUsd || potentialGainUsd) && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/40 text-xs border border-zinc-800/40 font-mono">
          {potentialLossUsd && (
            <span className="text-rose-400 font-semibold">
              Max Risk: -${potentialLossUsd.toLocaleString()} / BTC
            </span>
          )}
          {potentialGainUsd && (
            <span className="text-emerald-400 font-semibold">
              Max Reward: +${potentialGainUsd.toLocaleString()} / BTC
            </span>
          )}
        </div>
      )}
    </div>
  );
}
