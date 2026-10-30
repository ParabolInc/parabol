import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql'
import type {EmbeddingsRunActionEnum} from '../../resolverTypes'
import buildEmbeddings from '../buildEmbeddings'

const CURRENT = 'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8'
const NEXT = 'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8#v3'
const mockHashes = new Map<string, Map<string, string>>()
const mockActive = {modelId: 'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8'}
const mockGetProgress = jest.fn(async (_target: string, _source: string) => ({
  recentPages: {done: 2, total: 5},
  olderPages: {done: 1, total: 4},
  metadata: {done: 0, total: 3},
  queued: 0
}))

jest.mock('../../../../../embedder/activeEmbeddingModel', () => ({
  get activeEmbeddingModelId() {
    return mockActive.modelId
  },
  embeddingModelIds: [
    'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8',
    'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8#v3'
  ]
}))
jest.mock('../../../mutations/helpers/publishToEmbedder', () => ({publishToEmbedder: jest.fn()}))
jest.mock('../../../../utils/getRedis', () => ({
  __esModule: true,
  default: () => ({
    hgetall: async (key: string) => Object.fromEntries(mockHashes.get(key) ?? []),
    hset: async (key: string, values: Record<string, string>) => {
      const hash = mockHashes.get(key) ?? new Map<string, string>()
      Object.entries(values).forEach(([field, value]) => hash.set(field, value))
      mockHashes.set(key, hash)
      return 1
    },
    del: async (key: string) => Number(mockHashes.delete(key))
  })
}))
jest.mock('../../../../../embedder/feedEmbeddingsRun', () => ({
  getEmbeddingsRunProgress: (target: string, source: string) => mockGetProgress(target, source)
}))

const runHash = () => Object.fromEntries(mockHashes.get('embeddingsRun') ?? [])

const callRun = (run: {
  modelId: string
  action: EmbeddingsRunActionEnum
  copyMetadata?: boolean
  queueSize?: number
}) => {
  if (typeof buildEmbeddings !== 'function') throw new Error('buildEmbeddings must be a function')
  return buildEmbeddings({}, {input: {run}}, {} as unknown as GQLContext, {} as GraphQLResolveInfo)
}

beforeEach(() => {
  mockHashes.clear()
  mockActive.modelId = CURRENT
  mockGetProgress.mockClear()
})

it('starts a run for a configured generation', async () => {
  expect(await callRun({modelId: NEXT, action: 'start', copyMetadata: true, queueSize: 50})).toBe(6)
  expect(runHash()).toEqual({
    modelId: NEXT,
    sourceModelId: CURRENT,
    state: 'running',
    copyMetadata: '1',
    queueSize: '50'
  })
  expect(mockGetProgress).toHaveBeenCalledWith(NEXT, CURRENT)
})

it('rejects the active generation, unknown ones and an empty queue', async () => {
  await expect(callRun({modelId: CURRENT, action: 'start'})).rejects.toThrow('modelId')
  await expect(callRun({modelId: 'unknown', action: 'start'})).rejects.toThrow('modelId')
  await expect(callRun({modelId: NEXT, action: 'start', queueSize: 0})).rejects.toThrow('queueSize')
  expect(mockHashes.size).toBe(0)
})

it('pauses and resumes', async () => {
  await callRun({modelId: NEXT, action: 'start'})
  await callRun({modelId: NEXT, action: 'pause'})
  expect(runHash().state).toBe('paused')
  await callRun({modelId: NEXT, action: 'resume'})
  expect(runHash()).toEqual({
    modelId: NEXT,
    sourceModelId: CURRENT,
    state: 'running',
    copyMetadata: '0',
    queueSize: '1000'
  })
})

it('keeps managing a run after its generation becomes active', async () => {
  await callRun({modelId: NEXT, action: 'start'})
  mockActive.modelId = NEXT
  await callRun({modelId: NEXT, action: 'pause'})
  expect(runHash().state).toBe('paused')
  expect(await callRun({modelId: NEXT, action: 'status'})).toBe(6)
  expect(mockGetProgress).toHaveBeenLastCalledWith(NEXT, CURRENT)
})

it('reports pages left without changing the run', async () => {
  await callRun({modelId: NEXT, action: 'start'})
  const started = runHash()
  expect(await callRun({modelId: NEXT, action: 'status'})).toBe(6)
  expect(runHash()).toEqual(started)
})

it('needs a run to pause or report on', async () => {
  await expect(callRun({modelId: NEXT, action: 'pause'})).rejects.toThrow('no run')
  await expect(callRun({modelId: NEXT, action: 'status'})).rejects.toThrow('no run')
})
