import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  
  // Attempt Binance first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    
    const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', {
      signal: controller.signal,
      cache: 'no-store',
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Binance returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const price = parseFloat(data.price);
    
    if (isNaN(price)) {
      throw new Error('Binance response price is NaN');
    }

    return NextResponse.json({
      price,
      source: 'binance',
      timestamp: new Date().toISOString(),
    });
  } catch (binanceError: any) {
    console.warn(
      `[${new Date().toISOString()}] [API] Binance fetch failed: ${binanceError.message || binanceError}. Falling back to Coinbase...`
    );

    // Attempt Coinbase fallback
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot', {
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Coinbase returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const price = parseFloat(data.data.amount);

      if (isNaN(price)) {
        throw new Error('Coinbase response price is NaN');
      }

      return NextResponse.json({
        price,
        source: 'coinbase',
        timestamp: new Date().toISOString(),
      });
    } catch (coinbaseError: any) {
      console.error(
        `[${new Date().toISOString()}] [API] All price sources failed. Coinbase error: ${coinbaseError.message || coinbaseError}`
      );
      
      return NextResponse.json(
        { error: 'All price feeds rate-limited, offline, or blocked.' },
        { status: 502 }
      );
    }
  }
}
