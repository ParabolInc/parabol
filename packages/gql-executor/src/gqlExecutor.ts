import Redis from 'ioredis'
import {ServerChannel} from 'parabol-client/lib/types/constEnums'
import executeGraphQL from 'parabol-server/lib/graphql/executeGraphQL'

const publisher = new Redis(process.env.REDIS_URL)
const subscriber = new Redis(process.env.REDIS_URL)

console.log('ex', executeGraphQL)
const onMessage = async (_channel: string, message: string) => {

  const payload = JSON.parse(message)
  const result = await executeGraphQL(payload)
  publisher.publish(
    ServerChannel.GQL_EXECUTOR_RESPONSE,
    JSON.stringify({...result, jobId: payload.jobId})
  )
}

subscriber.on('message', onMessage)
subscriber.subscribe(ServerChannel.GQL_EXECUTOR_REQUEST)
