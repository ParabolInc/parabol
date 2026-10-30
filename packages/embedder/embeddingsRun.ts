import getRedis from '../server/utils/getRedis'
import type {ModelId} from './ai_models/modelIdDefinitions'

const RUN_KEY = 'embeddingsRun'
const progressKey = (modelId: ModelId) => `embeddingsRunProgress:${modelId}`

export interface EmbeddingsRunSettings {
  modelId: ModelId
  sourceModelId: ModelId
  state: 'running' | 'paused'
  copyMetadata: boolean
  queueSize: number
}

export interface EmbeddingsRun extends EmbeddingsRunSettings {
  pageCursor: string | null
  metadataCursor: number | null
  metadataDone: boolean
  pagesDone: boolean
}

export const getEmbeddingsRun = async (): Promise<EmbeddingsRun | null> => {
  const redis = getRedis()
  const settings = await redis.hgetall(RUN_KEY)
  if (!settings.modelId || !settings.sourceModelId) return null
  const modelId = settings.modelId as ModelId
  const progress = await redis.hgetall(progressKey(modelId))
  return {
    modelId,
    sourceModelId: settings.sourceModelId as ModelId,
    state: settings.state === 'paused' ? 'paused' : 'running',
    copyMetadata: settings.copyMetadata === '1',
    queueSize: Number(settings.queueSize),
    pageCursor: progress.pageCursor || null,
    metadataCursor: progress.metadataCursor ? Number(progress.metadataCursor) : null,
    metadataDone: progress.metadataDone === '1',
    pagesDone: progress.pagesDone === '1'
  }
}

export const startEmbeddingsRun = async (settings: EmbeddingsRunSettings) => {
  const redis = getRedis()
  await redis.del(progressKey(settings.modelId))
  await redis.hset(RUN_KEY, {
    modelId: settings.modelId,
    sourceModelId: settings.sourceModelId,
    state: settings.state,
    copyMetadata: settings.copyMetadata ? '1' : '0',
    queueSize: String(settings.queueSize)
  })
}

export const setEmbeddingsRunState = async (state: EmbeddingsRunSettings['state']) => {
  await getRedis().hset(RUN_KEY, {state})
}

export const saveEmbeddingsRunProgress = async (run: EmbeddingsRun) => {
  await getRedis().hset(progressKey(run.modelId), {
    pageCursor: run.pageCursor ?? '',
    metadataCursor: run.metadataCursor === null ? '' : String(run.metadataCursor),
    metadataDone: run.metadataDone ? '1' : '0',
    pagesDone: run.pagesDone ? '1' : '0'
  })
}
