export class JobQueueError extends Error {
  name = 'JobQueueError' as const
  retryDelay?: number
  maxRetries?: number
  jobData?: Record<string, any>

  constructor(
    message: string | Error,
    retryDelay?: number,
    maxRetries?: number,
    jobData?: Record<string, any>
  ) {
    const strMessage = message instanceof Error ? message.message : message
    super(strMessage)
    this.message = strMessage
    this.retryDelay = retryDelay
    this.maxRetries = maxRetries
    this.jobData = jobData
    if (message instanceof Error) {
      this.stack = message.stack
    }
  }
}
