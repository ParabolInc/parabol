import getDotenv from '../../universal/utils/dotenv'
import {RedisPubSub} from 'graphql-redis-subscriptions'

getDotenv()

let pubsub: RedisPubSub | undefined
const getPubSub = () => {
  if (!pubsub) {
    pubsub = new RedisPubSub({
      connection: process.env.REDIS_URL
    })
  }
  return pubsub
}
export default getPubSub
