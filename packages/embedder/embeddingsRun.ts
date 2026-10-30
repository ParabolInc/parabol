import getRedis from '../server/utils/getRedis'
import type {ModelId} from './ai_models/modelIdDefinitions'

const EMBEDDINGS_RUN_KEY = 'embeddingsRun'

export interface EmbeddingsRun {
  modelId: ModelId
  state: 'running' | 'paused'
  copyMetadata: boolean
  queueSize: number
}

export const getEmbeddingsRun = async (): Promise<EmbeddingsRun | null> => {
  const {modelId, state, copyMetadata, queueSize} = await getRedis().hgetall(EMBEDDINGS_RUN_KEY)
  if (!modelId) return null
  return {
    modelId: modelId as ModelId,
    state: state === 'paused' ? 'paused' : 'running',
    copyMetadata: copyMetadata === '1',
    queueSize: Number(queueSize)
  }
}

export const setEmbeddingsRun = async ({
  modelId,
  state,
  copyMetadata,
  queueSize
}: EmbeddingsRun) => {
  await getRedis().hset(EMBEDDINGS_RUN_KEY, {
    modelId,
    state,
    copyMetadata: copyMetadata ? '1' : '0',
    queueSize: String(queueSize)
  })
}
