import Redis from 'ioredis'
import SubscriptionIterator, {
  SubscriptionListener,
  SubscriptionTransform
} from './SubscriptionIterator'

interface ListenersByChannel {
  [channel: string]: SubscriptionListener[]
}

interface SubscribeOptions {
  onCompleted?: () => void
}

export default class GraphQLRedisPubSub {
  publisher: Redis.Redis
  subscriber: Redis.Redis
  listenersByChannel: ListenersByChannel = {}
  constructor(publisher: Redis.Redis, subscriber: Redis.Redis) {
    this.publisher = publisher
    this.subscriber = subscriber
    this.setup()
  }

  private onMessage = (channel: string, message: string) => {
    const listeners = this.listenersByChannel[channel]
    if (!listeners) return
    const parsedMessage = JSON.parse(message)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener(parsedMessage)
    }
  }

  private setup() {
    this.subscriber.on('message', this.onMessage)
  }

  publish = (channel: string, payload: object) => {
    return this.publisher.publish(channel, JSON.stringify(payload))
  }

  subscribe = (
    channels: string[],
    transform: SubscriptionTransform,
    options: SubscribeOptions = {}
  ) => {
    this.subscriber.subscribe(...channels)
    const onStart = (listener: SubscriptionListener) => {
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i]
        this.listenersByChannel[channel] = this.listenersByChannel[channel] || []
        this.listenersByChannel[channel].push(listener)
      }
    }
    const onCompleted = (listener: SubscriptionListener) => {
      options?.onCompleted?.()
      this.unsubscribe(channels, listener)
    }
    return new SubscriptionIterator(transform, {onStart, onCompleted})
  }

  unsubscribe = (channels: string[], listener: SubscriptionListener) => {
    const emptyChannels = [] as string[]
    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i]
      const listeners = this.listenersByChannel[channel]
      if (!listeners) return
      const listenerIdx = listeners.indexOf(listener)
      if (listenerIdx === -1) return
      if (listeners.length === 1) {
        emptyChannels.push(channel)
        delete this.listenersByChannel[channel]
      } else {
        listeners.splice(listenerIdx, 1)
      }
    }
    if (emptyChannels.length > 0) {
      this.subscriber.unsubscribe(...emptyChannels)
    }
  }

  destroy() {
    this.subscriber.off('message', this.onMessage)
  }
}
