export type SubscriptionTransform = (value: any) => any
export type SubscriptionListener = (value: JSON) => Promise<void>

interface Handlers {
  onStart?: (listener: SubscriptionListener) => void
  onCompleted?: (listener: SubscriptionListener) => void
  transform?: SubscriptionTransform
  channels: string[]
}

export default class SubscriptionIterator<T = any> implements AsyncIterator<T> {
  private done = false
  private pushQueue = [] as any[]
  private pullQueue = [] as ((resolvedValue?: any) => void)[]
  private transform?: SubscriptionTransform
  private onCompleted?: (listener: SubscriptionListener) => void
  channels: string[]
  private pushValue: SubscriptionListener = async (input) => {
    const value = this.transform ? await this.transform(input) : input
    if (value !== undefined) {
      const resolver = this.pullQueue.shift()
      if (resolver) {
        resolver({value, done: false})
      } else {
        this.pushQueue.push(value)
      }
    }
  }

  constructor({onStart, onCompleted, transform, channels}: Handlers) {
    this.transform = transform
    this.onCompleted = onCompleted
    this.channels = channels
    onStart?.(this.pushValue)
  }

  private close = () => {
    if (this.done) return
    this.done = true
    this.onCompleted?.(this.pushValue)
    this.pullQueue.forEach((resolve) => resolve({done: true, value: undefined}))
    this.pullQueue = []
  };

  [Symbol.asyncIterator]() {
    return this
  }

  next() {
    return new Promise<IteratorResult<any>>((resolve) => {
      if (this.done) resolve({done: true, value: undefined})
      const value = this.pushQueue.shift()
      if (value) {
        resolve({value, done: false})
      } else {
        this.pullQueue.push(resolve)
      }
    })
  }

  return() {
    this.close()
    return Promise.resolve({done: true as const, value: undefined})
  }

  throw(error: unknown) {
    const value = error instanceof Error ? error : new Error('SubscriptionIterator Error')
    this.close()
    return Promise.resolve({done: true as const, value})
  }
}
