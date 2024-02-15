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
  protected modelParams!: EmbeddingModelParams
  private readonly tableName: string
  constructor(config: EmbeddingModelConfig) {
    super(config)
    this.modelParams = this.constructModelParams(config)
    this.tableName = `Embeddings_${this.getModelParams().tableSuffix}`
  }
  getTableName() {
    return this.tableName
  }
  protected abstract constructModelParams(config: EmbeddingModelConfig): EmbeddingModelParams
  getModelParams() {
    return this.modelParams
  }
  abstract getEmbedding(content: string): Promise<number[]>
}

export interface GenerationModelParams {
  maxInputTokens: number
}

export abstract class AbstractGenerationModel extends AbstractModel {
  protected modelParams!: GenerationModelParams
  constructor(config: GenerationModelConfig) {
    super(config)
    this.modelParams = this.constructModelParams(config)
  }

  protected abstract constructModelParams(config: GenerationModelConfig): GenerationModelParams
  getModelParams() {
    return this.modelParams
  }
  abstract summarize(content: string, temperature: number, maxTokens: number): Promise<string>
}

export default AbstractModel
