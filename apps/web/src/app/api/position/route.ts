import { NextResponse } from 'next/server';
import { getUserPosition, saveUserPosition, clearUserPosition } from '@/lib/db/queries';

export async function GET() {
  try {
    const position = await getUserPosition();
    return NextResponse.json({ position });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching position:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve active position' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { direction, entryPrice, entry_price } = body;
    const price = entryPrice ?? entry_price;

    if (!direction || typeof price !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid "direction" or "entryPrice" in request body.' },
        { status: 400 }
      );
    }

    if (direction !== 'long' && direction !== 'short') {
      return NextResponse.json(
        { error: 'Direction must be either "long" or "short".' },
        { status: 400 }
      );
    }

    const savedPosition = await saveUserPosition({
      direction,
      entry_price: price,
    });

    return NextResponse.json({ success: true, position: savedPosition });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error saving position:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to save position' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const success = await clearUserPosition();
    return NextResponse.json({ success });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error clearing position:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to clear position' },
      { status: 500 }
    );
  }
}
