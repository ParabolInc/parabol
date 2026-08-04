import OpenAI from 'openai'
import groupReflections from './groupReflections/groupReflectionsStructured'
import type {GroupReflectionsInput, GroupReflectionsOptions} from './groupReflections/types'

// DeepSeek implements the OpenAI wire format, so the OpenAI client works verbatim against it
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com'

/**
 * deepseek-chat (V3) answers directly, which is what grouping wants. deepseek-reasoner (R1) thinks
 * first and reintroduces exactly the latency that dropping gpt-5's reasoning effort removed, so
 * only reach for it when comparing quality rather than speed.
 */
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

/**
 * Counterpart to OpenAIServerManager, for benchmarking a second provider on the same prompt.
 *
 * Everything but the credentials and the model name lives in utils/groupReflections, so a
 * comparison against OpenAI measures the provider and nothing else.
 */
class DeepSeekManager {
  deepSeekApi
  constructor() {
    if (!process.env.DEEPSEEK_API_KEY) {
      this.deepSeekApi = null
      return
    }
    this.deepSeekApi = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: DEEPSEEK_BASE_URL
    })
  }

  groupReflectionsStructured(input: GroupReflectionsInput, options: GroupReflectionsOptions = {}) {
    if (!this.deepSeekApi) return null
    return groupReflections(
      {label: 'deepseek', client: this.deepSeekApi, model: DEEPSEEK_MODEL},
      input,
      options
    )
  }
}

export default DeepSeekManager
