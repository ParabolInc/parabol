import RedisInstance from 'parabol-server/utils/RedisInstance'

type MessageValue = [prop: string, stringifiedData: string]
type Message = [messageId: string, value: MessageValue]
type XReadGroupRes = [streamName: string, messages: [Message, ...Message[]]]
export default class RedisStream implements AsyncIterableIterator<string> {
  private stream: string
  private consumerGroup: string
  // xreadgroup blocks until a response is received, so this needs its own connection
  private redis: RedisInstance
  private consumer: string

  constructor(stream: string, consumerGroup: string, consumer: string) {
    this.stream = stream
    this.consumerGroup = consumerGroup
    this.consumer = consumer
    this.redis = new RedisInstance(stream)
  }

  [Symbol.asyncIterator]() {
    return this
  }
  async next(): Promise<IteratorResult<string>> {
    try {
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
    } catch (e) {
      // when this.return() is called the blocking connection will throw
      return this.throw(e)
    }
  }
  async return() {
    // disconnect is not graceful. Necessary to end the blocking connection
    this.redis.disconnect()
    return Promise.resolve({done: true as const, value: undefined})
  }
  throw(error: any) {
    this.redis.disconnect()
    return Promise.resolve({done: true, value: error})
  }
}
