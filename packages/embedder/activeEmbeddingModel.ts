import {type ModelId, modelIdDefinitions} from './ai_models/modelIdDefinitions'
import {type EmbeddingsModelType, parseModelEnvVars} from './ai_models/parseModelEnvVars'

// The goal here is to have a string constant of the table name available to the server
// Without importing all the abstract model classes

const embeddingModelIds = parseModelEnvVars('AI_EMBEDDING_MODELS').map(({model}) => {
  const [, modelId] = model.split(':') as [EmbeddingsModelType, ModelId]
  return modelId
})
export const activeEmbeddingModelId = embeddingModelIds[0] ?? null
export const inactiveEmbeddingModelIds = embeddingModelIds.slice(1)
export const activeEmbeddingDefinition = activeEmbeddingModelId
  ? modelIdDefinitions[activeEmbeddingModelId]
  : undefined
