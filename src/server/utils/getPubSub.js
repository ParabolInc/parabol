import getDotenv from '../../universal/utils/dotenv';
import url from 'url';
import { RedisPubSub } from 'graphql-redis-subscriptions';

getDotenv();

let pubsub;
const getPubSub = () => {
  if (!pubsub) {
    const urlString = process.env.REDIS_URL || 'redis://localhost:6379';
    const {hostname, port} = url.parse(urlString);
    pubsub = new RedisPubSub({
      connection: {
        host: hostname,
        port
      }
    });
  }
  return pubsub;
};
export default getPubSub;
