import path from 'path'
import getProjectRoot from '../../../scripts/webpack/utils/getProjectRoot'
import {ModelConfig, EmbeddingModelConfig, SummarizationModelConfig} from './ModelManager'

export {EmbeddingModelConfig, SummarizationModelConfig}

export abstract class AbstractModel {
  public readonly modelConfigString: string
  public readonly priority: number
  public readonly maxInputTokens: number
  public readonly tableSuffix?: string
  public readonly url?: string

  public readonly embedderRoot: string

  public modelInstance: any

  constructor(config: ModelConfig) {
    this.modelConfigString = config.model
    this.priority = config.priority
    this.maxInputTokens = config.maxInputTokens
    this.tableSuffix = config.tableSuffix
    this.url = this.normalizeUrl(config.url)

    this.embedderRoot = path.join(getProjectRoot() as string, 'packages', 'server', 'embedder')
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
}

export abstract class AbstractEmbeddingsModel extends AbstractModel {
  private readonly tableName: string
  constructor(config: EmbeddingModelConfig) {
    super(config)
    this.tableName = `Embeddings_${this.tableSuffix}`
  }
  getTableName() {
    return this.tableName
  }
  abstract getEmbeddings(content: string): Promise<number[]>
  abstract getModelParams(): EmbeddingModelParams
}

export abstract class AbstractSummerizerModel extends AbstractModel {
  constructor(config: SummarizationModelConfig) {
    super(config)
  }

  abstract summarize(content: string, temperature: number, maxTokens: number): Promise<string>
}

export default AbstractModel
