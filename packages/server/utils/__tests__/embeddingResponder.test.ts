import {EmbeddingTimeoutError} from '../EmbeddingTimeoutError'
import {embeddingResponder} from '../embeddingResponder'

jest.mock('../RedisInstance', () => ({
  __esModule: true,
  default: class {
    subscribe() {}
    on() {}
  }
}))

it('rejects with an EmbeddingTimeoutError when no vector arrives in time', async () => {
  const error = await embeddingResponder.waitForResponse(7, 1).catch((e: unknown) => e)
  expect(error).toBeInstanceOf(EmbeddingTimeoutError)
  expect(error).toHaveProperty('message', 'Embedding timeout for request: 7')
})
