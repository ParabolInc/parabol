import OpenAIServerManager from 'parabol-server/utils/OpenAIServerManager'
import {
  AbstractGenerationModel,
  GenerationModelConfig,
  GenerationModelParams
} from './AbstractModel'

export enum ModelSubTypes {
  // localllm models
  Llama2_13b_Ensemble = 'TheBloke/Llama-2-13B-Ensemble-v5-GGUF'
}

const modelSubTypeDefinitions: Record<ModelSubTypes, GenerationModelParams> = {
  [ModelSubTypes.Llama2_13b_Ensemble]: {
    maxInputTokens: 512
  }
}

function isValidModelSubType(type: any): type is ModelSubTypes {
  return Object.values(ModelSubTypes).includes(type)
}

class EmbedderOpenAIServerManager extends OpenAIServerManager {
  private modelNameForApi
  constructor(modelNameForApi = '') {
    super()
    this.modelNameForApi = modelNameForApi
  }

  public async summarize(content: string, temperature: number = 0.8, maxNewTokens: number = 512) {
    if (!this.openAIApi) return null
    const prompt = `Create a brief, one-paragraph summary of the below text. When referring to
people in the summary, do not assume their gender and default to using the pronouns "they" and "them".

Text: """
${content}
"""`

    console.log(`to do: ${prompt}`)

    try {
      const response = await this.openAIApi.chat.completions.create({
        model: this.modelNameForApi,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature,
        max_tokens: maxNewTokens
      })
      console.log(`response:`)
      console.log(JSON.stringify(response))
      return (response.choices[0]?.message?.content?.trim() as string) ?? null
    } catch (e) {
      console.log(`error`)
      console.log(`error: ${e}`)
      const error = e instanceof Error ? e : new Error('OpenAI failed to getSummary')
      return null
    }
  }
}

export class OpenAIGeneration extends AbstractGenerationModel {
  private embedderOpenAI
  constructor(config: GenerationModelConfig) {
    super(config)
    this.embedderOpenAI = new EmbedderOpenAIServerManager()
  }

  public async summarize(content: string, temperature: number = 0.8, maxNewTokens: number = 512) {
    return await this.embedderOpenAI.summarize(content, temperature, maxNewTokens)
  }

  protected constructModelParams(): GenerationModelParams {
    const modelConfigStringSplit = this.modelConfigString.split(':')
    if (modelConfigStringSplit.length != 2) {
      throw new Error(`${this.constructor.name} model string must be colon-delimited and len 2`)
    }

    if (!process.env.OPEN_AI_API_KEY)
      throw new Error(`${this.constructor.name} model requires OPEN_AI_API_KEY env var`)

    const modelSubType = modelConfigStringSplit[1]
    if (!isValidModelSubType(modelSubType))
      throw new Error(`${this.constructor.name} model subtype unknown: ${modelSubType}`)
    return modelSubTypeDefinitions[modelSubType]
  }
}

export default OpenAIGeneration
