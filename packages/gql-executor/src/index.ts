// import Redis from 'ioredis'
// import {ServerChannel} from 'parabol-client/src/types/constEnums'
import executeGraphQL from 'parabol-server/graphql/executeGraphQL'

// const publisher = new Redis(process.env.REDIS_URL)
// const subscriber = new Redis(process.env.REDIS_URL)

console.log('ex', executeGraphQL)
// const onMessage = (_channel: string, message: string) => {
//   const payload = JSON.parse(message)
//   const result = executeGraphQL(payload)
//   publisher.publish(
//     ServerChannel.GQL_EXECUTOR_RESPONSE,
//     JSON.stringify({...result, jobId: payload.jobId})
//   )
// }

// subscriber.on('message', onMessage)
// subscriber.subscribe(ServerChannel.GQL_EXECUTOR_REQUEST)
