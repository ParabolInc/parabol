import createClient, {type ClientMethod} from 'openapi-fetch'
import sleep from 'parabol-client/utils/sleep'
import {Logger} from '../../server/utils/Logger'
import {embeddingUsage} from '../embeddingUsage'
import type {paths} from '../textEmbeddingsnterface'
import {AbstractEmbeddingsModel, type EmbeddingModelParams} from './AbstractEmbeddingsModel'
import {type ModelId, modelIdDefinitions} from './modelIdDefinitions'

const openAPIWithTimeout =
  (client: ClientMethod<any, any, any>, toError: (error: unknown) => any, timeout: number) =>
  async (...args: Parameters<ClientMethod<any, any, any>>) => {
    const controller = new AbortController()
    const {signal} = controller
    const timeoutId = setTimeout(() => {
      controller.abort(new Error('Timeout'))
    }, timeout)
    const [route, requestInit] = args
    let response: any
    try {
      response = await client(route, {
        signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8'
        },
        ...requestInit
      })
      clearTimeout(timeoutId)
      return response
    } catch (e) {
      const error = toError(e)
      return {error}
    }
  }

export class TextEmbeddingsInference extends AbstractEmbeddingsModel {
  client: ReturnType<typeof createClient<paths>>
  constructor(modelId: ModelId, url: string, maxTokens: number) {
    super(modelId, url, maxTokens)
    const client = createClient<paths>({baseUrl: this.url})
    const toError = (e: unknown) => ({
      error: e instanceof Error ? e.message : e
    })
    client.GET = openAPIWithTimeout(client.GET, toError, 40_000)
    client.POST = openAPIWithTimeout(client.POST, toError, 40_000)
    this.client = client
  }

  private readyPromise: Promise<boolean> | null = null
  async ready() {
    if (this.isReady) return true
    const start = Date.now()
    if (!this.readyPromise) {
      this.readyPromise = (async () => {
        while (!this.isReady) {
          const res = await this.getTokens('ready')
          const duration = Math.floor((Date.now() - start) / 1000)
          if (res instanceof Error) {
            Logger.log(`TEI warming up for ${duration} seconds`)
            await sleep(5_000)
            continue
          }
          Logger.log(`TEI warmed up in ${duration} seconds`)
          this.isReady = true
          this.readyPromise = null
          break
        }
        return true
      })()
    }
    return this.readyPromise
  }
  async getTokens(content: string) {
    if (!content) return []
    const {data, error} = await this.client.POST('/tokenize', {
      body: {add_special_tokens: true, inputs: content}
    })
    if (error) return new Error(error.error)
    return data[0]!.map(({id}) => id)
  }

  async decodeTokens(inputIds: number[]) {
    const {data, error} = await this.client.POST('/decode', {
      body: {ids: inputIds}
    })
    if (error) return new Error(error.error)
    return data
  }
  public async getEmbedding(content: string, retries = 5): Promise<number[] | Error> {
    const result = await this.getEmbeddingWithTokens(content, retries)
    return result instanceof Error ? result : result.embedding
  }

  public async getEmbeddingWithTokens(
    content: string,
    retries = 5
  ): Promise<{embedding: number[]; tokens: number} | Error> {
    if (!content.trim()) return new Error('Cannot embed blank text')
    const {data, error, response} = await this.client.POST('/embed', {
      body: {inputs: content}
    })
    if (error) {
      if (response?.status !== 429 || retries < 1) return new Error(error.error)
      await sleep(2000)
      return this.getEmbeddingWithTokens(content, retries - 1)
    }
    const tokens = Number(response.headers.get('x-compute-tokens')) || 0
    embeddingUsage.tokens += tokens
    return {embedding: data[0]!, tokens}
  }

  protected constructModelParams(modelId: ModelId): EmbeddingModelParams {
    const modelParams = modelIdDefinitions[modelId]
    if (!modelParams) throw new Error(`Unknown modelId ${modelId} for TextEmbeddingsInference`)
    return modelParams
  }
}

export default TextEmbeddingsInference
