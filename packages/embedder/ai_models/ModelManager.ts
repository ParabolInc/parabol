import {Kysely, sql} from 'kysely'

import {
  AbstractEmbeddingsModel,
  AbstractGenerationModel,
  EmbeddingModelConfig,
  GenerationModelConfig,
  ModelConfig
} from './AbstractModel'
import TextEmbeddingsInterface from './TextEmbeddingsInterface'
import TextGenerationInterface from './TextGenerationInterface'

interface ModelManagerConfig {
  embeddingModels: EmbeddingModelConfig[]
  generationModels: GenerationModelConfig[]
}

export type EmbeddingsModelTypes = 'text-embeddings-inference'

function isValid<T extends string>(type: T, validValues: T[]): type is T {
  return validValues.includes(type)
}

export function isValidEmbeddingsModelType(object: any) {
  return isValid<EmbeddingsModelTypes>(object, ['text-embeddings-inference'])
}

export type SummarizationModelTypes = 'text-generation-interface'

export function isValidSummarizationModelType(object: any) {
  return isValid<SummarizationModelTypes>(object, ['text-generation-interface'])
}

export class ModelManager {
  private embeddingModels: AbstractEmbeddingsModel[]
  private generationModels: AbstractGenerationModel[]

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
    this.embeddingModels = []
    config.embeddingModels.forEach(async (modelConfig) => {
      const modelType = modelConfig.model.split(':')[0]

      if (!isValidEmbeddingsModelType(modelType))
        throw new Error(`unsupported embeddings model '${modelType}'`)

      switch (modelType) {
        case 'text-embeddings-inference':
          const embeddingsModel = new TextEmbeddingsInterface(modelConfig)
          this.embeddingModels.push(embeddingsModel)
          break
      }
    })

    // Initialize summarization models
    this.generationModels = []
    config.generationModels.forEach(async (modelConfig) => {
      const modelType = modelConfig.model.split(':')[0]

      if (!isValidSummarizationModelType(modelType))
        throw new Error(`unsupported summarization model '${modelType}'`)

      switch (modelType) {
        case 'text-generation-interface':
          const generator = new TextGenerationInterface(modelConfig)
          this.generationModels.push(generator)
          break
      }
    })
  }

  async maybeCreateTables(pg: Kysely<any>) {
    for (const embeddingsModel of this.getEmbeddingModelsIter()) {
      const tableName = embeddingsModel.getTableName()
      const hasTable = await (async () => {
        const query = sql<number[]>`SELECT 1 FROM ${sql.id(
          'pg_catalog',
          'pg_tables'
        )} WHERE ${sql.id('tablename')} = ${tableName}`
        const result = await query.execute(pg)
        return result.rows.length > 0
      })()
      if (hasTable) continue
      const vectorDimensions = embeddingsModel.getModelParams().embeddingDimensions
      console.log(`ModelManager: creating ${tableName} with ${vectorDimensions} dimensions`)
      const query = sql`
      DO $$
      BEGIN
      CREATE TABLE IF NOT EXISTS ${sql.id(tableName)} (
        "id" SERIAL PRIMARY KEY,
        "embedText" TEXT,
        "embedding" vector(${sql.raw(vectorDimensions.toString())}),
        "embeddingsMetadataId" INTEGER NOT NULL,
        FOREIGN KEY ("embeddingsMetadataId")
          REFERENCES "EmbeddingsMetadata"("id")
          ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "idx_${sql.raw(tableName)}_embedding_vector_cosign_ops"
        ON ${sql.id(tableName)}
        USING hnsw ("embedding" vector_cosine_ops);
      END $$;
      `
      await query.execute(pg)
    }
  }

  // returns the highest priority summarizer instance
  getFirstGenerator() {
    if (!this.generationModels.length) throw new Error('no generator model initialzed')
    return this.generationModels[0]
  }

  getFirstEmbedder() {
    if (!this.embeddingModels.length) throw new Error('no embedder model initialzed')
    return this.embeddingModels[0]
  }

  getEmbeddingModelsIter() {
    return this.embeddingModels[Symbol.iterator]()
  }
}

let modelManager: ModelManager | undefined
export function getModelManager() {
  if (modelManager) return modelManager
  const {AI_EMBEDDING_MODELS, AI_GENERATION_MODELS} = process.env
  let config: ModelManagerConfig = {
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
    throw new Error(`Invalid AI_EMBEDDING_MODELS .env JSON: ${e}`)
  }

  modelManager = new ModelManager(config)

  return modelManager
}

export default getModelManager
