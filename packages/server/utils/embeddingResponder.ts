import {unpack} from 'msgpackr'
import RedisInstance from './RedisInstance'

type UserQueryEmbeddingResponse = {
  vector: Float32Array
  requestId: number
}
class EmbeddingResponder {
  private sub: RedisInstance
  private pending = new Map<number, (data: any) => void>()

  constructor() {
    this.sub = new RedisInstance('EmbeddingDispatcher_sub')
    const channelName = `userQueryEmbedding:${process.env.SERVER_ID}`
    this.sub.subscribe(channelName)
    this.sub.on('messageBuffer', (_channel, message) => {
      const data = unpack(message) as UserQueryEmbeddingResponse
      const {requestId, vector} = data

      const resolve = this.pending.get(requestId)
      if (resolve) {
        resolve(vector)
        this.pending.delete(requestId)
      }
    })
  }

  async waitForResponse(requestId: number, timeoutMs = 10_000) {
    return new Promise<Float32Array>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId)
        reject(new Error(`Embedding timeout for request: ${requestId}`))
      }, timeoutMs)

      this.pending.set(requestId, (vector: Float32Array) => {
        clearTimeout(timer)
        resolve(vector)
      })
    })
  }
}

export const embeddingResponder = new EmbeddingResponder()
