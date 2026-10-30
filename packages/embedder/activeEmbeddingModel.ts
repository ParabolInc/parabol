import type {EmbeddingModelParams} from './ai_models/AbstractEmbeddingsModel'
import {type ModelId, modelIdDefinitions} from './ai_models/modelIdDefinitions'
import {type EmbeddingsModelType, parseModelEnvVars} from './ai_models/parseModelEnvVars'

// The goal here is to have a string constant of the table name available to the server
// Without importing all the abstract model classes

const configuredModelIds = parseModelEnvVars('AI_EMBEDDING_MODELS').map(({model}) => {
  const [, modelId] = model.split(':') as [EmbeddingsModelType, ModelId]
  return modelId
})
export const activeEmbeddingModelId = configuredModelIds[0] ?? null
export const embeddingModelIds = [...new Set(configuredModelIds)].filter(
  (modelId) => modelId in modelIdDefinitions
)
export const activeEmbeddingDefinition: EmbeddingModelParams | undefined = activeEmbeddingModelId
  ? modelIdDefinitions[activeEmbeddingModelId]
  : undefined
