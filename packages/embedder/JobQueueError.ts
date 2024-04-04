export class JobQueueError extends Error {
  name = 'JobQueueError' as const
  retryDelay?: number
  maxRetries?: number

  constructor(message: string, retryDelay?: number, maxRetries?: number) {
    super(message)
    this.message = message
    this.retryDelay = retryDelay
    this.maxRetries = maxRetries
  }
}
