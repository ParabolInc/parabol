import r from './rethinkDriver';

// Used to assert exit when running cashay-schema
export default () => r.getPoolMaster().drain();
