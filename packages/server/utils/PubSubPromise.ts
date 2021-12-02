import Redis from 'ioredis'
import ms from 'ms'
import numToBase64 from './numToBase64'
import sendToSentry from './sendToSentry'

const STANDARD_TIMEOUT = ms('10s')
const ADHOC_TIMEOUT = ms('1m')

interface Job {
  resolve: (payload: any) => void
  timeoutId: NodeJS.Timeout
}

const {SERVER_ID, REDIS_URL} = process.env

interface BaseRequest {
  serverChannel?: string
  isAdHoc?: boolean
}

export default class PubSubPromise<Request extends BaseRequest, Response> {
  jobs = {} as {[jobId: string]: Job}
  publisher = new Redis(REDIS_URL)
  subscriber = new Redis(REDIS_URL)
  subChannel: string
  stream: string
  jobCounter = 0

  constructor(stream: string, subChannel: string) {
    this.stream = stream
    this.subChannel = subChannel
  }
  onMessage = (_channel: string, message: string) => {
    const {jobId, response} = JSON.parse(message)
    const cachedJob = this.jobs[jobId]
    if (!cachedJob) return
    delete this.jobs[jobId]
    const {resolve, timeoutId} = cachedJob
    clearTimeout(timeoutId)
    resolve(response)
  }

  subscribe = () => {
    this.subscriber.on('message', this.onMessage)
    this.subscriber.subscribe(this.subChannel)
  }

  publish = (request: Request) => {
    return new Promise<Response>((resolve, reject) => {
      const nextJob = numToBase64(this.jobCounter++)
      const jobId = `${SERVER_ID}:${nextJob}`
      const {isAdHoc} = request
      const timeout = isAdHoc ? ADHOC_TIMEOUT : STANDARD_TIMEOUT
      const timeoutId = setTimeout(() => {
        delete this.jobs[jobId]
        reject(new Error('TIMEOUT'))
      }, timeout)
      const previousJob = this.jobs[jobId]
      if (previousJob) {
        sendToSentry(new Error('REDIS JOB ALREADY EXISTS'), {tags: {jobId}})
      }
      this.jobs[jobId] = {resolve, timeoutId}
      const {serverChannel, ...rest} = request
      const message = JSON.stringify({jobId, request: rest})
      if (serverChannel) {
        this.publisher.publish(serverChannel, message)
      } else {
        // cap the stream to slightly more than 1000 entries.
        this.publisher.xadd(this.stream, 'MAXLEN', '~', 1000, '*', 'msg', message)
      }
    })
  }
}
