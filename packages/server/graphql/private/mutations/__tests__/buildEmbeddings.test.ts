import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql'
import type {EmbeddingsRunActionEnum} from '../../resolverTypes'
import buildEmbeddings from '../buildEmbeddings'

const CURRENT = 'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8'
const NEXT = 'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8#v3'
const mockRunHash = new Map<string, string>()

jest.mock('../../../../../embedder/activeEmbeddingModel', () => ({
  activeEmbeddingModelId: 'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8',
  embeddingModelIds: [
    'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8',
    'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8#v3'
  ]
}))
jest.mock('../../../mutations/helpers/publishToEmbedder', () => ({publishToEmbedder: jest.fn()}))
jest.mock('../../../../utils/getRedis', () => ({
  __esModule: true,
  default: () => ({
    hgetall: async () => Object.fromEntries(mockRunHash),
    hset: async (_key: string, values: Record<string, string>) => {
      Object.entries(values).forEach(([field, value]) => mockRunHash.set(field, value))
      return 1
    }
  })
}))
jest.mock('../../../../../embedder/feedEmbeddingsRun', () => ({
  getEmbeddingsRunProgress: async () => ({
    recentPages: {done: 2, total: 5},
    olderPages: {done: 1, total: 4},
    metadata: {done: 0, total: 3},
    queued: 0
  })
}))

const callRun = (run: {
  modelId: string
  action: EmbeddingsRunActionEnum
  copyMetadata?: boolean
  queueSize?: number
}) => {
  if (typeof buildEmbeddings !== 'function') throw new Error('buildEmbeddings must be a function')
  return buildEmbeddings({}, {input: {run}}, {} as unknown as GQLContext, {} as GraphQLResolveInfo)
}

beforeEach(() => mockRunHash.clear())

it('starts a run for a configured generation', async () => {
  expect(await callRun({modelId: NEXT, action: 'start', copyMetadata: true, queueSize: 50})).toBe(6)
  expect(Object.fromEntries(mockRunHash)).toEqual({
    modelId: NEXT,
    state: 'running',
    copyMetadata: '1',
    queueSize: '50'
  })
})

it('rejects the active generation, unknown ones and an empty queue', async () => {
  await expect(callRun({modelId: CURRENT, action: 'start'})).rejects.toThrow('modelId')
  await expect(callRun({modelId: 'unknown', action: 'start'})).rejects.toThrow('modelId')
  await expect(callRun({modelId: NEXT, action: 'start', queueSize: 0})).rejects.toThrow('queueSize')
  expect(mockRunHash.size).toBe(0)
})

it('pauses and resumes', async () => {
  await callRun({modelId: NEXT, action: 'start'})
  await callRun({modelId: NEXT, action: 'pause'})
  expect(mockRunHash.get('state')).toBe('paused')
  await callRun({modelId: NEXT, action: 'resume'})
  expect(Object.fromEntries(mockRunHash)).toEqual({
    modelId: NEXT,
    state: 'running',
    copyMetadata: '0',
    queueSize: '100'
  })
})

it('reports pages left without changing the run', async () => {
  expect(await callRun({modelId: NEXT, action: 'status'})).toBe(6)
  expect(mockRunHash.size).toBe(0)
})
