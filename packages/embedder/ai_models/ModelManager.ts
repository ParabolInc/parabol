import type {EmbeddingsTableName} from '../getEmbeddingsTableName'
import type {AbstractEmbeddingsModel} from './AbstractEmbeddingsModel'
import type {AbstractGenerationModel} from './AbstractGenerationModel'
import OpenAIEmbedding from './OpenAIEmbedding'
import OpenAIGeneration from './OpenAIGeneration'
import {
  type EmbeddingsModelType,
  type GenerationModelType,
  parseModelEnvVars
} from './parseModelEnvVars'
import TextEmbeddingsInference from './TextEmbeddingsInference'
import TextGenerationInference from './TextGenerationInference'

export class ModelManager {
  embeddingModels: Map<EmbeddingsTableName, AbstractEmbeddingsModel>
  generationModels: Map<string, AbstractGenerationModel>
  getEmbedder(tableName?: EmbeddingsTableName): AbstractEmbeddingsModel {
    return tableName
      ? this.embeddingModels.get(tableName)!
      : this.embeddingModels.values().next().value!
  }

  constructor() {
    // Initialize embeddings models
    const embeddingConfig = parseModelEnvVars('AI_EMBEDDING_MODELS')
    this.embeddingModels = new Map(
      embeddingConfig.map((modelConfig) => {
        const {model, url} = modelConfig
        const [modelType, modelId] = model.split(':') as [EmbeddingsModelType, string]
        switch (modelType) {
          case 'text-embeddings-inference': {
            const embeddingsModel = new TextEmbeddingsInference(modelId, url)
            return [embeddingsModel.tableName, embeddingsModel] as [
              EmbeddingsTableName,
              AbstractEmbeddingsModel
            ]
          }
          case 'vllm': {
            const openAIModel = new OpenAIEmbedding(modelId, url)
            return [openAIModel.tableName, openAIModel] as [
              EmbeddingsTableName,
              AbstractEmbeddingsModel
            ]
          }
          default:
            throw new Error(`unsupported embeddings model '${modelType}'`)
        }
      })
    )

    // Initialize generation models
    const generationConfig = parseModelEnvVars('AI_GENERATION_MODELS')
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
