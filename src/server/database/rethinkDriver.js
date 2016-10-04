import rethinkdbdash from 'rethinkdbdash';
import {getRethinkConfig} from './getRethinkConfig';

/**
 * Returning a thunk for the rethinkdb client allows us to defer client
 * initialization until it's actually needed. This speeds up server
 * startup and avoids us opening a rethinkdb pool during the build process.
 */
let client = null;
export default () => {
  if (client === null) {
    client = rethinkdbdash(getRethinkConfig());
  }
  return client;
};
