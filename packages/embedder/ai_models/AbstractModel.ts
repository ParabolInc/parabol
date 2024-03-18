export interface ModelConfig {
  model: string
  url: string
}

export interface EmbeddingModelConfig extends ModelConfig {
  tableSuffix: string
}

export interface GenerationModelConfig extends ModelConfig {}

export abstract class AbstractModel {
  public readonly url?: string

  constructor(config: ModelConfig) {
    this.url = this.normalizeUrl(config.url)
  }

  // removes a trailing slash from the inputUrl
  private normalizeUrl(inputUrl: string | undefined) {
    if (!inputUrl) return undefined
    const regex = /[/]+$/
    return inputUrl.replace(regex, '')
  }
}

export interface EmbeddingModelParams {
  embeddingDimensions: number
  maxInputTokens: number
  tableSuffix: string
}

export abstract class AbstractEmbeddingsModel extends AbstractModel {
  readonly embeddingDimensions: number
  readonly maxInputTokens: number
  readonly tableName: string
  constructor(config: EmbeddingModelConfig) {
    super(config)
    const modelParams = this.constructModelParams(config)
    this.embeddingDimensions = modelParams.embeddingDimensions
    this.maxInputTokens = modelParams.maxInputTokens
    this.tableName = `Embeddings_${modelParams.tableSuffix}`
  }
  protected abstract constructModelParams(config: EmbeddingModelConfig): EmbeddingModelParams
  abstract getEmbedding(content: string): Promise<number[]>
}

export interface GenerationModelParams {
  maxInputTokens: number
}

export interface GenerationOptions {
  maxNewTokens?: number
  seed?: number
  stop?: string
  temperature?: number
  topK?: number
  topP?: number
}

export abstract class AbstractGenerationModel extends AbstractModel {
  readonly maxInputTokens: number
  constructor(config: GenerationModelConfig) {
    super(config)
    const modelParams = this.constructModelParams(config)
    this.maxInputTokens = modelParams.maxInputTokens
  }

  protected abstract constructModelParams(config: GenerationModelConfig): GenerationModelParams
  abstract summarize(content: string, options: GenerationOptions): Promise<string>
}

export default AbstractModel
