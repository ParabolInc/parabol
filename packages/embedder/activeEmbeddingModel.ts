import {type ModelId, modelIdDefinitions} from './ai_models/modelIdDefinitions'
import {type EmbeddingsModelType, parseModelEnvVars} from './ai_models/parseModelEnvVars'
import {getEmbeddingsTableName} from './getEmbeddingsTableName'

// The goal here is to have a string constant of the table name available to the server
// Without importing all the abstract model classes

const getTableSuffix = () => {
  const embeddingConfig = parseModelEnvVars('AI_EMBEDDING_MODELS')
  const firstEmbeddingConfig = embeddingConfig[0]
  if (!firstEmbeddingConfig) return null
  const {model} = firstEmbeddingConfig
  const [, modelId] = model.split(':') as [EmbeddingsModelType, ModelId]
  const modelDefinition = modelIdDefinitions[modelId]
  const {tableSuffix} = modelDefinition
  return tableSuffix
}
const tableSuffix = getTableSuffix()
export const activeEmbeddingModel = getEmbeddingsTableName(tableSuffix)
