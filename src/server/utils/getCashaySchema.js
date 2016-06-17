require('babel-register');
require('babel-polyfill');
const {transformSchema} = require('cashay');
const graphql = require('graphql').graphql;
const rootSchema = require('../graphql/rootSchema');
const r = require('../database/rethinkDriver');
module.exports = (param) => {
  if (param === '?stopRethink') {
    r.getPoolMaster().drain();
  }
  return transformSchema(rootSchema, graphql);
};
