import {
  AbstractGenerationModel,
  GenerationModelConfig,
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

function isValidModelId(object: any): object is ModelId {
  return Object.keys(modelIdDefinitions).includes(object)
}

export class TextGenerationInference extends AbstractGenerationModel {
  constructor(config: GenerationModelConfig) {
    super(config)
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
      console.log('TextGenerationInferenceSummarizer.summarize(): timeout')
      throw e
    }
  }
  protected constructModelParams(config: GenerationModelConfig): GenerationModelParams {
    const modelConfigStringSplit = config.model.split(':')
    if (modelConfigStringSplit.length !== 2) {
      throw new Error('TextGenerationInference model string must be colon-delimited and len 2')
    }

    if (!this.url) throw new Error('TextGenerationInferenceSummarizer model requires url')
    const maybeModelId = modelConfigStringSplit[1]
    if (!isValidModelId(maybeModelId))
      throw new Error(`TextGenerationInference model id unknown: ${maybeModelId}`)
    return modelIdDefinitions[maybeModelId]
  }
}

export default TextGenerationInference
