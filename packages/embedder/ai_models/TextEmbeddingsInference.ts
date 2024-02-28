import {AbstractEmbeddingsModel, EmbeddingModelConfig, EmbeddingModelParams} from './AbstractModel'
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
      const listOfVectors = (await res.json()) as Array<number[]>
      if (!listOfVectors)
        throw new Error('TextEmbeddingsInference.getEmbeddings(): listOfVectors is undefined')
      if (listOfVectors.length !== 1 || !listOfVectors[0])
        throw new Error(
          `TextEmbeddingsInference.getEmbeddings(): listOfVectors list length !== 1 (length: ${listOfVectors.length})`
        )
      return listOfVectors[0]
    } catch (e) {
      console.log(`TextEmbeddingsInference.getEmbeddings() timeout: `, e)
      throw e
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
      throw new Error(`TextGenerationInference model subtype unknown: ${maybeModelId}`)
    return modelIdDefinitions[maybeModelId]
  }
}

export default TextEmbeddingsInference
