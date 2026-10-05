"use client";

import React, { useState } from "react";
import { Bell, Check, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { AlertWidgetProps } from "@btc-chat/shared";

export function WebAlertWidget({
  symbol,
  targetPrice,
  direction,
  note,
}: AlertWidgetProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "saved">("idle");

  const handleSetAlert = async () => {
    setStatus("loading");
    // Simulate setting the alert or dispatching to API
    setTimeout(() => {
      setStatus("saved");
    }, 800);
  };

  const isUp = direction === "up";

  return (
    <div className="my-3 p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 shadow-lg flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
            isUp
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}
        >
          <Bell className="size-4" />
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-zinc-200">
              {symbol}
            </span>
            <span
              className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded ${
                isUp
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/20 text-rose-400"
              }`}
            >
              {isUp ? (
                <ArrowUp className="size-2.5 mr-0.5" />
              ) : (
                <ArrowDown className="size-2.5 mr-0.5" />
              )}
              {direction.toUpperCase()}
            </span>
            <span className="text-xs font-mono font-black text-zinc-100">
              ${targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          {note && (
            <span className="text-[11px] text-zinc-400 truncate mt-0.5">
              {note}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleSetAlert}
        disabled={status !== "idle"}
        type="button"
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm ${
          status === "saved"
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
            : status === "loading"
            ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
            : "bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-black hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        {status === "loading" && <Loader2 className="size-3 animate-spin" />}
        {status === "saved" && <Check className="size-3 text-emerald-400" />}
        {status === "saved"
          ? "Alert Active"
          : status === "loading"
          ? "Activating..."
          : "Set Alert"}
      </button>
    </div>
  );
}
