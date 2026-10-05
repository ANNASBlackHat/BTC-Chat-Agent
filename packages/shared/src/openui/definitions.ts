import { defineComponent, createLibrary, type Library } from '@openuidev/lang-core';
import { z } from 'zod';

// ==========================================
// 1. Zod Prop Schemas
// ==========================================

export const MetricCardPropsSchema = z.object({
  label: z.string().describe('Key metric label, e.g. "24h Volume", "Funding Rate", "RSI (4h)"'),
  value: z.string().describe('Formatted metric value, e.g. "$48.5B", "+0.0100%", "64.2"'),
  trend: z.enum(['up', 'down', 'neutral']).optional().describe('Visual trend badge: "up" (bullish/green), "down" (bearish/red), or "neutral"'),
  change: z.string().optional().describe('Delta or percentage change string, e.g. "+3.45%", "-1.20%"'),
});
export type MetricCardProps = z.infer<typeof MetricCardPropsSchema>;

export const TradeCardPropsSchema = z.object({
  direction: z.enum(['long', 'short']).describe('Trade bias/direction: "long" or "short"'),
  entryPrice: z.number().describe('Trade entry price in USD/USDT'),
  targetPrice: z.number().optional().describe('Take profit price level'),
  stopLoss: z.number().optional().describe('Stop loss price level'),
  currentPrice: z.number().optional().describe('Current spot Bitcoin price'),
  leverage: z.number().optional().describe('Leverage multiple (e.g. 1, 5, 10, 20)'),
  thesis: z.string().optional().describe('Short 1-sentence trade summary/rationale'),
});
export type TradeCardProps = z.infer<typeof TradeCardPropsSchema>;

export const AlertWidgetPropsSchema = z.object({
  symbol: z.string().describe('Ticker symbol, e.g. "BTCUSDT"'),
  targetPrice: z.number().describe('Price level at which Telegram warning triggers'),
  direction: z.enum(['up', 'down']).describe('Direction: "up" (crosses above) or "down" (crosses below)'),
  note: z.string().optional().describe('Note attached to Telegram notification'),
});
export type AlertWidgetProps = z.infer<typeof AlertWidgetPropsSchema>;

export const RiskSimulatorPropsSchema = z.object({
  direction: z.enum(['long', 'short']).describe('Trade direction: "long" or "short"'),
  entryPrice: z.number().describe('Entry price in USD/USDT'),
  stopLoss: z.number().describe('Stop loss price level'),
  targetPrice: z.number().describe('Target exit price level'),
  riskRewardRatio: z.number().describe('Calculated Risk-to-Reward ratio (e.g. 2.4)'),
  potentialLossUsd: z.number().optional().describe('Estimated loss per 1 BTC in USD'),
  potentialGainUsd: z.number().optional().describe('Estimated profit per 1 BTC in USD'),
  liquidationPrice: z.number().optional().describe('Estimated liquidation price at 10x leverage'),
});
export type RiskSimulatorProps = z.infer<typeof RiskSimulatorPropsSchema>;

// ==========================================
// 2. OpenUI Component Definitions
// ==========================================

export const MetricCard = defineComponent({
  name: 'MetricCard',
  description: 'Displays a single prominent trading metric with an optional trend indicator and delta change',
  props: MetricCardPropsSchema,
  component: () => null,
});

export const MetricGridPropsSchema = z.object({
  title: z.string().optional().describe('Optional title header for the metrics group, e.g. "24h Market Overview"'),
  metrics: z.array(MetricCard.ref).describe('List of MetricCard component references'),
});
export type MetricGridProps = {
  title?: string;
  metrics: MetricCardProps[];
};

export const MetricGrid = defineComponent({
  name: 'MetricGrid',
  description: 'Displays a responsive grid of multiple MetricCards for comparing market indicators',
  props: MetricGridPropsSchema,
  component: () => null,
});

export const TradeCard = defineComponent({
  name: 'TradeCard',
  description: 'Displays an interactive Bitcoin position and risk summary card with entry, stop loss, targets, and P&L status',
  props: TradeCardPropsSchema,
  component: () => null,
});

export const AlertWidget = defineComponent({
  name: 'AlertWidget',
  description: 'Displays an interactive one-click Telegram price alert button inside chat',
  props: AlertWidgetPropsSchema,
  component: () => null,
});

export const RiskSimulator = defineComponent({
  name: 'RiskSimulator',
  description: 'Displays a risk/reward simulator card showing R:R ratio, dollar gain/loss targets, and liquidation risk',
  props: RiskSimulatorPropsSchema,
  component: () => null,
});

// ==========================================
// 3. OpenUI Library & Prompt Generator
// ==========================================

export function createBtcOpenUILibrary(): Library {
  return createLibrary({
    id: 'btc-chat-agent@1',
    components: [MetricCard, MetricGrid, TradeCard, AlertWidget, RiskSimulator],
  });
}

export function generateOpenUIPrompt(): string {
  const library = createBtcOpenUILibrary();
  return library.prompt({
    preamble: `### GENERATIVE UI CAPABILITY (OPENUI LANG)
You have the unique ability to render interactive UI cards directly inside your response using OpenUI Lang!
When discussing trade setups, price levels, alerts, or key market metrics, ALWAYS include an appropriate OpenUI widget inside a \`\`\`openui code block.

Available Components:
- TradeCard(direction, entryPrice, targetPrice?, stopLoss?, currentPrice?, leverage?, thesis?)
- MetricGrid(title?, metrics) [composed of MetricCard(label, value, trend?, change?)]
- AlertWidget(symbol, targetPrice, direction, note?)
- RiskSimulator(direction, entryPrice, stopLoss, targetPrice, riskRewardRatio, potentialLossUsd?, potentialGainUsd?, liquidationPrice?)

Rules for OpenUI Lang:
1. Always wrap the OpenUI code in a \`\`\`openui ... \`\`\` fenced block.
2. The entry point must be assigned to \`root\`.
3. Provide helpful conversational analysis and explanation before or after the widget.`,
    examples: [
      `\`\`\`openui
root = TradeCard("long", 95500, 102000, 92000, 96200, 10, "Ascending triangle breakout test")
\`\`\``,
      `\`\`\`openui
root = MetricGrid("24h Market Pulse", [vol, funding, rsi])
vol = MetricCard("24h Volume", "$48.5B", "up", "+12.4%")
funding = MetricCard("Funding Rate", "+0.0082%", "neutral")
rsi = MetricCard("RSI (4h)", "63.5", "up")
\`\`\``,
      `\`\`\`openui
root = AlertWidget("BTCUSDT", 98000, "up", "Resistance break alert")
\`\`\``,
      `\`\`\`openui
root = RiskSimulator("long", 95000, 92500, 102500, 3.0, 2500, 7500, 86000)
\`\`\``,
    ],
  });
}
