import OpenAI from 'openai'
import {
  AbstractGenerationModel,
  GenerationModelConfig,
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

function isValidModelId(object: any): object is ModelId {
  return Object.keys(modelIdDefinitions).includes(object)
}

export class OpenAIGeneration extends AbstractGenerationModel {
  private openAIApi: OpenAI | null
  private modelId!: ModelId

  constructor(config: GenerationModelConfig) {
    super(config)
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
      console.log('OpenAIGenerationSummarizer.summarize(): ', eMsg)
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
      console.log('OpenAIGenerationSummarizer.summarize(): ', e)
      throw e
    }
  }
  protected constructModelParams(config: GenerationModelConfig): GenerationModelParams {
    const modelConfigStringSplit = config.model.split(':')
    if (modelConfigStringSplit.length != 2) {
      throw new Error('OpenAIGeneration model string must be colon-delimited and len 2')
    }

    const maybeModelId = modelConfigStringSplit[1]
    if (!isValidModelId(maybeModelId))
      throw new Error(`OpenAIGeneration model id unknown: ${maybeModelId}`)

    this.modelId = maybeModelId

    return modelIdDefinitions[maybeModelId]
  }
}

export default OpenAIGeneration
