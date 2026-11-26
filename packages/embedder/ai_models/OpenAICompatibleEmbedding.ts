import {setTimeout as wait} from 'node:timers/promises'
import {Tiktoken} from 'js-tiktoken/lite'
import cl100kBase from 'js-tiktoken/ranks/cl100k_base'
import OpenAI, {type APIError} from 'openai'
import {embeddingUsage} from '../embeddingUsage'
import {AbstractEmbeddingsModel, type EmbeddingModelParams} from './AbstractEmbeddingsModel'
import {type ModelId, modelIdDefinitions} from './modelIdDefinitions'

const OPERATION_TIMEOUT_MS = 25_000
const MAX_ATTEMPTS = 3

const retryDelay = (error: APIError, attempt: number) => {
  const milliseconds = error.headers?.get('retry-after-ms')
  const secondsOrDate = error.headers?.get('retry-after')
  const delay = milliseconds
    ? Number(milliseconds)
    : secondsOrDate
      ? Number.isFinite(Number(secondsOrDate))
        ? Number(secondsOrDate) * 1000
        : Date.parse(secondsOrDate) - Date.now()
      : NaN
  return Number.isFinite(delay) && delay >= 0
    ? Math.min(delay, OPERATION_TIMEOUT_MS)
    : 500 * 2 ** attempt
}

export default class OpenAICompatibleEmbedding extends AbstractEmbeddingsModel {
  readonly client: OpenAI
  private readonly apiModel: string
  private tokenizer?: Tiktoken
  isReady = true

  constructor(modelId: ModelId, url: string, maxTokens: number, apiModel: string = modelId) {
    super(modelId, url, maxTokens)
    if (!Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > 8192) {
      throw new Error('OpenAI embeddings maxTokens must be an integer between 1 and 8192')
    }
    const apiKey = process.env.OPEN_AI_API_KEY || process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OpenAI embeddings require OPEN_AI_API_KEY or OPENAI_API_KEY')
    const baseURL = url || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    const endpoint = URL.parse(baseURL)
    if (
      !endpoint ||
      !['https:', 'http:'].includes(endpoint.protocol) ||
      endpoint.username ||
      endpoint.password ||
      endpoint.search ||
      endpoint.hash
    ) {
      throw new Error('Invalid OpenAI embeddings base URL')
    }
    this.apiModel = apiModel
    this.client = new OpenAI({
      apiKey,
      baseURL,
      maxRetries: 0,
      timeout: OPERATION_TIMEOUT_MS,
      fetchOptions: {redirect: 'error'},
      logLevel: 'off'
    })
  }

  async ready() {
    return true
  }

  async getTokens(content: string) {
    this.tokenizer ??= new Tiktoken(cl100kBase)
    return this.tokenizer.encode(content, [], [])
  }

  async getEmbeddingWithTokens(
    content: string
  ): Promise<{embedding: number[]; tokens: number} | Error> {
    if (!content.trim()) return new Error('Cannot embed blank text')
    if ((await this.getTokens(content)).length > this.maxInputTokens)
      return new Error('OpenAI embedding input exceeds maxTokens')
    const signal = AbortSignal.timeout(OPERATION_TIMEOUT_MS)
    // Keep the operation deadline attached to fetch while the SDK reads the response body.
    const client = this.client.withOptions({
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          signal: AbortSignal.any(init?.signal ? [signal, init.signal] : [signal])
        })
    })
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const {data, usage} = await client.embeddings.create(
          {
            model: this.apiModel,
            input: content,
            dimensions: this.embeddingDimensions,
            encoding_format: 'float'
          },
          {signal}
        )
        const embedding = data[0]?.embedding
        if (
          data.length !== 1 ||
          data[0]?.index !== 0 ||
          !Array.isArray(embedding) ||
          embedding.length !== this.embeddingDimensions ||
          !embedding.every(Number.isFinite) ||
          !embedding.some((value) => value !== 0)
        ) {
          return new Error('OpenAI embeddings returned an invalid vector')
        }
        const reportedTokens = usage?.prompt_tokens
        const tokens =
          Number.isSafeInteger(reportedTokens) && reportedTokens >= 0 ? reportedTokens : 0
        embeddingUsage.tokens += tokens
        return {embedding, tokens}
      } catch (error) {
        if (signal.aborted || attempt === MAX_ATTEMPTS - 1) break
        const retryable =
          error instanceof OpenAI.APIConnectionError ||
          (error instanceof OpenAI.APIError &&
            error.status !== undefined &&
            ([408, 409, 429].includes(error.status) || error.status >= 500))
        if (!retryable) break
        try {
          await wait(
            error instanceof OpenAI.APIError ? retryDelay(error, attempt) : 500 * 2 ** attempt,
            undefined,
            {signal}
          )
        } catch {
          break
        }
      }
    }
    return new Error('OpenAI embeddings request failed')
  }

  protected constructModelParams(modelId: ModelId): EmbeddingModelParams {
    if (modelId !== 'text-embedding-3-small') throw new Error('Unsupported OpenAI embedding model')
    return modelIdDefinitions[modelId]
  }
}
