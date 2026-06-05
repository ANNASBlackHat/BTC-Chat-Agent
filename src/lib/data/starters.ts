import clientPromise from '@/lib/db/client';
import { getLatestAgentMemory, getUserPosition } from '@/lib/db/queries';
import { ConversationStarter } from '@/types';

/**
 * Server-side async function to query MongoDB and retrieve the 4 dynamic conversation starters.
 */
export async function getConversationStarters(): Promise<ConversationStarter[]> {
  const client = await clientPromise;
  const db = client.db('btc_agent');

  const starters: ConversationStarter[] = [];

  // ==========================================
  // Card 1 — Today's analysis (Always shown)
  // ==========================================
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Also check using the local server offset date to handle timezone boundary issues
  const offset = today.getTimezoneOffset();
  const localToday = new Date(today.getTime() - (offset * 60 * 1000));
  const localTodayStr = localToday.toISOString().split('T')[0];

  const analysisExists = await db.collection('daily_analyses').findOne({
    $or: [
      { analysis_date: todayStr },
      { analysis_date: localTodayStr }
    ]
  });

  if (analysisExists) {
    starters.push({
      icon: "📊",
      title: "Today's analysis",
      description: "What are the channels saying today?",
      prompt: "What are the channels saying today?"
    });
  } else {
    starters.push({
      icon: "📊",
      title: "Today's analysis",
      description: "What's the latest market view?",
      prompt: "What's the latest market view?"
    });
  }

  // ==========================================
  // Card 2 — Prediction scorecard
  // ==========================================
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const scoredPrediction = await db.collection('predictions').findOne({
    outcome: { $ne: null },
    prediction_date: { $gte: sevenDaysAgoStr }
  });

  if (scoredPrediction) {
    starters.push({
      icon: "🎯",
      title: "Prediction scorecard",
      description: "How accurate have the channel predictions been this week?",
      prompt: "How accurate have the channel predictions been this week?"
    });
  } else {
    starters.push({
      icon: "💬",
      title: "Ask anything",
      description: "What's your take on BTC right now?",
      prompt: "What's your take on BTC right now?"
    });
  }

  // ==========================================
  // Card 3 — Technique of the week
  // ==========================================
  const topTechniqueDoc = await db.collection('technique_ledger')
    .find({})
    .sort({ times_used: -1 })
    .limit(1)
    .toArray();

  if (topTechniqueDoc && topTechniqueDoc.length > 0) {
    const techName = topTechniqueDoc[0].technique_name;
    starters.push({
      icon: "🔧",
      title: "Technique of the week",
      description: `Explain ${techName} and when to use it`,
      prompt: `Explain ${techName} and when to use it`
    });
  } else {
    starters.push({
      icon: "📚",
      title: "Learn a technique",
      description: "Teach me a Bitcoin technical analysis technique",
      prompt: "Teach me a Bitcoin technical analysis technique"
    });
  }

  // ==========================================
  // Card 4 — Position check/set
  // ==========================================
  const position = await getUserPosition();
  if (position) {
    // Format entry price cleanly using locale formatting
    const formattedPrice = position.entry_price.toLocaleString("en-US");
    starters.push({
      icon: "📍",
      title: "My position check",
      description: `Analyze my ${position.direction} position entered at $${formattedPrice}`,
      prompt: `Analyze my ${position.direction} position entered at $${formattedPrice}`
    });
  } else {
    // Try to retrieve current BTC price from MongoDB agent_memory key_levels support/resistance consensus
    const memory = await getLatestAgentMemory();
    let priceText = "";
    
    if (memory && memory.key_levels_consensus) {
      const support = memory.key_levels_consensus.support;
      const resistance = memory.key_levels_consensus.resistance;
      if (support && support.length > 0) {
        priceText = `$${support[0].toLocaleString("en-US")}`;
      } else if (resistance && resistance.length > 0) {
        priceText = `$${resistance[0].toLocaleString("en-US")}`;
      }
    }

    const description = priceText
      ? `I'm long at ${priceText} — help me analyze my entry`
      : "I'm long at current price — help me analyze my entry";

    starters.push({
      icon: "📍",
      title: "Set my position",
      description,
      prompt: description
    });
  }

  return starters;
}
