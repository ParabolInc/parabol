import {EmbeddingTimeoutError} from '../../../../utils/EmbeddingTimeoutError'

const mockWaitForResponse = jest.fn()

jest.mock('../../../../postgres/getKysely', () => {
  const insertQuery = {values: () => insertQuery, $if: () => insertQuery, execute: async () => []}
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
