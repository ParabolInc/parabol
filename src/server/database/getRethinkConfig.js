import url from 'url';
import {readCert} from './readCert';
import flag from 'node-env-flag';
import {getDotenv} from 'universal/utils/dotenv';

// Import .env and expand variables:
getDotenv();

export const getRethinkConfig = () => {
  const urlString = process.env.RETHINKDB_URL || 'rethinkdb://localhost:28015/actionDevelopment';
  const u = url.parse(urlString);

  const config = {
    host: u.hostname,
    port: parseInt(u.port, 10),
    authKey: process.env.RETHINKDB_AUTH_KEY || '',
    db: u.path.split('/')[1],
    min: process.env.NODE_ENV === 'production' ? 50 : 3,
    buffer: process.env.NODE_ENV === 'production' ? 50 : 3
  };

  if (process.env.NODE_ENV && flag(process.env.RETHINKDB_SSL)) {
    // we may need a cert for production deployment
    // Compose.io requires this, for example.
    // https://www.compose.io/articles/rethinkdb-and-ssl-think-secure/
    Object.assign(config, {
      ssl: {
        ca: readCert()
      }
    });
  }
  return config;
};
