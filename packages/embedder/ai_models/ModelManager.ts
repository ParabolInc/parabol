import {Kysely, sql} from 'kysely'

import {
  AbstractEmbeddingsModel,
  AbstractSummerizerModel,
  EmbeddingModelConfig,
  SummarizationModelConfig,
  ModelConfig
} from './abstractModel'
import TextEmbeddingsInterface from './TextEmbeddingsInterface'
import TextGenerationInterfaceSummarizer from './TextGenerationInterfaceSummarizer'

interface EnvConfig {
  embeddingModels: EmbeddingModelConfig[]
  summarizationModels: SummarizationModelConfig[]
}

export enum EmbeddingsModelTypes {
  TextEmbeddingsInterface = 'text-embeddings-inference'
}
export function isValidEmbeddingsModelType(type: any): type is EmbeddingsModelTypes {
  return Object.values(EmbeddingsModelTypes).includes(type)
}

export enum SummarizationModelTypes {
  TextGenerationInterface = 'text-generation-interface'
}
export function isValidSummarizationModelType(type: any): type is SummarizationModelTypes {
  return Object.values(SummarizationModelTypes).includes(type)
}

export class ModelManager {
  private embeddingModels: AbstractEmbeddingsModel[]
  private summarizationModels: AbstractSummerizerModel[]

  private validateEnvConfig(envConfig: any): EnvConfig {
    if (!envConfig.embeddingModels || !Array.isArray(envConfig.embeddingModels)) {
      throw new Error('Invalid configuration: embedding_models is missing or not an array')
    }
    if (!envConfig.summarizationModels || !Array.isArray(envConfig.summarizationModels)) {
      throw new Error('Invalid configuration: summarization_models is missing or not an array')
    }

    envConfig.embeddingModels.forEach((model: ModelConfig) => {
      this.validateEmbeddingModelConfig(model)
    })

    envConfig.summarizationModels.forEach((model: ModelConfig) => {
      this.validateSummarizationModelConfig(model)
    })

    return envConfig
  }

  private validateModelConfig(model: ModelConfig, requireTableSuffix = false) {
    if (typeof model.model !== 'string') {
      throw new Error('Invalid ModelConfig: model field should be a string')
    }
    if (typeof model.priority !== 'number') {
      throw new Error('Invalid ModelConfig: priority field should be a number')
    }
    if (typeof model.maxInputTokens !== 'number') {
      throw new Error('Invalid ModelConfig: maxInputTokens field should be a number')
    }
    if (
      requireTableSuffix &&
      model.tableSuffix !== undefined &&
      typeof model.tableSuffix !== 'string'
    ) {
      throw new Error('Invalid ModelConfig: tableSuffix field should be a string')
    }
    if (model.url !== undefined && typeof model.url !== 'string') {
      throw new Error('Invalid ModelConfig: url field should be a string')
    }
  }

  private validateEmbeddingModelConfig(model: ModelConfig): model is EmbeddingModelConfig {
    this.validateModelConfig(model, true)
    return true
  }

  private validateSummarizationModelConfig(model: ModelConfig): model is SummarizationModelConfig {
    this.validateModelConfig(model, false)
    return true
  }

  constructor(envConfig: EnvConfig) {
    // Validate configuration
    this.validateEnvConfig(envConfig)
    // Initialize embeddings models
    this.embeddingModels = []
    const embeddingsModelConfigs = envConfig.embeddingModels.sort((a, b) => a.priority - b.priority)
    embeddingsModelConfigs.forEach(async (modelConfig) => {
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
    this.summarizationModels = []
    const summarizationModelConfigs = envConfig.summarizationModels.sort(
      (a, b) => a.priority - b.priority
    )
    summarizationModelConfigs.forEach(async (modelConfig) => {
      const modelType = modelConfig.model.split(':')[0]

      if (!isValidSummarizationModelType(modelType))
        throw new Error(`unsupported summarization model '${modelType}'`)

      switch (modelType) {
        case 'text-generation-interface':
          const summarizer = new TextGenerationInterfaceSummarizer(modelConfig)
          this.summarizationModels.push(summarizer)
          break
      }
    })
  }

  async createEmbeddingsTables(pg: Kysely<any>) {
    for (const embeddingsModel of this.getEmbeddingsModelsIter()) {
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
        "embeddingsIndexId" INTEGER NOT NULL,
        FOREIGN KEY ("embeddingsIndexId")
          REFERENCES "EmbeddingsIndex"("id")
          ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "idx_${sql.raw(tableName)}_embedding_vector_cosign_ops"
        ON ${sql.id(tableName)}
        USING hnsw ("embedding" vector_cosine_ops);
      END $$;
      `
      console.log(`query: ${query.compile(pg).sql}`)
      await query.execute(pg)
    }
  }

  // returns the highest priority summarizer instance
  getSummarizer() {
    if (!this.summarizationModels.length) throw new Error('no summarizer initialzed')
    return this.summarizationModels[0]
  }

  getEmbeddingsModelsIter() {
    return this.embeddingModels[Symbol.iterator]()
  }
}

let modelManager: ModelManager | undefined
export function getModelManager() {
  if (!modelManager) {
    const {AI_MODELS} = process.env
    if (AI_MODELS) {
      let aiModels
      try {
        aiModels = JSON.parse(AI_MODELS)
      } catch (e) {
        throw new Error(`Invalid AI_MODELS configuration: ${e}`)
      }
      if (!aiModels || !aiModels.config) return

      modelManager = new ModelManager(aiModels.config)
    }
  }
  return modelManager
}

export default getModelManager
