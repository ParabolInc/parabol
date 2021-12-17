import Redis from 'ioredis'
import GraphQLRedisPubSub from './GraphQLRedisPubSub'

let pubsub: GraphQLRedisPubSub
const getPubSub = () => {
  if (!pubsub) {
    const pub = new Redis(Number(process.env.REDIS_PORT), process.env.REDIS_URL, {
      connectionName: 'getPubSub_pub'
    })
    const sub = new Redis(Number(process.env.REDIS_PORT), process.env.REDIS_URL, {
      connectionName: 'getPubSub_sub'
    })
    pubsub = new GraphQLRedisPubSub(pub, sub)
  }
  return pubsub
}
export default getPubSub
