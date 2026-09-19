import type { LanguageModel } from 'ai'

export interface LLMProvider {
  model: LanguageModel
  modelId: string
}
