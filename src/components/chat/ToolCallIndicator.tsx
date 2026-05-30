"use client";

import * as React from "react";
import { 
  Loader2, 
  Check, 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Database, 
  Compass, 
  BookOpen 
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToolCallIndicatorProps {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: "call" | "result";
  result?: unknown;
}

const TOOL_METADATA: Record<
  string, 
  { description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  getCurrentPrice: {
    description: "Fetching real-time BTC/USDT spot price...",
    icon: TrendingUp,
  },
  getCurrentPosition: {
    description: "Retrieving active trade position...",
    icon: Compass,
  },
  updateUserPosition: {
    description: "Updating active trade position...",
    icon: Compass,
  },
  clearActivePosition: {
    description: "Clearing active trade position...",
    icon: Compass,
  },
  getLatestAgentMemory: {
    description: "Analyzing daily market consensus and memory...",
    icon: Database,
  },
  getRecentDailyAnalyses: {
    description: "Scanning recent daily analyst reports...",
    icon: BookOpen,
  },
  getDailyAnalysisByVideoId: {
    description: "Loading target analyst video records...",
    icon: BookOpen,
  },
  getRecentPredictions: {
    description: "Compiling recent accuracy records...",
    icon: Database,
  },
  getPredictionByVideoId: {
    description: "Locating prediction outcome history...",
    icon: Database,
  },
  getTechniqueLedgerEntries: {
    description: "Checking technique win rate ledger...",
    icon: Database,
  },
};

export function ToolCallIndicator({
  toolName,
  state,
  args,
  result,
}: ToolCallIndicatorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const metadata = TOOL_METADATA[toolName] || {
    description: `Executing background tool: ${toolName}...`,
    icon: Terminal,
  };
  const Icon = metadata.icon;
  const isCompleted = state === "result";

  return (
    <div className="w-full my-2 animate-fade-in">
      <div 
        className={cn(
          "flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-sm select-none border transition-all duration-200",
          isCompleted 
            ? "bg-zinc-950/20 border-zinc-900/60 text-zinc-400 hover:border-zinc-800/80" 
            : "bg-zinc-950/50 border-zinc-800/60 text-zinc-300 shadow-md shadow-black/30 backdrop-blur-sm"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className={cn(
              "flex items-center justify-center size-6 rounded-md border shrink-0 transition-colors",
              isCompleted 
                ? "bg-emerald-950/10 border-emerald-900/50 text-emerald-400" 
                : "bg-zinc-900/60 border-zinc-800 text-zinc-400"
            )}
          >
            {isCompleted ? (
              <Check className="size-3.5 stroke-[3px]" />
            ) : (
              <Loader2 className="size-3.5 animate-spin text-zinc-400" />
            )}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <Icon className={cn("size-4 shrink-0 opacity-70", !isCompleted && "text-zinc-300")} />
            <span className="font-medium truncate leading-none">{metadata.description}</span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-center size-7 rounded-md hover:bg-zinc-900/80 hover:text-zinc-200 transition-all active:scale-95 text-zinc-500",
            isOpen && "text-zinc-200 bg-zinc-900/60"
          )}
          title="Toggle execution logs"
          type="button"
        >
          {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-1.5 mx-1 p-3 rounded-lg bg-black border border-zinc-900 text-xs font-mono text-zinc-400 shadow-inner max-w-full overflow-hidden animate-slide-down">
          <div className="flex flex-col gap-2">
            <div>
              <span className="text-zinc-600 font-bold block mb-1 uppercase tracking-wider text-[10px]">{"// Parameters"}</span>
              <pre className="whitespace-pre-wrap break-all bg-zinc-950/80 p-2 rounded border border-zinc-900 text-zinc-300 max-h-48 overflow-y-auto">
                {JSON.stringify(args, null, 2)}
              </pre>
            </div>
            {isCompleted && result !== undefined && (
              <div className="pt-2 border-t border-zinc-900/80">
                <span className="text-zinc-600 font-bold block mb-1 uppercase tracking-wider text-[10px]">{"// Response"}</span>
                <pre className="whitespace-pre-wrap break-all bg-zinc-950/80 p-2 rounded border border-zinc-900 text-zinc-300 max-h-60 overflow-y-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
