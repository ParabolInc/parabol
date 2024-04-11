export class JobQueueError extends Error {
  name = 'JobQueueError' as const
  retryDelay?: number
  maxRetries?: number
  jobData?: Record<string, any>

  constructor(
    message: string,
    retryDelay?: number,
    maxRetries?: number,
    jobData?: Record<string, any>
  ) {
    super(message)
    this.message = message
    this.retryDelay = retryDelay
    this.maxRetries = maxRetries
    this.jobData = jobData
  }
}
