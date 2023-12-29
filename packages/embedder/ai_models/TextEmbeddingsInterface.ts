import {AbstractEmbeddingsModel, EmbeddingModelConfig, EmbeddingModelParams} from './abstractModel'

const MAX_REQUEST_TIME_MS = 120 * 1000

export enum ModelSubTypes {
  BGE_Large_En_1p5 = 'BAAI/bge-large-en-v1.5'
}

const modelSubTypeDefinitions: Record<ModelSubTypes, EmbeddingModelParams> = {
  [ModelSubTypes.BGE_Large_En_1p5]: {embeddingDimensions: 1024}
}

function isValidModelSubType(type: any): type is ModelSubTypes {
  return Object.values(ModelSubTypes).includes(type)
}

export class TextEmbeddingsInterface extends AbstractEmbeddingsModel {
  private readonly modelSubTypeParams: EmbeddingModelParams
  constructor(config: EmbeddingModelConfig) {
    super(config)

    const modelConfigStringSplit = this.modelConfigString.split(':')
    if (modelConfigStringSplit.length != 2) {
      throw new Error('TextEmbeddingsInterface model string must be colon-delimited and len 2')
    }

    if (!this.url) throw new Error('TextEmbeddingsInterface model requires url')

    const modelSubType = modelConfigStringSplit[1]
    if (!isValidModelSubType(modelSubType))
      throw new Error(`TextEmbeddingsInterface model subtype unknown: ${modelSubType}`)
    this.modelSubTypeParams = modelSubTypeDefinitions[modelSubType]
  }

  public async getEmbeddings(content: string) {
    const body = {
      inputs: content
    }
    const controller = new AbortController()
    const {signal} = controller as any
    const timeout = setTimeout(() => {
      controller.abort()
    }, MAX_REQUEST_TIME_MS)

    try {
      console.log(`embedding from ${this.url}/embed`)
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
      console.log(`error: `, e)
      clearTimeout(timeout)
      console.log('TextEmbeddingsInterface.getEmbeddings(): timeout')
      throw e
    }
  }

  getModelParams(): EmbeddingModelParams {
    return this.modelSubTypeParams
  }
}

export default TextEmbeddingsInterface
