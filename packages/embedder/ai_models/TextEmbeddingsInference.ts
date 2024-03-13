import {
  AbstractEmbeddingsModel,
  EmbeddingModelConfig,
  EmbeddingModelParams
} from './AbstractEmbeddingsModel'
import fetchWithRetry from './helpers/fetchWithRetry'

const MAX_REQUEST_TIME_S = 3 * 60

export type ModelId = 'BAAI/bge-large-en-v1.5' | 'llmrails/ember-v1'

const modelIdDefinitions: Record<ModelId, EmbeddingModelParams> = {
  'BAAI/bge-large-en-v1.5': {
    embeddingDimensions: 1024,
    maxInputTokens: 512,
    tableSuffix: 'bge_l_en_1p5'
  },
  'llmrails/ember-v1': {
    embeddingDimensions: 1024,
    maxInputTokens: 512,
    tableSuffix: 'ember_1'
  }
}

function isValidModelId(object: any): object is ModelId {
  return Object.keys(modelIdDefinitions).includes(object)
}

export class TextEmbeddingsInference extends AbstractEmbeddingsModel {
  constructor(config: EmbeddingModelConfig) {
    super(config)
  }

  async getTokens(content: string) {
    const fetchOptions = {
      body: JSON.stringify({inputs: content}),
      deadline: new Date(new Date().getTime() + MAX_REQUEST_TIME_S * 1000),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
      },
      method: 'POST'
    }

    try {
      const res = await fetchWithRetry(`${this.url}/tokenize`, fetchOptions)
      const listOfTokens = (await res.json()) as number[][]
      if (!listOfTokens) return new Error('listOfTokens is undefined')
      if (listOfTokens.length !== 1 || !listOfTokens[0])
        return new Error(`listOfTokens list length !== 1 (length: ${listOfTokens.length})`)
      return listOfTokens[0]
    } catch (e) {
      return e instanceof Error ? e : new Error(e)
    }
  }
  public async getEmbedding(content: string) {
    const fetchOptions = {
      body: JSON.stringify({inputs: content}),
      deadline: new Date(new Date().getTime() + MAX_REQUEST_TIME_S * 1000),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
      },
      method: 'POST'
    }

    try {
      const res = await fetchWithRetry(`${this.url}/embed`, fetchOptions)
      const listOfVectors = (await res.json()) as number[][]
      if (!listOfVectors) return new Error('listOfVectors is undefined')
      if (listOfVectors.length !== 1 || !listOfVectors[0])
        return new Error(`listOfVectors list length !== 1 (length: ${listOfVectors.length})`)
      return listOfVectors[0]
    } catch (e) {
      console.log(`TextEmbeddingsInference.getEmbeddings() timeout: `, e)
      return e instanceof Error ? e : new Error(e || 'Unknown Error')
    }
  }

  protected constructModelParams(config: EmbeddingModelConfig): EmbeddingModelParams {
    const modelConfigStringSplit = config.model.split(':')
    if (modelConfigStringSplit.length != 2) {
      throw new Error('TextGenerationInference model string must be colon-delimited and len 2')
    }

    if (!this.url) throw new Error('TextGenerationInferenceSummarizer model requires url')
    const maybeModelId = modelConfigStringSplit[1]
    if (!isValidModelId(maybeModelId))
      throw new Error(`TextGenerationInference model id unknown: ${maybeModelId}`)
    return modelIdDefinitions[maybeModelId]
  }
}

export default TextEmbeddingsInference
