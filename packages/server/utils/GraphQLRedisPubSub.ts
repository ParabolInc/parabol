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
  publisher: Redis
  subscriber: Redis
  listenersByChannel: ListenersByChannel = {}
  constructor(publisher: Redis, subscriber: Redis) {
    this.publisher = publisher
    this.subscriber = subscriber
    this.subscriber.on('message', this.onMessage)
  }

  private onMessage = (channel: string, message: string) => {
    const listeners = this.listenersByChannel[channel]
    if (!listeners) return
    const parsedMessage = JSON.parse(message)
    listeners.forEach((listener) => {
      listener(parsedMessage)
    })
  }

  publish = (channel: string, payload: any) => {
    return this.publisher.publish(channel, JSON.stringify(payload))
  }

  subscribe = (channels: string[], options: SubscribeOptions = {}) => {
    this.subscriber.subscribe(...channels)
    const onStart = (listener: SubscriptionListener) => {
      channels.forEach((channel) => {
        this.listenersByChannel[channel] = this.listenersByChannel[channel] || []
        this.listenersByChannel[channel]!.push(listener)
      })
    }
    const onCompleted = (listener: SubscriptionListener) => {
      options?.onCompleted?.()
      this.unsubscribe(channels, listener)
    }
    return new SubscriptionIterator({onStart, onCompleted, transform: options?.transform})
  }

  unsubscribe = (channels: string[], listener: SubscriptionListener) => {
    const emptyChannels = [] as string[]
    channels.forEach((channel) => {
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
    })
    if (emptyChannels.length > 0) {
      this.subscriber.unsubscribe(...emptyChannels)
    }
  }

  destroy() {
    this.subscriber.off('message', this.onMessage)
  }
}
