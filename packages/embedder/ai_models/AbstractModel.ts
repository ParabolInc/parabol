export interface ModelConfig {
  model: string
  url?: string
}

export interface EmbeddingModelConfig extends ModelConfig {
  tableSuffix: string
}

export interface GenerationModelConfig extends ModelConfig {}

export abstract class AbstractModel {
  public readonly url?: string
  public modelInstance: any

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
  readonly modelParams!: EmbeddingModelParams
  readonly tableName: string
  constructor(config: EmbeddingModelConfig) {
    super(config)
    this.modelParams = this.constructModelParams(config)
    this.tableName = `Embeddings_${this.modelParams.tableSuffix}`
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
  truncate?: boolean
}

export abstract class AbstractGenerationModel extends AbstractModel {
  readonly modelParams!: GenerationModelParams
  constructor(config: GenerationModelConfig) {
    super(config)
    this.modelParams = this.constructModelParams(config)
  }

  protected abstract constructModelParams(config: GenerationModelConfig): GenerationModelParams
  abstract summarize(content: string, options: GenerationOptions): Promise<string>
}

export default AbstractModel
