import { tool } from 'ai';
import { z } from 'zod';

export interface TradeRiskCalculation {
  direction: 'long' | 'short';
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  leverage: number;
  positionSizeUsd: number;
  riskRewardRatio: number;
  riskAmountUsd: number;
  rewardAmountUsd: number;
  riskPercent: number;
  rewardPercent: number;
  estimatedLiquidationPrice: number;
  assessment: string;
}

export const calculateTradeRisk = tool({
  description: 'Calculates the Risk-to-Reward ratio, dollar risk/reward amounts, percentage drawdowns/gains, and estimated liquidation price for a proposed Bitcoin trade setup.',
  inputSchema: z.object({
    direction: z.enum(['long', 'short']).describe('Trade bias: "long" or "short"'),
    entryPrice: z.number().positive().describe('Planned or active trade entry price in USD/USDT'),
    stopLoss: z.number().positive().describe('Stop-loss price level in USD/USDT'),
    targetPrice: z.number().positive().describe('Take-profit price level in USD/USDT'),
    positionSizeUsd: z.number().positive().optional().default(10000).describe('Total position size in USD/USDT (default: 10,000 USD)'),
    leverage: z.number().positive().optional().default(10).describe('Leverage multiple (default: 10x)'),
  }),
  execute: async ({
    direction,
    entryPrice,
    stopLoss,
    targetPrice,
    positionSizeUsd = 10000,
    leverage = 10,
  }): Promise<TradeRiskCalculation> => {
    // 1. Calculate price deltas
    const stopDistance = Math.abs(entryPrice - stopLoss);
    const targetDistance = Math.abs(targetPrice - entryPrice);

    // 2. Risk/Reward ratio
    const riskRewardRatio = stopDistance > 0 ? Number((targetDistance / stopDistance).toFixed(2)) : 0;

    // 3. Percentage moves
    const riskPercent = Number(((stopDistance / entryPrice) * 100).toFixed(2));
    const rewardPercent = Number(((targetDistance / entryPrice) * 100).toFixed(2));

    // 4. Dollar calculations based on position size
    const btcAmount = positionSizeUsd / entryPrice;
    const riskAmountUsd = Number((btcAmount * stopDistance).toFixed(2));
    const rewardAmountUsd = Number((btcAmount * targetDistance).toFixed(2));

    // 5. Estimated liquidation price (assuming ~0.5% maintenance margin buffer)
    const marginRate = 1 / leverage;
    const maintenanceMarginBuffer = 0.005; // 0.5%
    let estimatedLiquidationPrice = 0;

    if (direction === 'long') {
      estimatedLiquidationPrice = Number(
        (entryPrice * (1 - marginRate + maintenanceMarginBuffer)).toFixed(2)
      );
    } else {
      estimatedLiquidationPrice = Number(
        (entryPrice * (1 + marginRate - maintenanceMarginBuffer)).toFixed(2)
      );
    }

    // 6. Qualitative assessment
    let assessment = '';
    if (riskRewardRatio >= 3.0) {
      assessment = 'Exceptional R:R ratio (>3.0). Asymmetrical reward potential.';
    } else if (riskRewardRatio >= 2.0) {
      assessment = 'Solid institutional-grade R:R ratio (2.0 - 3.0).';
    } else if (riskRewardRatio >= 1.5) {
      assessment = 'Acceptable R:R ratio (1.5 - 2.0). Requires strong conviction/win-rate.';
    } else {
      assessment = 'Sub-optimal R:R ratio (<1.5). High risk relative to upside.';
    }

    // Check if stop loss is dangerously close or beyond liquidation
    if (direction === 'long' && stopLoss <= estimatedLiquidationPrice) {
      assessment += ` WARNING: Stop loss ($${stopLoss}) is at or below liquidation price ($${estimatedLiquidationPrice})!`;
    } else if (direction === 'short' && stopLoss >= estimatedLiquidationPrice) {
      assessment += ` WARNING: Stop loss ($${stopLoss}) is at or above liquidation price ($${estimatedLiquidationPrice})!`;
    }

    return {
      direction,
      entryPrice,
      stopLoss,
      targetPrice,
      leverage,
      positionSizeUsd,
      riskRewardRatio,
      riskAmountUsd,
      rewardAmountUsd,
      riskPercent,
      rewardPercent,
      estimatedLiquidationPrice,
      assessment,
    };
  },
});
