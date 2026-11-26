import {resolveModelId} from './modelIdDefinitions'

export type EmbeddingsModelType = 'text-embeddings-inference' | 'vllm' | 'openai'
export type GenerationModelType = 'openai' | 'text-generation-inference'

export interface ModelConfig {
  model: `${EmbeddingsModelType | GenerationModelType}:${string}`
  url: string
  maxTokens: number
  apiModel?: string
}

export const parseModelEnvVars = (
  envVar: 'AI_EMBEDDING_MODELS' | 'AI_GENERATION_MODELS'
): ModelConfig[] => {
  const envValue = process.env[envVar]
  if (!envValue) return []
  let models
  try {
    models = JSON.parse(envValue)
  } catch {
    throw new Error(`Invalid Env Var: ${envVar}. Must be a valid JSON`)
  }

  if (!Array.isArray(models)) {
    throw new Error(`Invalid Env Var: ${envVar}. Must be an array`)
  }
  const strProperties = ['model', 'url']
  models.forEach((model, idx) => {
    if (typeof model.maxTokens !== 'number') {
      throw new Error(`Invalid Env Var: ${envVar}. Invalid "maxTokens" at index ${idx}`)
    }
    strProperties.forEach((prop) => {
      if (typeof model[prop] !== 'string') {
        throw new Error(`Invalid Env Var: ${envVar}. Invalid "${prop}" at index ${idx}`)
      }
    })
  })
  if (envVar === 'AI_GENERATION_MODELS') return models
  const modelIds = new Set<string>()
  return models.map((config: ModelConfig) => {
    const [modelType, modelId] = config.model.split(':') as [EmbeddingsModelType, string]
    const canonicalId = resolveModelId(modelId)
    if (modelIds.has(canonicalId)) throw new Error(`Duplicate embedding model: ${canonicalId}`)
    modelIds.add(canonicalId)
    if (
      config.apiModel !== undefined &&
      (modelType !== 'openai' || typeof config.apiModel !== 'string' || !config.apiModel.trim())
    ) {
      throw new Error('Embedding apiModel must be a nonempty string for an openai provider')
    }
    return {...config, model: `${modelType}:${canonicalId}`}
  })
}
