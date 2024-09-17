import {AbstractEmbeddingsModel, EmbeddingsTableName} from './AbstractEmbeddingsModel'
import {AbstractGenerationModel} from './AbstractGenerationModel'
import OpenAIGeneration from './OpenAIGeneration'
import TextEmbeddingsInference from './TextEmbeddingsInference'
import TextGenerationInference from './TextGenerationInference'

type EmbeddingsModelType = 'text-embeddings-inference'
type GenerationModelType = 'openai' | 'text-generation-inference'

export interface ModelConfig {
  model: `${EmbeddingsModelType | GenerationModelType}:${string}`
  url: string
}

export class ModelManager {
  embeddingModels: Map<EmbeddingsTableName, AbstractEmbeddingsModel>
  generationModels: Map<string, AbstractGenerationModel>
  getEmbedder(tableName?: EmbeddingsTableName): AbstractEmbeddingsModel {
    return tableName
      ? this.embeddingModels.get(tableName)!
      : this.embeddingModels.values().next().value!
  }

  private parseModelEnvVars(envVar: 'AI_EMBEDDING_MODELS' | 'AI_GENERATION_MODELS'): ModelConfig[] {
    const envValue = process.env[envVar]
    if (!envValue) return []
    let models
    try {
      models = JSON.parse(envValue)
    } catch (e) {
      throw new Error(`Invalid Env Var: ${envVar}. Must be a valid JSON`)
    }

    if (!Array.isArray(models)) {
      throw new Error(`Invalid Env Var: ${envVar}. Must be an array`)
    }
    const properties = ['model', 'url']
    models.forEach((model, idx) => {
      properties.forEach((prop) => {
        if (typeof model[prop] !== 'string') {
          throw new Error(`Invalid Env Var: ${envVar}. Invalid "${prop}" at index ${idx}`)
        }
      })
    })
    return models
  }

  constructor() {
    // Initialize embeddings models
    const embeddingConfig = this.parseModelEnvVars('AI_EMBEDDING_MODELS')
    this.embeddingModels = new Map(
      embeddingConfig.map((modelConfig) => {
        const {model, url} = modelConfig
        const [modelType, modelId] = model.split(':') as [EmbeddingsModelType, string]
        switch (modelType) {
          case 'text-embeddings-inference': {
            const embeddingsModel = new TextEmbeddingsInference(modelId, url)
            return [embeddingsModel.tableName, embeddingsModel]
          }
          default:
            throw new Error(`unsupported embeddings model '${modelType}'`)
        }
      })
    )

    // Initialize generation models
    const generationConfig = this.parseModelEnvVars('AI_GENERATION_MODELS')
    this.generationModels = new Map<string, AbstractGenerationModel>(
      generationConfig.map((modelConfig) => {
        const {model, url} = modelConfig
        const [modelType, modelId] = model.split(':') as [GenerationModelType, string]
        switch (modelType) {
          case 'openai': {
            return [modelId, new OpenAIGeneration(modelId, url)]
          }
          case 'text-generation-inference': {
            return [modelId, new TextGenerationInference(modelId, url)]
          }
          default:
            throw new Error(`unsupported generation model '${modelType}'`)
        }
      })
    )
  }

  async maybeCreateTables() {
    return Promise.all([...this.embeddingModels].map(([, model]) => model.createTable()))
  }
}

let modelManager: ModelManager | undefined
export function getModelManager() {
  if (!modelManager) {
    modelManager = new ModelManager()
  }
  return modelManager
}

export default getModelManager
