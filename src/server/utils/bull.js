import BullQueue from 'bull';
import Redis from 'ioredis';
import getDotenv from '../../universal/utils/dotenv';

getDotenv();

const urlString = process.env.REDIS_URL || 'redis://localhost:6379';

// Re-use redis connections:
const client = new Redis(urlString);
const subscriber = new Redis(urlString);
const opts = {
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

export default (name) => BullQueue(name, opts);
