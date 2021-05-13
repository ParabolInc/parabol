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
  transform?: SubscriptionTransform
}

export default class GraphQLRedisPubSub {
  publisher: Redis.Redis
  subscriber: Redis.Redis
  listenersByChannel: ListenersByChannel = {}
  constructor(publisher: Redis.Redis, subscriber: Redis.Redis) {
    this.publisher = publisher
    this.subscriber = subscriber
    this.subscriber.on('message', this.onMessage)
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

  publish = (channel: string, payload: any) => {
    return this.publisher.publish(channel, JSON.stringify(payload))
  }

  subscribe = (channels: string[], options: SubscribeOptions = {}) => {
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
    return new SubscriptionIterator({onStart, onCompleted, transform: options?.transform})
  }

  unsubscribe = (channels: string[], listener: SubscriptionListener) => {
    const emptyChannels = [] as string[]
    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i]
      const listeners = this.listenersByChannel[channel]
      if (!listeners) continue
      const listenerIdx = listeners.indexOf(listener)
      if (listenerIdx === -1) continue
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
