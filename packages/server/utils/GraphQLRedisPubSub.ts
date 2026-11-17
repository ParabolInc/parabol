import type Redis from 'ioredis'
import SubscriptionIterator, {type SubscriptionListener} from './SubscriptionIterator'

interface ListenersByChannel {
  [channel: string]: SubscriptionListener[]
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

  subscribe = async (channels: string[], onCompleted?: () => void) => {
    const onStart = (listener: SubscriptionListener) => {
      channels.forEach((channel) => {
        this.listenersByChannel[channel] = this.listenersByChannel[channel] || []
        this.listenersByChannel[channel]!.push(listener)
      })
    }
    const onCompletedHandler = (listener: SubscriptionListener) => {
      onCompleted?.()
      this.unsubscribe(channels, listener)
    }
    // listen before subscribing, so a message that arrives with the SUBSCRIBE reply isn't dropped
    // and a concurrent unsubscribe from the channel's last listener can't remove the channel
    const iterator = new SubscriptionIterator({onStart, onCompleted: onCompletedHandler})
    if (channels.length > 0) {
      try {
        await this.subscriber.subscribe(...channels)
      } catch (error) {
        await iterator.return()
        throw error
      }
    }
    return iterator
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
