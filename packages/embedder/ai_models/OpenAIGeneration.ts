import OpenAI from 'openai'
import {Logger} from '../../server/utils/Logger'
import {
  AbstractGenerationModel,
  GenerationModelParams,
  GenerationOptions
} from './AbstractGenerationModel'

export type ModelId = 'gpt-3.5-turbo-0125' | 'gpt-4-turbo-preview'

type OpenAIGenerationOptions = Omit<GenerationOptions, 'topK'>

const modelIdDefinitions: Record<ModelId, GenerationModelParams> = {
  'gpt-3.5-turbo-0125': {
    maxInputTokens: 4096
  },
  'gpt-4-turbo-preview': {
    maxInputTokens: 128000
  }
}

export class OpenAIGeneration extends AbstractGenerationModel {
  private openAIApi: OpenAI | null
  private modelId!: ModelId

  constructor(modelId: string, url: string) {
    super(modelId, url)
    if (!process.env.OPEN_AI_API_KEY) {
      this.openAIApi = null
      return
    }
    this.openAIApi = new OpenAI({
      apiKey: process.env.OPEN_AI_API_KEY,
      organization: process.env.OPEN_AI_ORG_ID
    })
  }

  async summarize(content: string, options: OpenAIGenerationOptions) {
    if (!this.openAIApi) {
      const eMsg = 'OpenAI is not configured'
      Logger.log('OpenAIGenerationSummarizer.summarize(): ', eMsg)
      throw new Error(eMsg)
    }
    const {maxNewTokens: max_tokens = 512, seed, stop, temperature = 0.8, topP: top_p} = options
    const prompt = `Create a brief, one-paragraph summary of the following: ${content}`

    try {
      const response = await this.openAIApi.chat.completions.create({
        frequency_penalty: 0,
        max_tokens,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: this.modelId,
        presence_penalty: 0,
        temperature,
        seed,
        stop,
        top_p
      })
      const maybeSummary = response.choices[0]?.message?.content?.trim()
      if (!maybeSummary) throw new Error('OpenAI returned empty summary')
      return maybeSummary
    } catch (e) {
      Logger.log('OpenAIGenerationSummarizer.summarize(): ', e)
      throw e
    }
  }
  protected constructModelParams(modelId: string): GenerationModelParams {
    const modelParams = modelIdDefinitions[modelId as keyof typeof modelIdDefinitions]
    if (!modelParams) throw new Error(`Unknown modelId ${modelId} for OpenAIGeneration`)
    return modelParams
  }
}

export default OpenAIGeneration
