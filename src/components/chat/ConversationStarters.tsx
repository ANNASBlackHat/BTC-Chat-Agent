import * as React from "react";
import { Card } from "@/components/ui/card";
import { ConversationStarter } from "@/types";

interface ConversationStartersProps {
  starters: ConversationStarter[];
  onSelect: (prompt: string) => void;
}

export function ConversationStarters({ starters, onSelect }: ConversationStartersProps) {
  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto px-6 py-12 select-none text-center">
      {/* App name / logo & subtitle */}
      <div className="mb-10 flex flex-col items-center gap-2">
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-zinc-100 bg-clip-text text-transparent">
          ₿ BTC Analysis Agent
        </h2>
        <p className="text-sm text-muted-foreground font-medium tracking-wide">
          Your personal Bitcoin analyst
        </p>
      </div>

      {/* 2x2 grid on desktop, 1 column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {starters.map((starter, index) => (
          <Card
            key={index}
            onClick={() => onSelect(starter.prompt)}
            className="group cursor-pointer border border-border bg-card/45 hover:bg-muted/30 backdrop-blur-md transition-all duration-200 ease-in-out hover:border-border/80 hover:scale-[1.02] p-5 flex flex-col items-start text-left gap-2 rounded-xl"
          >
            <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.15)] select-none">
              {starter.icon}
            </span>
            <h3 className="font-semibold text-sm text-foreground group-hover:text-foreground/90 transition-colors">
              {starter.title}
            </h3>
            <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/90 transition-colors leading-relaxed">
              {starter.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
