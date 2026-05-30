import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { LLMProvider } from './interface'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
})

const provider: LLMProvider = {
  model: google(process.env.LLM_MODEL ?? 'gemini-2.5-flash'),
  modelId: process.env.LLM_MODEL ?? 'gemini-2.5-flash',
}

export default provider
