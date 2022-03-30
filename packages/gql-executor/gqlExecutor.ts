import tracer from 'dd-trace'
import Redis from 'ioredis'
import {ServerChannel} from 'parabol-client/types/constEnums'
import GQLExecutorId from '../client/shared/gqlIds/GQLExecutorId'
import SocketServerId from '../client/shared/gqlIds/SocketServerId'
import executeGraphQL, {GQLRequest} from '../server/graphql/executeGraphQL'
import '../server/initSentry'
import RedisStream from './RedisStream'

tracer.init({
  enabled: process.env.DD_TRACE_ENABLED === 'true',
  service: `GQLExecutor ${process.env.SERVER_ID}`,
  appsec: process.env.DD_APPSEC_ENABLED === 'true',
  plugins: false
})

const {REDIS_URL, SERVER_ID} = process.env
interface PubSubPromiseMessage {
  jobId: string
  socketServerId: string
  request: GQLRequest
}

const run = async () => {
  const publisher = new Redis(REDIS_URL, {connectionName: 'gql_pub'})
  const subscriber = new Redis(REDIS_URL, {connectionName: 'gql_sub'})
  const executorChannel = GQLExecutorId.join(SERVER_ID)

  // subscribe to direct messages
  const onMessage = async (_channel: string, message: string) => {
    const {jobId, socketServerId, request} = JSON.parse(message) as PubSubPromiseMessage
    const response = await executeGraphQL(request)
    const channel = SocketServerId.join(socketServerId)
    publisher.publish(channel, JSON.stringify({response, jobId}))
  }

  subscriber.on('message', onMessage)
  subscriber.subscribe(executorChannel)

  // subscribe to consumer group
  try {
    await publisher.xgroup(
      'CREATE',
      ServerChannel.GQL_EXECUTOR_STREAM,
      ServerChannel.GQL_EXECUTOR_CONSUMER_GROUP,
      '$',
      'MKSTREAM'
    )
  } catch (e) {
    // stream already exists
  }

  const incomingStream = new RedisStream(
    ServerChannel.GQL_EXECUTOR_STREAM,
    ServerChannel.GQL_EXECUTOR_CONSUMER_GROUP,
    executorChannel
  )
  console.log(`\n💧💧💧 Ready for GraphQL Execution: ${SERVER_ID} 💧💧💧`)

  for await (const message of incomingStream) {
    // don't await the call below so this instance can immediately call incomingStream.next()
    // and be put back in the consumer group, which means it can process more than 1 job at a time
    // See https://www.loom.com/share/b56812bc561348d0b3d74fe35414499d
    onMessage('', message)
  }
}

run()
