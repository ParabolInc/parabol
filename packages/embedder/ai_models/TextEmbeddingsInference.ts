import createClient from 'openapi-fetch'
import sleep from 'parabol-client/utils/sleep'
import type {paths} from '../textEmbeddingsnterface'
import {AbstractEmbeddingsModel, EmbeddingModelParams} from './AbstractEmbeddingsModel'
export type ModelId = 'BAAI/bge-large-en-v1.5' | 'llmrails/ember-v1'

const modelIdDefinitions: Record<ModelId, EmbeddingModelParams> = {
  'BAAI/bge-large-en-v1.5': {
    embeddingDimensions: 1024,
    maxInputTokens: 512,
    tableSuffix: 'bge_l_en_1p5',
    languages: ['en']
  },
  'llmrails/ember-v1': {
    embeddingDimensions: 1024,
    maxInputTokens: 512,
    tableSuffix: 'ember_1',
    languages: ['en']
  }
}

export class TextEmbeddingsInference extends AbstractEmbeddingsModel {
  client: ReturnType<typeof createClient<paths>>
  constructor(modelId: string, url: string) {
    super(modelId, url)
    this.client = createClient<paths>({baseUrl: this.url})
  }

  async getTokens(content: string) {
    try {
      const {data, error} = await this.client.POST('/tokenize', {
        body: {inputs: content, add_special_tokens: true},
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
      if (error) return new Error(error.error)
      return data[0]!.map(({id}) => id)
    } catch (e) {
      return e instanceof Error ? e : new Error(e as string)
    }
  }

  async decodeTokens(inputIds: number[]) {
    try {
      const {data, error} = await this.client.POST('/decode', {
        body: {ids: inputIds},
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
      if (error) return new Error(error.error)
      return data
    } catch (e) {
      return e instanceof Error ? e : new Error(e as string)
    }
  }
  public async getEmbedding(content: string, retries = 5): Promise<number[] | Error> {
    try {
      const {data, error, response} = await this.client.POST('/embed', {
        body: {inputs: content},
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
      if (error) {
        if (response.status !== 429 || retries < 1) return new Error(error.error)
        await sleep(2000)
        return this.getEmbedding(content, retries - 1)
      }
      return data[0]!
    } catch (e) {
      return e instanceof Error ? e : new Error(e as string)
    }
  }

  protected constructModelParams(modelId: string): EmbeddingModelParams {
    const modelParams = modelIdDefinitions[modelId as keyof typeof modelIdDefinitions]
    if (!modelParams) throw new Error(`Unknown modelId ${modelId} for TextEmbeddingsInference`)
    return modelParams
  }
}

export default TextEmbeddingsInference
