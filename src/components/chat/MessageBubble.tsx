"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { ChatMessage, ToolInvocation } from "@/types";
import { ToolCallPanel } from "./ToolCallPanel";
import { Copy, Check } from "lucide-react";

export interface MessageBubbleProps {
  message: ChatMessage & { toolInvocations?: ToolInvocation[] };
  onSelectSuggestion?: (prompt: string) => void;
  isLast?: boolean;
}

const AssistantAvatar = () => (
  <div className="flex items-center justify-center size-8 rounded-lg bg-card border border-border shadow-md shadow-foreground/5 dark:shadow-black/40 relative overflow-hidden group select-none shrink-0">
    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-muted opacity-60 group-hover:opacity-100 transition-opacity" />
    <span className="font-sans font-extrabold text-sm text-emerald-500 dark:text-emerald-400 z-10">₿</span>
  </div>
);

const UserAvatar = () => (
  <div className="flex items-center justify-center size-8 rounded-lg bg-muted border border-border shadow-md shadow-foreground/5 dark:shadow-black/20 select-none shrink-0">
    <span className="font-sans font-bold text-xs text-muted-foreground">U</span>
  </div>
);

export function MessageBubble({ message, onSelectSuggestion, isLast }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = React.useState(false);

  const suggestions = React.useMemo(() => {
    console.log(`role: ${message.role} | message.toolInvocations: ${message.toolInvocations}`);
    if (message.role !== "assistant" || !message.toolInvocations) return null;
    const toolCall = message.toolInvocations.find(
      (ti) => ti.toolName === "suggestFollowUps" && ti.state === "result"
    );
    console.log(`toolCall: ${toolCall}`)
    if (toolCall && toolCall.result && typeof toolCall.result === "object") {
      const resultObj = toolCall.result as Record<string, unknown>;
      if (Array.isArray(resultObj.suggestions)) {
        return resultObj.suggestions as string[];
      }
    }
    return null;
  }, [message]);

  if (suggestions && suggestions.length > 0) {
    console.log('>>>>>> FOUND SUGGESTION <<<<<<')
    console.log(suggestions)
  }

  // console.log("[DEBUG MessageBubble]", {
  //   role: message.role,
  //   isLast,
  //   hasToolInvocations: !!message.toolInvocations,
  //   toolInvocationsCount: message.toolInvocations ? message.toolInvocations.length : 0,
  //   toolNames: message.toolInvocations ? message.toolInvocations.map(ti => ti.toolName) : [],
  //   toolStates: message.toolInvocations ? message.toolInvocations.map(ti => ti.state) : [],
  //   suggestions,
  // });

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  }, [message.content]);

  const formattedTime = React.useMemo(() => {
    try {
      return new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, [message.timestamp]);

  return (
    <div
      className={cn(
        "flex w-full gap-3 my-4 animate-fade-in md:max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {isUser ? <UserAvatar /> : <AssistantAvatar />}

      <div className="flex flex-col gap-1 min-w-0 flex-1">
        {/* Chat bubble content */}
        <div
          className={cn(
            "px-4 py-3 rounded-2xl border text-sm transition-all duration-200 relative group/bubble",
            isUser
              ? "bg-muted/60 dark:bg-zinc-900/60 border-border dark:border-zinc-800/80 text-foreground rounded-tr-none shadow-md shadow-foreground/5 dark:shadow-black/10 hover:border-border/80 dark:hover:border-zinc-700/60"
              : "bg-card/40 border-border text-foreground rounded-tl-none shadow-lg shadow-foreground/5 dark:shadow-black/20 backdrop-blur-sm hover:border-border/80"
          )}
        >
          {/* Copy Message Button */}
          <button
            onClick={handleCopy}
            className={cn(
              "absolute top-2 p-1 rounded-lg border border-border/80 bg-background/90 dark:bg-zinc-950/95 text-muted-foreground hover:text-foreground opacity-0 group-hover/bubble:opacity-100 transition-all duration-150 cursor-pointer shadow-sm hover:shadow active:scale-95 focus:outline-none z-10",
              isUser ? "left-2" : "right-2"
            )}
            title="Copy message"
            type="button"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-500 animate-fade-in" />
            ) : (
              <Copy className="size-3.5 text-muted-foreground/80 hover:text-foreground" />
            )}
          </button>
          <div className="prose dark:prose-invert prose-sm max-w-none break-words text-foreground">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-base font-bold text-foreground mt-4 mb-2 first:mt-0 tracking-tight">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm font-semibold text-foreground mt-3.5 mb-1.5 first:mt-0 tracking-tight">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xs font-semibold text-muted-foreground mt-3 mb-1 first:mt-0 uppercase tracking-wider">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="leading-relaxed mb-2 last:mb-0 text-[13.5px]">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-4 mb-2.5 text-[13.5px] text-muted-foreground space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-4 mb-2.5 text-[13.5px] text-muted-foreground space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match;
                  return isInline ? (
                    <code
                      className="bg-muted border border-border/50 text-foreground px-1.5 py-0.5 rounded font-mono text-[11px]"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-muted/50 dark:bg-zinc-950/80 border border-border rounded-lg p-3 my-2 overflow-x-auto text-[11px] font-mono text-foreground max-w-full">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                },
                table: ({ children }) => (
                  <div className="my-3 overflow-x-auto border border-border rounded-lg max-w-full shadow-inner shadow-foreground/5 dark:shadow-black/30">
                    <table className="min-w-full divide-y divide-border/60 text-left text-xs font-sans table-auto border-collapse bg-card/20">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-muted text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border/60">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-border/40">{children}</tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-muted/10 transition-colors odd:bg-muted/5">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="px-3 py-2 border-b border-border font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-1.5 text-muted-foreground whitespace-nowrap font-medium text-[12px]">
                    {children}
                  </td>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors underline decoration-emerald-250 dark:decoration-emerald-950 hover:decoration-emerald-500 font-medium"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => {
                  const text = String(children).toLowerCase();
                  if (text === "long" || text === "bullish" || text === "buy") {
                    return (
                      <strong className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20 dark:border-emerald-950/40 shadow-sm shadow-emerald-950/10">
                        {children}
                      </strong>
                    );
                  }
                  if (text === "short" || text === "bearish" || text === "sell") {
                    return (
                      <strong className="font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/20 dark:border-rose-950/40 shadow-sm shadow-rose-950/10">
                        {children}
                      </strong>
                    );
                  }
                  return (
                    <strong className="font-bold text-foreground">{children}</strong>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {message.role === "assistant" && message.toolInvocations && message.toolInvocations.length > 0 && (
            <ToolCallPanel toolInvocations={message.toolInvocations} />
          )}
        </div>

        {/* Dynamic Reply Suggestions */}
        {!isUser && isLast && suggestions && suggestions.length > 0 && onSelectSuggestion && (
          <div className="flex flex-wrap gap-2 mt-2 select-none animate-fade-in justify-start">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSuggestion(suggestion)}
                className="px-3 py-1.5 rounded-xl border border-border bg-card/65 hover:bg-muted/40 text-[11.5px] text-foreground/80 hover:text-foreground font-semibold cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:border-border/80 text-left active:scale-[0.98] shadow-sm hover:shadow"
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        {formattedTime && (
          <span
            className={cn(
              "text-[10px] text-muted-foreground px-1 select-none font-medium mt-0.5",
              isUser ? "ml-auto text-right" : "mr-auto text-left"
            )}
          >
            {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
}
