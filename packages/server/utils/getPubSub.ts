import GraphQLRedisPubSub from './GraphQLRedisPubSub'
import RedisInstance from './RedisInstance'

let pubsub: GraphQLRedisPubSub
const getPubSub = () => {
  if (!pubsub) {
    const pub = new RedisInstance('getPubSub_pub')
    const sub = new RedisInstance('getPubSub_sub')
    pubsub = new GraphQLRedisPubSub(pub, sub)
  }
  return pubsub
}
export default getPubSub
