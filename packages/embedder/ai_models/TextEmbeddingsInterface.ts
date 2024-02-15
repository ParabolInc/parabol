import {
  AbstractEmbeddingsModel,
  EmbeddingModelConfig,
  EmbeddingModelParams,
  ModelConfig
} from './AbstractModel'

const MAX_REQUEST_TIME_MS = 120 * 1000

export type ModelSubTypes = 'BAAI/bge-large-en-v1.5' | 'llmrails/ember-v1'

const modelSubTypeDefinitions: Record<ModelSubTypes, EmbeddingModelParams> = {
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

function isValidModelSubType(object: any): object is ModelSubTypes {
  return Object.keys(modelSubTypeDefinitions).includes(object)
}

export class TextEmbeddingsInterface extends AbstractEmbeddingsModel {
  protected constructModelParams(config: EmbeddingModelConfig): EmbeddingModelParams {
    throw new Error('Method not implemented.')
  }
  constructor(config: EmbeddingModelConfig) {
    super(config)
  }

  public async getEmbedding(content: string) {
    const body = {
      inputs: content
    }
    const controller = new AbortController()
    const {signal} = controller as any
    const timeout = setTimeout(() => {
      controller.abort()
    }, MAX_REQUEST_TIME_MS)

    try {
      // console.log(`TextEmbeddingInterface.getEmebddings(): requesting from ${this.url}/embed`)
      const res = await fetch(`${this.url}/embed`, {
        signal,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(body)
      })
      clearTimeout(timeout)
      const listOfVectors = (await res.json()) as Array<number[]>
      if (!listOfVectors)
        throw new Error('TextEmbeddingsInterface.getEmbeddings(): listOfVectors is undefined')
      if (listOfVectors.length !== 1 || !listOfVectors[0])
        throw new Error(
          `TextEmbeddingsInterface.getEmbeddings(): listOfVectors list length !== 1 (length: ${listOfVectors.length})`
        )
      return listOfVectors[0]
    } catch (e) {
      console.log(`TextEmbeddingsInterface.getEmbeddings() timeout: `, e)
      clearTimeout(timeout)
      throw e
    }
  }
  protected contructModelParams(config: EmbeddingModelConfig): EmbeddingModelParams {
    const modelConfigStringSplit = config.model.split(':')
    if (modelConfigStringSplit.length != 2) {
      throw new Error('TextGenerationInterface model string must be colon-delimited and len 2')
    }

    if (!this.url) throw new Error('TextGenerationInterfaceSummarizer model requires url')
    const modelSubType = modelConfigStringSplit[1]
    if (!isValidModelSubType(modelSubType))
      throw new Error(`TextGenerationInterface model subtype unknown: ${modelSubType}`)
    return modelSubTypeDefinitions[modelSubType]
  }
}

export default TextEmbeddingsInterface
