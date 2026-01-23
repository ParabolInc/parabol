export class JobQueueError extends Error {
  name = 'JobQueueError' as const
  retry: boolean
  jobData?: Record<string, any>

  constructor(message: string | Error, retry: boolean = false, jobData?: Record<string, any>) {
    const strMessage = message instanceof Error ? message.message : message
    super(strMessage)
    this.message = strMessage
    this.retry = retry ?? false
    this.jobData = jobData
    if (message instanceof Error) {
      this.stack = message.stack
    }
  }
}
