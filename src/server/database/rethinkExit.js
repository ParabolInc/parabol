import r from './rethinkDriver';

export default () => r.getPoolMaster().drain();
