import {type ModelId} from './ai_models/modelIdDefinitions'
import {type EmbeddingsModelType, parseModelEnvVars} from './ai_models/parseModelEnvVars'

// The goal here is to have a string constant of the table name available to the server
// Without importing all the abstract model classes

const getFirstModelId = () => {
  const embeddingConfig = parseModelEnvVars('AI_EMBEDDING_MODELS')
  const firstEmbeddingConfig = embeddingConfig[0]
  if (!firstEmbeddingConfig) return null
  const {model} = firstEmbeddingConfig
  const [, modelId] = model.split(':') as [EmbeddingsModelType, ModelId]
  return modelId
}
export const activeEmbeddingModelId = getFirstModelId()
