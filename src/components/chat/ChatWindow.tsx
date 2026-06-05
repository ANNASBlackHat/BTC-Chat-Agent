"use client";

import * as React from "react";
import { X, ShieldAlert, Cpu } from "lucide-react";
import { MessageList } from "./MessageList";
import { InputBar } from "./InputBar";
import { UIMessage, UserPosition, ConversationStarter } from "@/types";
import { cn } from "@/lib/utils";
import { ConversationStarters } from "./ConversationStarters";

export interface ChatWindowProps {
  messages: UIMessage[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setInput: (value: string) => void;
  isLoading?: boolean;
  activePosition: UserPosition | null;
  onClearPosition?: () => void;
  onUpdatePosition?: (direction: "long" | "short", entryPrice: number) => void;
  starters: ConversationStarter[];
  onSelect?: (prompt: string) => void;
}

export function ChatWindow({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  setInput,
  isLoading,
  activePosition,
  onClearPosition,
  onUpdatePosition,
  starters,
  onSelect,
}: ChatWindowProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editDirection, setEditDirection] = React.useState<"long" | "short">("long");
  const [editPrice, setEditPrice] = React.useState("");

  const handleInjectCommand = (prefix: string) => {
    setInput(prefix);
  };

  const formattedEntryPrice = React.useMemo(() => {
    if (!activePosition) return "";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(activePosition.entry_price);
    } catch {
      return `$${activePosition.entry_price}`;
    }
  }, [activePosition]);

  return (
    <div className="dark flex flex-col h-full w-full bg-black text-zinc-50 relative overflow-hidden font-sans">
      {/* Premium Glassmorphic Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between w-full px-6 py-4 bg-zinc-950/80 border-b border-zinc-900 backdrop-blur-md select-none shrink-0 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-zinc-900 border border-zinc-800 shadow-md">
            <Cpu className="size-4.5 text-emerald-400 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-wider text-zinc-100 uppercase leading-none">
              BTC Chat Agent
            </h1>
            <span className="text-[9.5px] text-zinc-500 font-semibold uppercase tracking-widest mt-1 leading-none">
              Active Thinking Partner
            </span>
          </div>
        </div>

        {/* Real-time Position Status Badge & Form */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const price = parseFloat(editPrice);
                if (!isNaN(price) && price > 0 && onUpdatePosition) {
                  onUpdatePosition(editDirection, price);
                  setIsEditing(false);
                }
              }}
              className="flex items-center gap-2 p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-lg shadow-black/40 animate-fade-in"
            >
              {/* Direction Toggle */}
              <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-850">
                <button
                  type="button"
                  onClick={() => setEditDirection("long")}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer",
                    editDirection === "long"
                      ? "bg-emerald-500 text-black shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  Long
                </button>
                <button
                  type="button"
                  onClick={() => setEditDirection("short")}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer",
                    editDirection === "short"
                      ? "bg-rose-500 text-black shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  Short
                </button>
              </div>

              {/* Price Input */}
              <input
                type="number"
                step="any"
                required
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Entry price"
                className="w-20 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-zinc-700 text-right"
              />

              {/* Action Buttons */}
              <div className="flex gap-1">
                <button
                  type="submit"
                  disabled={!editPrice || isNaN(parseFloat(editPrice)) || parseFloat(editPrice) <= 0}
                  className="flex items-center justify-center size-6 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black transition-all cursor-pointer font-bold text-[10.5px]"
                  title="Save trade position"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center justify-center size-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer font-bold text-[10.5px]"
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            </form>
          ) : activePosition ? (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold shadow-inner transition-all hover:bg-zinc-900/20 cursor-pointer",
                activePosition.direction === "long"
                  ? "bg-emerald-950/15 border-emerald-900/60 text-emerald-400 shadow-emerald-950/10 hover:border-emerald-800/80"
                  : "bg-rose-950/15 border-rose-900/60 text-rose-400 shadow-rose-950/10 hover:border-rose-800/80"
              )}
              onClick={() => {
                setEditDirection(activePosition.direction);
                setEditPrice(String(activePosition.entry_price));
                setIsEditing(true);
              }}
              title="Click to edit active trade position"
            >
              <span className="flex size-1.5 rounded-full bg-current animate-pulse" />
              <span className="uppercase tracking-wider">
                {activePosition.direction}: {formattedEntryPrice}
              </span>
              {onClearPosition && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent opening the editor
                    onClearPosition();
                  }}
                  className="flex items-center justify-center size-4 rounded-full ml-1 bg-black/30 hover:bg-black/60 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Clear active trade thesis position"
                  type="button"
                >
                  <X className="size-2.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setEditDirection("long");
                setEditPrice("");
                setIsEditing(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/40 border border-zinc-900 text-[10.5px] font-semibold text-zinc-500 hover:text-zinc-300 hover:border-zinc-800/80 hover:bg-zinc-900/60 transition-all cursor-pointer select-none active:scale-95 shadow-inner animate-fade-in"
              type="button"
              title="Click to set an active position"
            >
              <ShieldAlert className="size-3 text-zinc-700 font-bold" />
              <span className="uppercase tracking-wider">No Active Position</span>
            </button>
          )}
        </div>
      </header>

      {/* Main chat log stream viewport */}
      <div className="flex-1 w-full overflow-hidden bg-gradient-to-b from-black via-zinc-950/20 to-black flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto flex items-center justify-center">
            <ConversationStarters starters={starters} onSelect={onSelect || (() => {})} />
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
      </div>

      {/* Bottom Pinned Input Area */}
      <footer className="sticky bottom-0 z-40 w-full bg-gradient-to-t from-black via-black/95 to-transparent pt-8 shrink-0">
        <InputBar
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          onInjectCommand={handleInjectCommand}
        />
      </footer>
    </div>
  );
}
