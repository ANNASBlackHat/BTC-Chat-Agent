import type { LLMProvider } from './interface'

export async function getLLMProvider(): Promise<LLMProvider> {
  const providerName = process.env.LLM_PROVIDER ?? 'gemini'
  
  if (providerName === 'gemini') {
    const mod = await import('./gemini')
    return mod.default
  }
  
  // Future expansion: Anthropic / Claude
  // if (providerName === 'anthropic') {
  //   const mod = await import('./anthropic')
  //   return mod.default
  // }
  
  throw new Error(`Unsupported LLM_PROVIDER: ${providerName}`)
}
