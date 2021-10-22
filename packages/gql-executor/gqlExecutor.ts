import Redis from 'ioredis'
import {ServerChannel} from 'parabol-client/types/constEnums'
import '../server/initSentry'
import RedisStream from './RedisStream'
import './tracer'
import PROD from '../server/PROD'
import executeGraphQL, {GQLRequest} from '../server/graphql/executeGraphQL'

const {REDIS_URL, SERVER_ID} = process.env
interface PubSubPromiseMessage {
  jobId: string
  request: GQLRequest
}

const run = async (id = SERVER_ID) => {
  const redis = new Redis(REDIS_URL)
  try {
    await redis.xgroup(
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
    id
  )
  console.log(`\n💧💧💧 Ready for GraphQL Execution: ${id} 💧💧💧`)

  for await (const message of incomingStream) {
    const {jobId, request} = JSON.parse(message) as PubSubPromiseMessage
    const response = await executeGraphQL(request)
    redis.publish(ServerChannel.GQL_EXECUTOR_RESPONSE, JSON.stringify({response, jobId}))
  }
}

run()

// test a cluster in development
const NUM_EXECUTORS = 2
if (!PROD && NUM_EXECUTORS > 1) {
  for (let i = 1; i < NUM_EXECUTORS; i++) {
    run(String(Number(SERVER_ID) + i))
  }
}
