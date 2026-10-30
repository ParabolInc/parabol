import OpenAI from 'openai'
import {embeddingUsage} from '../embeddingUsage'
import {AbstractEmbeddingsModel, type EmbeddingModelParams} from './AbstractEmbeddingsModel'
import {type ModelId, modelIdDefinitions} from './modelIdDefinitions'

export class OpenAIEmbedding extends AbstractEmbeddingsModel {
  client: OpenAI
  url: string
  modelId: ModelId
  constructor(modelId: ModelId, url: string, maxTokens: number) {
    super(modelId, url, maxTokens)
    this.url = url
    this.modelId = modelId as ModelId
    this.client = new OpenAI({
      apiKey: 'vllm',
      baseURL: url
    })
  }

  async ready() {
    return true
  }
  async getTokens(content: string) {
    if (!content) return []
    const res = await fetch(this.url, {
      method: 'post',
      body: JSON.stringify({
        model: this.modelId,
        prompt: content
      })
    })
    const resJSON = await res.json()
    console.log({resJSON})
    const {tokens} = resJSON
    return tokens
  }

  public async getEmbedding(content: string): Promise<number[] | Error> {
    const result = await this.getEmbeddingWithTokens(content)
    return result instanceof Error ? result : result.embedding
  }

  public async getEmbeddingWithTokens(
    content: string
  ): Promise<{embedding: number[]; tokens: number} | Error> {
    const {data, usage} = await this.client.embeddings.create({
      input: content,
      model: this.modelId
    })
    const tokens = usage?.prompt_tokens ?? 0
    embeddingUsage.tokens += tokens
    return {embedding: data[0]?.embedding ?? [], tokens}
  }

  protected constructModelParams(modelId: ModelId): EmbeddingModelParams {
    const modelParams = modelIdDefinitions[modelId]
    if (!modelParams) throw new Error(`Unknown modelId ${modelId} for OpenAIEmbedding`)
    return modelParams
  }
}

export default OpenAIEmbedding
