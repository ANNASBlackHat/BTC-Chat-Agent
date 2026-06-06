"use client";

import * as React from "react";
import { ArrowUp, CornerDownLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputBarProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
  onInjectCommand?: (command: string) => void;
}

interface ModePill {
  label: string;
  prefix: string;
  description: string;
  icon: string;
}

const MODE_PILLS: ModePill[] = [
  {
    label: "Analyst",
    prefix: "/analyst ",
    description: "Descriptive objective market analysis",
    icon: "🔍",
  },
  {
    label: "Devil's Advocate",
    prefix: "/devil ",
    description: "Stress-test trading thesis and positions",
    icon: "⚔️",
  },
  {
    label: "Tutor",
    prefix: "/tutor ",
    description: "Explain technical indicators & pipeline ledger",
    icon: "📚",
  },
];

export function InputBar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  onInjectCommand,
}: InputBarProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Handle enter key form submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() !== "" && !isLoading) {
        e.currentTarget.form?.requestSubmit();
      }
    }
  };

  const handlePillClick = (prefix: string) => {
    if (onInjectCommand) {
      onInjectCommand(prefix);
    }
    // Auto-focus input text area
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  // Automatically adjust textarea height based on typing scroll-height
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  }, [input]);

  const canSubmit = input.trim() !== "" && !isLoading;

  return (
    <div className="w-full flex flex-col gap-3 max-w-4xl mx-auto px-4 py-4 md:px-6">
      {/* Dynamic Mode Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mr-1.5 whitespace-nowrap shrink-0">
          Chat Modes:
        </span>
        {MODE_PILLS.map((pill) => (
          <button
            key={pill.prefix}
            onClick={() => handlePillClick(pill.prefix)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-card/45 border border-border text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border/80 transition-all cursor-pointer active:scale-95 whitespace-nowrap group"
            title={pill.description}
            type="button"
          >
            <span>{pill.icon}</span>
            <span className="font-semibold">{pill.label}</span>
            <span className="text-[10px] text-muted-foreground/50 group-hover:text-muted-foreground font-mono">
              {pill.prefix.trim()}
            </span>
          </button>
        ))}
      </div>

      {/* Input container */}
      <form onSubmit={handleSubmit} className="w-full relative">
        <div 
          className="flex flex-col w-full rounded-2xl bg-card/50 border border-border backdrop-blur-md transition-all duration-200 focus-within:border-border/80 focus-within:ring-2 focus-within:ring-emerald-500/10 focus-within:shadow-md focus-within:shadow-foreground/5 dark:focus-within:shadow-black/40 overflow-hidden"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message or slash command..."
            rows={1}
            disabled={isLoading}
            className="w-full min-h-[44px] max-h-44 bg-transparent outline-none border-none py-3.5 pl-4 pr-16 text-sm text-foreground placeholder:text-muted-foreground/60 font-sans resize-none leading-relaxed overflow-y-auto"
          />

          <div className="flex items-center justify-between px-3 py-2 border-t border-border/60 bg-muted/20 text-muted-foreground text-[10px] font-medium font-sans">
            <div className="flex items-center gap-1 select-none">
              <CornerDownLeft className="size-3 text-muted-foreground/60" />
              <span>Enter to send</span>
              <span className="text-muted-foreground/40 mx-1">•</span>
              <span>Shift+Enter for line break</span>
            </div>

            {/* Glowing active indicator if slash command is input */}
            {input.startsWith("/") && (
              <span className="font-mono text-emerald-600 dark:text-emerald-500/70 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20 dark:border-emerald-950/30 animate-pulse uppercase tracking-wider text-[8.5px]">
                Command Mode Active
              </span>
            )}
          </div>

          {/* Absolute Pinned Send button */}
          <div className="absolute right-3 top-2 flex items-center">
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "flex items-center justify-center size-8 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 border",
                canSubmit
                  ? "bg-emerald-500 hover:bg-emerald-400 border-emerald-500 hover:border-emerald-400 text-black shadow-lg shadow-emerald-500/25"
                  : "bg-muted/40 border-border text-muted-foreground/60 pointer-events-none"
              )}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : (
                <ArrowUp className="size-4 stroke-[2.5px]" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
