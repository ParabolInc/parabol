import {Logger} from '../../server/utils/Logger'
import {
  AbstractGenerationModel,
  GenerationModelParams,
  GenerationOptions
} from './AbstractGenerationModel'
import fetchWithRetry from './helpers/fetchWithRetry'

const MAX_REQUEST_TIME_S = 3 * 60

export type ModelId = 'TheBloke/zephyr-7b-beta'

const modelIdDefinitions: Record<ModelId, GenerationModelParams> = {
  'TheBloke/zephyr-7b-beta': {
    maxInputTokens: 512
  }
}

export class TextGenerationInference extends AbstractGenerationModel {
  constructor(modelId: string, url: string) {
    super(modelId, url)
  }

  async summarize(content: string, options: GenerationOptions) {
    const {maxNewTokens: max_new_tokens = 512, seed, stop, temperature = 0.8, topP, topK} = options
    const parameters = {
      max_new_tokens,
      seed,
      stop,
      temperature,
      topP,
      topK,
      truncate: true
    }
    const prompt = `Create a brief, one-paragraph summary of the following: ${content}`
    const fetchOptions = {
      body: JSON.stringify({
        inputs: prompt,
        parameters
      }),
      deadline: new Date(new Date().getTime() + MAX_REQUEST_TIME_S * 1000),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
      },
      method: 'POST'
    }

    try {
      const res = await fetchWithRetry(`${this.url}/generate`, fetchOptions)
      const json = await res.json()
      if (!json || !json.generated_text)
        throw new Error('TextGenerationInference.summarize(): malformed response')
      return json.generated_text as string
    } catch (e) {
      Logger.log('TextGenerationInferenceSummarizer.summarize(): timeout')
      throw e
    }
  }
  protected constructModelParams(modelId: string): GenerationModelParams {
    const modelParams = modelIdDefinitions[modelId as keyof typeof modelIdDefinitions]
    if (!modelParams) throw new Error(`Unknown modelId ${modelId} for TextGenerationInference`)
    return modelParams
  }
}

export default TextGenerationInference
