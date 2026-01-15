import type {DB} from '../server/postgres/types/pg'
import {activeEmbeddingModelId} from './activeEmbeddingModel'
import {type ModelId, modelIdDefinitions} from './ai_models/modelIdDefinitions'

export type EmbeddingsTableName = `Embeddings_${string}`
export type EmbeddingsPagesTableName = `EmbeddingsPages_${string}`
export type EmbeddingsTable = Extract<keyof DB, EmbeddingsTableName>
export type EmbeddingsPagesTable = Extract<keyof DB, EmbeddingsPagesTableName>

export const getEmbeddingsTableName = (modelId?: ModelId | null) => {
  const safeModelId = modelId ?? activeEmbeddingModelId
  const definition = modelIdDefinitions[safeModelId!]
  return (definition ? `Embeddings_${definition.tableSuffix}` : '') as EmbeddingsTable
}

export const getEmbeddingsPagesTableName = (modelId?: ModelId | null) => {
  if (!modelId) return null
  const definition = modelIdDefinitions[modelId]
  if (!definition) return null
  return `EmbeddingsPages_${definition.tableSuffix}` as EmbeddingsPagesTable
}
