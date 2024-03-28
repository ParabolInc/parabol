import {AbstractModel, ModelConfig} from './AbstractModel'

export interface GenerationOptions {
  maxNewTokens?: number
  seed?: number
  stop?: string
  temperature?: number
  topK?: number
  topP?: number
}
export interface GenerationModelParams {
  maxInputTokens: number
}
export interface GenerationModelConfig extends ModelConfig {}

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
