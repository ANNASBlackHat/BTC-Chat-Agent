"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types";

export interface MessageBubbleProps {
  message: ChatMessage;
}

const AssistantAvatar = () => (
  <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-950 border border-zinc-900 shadow-md shadow-black/40 relative overflow-hidden group select-none shrink-0">
    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/40 to-zinc-900 opacity-60 group-hover:opacity-100 transition-opacity" />
    <span className="font-sans font-extrabold text-sm text-emerald-400 z-10">₿</span>
  </div>
);

const UserAvatar = () => (
  <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-900 border border-zinc-800 shadow-md shadow-black/20 select-none shrink-0">
    <span className="font-sans font-bold text-xs text-zinc-400">U</span>
  </div>
);

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
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
            "px-4 py-3 rounded-2xl border text-sm transition-all duration-200",
            isUser
              ? "bg-zinc-900/60 border-zinc-800/80 text-zinc-100 rounded-tr-none shadow-md shadow-black/10 hover:border-zinc-700/60"
              : "bg-zinc-950/40 border-zinc-900 text-zinc-300 rounded-tl-none shadow-lg shadow-black/20 backdrop-blur-sm hover:border-zinc-800/80"
          )}
        >
          <div className="prose prose-invert prose-sm max-w-none break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-base font-bold text-zinc-50 mt-4 mb-2 first:mt-0 tracking-tight">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm font-semibold text-zinc-200 mt-3.5 mb-1.5 first:mt-0 tracking-tight">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xs font-semibold text-zinc-300 mt-3 mb-1 first:mt-0 uppercase tracking-wider">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="leading-relaxed mb-2 last:mb-0 text-[13.5px]">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-4 mb-2.5 text-[13.5px] text-zinc-300 space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-4 mb-2.5 text-[13.5px] text-zinc-300 space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match;
                  return isInline ? (
                    <code
                      className="bg-zinc-900 border border-zinc-800/50 text-zinc-300 px-1.5 py-0.5 rounded font-mono text-[11px]"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-zinc-950/80 border border-zinc-900 rounded-lg p-3 my-2 overflow-x-auto text-[11px] font-mono text-zinc-300 max-w-full">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                },
                table: ({ children }) => (
                  <div className="my-3 overflow-x-auto border border-zinc-900 rounded-lg max-w-full shadow-inner shadow-black/30">
                    <table className="min-w-full divide-y divide-zinc-900/60 text-left text-xs font-sans table-auto border-collapse bg-zinc-950/20">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-900/60">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-zinc-900/40">{children}</tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-zinc-900/10 transition-colors odd:bg-zinc-950/15">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="px-3 py-2 border-b border-zinc-900 font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-1.5 text-zinc-300 whitespace-nowrap font-medium text-[12px]">
                    {children}
                  </td>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors underline decoration-emerald-950 hover:decoration-emerald-500 font-medium"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => {
                  const text = String(children).toLowerCase();
                  if (text === "long" || text === "bullish" || text === "buy") {
                    return (
                      <strong className="font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-950/40 shadow-sm shadow-emerald-950/10">
                        {children}
                      </strong>
                    );
                  }
                  if (text === "short" || text === "bearish" || text === "sell") {
                    return (
                      <strong className="font-bold text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded border border-rose-950/40 shadow-sm shadow-rose-950/10">
                        {children}
                      </strong>
                    );
                  }
                  return (
                    <strong className="font-bold text-zinc-100">{children}</strong>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Timestamp */}
        {formattedTime && (
          <span
            className={cn(
              "text-[10px] text-zinc-600 px-1 select-none font-medium mt-0.5",
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
