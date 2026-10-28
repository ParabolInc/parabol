import {activeEmbeddingModelId} from '../../../embedder/activeEmbeddingModel'
import {embedQuery} from '../../../embedder/workflows/embedQuery'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'

jest.mock('../../../embedder/ai_models/ModelManager', () => ({
  __esModule: true,
  default: () => ({getEmbedder: () => mockEmbedder})
}))

jest.mock('../../utils/getRedis', () => ({
  __esModule: true,
  default: () => ({publish: mockPublish})
}))

const mockPublish = jest.fn(async () => 1)

const mockEmbedder = {
  getEmbedding: jest.fn(async (): Promise<number[] | Error> => [1, 0, 0])
}

const data = (expiresAt: number) => ({
  query: 'retro',
  modelId: activeEmbeddingModelId!,
  requestId: 7,
  channelName: 'embedderResponse:1' as const,
  expiresAt
})

it('skips a query job whose requester stopped waiting', async () => {
  const input = data(Date.now() - 1)
  expect(await embedQuery({dataLoader: getNewDataLoader('embedQueryTest'), data: input})).toBe(
    input
  )
  expect(mockEmbedder.getEmbedding).not.toHaveBeenCalled()
  expect(mockPublish).not.toHaveBeenCalled()
})

it('embeds and publishes a live query job', async () => {
  await embedQuery({
    dataLoader: getNewDataLoader('embedQueryTest'),
    data: data(Date.now() + 5_000)
  })
  expect(mockEmbedder.getEmbedding).toHaveBeenCalledWith('retro')
  expect(mockPublish).toHaveBeenCalledWith('embedderResponse:1', expect.any(Buffer))
})
