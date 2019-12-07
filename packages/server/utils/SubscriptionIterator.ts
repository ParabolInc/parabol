export type SubscriptionTransform = (value: any) => any
export type SubscriptionListener = (value: JSON) => Promise<void>
interface Handlers {
  onStart?: (listener: SubscriptionListener) => void
  onCompleted?: (listener: SubscriptionListener) => void
}

export default class SubscriptionIterator {
  [Symbol.asyncIterator]() {
    return this
  }
  done = false
  pushQueue = [] as any[]
  pullQueue = [] as any[]
  transform: SubscriptionTransform
  onStart?: (listener: SubscriptionListener) => void
  onCompleted?: (listener: SubscriptionListener) => void
  pushValue = async (input: any) => {
    // TODO try/catch
    const value = await this.transform(input)
    if (value !== undefined) {
      const resolver = this.pullQueue.shift()
      if (resolver) {
        resolver({value, done: false})
      } else {
        this.pushQueue.push(value)
      }
    }
  }

  constructor(transform: SubscriptionTransform, {onStart, onCompleted}: Handlers) {
    this.transform = transform
    this.onStart = onStart
    this.onCompleted = onCompleted
    onStart?.(this.pushValue)
  }

  pullValue = () => {
    if (this.done) return {done: true, value: undefined}
    return new Promise((resolve) => {
      const value = this.pushQueue.shift()
      if (value) {
        resolve({value, done: false})
      } else {
        this.pullQueue.push(resolve)
      }
    })
  }

  close = () => {
    this.done = true
    this.onCompleted?.(this.pushValue)
  }

  next() {
    return this.pullValue()
  }

  return() {
    this.close()
    return Promise.resolve({value: undefined, done: true})
  }

  throw(error) {
    this.close()
    return Promise.reject(error)
  }
}
