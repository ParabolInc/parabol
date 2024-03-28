import {sql} from 'kysely'
import getKysely from 'parabol-server/postgres/getKysely'
import {AbstractEmbeddingsModel, EmbeddingModelConfig} from './AbstractEmbeddingsModel'
import {AbstractGenerationModel, GenerationModelConfig} from './AbstractGenerationModel'
import {ModelConfig} from './AbstractModel'
import OpenAIGeneration from './OpenAIGeneration'
import TextEmbeddingsInference from './TextEmbeddingsInference'
import TextGenerationInference from './TextGenerationInference'

interface ModelManagerConfig {
  embeddingModels: EmbeddingModelConfig[]
  generationModels: GenerationModelConfig[]
}

type EmbeddingsModelType = 'text-embeddings-inference'
type GenerationModelType = 'openai' | 'text-generation-inference'

export class ModelManager {
  embeddingModels: AbstractEmbeddingsModel[]
  embeddingModelsMapByTable: {[key: string]: AbstractEmbeddingsModel}
  generationModels: AbstractGenerationModel[]

  private isValidConfig(
    maybeConfig: Partial<ModelManagerConfig>
  ): maybeConfig is ModelManagerConfig {
    if (!maybeConfig.embeddingModels || !Array.isArray(maybeConfig.embeddingModels)) {
      throw new Error('Invalid configuration: embedding_models is missing or not an array')
    }
    if (!maybeConfig.generationModels || !Array.isArray(maybeConfig.generationModels)) {
      throw new Error('Invalid configuration: summarization_models is missing or not an array')
    }

    maybeConfig.embeddingModels.forEach((model: ModelConfig) => {
      this.isValidModelConfig(model)
    })

    maybeConfig.generationModels.forEach((model: ModelConfig) => {
      this.isValidModelConfig(model)
    })

    return true
  }

  private isValidModelConfig(model: ModelConfig): model is ModelConfig {
    if (typeof model.model !== 'string') {
      throw new Error('Invalid ModelConfig: model field should be a string')
    }
    if (model.url !== undefined && typeof model.url !== 'string') {
      throw new Error('Invalid ModelConfig: url field should be a string')
    }

    return true
  }

  constructor(config: ModelManagerConfig) {
    // Validate configuration
    this.isValidConfig(config)

    // Initialize embeddings models
    this.embeddingModelsMapByTable = {}
    this.embeddingModels = config.embeddingModels.map((modelConfig) => {
      const [modelType] = modelConfig.model.split(':') as [EmbeddingsModelType, string]

      switch (modelType) {
        case 'text-embeddings-inference': {
          const embeddingsModel = new TextEmbeddingsInference(modelConfig)
          this.embeddingModelsMapByTable[embeddingsModel.tableName] = embeddingsModel
          return embeddingsModel
        }
        default:
          throw new Error(`unsupported embeddings model '${modelType}'`)
      }
    })

    // Initialize summarization models
    this.generationModels = config.generationModels.map((modelConfig) => {
      const [modelType, _] = modelConfig.model.split(':') as [GenerationModelType, string]

      switch (modelType) {
        case 'openai': {
          return new OpenAIGeneration(modelConfig)
        }
        case 'text-generation-inference': {
          return new TextGenerationInference(modelConfig)
        }
        default:
          throw new Error(`unsupported summarization model '${modelType}'`)
      }
    })
  }

  async maybeCreateTables() {
    return Promise.all(this.embeddingModels.map((model) => model.createTable()))
  }
}

let modelManager: ModelManager | undefined
export function getModelManager() {
  if (modelManager) return modelManager
  const {AI_EMBEDDING_MODELS, AI_GENERATION_MODELS} = process.env
  const config: ModelManagerConfig = {
    embeddingModels: [],
    generationModels: []
  }
  try {
    config.embeddingModels = AI_EMBEDDING_MODELS && JSON.parse(AI_EMBEDDING_MODELS)
  } catch (e) {
    throw new Error(`Invalid AI_EMBEDDING_MODELS .env JSON: ${e}`)
  }
  try {
    config.generationModels = AI_GENERATION_MODELS && JSON.parse(AI_GENERATION_MODELS)
  } catch (e) {
    throw new Error(`Invalid AI_GENERATION_MODELS .env JSON: ${e}`)
  }

  modelManager = new ModelManager(config)

  return modelManager
}

export default getModelManager
