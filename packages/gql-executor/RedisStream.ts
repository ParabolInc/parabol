import Redis from 'ioredis'

const {REDIS_URL} = process.env

type MessageValue = [prop: string, stringifiedData: string]
type Message = [messageId: string, value: MessageValue]
type XReadGroupRes = [streamName: string, messages: Message[]]
export default class RedisStream<T> implements AsyncIterableIterator<T> {
  private stream: string
  private consumerGroup: string
  // xreadgroup blocks until a response is received, so this needs its own connection
  private redis = new Redis(REDIS_URL)
  private consumer: string

  constructor(stream: string, consumerGroup: string, consumer: string) {
    this.stream = stream
    this.consumerGroup = consumerGroup
    this.consumer = consumer
  }

  [Symbol.asyncIterator]() {
    return this
  }
  async next() {
    const response = await this.redis.xreadgroup(
      'GROUP',
      this.consumerGroup,
      this.consumer,
      'COUNT',
      1,
      // block the redis connection indefinitely until a result is returned
      'BLOCK',
      0,
      // no pending entries list (lost messages are not retried)
      'NOACK',
      'STREAMS',
      this.stream,
      // listen for messages never delivered to other consumers so far
      '>'
    )
    // only happens if BLOCK is > 0
    if (!response) return this.next()
    const [_streamName, messages] = response[0] as unknown as XReadGroupRes
    const [message] = messages
    const [, value] = message
    const [, data] = value
    return {done: false, value: data}
  }
  return() {
    // disconnect is not graceful. Use quit if that's required
    this.redis.disconnect()
    return Promise.resolve({done: true as const, value: undefined})
  }
  throw(error: any) {
    this.redis.disconnect()
    return Promise.resolve({done: true, value: error})
  }
}
