import type {ExecutionResult} from 'graphql'
import ms from 'ms'
import GQLExecutorChannelId from '../../client/shared/gqlIds/GQLExecutorChannelId'
import type {GQLRequest} from '../types/custom'
import {Logger} from './Logger'
import RedisInstance from './RedisInstance'
import {getUserId} from './authorization'
import numToBase64 from './numToBase64'
import sendToSentry from './sendToSentry'

const STANDARD_TIMEOUT = ms('10s')
const LONG_TIMEOUT = ms('60s')
const ADHOC_TIMEOUT = ms('10m')

interface Job {
  resolve: (payload: any) => void
  timeoutId: NodeJS.Timeout
}

const {SERVER_ID} = process.env

interface BaseRequest {
  executorServerId?: string
  isAdHoc?: boolean
  longRunning?: boolean
}

export default class PubSubPromise {
  jobs = {} as {[jobId: string]: Job}
  publisher = new RedisInstance('pubsubPromise_pub')
  subscriber = new RedisInstance('pubsubPromise_sub')
  subChannel: string
  stream: string
  jobCounter = 0
  carrier: any

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

  publish = <NarrowResponse = ExecutionResult>(request: GQLRequest & BaseRequest) => {
    return new Promise<NarrowResponse>((resolve, reject) => {
      const nextJob = numToBase64(this.jobCounter++)
      const jobId = `${SERVER_ID}:${nextJob}`
      const {isAdHoc, longRunning} = request
      const timeout = isAdHoc ? ADHOC_TIMEOUT : longRunning ? LONG_TIMEOUT : STANDARD_TIMEOUT
      const timeoutId = setTimeout(() => {
        delete this.jobs[jobId]
        const {authToken, docId, query, variables} = request
        Logger.error('GQL executor took too long to respond', {
          tags: {
            userId: getUserId(authToken),
            authToken: JSON.stringify(authToken),
            docId: docId || '',
            query: query?.slice(0, 50) ?? '',
            variables: JSON.stringify(variables),
            socketServerId: SERVER_ID!,
            executorServerId
          }
        })
        reject(new Error('TIMEOUT'))
      }, timeout)
      const previousJob = this.jobs[jobId]
      if (previousJob) {
        sendToSentry(new Error('REDIS JOB ALREADY EXISTS'), {tags: {jobId}})
      }
      this.jobs[jobId] = {resolve, timeoutId}
      const {executorServerId, ...rest} = request
      const message = JSON.stringify({jobId, socketServerId: SERVER_ID, request: rest})
      if (executorServerId) {
        const executorChannel = GQLExecutorChannelId.join(executorServerId)
        this.publisher.publish(executorChannel, message)
      } else {
        // cap the stream to slightly more than 1000 entries.
        this.publisher.xadd(this.stream, 'MAXLEN', '~', 1000, '*', 'msg', message)
      }
    })
  }
}
