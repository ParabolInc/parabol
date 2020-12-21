import Redis from 'ioredis'
import {ServerChannel} from 'parabol-client/types/constEnums'


const publisher = new Redis(process.env.REDIS_URL)
const subscriber = new Redis(process.env.REDIS_URL)

const onMessage = async (_channel: string, message: string) => {
  const payload = JSON.parse(message)
  const executeGraphQL = require('../server/graphql/executeGraphQL').default
  const result = await executeGraphQL(payload)
  publisher.publish(
    ServerChannel.GQL_EXECUTOR_RESPONSE,
    JSON.stringify({...result, jobId: payload.jobId})
  )
}

subscriber.on('message', onMessage)
subscriber.subscribe(ServerChannel.GQL_EXECUTOR_REQUEST)
console.log(`\n💧💧💧 Ready for GraphQL Execution 💧💧💧`)
