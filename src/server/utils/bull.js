import BullQueue from 'bull';
import Redis from 'ioredis';
import getDotenv from '../../universal/utils/dotenv';

getDotenv();

const urlString = process.env.REDIS_URL || 'redis://localhost:6379';

let opts;
const startRedis = () => {
  // Re-use redis connections:
  const client = new Redis(urlString);
  const subscriber = new Redis(urlString);

  opts = {
    redis: {
      opts: {
        createClient: (type) => {
          switch (type) {
            case 'client':
              return client;
            case 'subscriber':
              return subscriber;
            default:
              return new Redis(urlString);
          }
        }
      }
    }
  };
};


export default (name) => {
  if (!opts) {
    startRedis();
  }
  return BullQueue(name, opts);
};
