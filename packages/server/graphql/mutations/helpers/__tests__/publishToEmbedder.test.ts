import {EmbeddingTimeoutError} from '../../../../utils/EmbeddingTimeoutError'

const mockWaitForResponse = jest.fn()
const mockInsertedValues: Record<string, unknown>[] = []

jest.mock('../../../../postgres/getKysely', () => {
  const insertQuery = {
    values: (values: Record<string, unknown> | Record<string, unknown>[]) => {
      if (Array.isArray(values) && values.length === 0)
        throw new Error('syntax error at or near ")"')
      mockInsertedValues.push(...[values].flat())
      return insertQuery
    },
    $if: () => insertQuery,
    execute: async () => []
  }
  return {__esModule: true, default: () => ({insertInto: () => insertQuery})}
})
jest.mock('../../../../utils/getRedis', () => ({
  __esModule: true,
  default: () => ({publish: async () => 1})
}))
jest.mock('../../../../../embedder/getEmbedderJobPriority', () => ({
  getEmbedderJobPriority: async () => 0
}))
jest.mock('../../../../utils/embeddingResponder', () => ({
  embeddingResponder: {
    channelName: 'embedderResponse:1',
    nextRequestId: () => 7,
    waitForResponse: (...args: unknown[]) => mockWaitForResponse(...args)
  }
}))

const publishUserQuery = () => {
  jest.resetModules()
  process.env.AI_EMBEDDER_WORKERS = '1'
  const {publishToEmbedder} =
    require('../publishToEmbedder') as typeof import('../publishToEmbedder')
  return publishToEmbedder({
    jobType: 'userQuery:start',
    data: {
      query: 'retro',
      requestId: 7,
      channelName: 'embedderResponse:1',
      expiresAt: Date.now() + 3_000
    }
  })
}

it('returns an error when the embedder responds with an empty vector', async () => {
  mockWaitForResponse.mockResolvedValue(new Float32Array(0))
  expect(await publishUserQuery()).toBeInstanceOf(Error)
})

it('returns the vector the embedder responds with', async () => {
  const vector = new Float32Array([0.5, 0.25])
  mockWaitForResponse.mockResolvedValue(vector)
  expect(await publishUserQuery()).toBe(vector)
})

it('returns the timeout error when the embedder does not respond in time', async () => {
  const timeout = new EmbeddingTimeoutError('Embedding timeout for request: 7')
  mockWaitForResponse.mockRejectedValue(timeout)
  expect(await publishUserQuery()).toBe(timeout)
})

it('delays only page jobs, so searches never wait', async () => {
  jest.resetModules()
  process.env.AI_EMBEDDER_WORKERS = '1'
  const {publishToEmbedder} =
    require('../publishToEmbedder') as typeof import('../publishToEmbedder')
  mockWaitForResponse.mockResolvedValue(new Float32Array([0.5]))
  mockInsertedValues.length = 0
  await publishToEmbedder({
    jobType: 'userQuery:start',
    data: {
      query: 'retro',
      requestId: 7,
      channelName: 'embedderResponse:1',
      expiresAt: Date.now() + 3_000
    }
  })
  await publishToEmbedder({jobType: 'embed:start', embeddingsMetadataId: 1})
  await publishToEmbedder({jobType: 'embedPage:start', pageId: 1})
  expect(
    mockInsertedValues.map(({jobType, runAfter}) => [jobType, runAfter !== undefined])
  ).toEqual([
    ['userQuery:start', false],
    ['embed:start', false],
    ['embedPage:start', true]
  ])
})

const CURRENT_GENERATION = 'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8'
const NEXT_GENERATION = 'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8#v3'
const configuredModels = process.env.AI_EMBEDDING_MODELS

const withGenerations = (modelIds: string[]) => {
  jest.resetModules()
  process.env.AI_EMBEDDER_WORKERS = '1'
  process.env.AI_EMBEDDING_MODELS = JSON.stringify(
    modelIds.map((modelId) => ({
      model: `text-embeddings-inference:${modelId}`,
      url: 'http://localhost:3040/',
      maxTokens: 2048
    }))
  )
  mockInsertedValues.length = 0
  return (require('../publishToEmbedder') as typeof import('../publishToEmbedder'))
    .publishToEmbedder
}

describe('generations', () => {
  afterEach(() => {
    process.env.AI_EMBEDDING_MODELS = configuredModels
  })

  it('queues a page edit for every generation', async () => {
    const publishToEmbedder = withGenerations([NEXT_GENERATION, CURRENT_GENERATION])
    await publishToEmbedder({jobType: 'embedPage:start', pageId: 1})
    expect(
      mockInsertedValues.map(({modelId, runAfter}) => [modelId, runAfter !== undefined])
    ).toEqual([
      [NEXT_GENERATION, true],
      [CURRENT_GENERATION, true]
    ])
  })

  it('answers a metadata request from the active generation only', async () => {
    const publishToEmbedder = withGenerations([NEXT_GENERATION, CURRENT_GENERATION])
    mockWaitForResponse.mockResolvedValue(new Float32Array([0.5]))
    await publishToEmbedder({
      jobType: 'embed:start',
      embeddingsMetadataId: 1,
      data: {requestId: 7, channelName: 'embedderResponse:1'}
    })
    expect(
      mockInsertedValues.map(({modelId, jobData}) => [modelId, JSON.parse(String(jobData))])
    ).toEqual([
      [NEXT_GENERATION, {requestId: 7, channelName: 'embedderResponse:1'}],
      [CURRENT_GENERATION, {}]
    ])
  })

  it('queues each known generation once', async () => {
    const publishToEmbedder = withGenerations([
      NEXT_GENERATION,
      CURRENT_GENERATION,
      NEXT_GENERATION,
      'unknown/model'
    ])
    await publishToEmbedder({jobType: 'embedPage:start', pageId: 1})
    expect(mockInsertedValues.map(({modelId}) => modelId)).toEqual([
      NEXT_GENERATION,
      CURRENT_GENERATION
    ])
  })

  it('queues nothing when no embedding model is configured', async () => {
    jest.resetModules()
    process.env.AI_EMBEDDER_WORKERS = '1'
    process.env.AI_EMBEDDING_MODELS = '[]'
    const {publishToEmbedder} =
      require('../publishToEmbedder') as typeof import('../publishToEmbedder')
    await expect(
      publishToEmbedder({jobType: 'embedPage:start', pageId: 1})
    ).resolves.toBeUndefined()
  })

  it('queues a search query for the active generation only', async () => {
    const publishToEmbedder = withGenerations([NEXT_GENERATION, CURRENT_GENERATION])
    mockWaitForResponse.mockResolvedValue(new Float32Array([0.5]))
    await publishToEmbedder({
      jobType: 'userQuery:start',
      data: {
        query: 'retro',
        requestId: 7,
        channelName: 'embedderResponse:1',
        expiresAt: Date.now() + 3_000
      }
    })
    expect(mockInsertedValues.map(({modelId}) => modelId)).toEqual([NEXT_GENERATION])
  })
})
