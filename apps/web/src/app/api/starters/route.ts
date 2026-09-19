import { NextResponse } from 'next/server';
import { getConversationStarters } from '@/lib/data/starters';
import { getLatestAnalysisDate } from '@/lib/db/queries';

/**
 * Dynamic conversation starters for mobile clients.
 * Mirrors the server-rendered starters used by the web /chat page.
 */
export async function GET() {
  try {
    const [starters, latestAnalysisDate] = await Promise.all([
      getConversationStarters(),
      getLatestAnalysisDate(),
    ]);

    return NextResponse.json({ starters, latestAnalysisDate });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching conversation starters:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch conversation starters' },
      { status: 500 }
    );
  }
}
