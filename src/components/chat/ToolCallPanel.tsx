"use client";

import * as React from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ToolInvocation } from "@/types";

export interface ToolCallPanelProps {
  toolInvocations: ToolInvocation[];
}

/**
 * Summarizes the result of a tool execution.
 */
export function summarizeToolResult(toolName: string, result: unknown): string {
  if (result === undefined || result === null) {
    if (toolName === "getPosition" || toolName === "getCurrentPosition") {
      return "no position set";
    }
    return "";
  }

  // Helper to extract arrays from common result wrapper object keys
  const getArrayFromKey = (obj: unknown, keys: string[]): unknown[] | null => {
    if (!obj || typeof obj !== "object") return null;
    const record = obj as Record<string, unknown>;
    for (const key of keys) {
      if (key in record && Array.isArray(record[key])) {
        return record[key] as unknown[];
      }
    }
    return null;
  };

  switch (toolName) {
    case "getMarketMemory":
    case "getLatestAgentMemory":
      return "memory loaded";

    case "getCurrentPrice": {
      let price: number | null = null;
      if (typeof result === "number") {
        price = result;
      } else if (typeof result === "object") {
        const record = result as Record<string, unknown>;
        if ("price" in record && record.price !== null && record.price !== undefined) {
          price = Number(record.price);
        }
      }
      if (price !== null && !isNaN(price)) {
        return `$${Math.round(price).toLocaleString()}`;
      }
      return "no price found";
    }

    case "getTodaysAnalyses": {
      let count = 0;
      if (Array.isArray(result)) {
        count = result.length;
      } else {
        const arr = getArrayFromKey(result, ["analyses", "entries"]);
        if (arr) count = arr.length;
      }
      return count > 0 ? `${count} analyses found` : "no analyses today";
    }

    case "getRecentAnalyses":
    case "getRecentDailyAnalyses": {
      let analyses: unknown[] = [];
      if (Array.isArray(result)) {
        analyses = result;
      } else {
        const arr = getArrayFromKey(result, ["analyses", "entries"]);
        if (arr) analyses = arr;
      }
      const count = analyses.length;

      let days = 0;
      if (count > 0) {
        const dates = new Set(
          analyses
            .map((a) => {
              if (a && typeof a === "object") {
                const record = a as Record<string, unknown>;
                return (
                  (record.analysis_date as string) ||
                  (record.date as string) ||
                  (record.createdAt && new Date(record.createdAt as string).toDateString()) ||
                  ""
                );
              }
              return "";
            })
            .filter(Boolean)
        );
        days = dates.size || 1;
      }
      return `${count} analyses across ${days} days`;
    }

    case "getTechniqueLedger":
    case "getTechniqueLedgerEntries": {
      let count = 0;
      if (Array.isArray(result)) {
        count = result.length;
      } else {
        const arr = getArrayFromKey(result, ["entries", "techniques"]);
        if (arr) count = arr.length;
      }
      return `${count} techniques in ledger`;
    }

    case "getScoredPredictions":
    case "getRecentPredictions": {
      let count = 0;
      if (Array.isArray(result)) {
        count = result.length;
      } else {
        const arr = getArrayFromKey(result, ["predictions", "entries"]);
        if (arr) count = arr.length;
      }
      return `${count} predictions scored`;
    }

    case "getPriceHistory": {
      let count = 0;
      if (Array.isArray(result)) {
        count = result.length;
      } else {
        const arr = getArrayFromKey(result, ["candles", "history", "prices"]);
        if (arr) count = arr.length;
      }
      return `${count} candles fetched`;
    }

    case "savePosition":
    case "updateUserPosition":
      return "position saved";

    case "getPosition":
    case "getCurrentPosition": {
      let direction: string | null = null;
      let entryPrice: number | null = null;
      if (typeof result === "object") {
        const record = result as Record<string, unknown>;
        const posObj = "position" in record ? record.position : record;
        if (posObj && typeof posObj === "object") {
          const posRecord = posObj as Record<string, unknown>;
          direction = (posRecord.direction as string) || null;
          entryPrice =
            (posRecord.entry_price as number) ||
            (posRecord.entryPrice as number) ||
            (posRecord.price as number) ||
            null;
        }
      }
      if (direction && entryPrice !== null && !isNaN(Number(entryPrice))) {
        return `${direction.toUpperCase()} $${Math.round(Number(entryPrice)).toLocaleString()}`;
      }
      return "no position set";
    }

    default: {
      if (Array.isArray(result)) {
        return `${result.length} items`;
      }
      if (typeof result === "object" && result !== null) {
        return "loaded";
      }
      return String(result);
    }
  }
}

/**
 * Returns the status icon corresponding to the tool invocation state.
 */
function getStatusIcon(state: "call" | "result" | string): string {
  if (state === "partial-call") return "⏳";
  if (state === "call") return "🔧";
  if (state === "result") return "✅";
  return "🔧";
}

export function ToolCallPanel({ toolInvocations }: ToolCallPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!toolInvocations || toolInvocations.length === 0) {
    return null;
  }

  const count = toolInvocations.length;

  return (
    <div className="w-full mt-3 font-sans text-xs border border-zinc-900/60 rounded-xl bg-zinc-950/35 overflow-hidden shadow-inner shadow-black/10 select-none">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-zinc-900/20 active:bg-zinc-900/30 transition-colors cursor-pointer text-zinc-400 font-semibold focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-800">
          <div className="flex items-center gap-1.5">
            <span>🔧</span>
            <span>{count} {count === 1 ? "tool" : "tools"} used</span>
          </div>
          <span className="text-[10px] text-zinc-500">{isOpen ? "▴" : "▾"}</span>
        </CollapsibleTrigger>

        <CollapsibleContent className="border-t border-zinc-900/40 bg-zinc-950/20">
          <div className="divide-y divide-zinc-900/45 py-0.5">
            {toolInvocations.map((tool, index) => {
              const statusIcon = getStatusIcon(tool.state);
              const summary = tool.state === "result" 
                ? summarizeToolResult(tool.toolName, tool.result) 
                : "";

              return (
                <div 
                  key={tool.toolCallId || index} 
                  className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-900/10 transition-colors"
                >
                  <span className="shrink-0 text-[13px]">{statusIcon}</span>
                  <span className="font-mono text-zinc-300 font-medium">{tool.toolName}</span>
                  {summary && (
                    <span className="text-zinc-500 font-normal ml-auto truncate max-w-[60%]">
                      {summary}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
