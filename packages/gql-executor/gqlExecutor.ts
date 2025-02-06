import tracer from 'dd-trace'
import {ServerChannel} from 'parabol-client/types/constEnums'
import GQLExecutorChannelId from '../client/shared/gqlIds/GQLExecutorChannelId'
import SocketServerChannelId from '../client/shared/gqlIds/SocketServerChannelId'
import executeGraphQL from '../server/graphql/executeGraphQL'
import '../server/initSentry'
import '../server/monkeyPatchFetch'
import {GQLRequest} from '../server/types/custom'
import {Logger} from '../server/utils/Logger'
import RedisInstance from '../server/utils/RedisInstance'
import RedisStream from './RedisStream'

tracer.init({
  service: `gql`,
  appsec: process.env.DD_APPSEC_ENABLED === 'true',
  plugins: false,
  version: process.env.npm_package_version
})
tracer.use('ioredis').use('http').use('pg')

const {SERVER_ID} = process.env
interface PubSubPromiseMessage {
  jobId: string
  socketServerId: string
  request: GQLRequest
}

const run = async () => {
  const publisher = new RedisInstance('gql_pub')
  const subscriber = new RedisInstance('gql_sub')
  const executorChannel = GQLExecutorChannelId.join(SERVER_ID!)
  let activeJobCount = 0

  // on shutdown, remove consumer from the group wait for current jobs to complete
  process.on('SIGTERM', async (signal) => {
    const MAX_SHUTDOWN_TIME = 40000
    const SHUTDOWN_CHECK_INTERVAL = 1000
    let start = Date.now()
    Logger.log(
      `Server ID: ${SERVER_ID}. Kill signal received: ${signal}, starting graceful shutdown.`
    )

    await publisher.xgroup(
      'DELCONSUMER',
      ServerChannel.GQL_EXECUTOR_STREAM,
      ServerChannel.GQL_EXECUTOR_CONSUMER_GROUP,
      executorChannel
    )

    setInterval(() => {
      if (Date.now() - start >= MAX_SHUTDOWN_TIME) {
        Logger.log(`Server ID: ${SERVER_ID}. Graceful shutdown timed out, exiting.`)
        process.exit()
      } else if (activeJobCount <= 0) {
        Logger.log(`Server ID: ${SERVER_ID}. Graceful shutdown complete, exiting.`)
        process.exit()
      }
    }, SHUTDOWN_CHECK_INTERVAL)
  })

  // subscribe to direct messages
  const onMessage = async (_channel: string, message: string) => {
    const {jobId, socketServerId, request} = JSON.parse(message) as PubSubPromiseMessage
    activeJobCount++
    const response = await executeGraphQL(request)
    const channel = SocketServerChannelId.join(socketServerId)
    publisher.publish(channel, JSON.stringify({response, jobId}))
    activeJobCount--
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
  Logger.log(`\n💧💧💧 Server ID: ${SERVER_ID}. Ready for GraphQL Execution 💧💧💧`)

  for await (const message of incomingStream) {
    // don't await the call below so this instance can immediately call incomingStream.next()
    // and be put back in the consumer group, which means it can process more than 1 job at a time
    // See https://www.loom.com/share/b56812bc561348d0b3d74fe35414499d
    onMessage('', message)
  }
}

run()
