import {unpack} from 'msgpackr'
import RedisInstance from './RedisInstance'

type EmbeddingResponse = {
  vector: Float32Array
  requestId: number
}

class EmbeddingResponder {
  private sub: RedisInstance
  private pending = new Map<number, (vector: Float32Array) => void>()

  readonly channelName = `embedderResponse:${process.env.SERVER_ID}`

  constructor() {
    this.sub = new RedisInstance('EmbeddingDispatcher_sub')
    this.sub.subscribe(this.channelName)
    this.sub.on('messageBuffer', (_channel, message) => {
      const {requestId, vector} = unpack(message) as EmbeddingResponse
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
