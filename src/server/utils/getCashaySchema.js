require('babel-register');
require('babel-polyfill');
const {transformSchema} = require('cashay');
const graphql = require('graphql').graphql;
const rootSchema = require('../graphql/rootSchema');
const r = require('../database/rethinkDriver');

module.exports = params => {
  if (params === '?stopRethink') {
    // optional pool draining if your schema starts a DB connection pool
    r.getPoolMaster().drain();
  }
  return transformSchema(rootSchema, graphql);
};
