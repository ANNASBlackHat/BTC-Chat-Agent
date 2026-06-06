import { allTools } from './index'

async function runTests() {
  console.log('--- Testing Price Tool ---')
  const priceResult = await allTools.getCurrentPrice.execute!({}, { toolCallId: 'test-price', messages: [] })
  console.log('Price Result:', priceResult)

  console.log('\n--- Testing Session Tools ---')
  const currentPos = await allTools.getCurrentPosition.execute!({}, { toolCallId: 'test-get-pos', messages: [] })
  console.log('Current Position:', currentPos)

  const updateResult = await allTools.updateUserPosition.execute!(
    { direction: 'long', entryPrice: 65000 },
    { toolCallId: 'test-update-pos', messages: [] }
  )
  console.log('Update Position Result:', updateResult)

  const updatedPos = await allTools.getCurrentPosition.execute!({}, { toolCallId: 'test-get-pos-2', messages: [] })
  console.log('New Active Position:', updatedPos)

  const clearResult = await allTools.clearActivePosition.execute!({}, { toolCallId: 'test-clear-pos', messages: [] })
  console.log('Clear Position Result:', clearResult)

  console.log('\n--- Testing Pipeline Tools ---')
  const memoryResult = await allTools.getLatestAgentMemory.execute!({}, { toolCallId: 'test-memory', messages: [] })
  console.log('Agent Memory Result:', memoryResult)

  const recentAnalyses = await allTools.getRecentDailyAnalyses.execute!(
    { limit: 2 },
    { toolCallId: 'test-analyses', messages: [] }
  )
  console.log('Recent Daily Analyses (limit 2):', recentAnalyses)

  const videoAnalysis = await allTools.getDailyAnalysisByVideoId.execute!(
    { videoId: 'test-video-id' },
    { toolCallId: 'test-video-analysis', messages: [] }
  )
  console.log('Video Analysis:', videoAnalysis)

  const recentPredictions = await allTools.getRecentPredictions.execute!(
    { limit: 2 },
    { toolCallId: 'test-predictions', messages: [] }
  )
  console.log('Recent Predictions (limit 2):', recentPredictions)

  const videoPrediction = await allTools.getPredictionByVideoId.execute!(
    { videoId: 'test-video-id' },
    { toolCallId: 'test-video-prediction', messages: [] }
  )
  console.log('Video Prediction:', videoPrediction)

  const techniqueLedger = await allTools.getTechniqueLedgerEntries.execute!(
    { techniqueName: 'Orderbook' },
    { toolCallId: 'test-ledger', messages: [] }
  )
  console.log('Technique Ledger Entries:', techniqueLedger)

  console.log('\n--- Testing Price Alert Tools ---')
  const alertsListBefore = await allTools.getPriceAlerts.execute!(
    {},
    { toolCallId: 'test-get-alerts-before', messages: [] }
  )
  console.log('Price Alerts List Before:', alertsListBefore)

  console.log('Creating Test Price Alert at 99999...')
  const createResult = await allTools.createPriceAlert.execute!(
    { targetPrice: 99999, botName: 'Test-Bot', symbol: 'BTC', note: 'BTC price warning note!' },
    { toolCallId: 'test-create-alert', messages: [] }
  )
  console.log('Create Price Alert Result:', createResult)

  console.log('Creating Test Trailing Stop alert down by 15%...')
  const createTrailingResult = await allTools.createPriceAlert.execute!(
    { type: 'trailing', trailingPercent: 15, direction: 'down', symbol: 'ETHUSDT', note: 'ETH trailing stop triggered!' },
    { toolCallId: 'test-create-trailing-alert', messages: [] }
  )
  console.log('Create Trailing Alert Result:', createTrailingResult)


  const alertsListAfter = await allTools.getPriceAlerts.execute!(
    {},
    { toolCallId: 'test-get-alerts-after', messages: [] }
  )
  console.log('Price Alerts List After:', alertsListAfter)

  console.log('\n--- All tool tests execution complete ---')
  process.exit(0)
}

runTests().catch(err => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
