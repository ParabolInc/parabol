import BullQueue from 'bull';
import getDotenv from '../../universal/utils/dotenv';

getDotenv();

const [DEFAULT_HOST, DEFAULT_PORT = 6379] = process.env.REDIS_HOST ?
  process.env.REDIS_HOST : ['127.0.0.1'];

export default (name, host = DEFAULT_HOST, port = DEFAULT_PORT) =>
  BullQueue(name, port, host);
