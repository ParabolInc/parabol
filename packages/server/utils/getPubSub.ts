import Redis from 'ioredis'
import getDotenv from '../../server/utils/dotenv'
import GraphQLRedisPubSub from './GraphQLRedisPubSub'

getDotenv()

let pubsub: GraphQLRedisPubSub
const getPubSub = () => {
  if (!pubsub) {
    const pub = new Redis(process.env.REDIS_URL)
    const sub = new Redis(process.env.REDIS_URL)
    pubsub = new GraphQLRedisPubSub(pub, sub)
  }
  return pubsub
}
export default getPubSub
