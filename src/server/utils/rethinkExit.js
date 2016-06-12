import r from '../database/rethinkDriver';

// Used to assert exit when running cashay-schema
export default () => r.getPoolMaster().drain();
