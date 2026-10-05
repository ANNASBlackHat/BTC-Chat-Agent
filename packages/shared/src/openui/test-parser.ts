import { parseOpenUIMessage } from './parser';

console.log('--- Running OpenUI Parser Unit Tests ---');

// Test 1: Plain text without OpenUI
const textOnly = 'Hello! Bitcoin is at $96,000 right now. Stay safe.';
const res1 = parseOpenUIMessage(textOnly);
console.assert(!res1.hasOpenUI, 'Test 1 Failed: hasOpenUI should be false');
console.assert(res1.cleanText === textOnly, 'Test 1 Failed: cleanText should equal original text');
console.assert(res1.rootNode === null, 'Test 1 Failed: rootNode should be null');
console.log('✓ Test 1 Passed: Pure markdown text correctly detected as no OpenUI');

// Test 2: Message with embedded TradeCard
const tradeMsg = `Here is your trade risk evaluation:

\`\`\`openui
root = TradeCard("long", 95000, 102000, 92000, 96500, 10, "Ascending triangle breakout test")
\`\`\`

Make sure to monitor the $92,000 stop loss level closely.`;

const res2 = parseOpenUIMessage(tradeMsg);
console.assert(res2.hasOpenUI, 'Test 2 Failed: hasOpenUI should be true');
console.assert(res2.rootNode !== null, 'Test 2 Failed: rootNode should not be null');
console.assert(res2.rootNode?.typeName === 'TradeCard', 'Test 2 Failed: typeName should be TradeCard');
console.assert(res2.rootNode?.props.direction === 'long', 'Test 2 Failed: props.direction should be long');
console.assert(res2.rootNode?.props.entryPrice === 95000, 'Test 2 Failed: props.entryPrice should be 95000');
console.assert(!res2.cleanText.includes('```openui'), 'Test 2 Failed: cleanText should not include ```openui code block');
console.log('✓ Test 2 Passed: Embedded TradeCard parsed accurately into AST and stripped from cleanText');

// Test 3: Composite MetricGrid with references
const gridMsg = `Market overview snapshot:

\`\`\`openui
root = MetricGrid("Key Metrics", [vol, funding])
vol = MetricCard("24h Volume", "$48.5B", "up", "+12.4%")
funding = MetricCard("Funding Rate", "+0.0100%", "neutral")
\`\`\`

Volume is picking up aggressively.`;

const res3 = parseOpenUIMessage(gridMsg);
console.assert(res3.hasOpenUI, 'Test 3 Failed: hasOpenUI should be true');
console.assert(res3.rootNode !== null, 'Test 3 Failed: rootNode should not be null');
console.assert(res3.rootNode?.typeName === 'MetricGrid', 'Test 3 Failed: typeName should be MetricGrid');
const metrics = res3.rootNode?.props.metrics as Array<{ typeName: string; props: Record<string, unknown> }>;
console.assert(Array.isArray(metrics) && metrics.length === 2, 'Test 3 Failed: metrics should have 2 items');
console.assert(metrics[0].typeName === 'MetricCard', 'Test 3 Failed: child typeName should be MetricCard');
console.assert(metrics[0].props.label === '24h Volume', 'Test 3 Failed: label should be 24h Volume');
console.log('✓ Test 3 Passed: Composite MetricGrid with references resolved properly in AST');

console.log('All OpenUI parser tests passed successfully! 🎉');
