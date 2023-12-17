import {Kysely, sql} from 'kysely'
import getKysely from 'parabol-server/postgres/getKysely'

import {AbstractEmbeddingsModel, AbstractSummerizerModel} from './abstractModel'
import TextEmbeddingsInterface from './TextEmbeddingsInterface'
import TextGenerationInterfaceSummarizer from './TextGenerationInterfaceSummarizer'
import {table} from 'console'
import {string} from 'yargs'

export enum EmbeddingsModelTypes {
  TextEmbeddingsInterface = 'text-embeddings-inference'
}

function isValidEmbeddingsModelType(type: any): type is EmbeddingsModelTypes {
  return Object.values(EmbeddingsModelTypes).includes(type)
}

export enum SummarizationModelTypes {
  TextGenerationInterface = 'text-generation-interface'
}

function isValidSummarizationModelType(type: any): type is SummarizationModelTypes {
  return Object.values(SummarizationModelTypes).includes(type)
}

export interface ModelConfig {
  model: string
  priority: number
  maxInputTokens: number
  tableSuffix?: string
  url?: string
}

export interface EmbeddingModelConfig extends ModelConfig {
  tableSuffix: string
}

export interface SummarizationModelConfig extends ModelConfig {}

interface EnvConfig {
  embeddingModels: EmbeddingModelConfig[]
  summarizationModels: SummarizationModelConfig[]
}

class ModelManager {
  private embeddingModels: AbstractEmbeddingsModel[]
  private summarizationModels: AbstractSummerizerModel[]

  static validateEnvConfig(envConfig: any): EnvConfig {
    if (!envConfig.embeddingModels || !Array.isArray(envConfig.embeddingModels)) {
      throw new Error('Invalid configuration: embedding_models is missing or not an array')
    }
    if (!envConfig.summarizationModels || !Array.isArray(envConfig.summarizationModels)) {
      throw new Error('Invalid configuration: summarization_models is missing or not an array')
    }

    envConfig.embeddingModels.forEach((model: ModelConfig) => {
      ModelManager.validateEmbeddingModelConfig(model)
    })

    envConfig.summarizationModels.forEach((model: ModelConfig) => {
      ModelManager.validateSummarizationModelConfig(model)
    })

    return envConfig
  }

  private static validateModelConfig(model: ModelConfig, requireTableSuffix = false) {
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

  private static validateEmbeddingModelConfig(model: ModelConfig): model is EmbeddingModelConfig {
    ModelManager.validateModelConfig(model, true)
    return true
  }

  private static validateSummarizationModelConfig(
    model: ModelConfig
  ): model is SummarizationModelConfig {
    ModelManager.validateModelConfig(model, false)
    return true
  }

  constructor(envConfig: EnvConfig) {
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
    for (const embeddingsModel of this.getAllEmbeddingsModels()) {
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

  getAllEmbeddingsModels() {
    return this.embeddingModels[Symbol.iterator]()
  }
}

export default ModelManager
