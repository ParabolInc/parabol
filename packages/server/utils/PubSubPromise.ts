import Redis from 'ioredis'

interface PubSubPromisePayload {
  jobId: string
  [key: string]: any
}

export default class PubSubPromise<T extends PubSubPromisePayload> {
  promises = {} as {[jobId: string]: (payload: any) => void}
  publisher = new Redis(process.env.REDIS_URL)
  subscriber = new Redis(process.env.REDIS_URL)
  subChannel: string
  pubChannel: string

  constructor(pubChannel: string, subChannel: string) {
    this.pubChannel = pubChannel
    this.subChannel = subChannel
  }
  onMessage = (_channel: string, message: string) => {
    const payload = JSON.parse(message) as PubSubPromisePayload
    const {jobId} = payload
    const resolve = this.promises[jobId]
    if (resolve) {
      resolve(payload)
      delete this.promises[jobId]
    }
  }

  subscribe = () => {
    this.subscriber.on('message', this.onMessage)
    this.subscriber.subscribe(this.subChannel)
  }

  publish = (payload: PubSubPromisePayload) => {
    return new Promise<T>((resolve) => {
      const {jobId} = payload
      this.promises[jobId] = resolve
      this.publisher.publish(this.pubChannel, JSON.stringify(payload))
    })
  }
}
