import OpenAI from 'openai'
import {AbstractEmbeddingsModel, type EmbeddingModelParams} from './AbstractEmbeddingsModel'

const modelIdDefinitions = {
  'Qwen/Qwen3-Embedding-0.6B': {
    embeddingDimensions: 1024,
    maxInputTokens: 32768,
    tableSuffix: 'qwen3_600M',
    languages: [
      'af',
      'am',
      'ar',
      'as',
      'az',
      'be',
      'bg',
      'bn',
      'bo',
      'bs',
      'ca',
      'cs',
      'cy',
      'da',
      'de',
      'el',
      'en',
      'es',
      'et',
      'eu',
      'fa',
      'fi',
      'fo',
      'fr',
      'ga',
      'gd',
      'gl',
      'gu',
      'he',
      'hi',
      'hr',
      'ht',
      'hu',
      'hy',
      'id',
      'is',
      'it',
      'ja',
      'jv',
      'ka',
      'kk',
      'km',
      'kn',
      'ko',
      'lo',
      'lt',
      'lv',
      'mk',
      'ml',
      'mn',
      'mr',
      'ms',
      'mt',
      'my',
      'nb',
      'ne',
      'nl',
      'nn',
      'or',
      'pa',
      'pl',
      'ps',
      'pt',
      'ro',
      'ru',
      'sd',
      'si',
      'sk',
      'sl',
      'sq',
      'sr',
      'su',
      'sv',
      'sw',
      'ta',
      'te',
      'tg',
      'th',
      'tl',
      'tr',
      'tt',
      'uk',
      'ur',
      'uz',
      'vi',
      'zh'
    ]
  }
} satisfies Record<string, EmbeddingModelParams>

type ModelId = keyof typeof modelIdDefinitions

export class OpenAIEmbedding extends AbstractEmbeddingsModel {
  client: OpenAI
  url: string
  modelId: ModelId
  constructor(modelId: string, url: string) {
    super(modelId, url)
    this.url = url
    this.modelId = modelId as ModelId
    this.client = new OpenAI({
      apiKey: 'vllm',
      baseURL: url
    })
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
    const {data} = await this.client.embeddings.create({
      input: content,
      model: this.modelId
    })
    return data[0]?.embedding ?? []
  }

  protected constructModelParams(modelId: string): EmbeddingModelParams {
    const modelParams = modelIdDefinitions[modelId as keyof typeof modelIdDefinitions]
    if (!modelParams) throw new Error(`Unknown modelId ${modelId} for OpenAIEmbedding`)
    return modelParams
  }
}

export default OpenAIEmbedding
