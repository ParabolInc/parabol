import {AbstractModel} from './AbstractModel'

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

export abstract class AbstractGenerationModel extends AbstractModel {
  readonly maxInputTokens: number
  constructor(modelId: string, url: string) {
    super(url)
    const modelParams = this.constructModelParams(modelId)
    this.maxInputTokens = modelParams.maxInputTokens
  }

  protected abstract constructModelParams(modelId: string): GenerationModelParams
  abstract summarize(content: string, options: GenerationOptions): Promise<string>
}
