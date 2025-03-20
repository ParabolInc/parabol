import type {ExecutionResult, GraphQLError, InitialIncrementalExecutionResult} from 'graphql'
import ms from 'ms'
import GQLExecutorChannelId from '../../client/shared/gqlIds/GQLExecutorChannelId'
import type {GQLRequest} from '../types/GQLRequest'
import {Logger} from './Logger'
import RedisInstance from './RedisInstance'
import numToBase64 from './numToBase64'
import sendToSentry from './sendToSentry'

// OpenAI calls like pageInsights can take a LONG time
const STANDARD_TIMEOUT = ms('30s')
const LONG_TIMEOUT = ms('60s')
const ADHOC_TIMEOUT = ms('10m')

interface Job {
  onResult: (payload: any) => void
  onTimeout: () => void
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
    const {onResult, timeoutId, onTimeout} = cachedJob
    clearTimeout(timeoutId)
    if (!response.hasNext) {
      delete this.jobs[jobId]
    } else {
      cachedJob.timeoutId = setTimeout(onTimeout, STANDARD_TIMEOUT)
    }
    onResult(response)
  }

  subscribe = () => {
    this.subscriber.on('message', this.onMessage)
    this.subscriber.subscribe(this.subChannel)
  }

  publish = (
    request: GQLRequest & BaseRequest,
    onResult: (result: ExecutionResult | InitialIncrementalExecutionResult) => void
  ) => {
    const nextJob = numToBase64(this.jobCounter++)
    const jobId = `${SERVER_ID}:${nextJob}`
    const {isAdHoc, longRunning} = request
    const timeout = isAdHoc ? ADHOC_TIMEOUT : longRunning ? LONG_TIMEOUT : STANDARD_TIMEOUT
    const onTimeout = () => {
      delete this.jobs[jobId]
      const {authToken, docId, query, variables} = request
      Logger.error('GQL executor took too long to respond', {
        tags: {
          userId: authToken?.sub ?? '',
          authToken: JSON.stringify(authToken),
          docId: docId || '',
          query: query?.slice(0, 50) ?? '',
          variables: JSON.stringify(variables),
          socketServerId: SERVER_ID!,
          executorServerId
        }
      })
      onResult({errors: [{message: 'The request took too long'} as GraphQLError]})
    }
    const timeoutId = setTimeout(onTimeout, timeout)
    const previousJob = this.jobs[jobId]
    if (previousJob) {
      sendToSentry(new Error('REDIS JOB ALREADY EXISTS'), {tags: {jobId}})
    }
    this.jobs[jobId] = {onResult, onTimeout, timeoutId}
    const {executorServerId, ...rest} = request
    const message = JSON.stringify({jobId, socketServerId: SERVER_ID, request: rest})
    if (executorServerId) {
      const executorChannel = GQLExecutorChannelId.join(executorServerId)
      this.publisher.publish(executorChannel, message)
    } else {
      // cap the stream to slightly more than 1000 entries.
      this.publisher.xadd(this.stream, 'MAXLEN', '~', 1000, '*', 'msg', message)
    }
  }
}
