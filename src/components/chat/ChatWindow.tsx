"use client";

import * as React from "react";
import { X, ShieldAlert, Cpu, Download } from "lucide-react";
import { MessageList } from "./MessageList";
import { InputBar } from "./InputBar";
import { UIMessage, UserPosition, ConversationStarter } from "@/types";
import { cn } from "@/lib/utils";
import { ConversationStarters } from "./ConversationStarters";
import { ThemeToggle } from "./ThemeToggle";

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

  const handleExport = React.useCallback(() => {
    if (messages.length === 0) return;

    let markdown = `# BTC Chat Agent Session\n`;
    markdown += `Generated on: ${new Date().toLocaleString()}\n\n`;

    if (activePosition) {
      markdown += `### 📈 Active Trade Thesis Position\n`;
      markdown += `- **Direction**: ${activePosition.direction.toUpperCase()}\n`;
      try {
        const formattedPrice = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(activePosition.entry_price);
        markdown += `- **Entry Price**: ${formattedPrice}\n\n`;
      } catch {
        markdown += `- **Entry Price**: $${activePosition.entry_price}\n\n`;
      }
    } else {
      markdown += `### 📈 Active Trade Thesis Position\n`;
      markdown += `- **Direction**: None\n\n`;
    }

    markdown += `---\n\n## 💬 Conversation History\n\n`;

    messages.forEach((msg, idx) => {
      const roleText = msg.role === "user" ? "👤 User" : "🤖 BTC Chat Agent";
      const timestampText = msg.createdAt
        ? new Date(msg.createdAt).toLocaleString()
        : new Date().toLocaleString();

      markdown += `### ${roleText} _(${timestampText})_\n\n`;
      markdown += `${msg.content}\n\n`;

      if (msg.toolInvocations && msg.toolInvocations.length > 0) {
        markdown += `*System Tool Calls executed in this step:*\n`;
        msg.toolInvocations.forEach((tool) => {
          markdown += `- **${tool.toolName}** (${tool.state === "result" ? "resolved" : "calling"})\n`;
        });
        markdown += `\n`;
      }

      if (idx < messages.length - 1) {
        markdown += `---\n\n`;
      }
    });

    try {
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `btc-chat-export-${dateStr}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export chat session:", err);
    }
  }, [messages, activePosition]);

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
    <div className="flex flex-col h-full w-full bg-background text-foreground relative overflow-hidden font-sans">
      {/* Premium Glassmorphic Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between w-full px-6 py-4 bg-card/80 border-b border-border backdrop-blur-md select-none shrink-0 shadow-lg shadow-foreground/5 dark:shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-muted border border-border/80 shadow-md">
            <Cpu className="size-4.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-wider text-foreground uppercase leading-none">
              BTC Chat Agent
            </h1>
            <span className="text-[9.5px] text-muted-foreground font-semibold uppercase tracking-widest mt-1 leading-none">
              Active Thinking Partner
            </span>
          </div>
        </div>

        {/* Real-time Position Status Badge & Theme toggle */}
        <div className="flex items-center gap-3">
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
              className="flex items-center gap-2 p-1.5 bg-card border border-border rounded-xl shadow-lg shadow-foreground/5 dark:shadow-black/40 animate-fade-in"
            >
              {/* Direction Toggle */}
              <div className="flex rounded-lg bg-muted p-0.5 border border-border/60">
                <button
                  type="button"
                  onClick={() => setEditDirection("long")}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer",
                    editDirection === "long"
                      ? "bg-emerald-500 text-black shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
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
                      : "text-muted-foreground hover:text-foreground"
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
                className="w-20 px-2 py-1 bg-muted border border-border rounded-lg text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-border/80 text-right"
              />

              {/* Action Buttons */}
              <div className="flex gap-1">
                <button
                  type="submit"
                  disabled={!editPrice || isNaN(parseFloat(editPrice)) || parseFloat(editPrice) <= 0}
                  className="flex items-center justify-center size-6 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-muted disabled:text-muted-foreground text-black transition-all cursor-pointer font-bold text-[10.5px]"
                  title="Save trade position"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center justify-center size-6 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer font-bold text-[10.5px]"
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            </form>
          ) : activePosition ? (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold shadow-inner transition-all hover:bg-muted/30 cursor-pointer",
                activePosition.direction === "long"
                  ? "bg-emerald-500/10 dark:bg-emerald-950/15 border-emerald-500/30 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 dark:bg-rose-950/15 border-rose-500/30 dark:border-rose-900/60 text-rose-600 dark:text-rose-400"
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
                  className="flex items-center justify-center size-4 rounded-full ml-1 bg-muted/65 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/45 border border-border text-[10.5px] font-semibold text-muted-foreground hover:text-foreground hover:border-border/85 hover:bg-muted/60 transition-all cursor-pointer select-none active:scale-95 shadow-inner animate-fade-in"
              type="button"
              title="Click to set an active position"
            >
              <ShieldAlert className="size-3 text-muted-foreground/60 font-bold" />
              <span className="uppercase tracking-wider">No Active Position</span>
            </button>
          )}

          <button
            onClick={handleExport}
            disabled={messages.length === 0}
            className="flex items-center justify-center size-9 rounded-xl border border-border bg-card/40 hover:bg-muted text-foreground disabled:opacity-40 disabled:hover:bg-card/40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer active:scale-95 shadow-md hover:shadow-lg focus:outline-none"
            title={messages.length === 0 ? "No chat history to export" : "Export conversation as Markdown"}
            type="button"
          >
            <Download className="size-4.5" />
          </button>

          <div className="border-l border-border h-5 mx-0.5" />

          <ThemeToggle />
        </div>
      </header>

      {/* Main chat log stream viewport */}
      <div className="flex-1 w-full overflow-hidden bg-gradient-to-b from-background via-card/20 to-background flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto flex items-center justify-center">
            <ConversationStarters starters={starters} onSelect={onSelect || (() => {})} />
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
      </div>

      {/* Bottom Pinned Input Area */}
      <footer className="sticky bottom-0 z-40 w-full bg-gradient-to-t from-background via-background/95 to-transparent pt-8 shrink-0">
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
