import rethinkdbdash from 'rethinkdbdash';
import getRethinkConfig from './getRethinkConfig';

const config = getRethinkConfig();
let driver;
export default () => {
  if (!driver) {
    driver = rethinkdbdash(config);
  }
  return driver;
};
