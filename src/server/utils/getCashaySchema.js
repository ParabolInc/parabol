require('babel-register');
require('babel-polyfill');
const {transformSchema} = require('cashay');
const graphql = require('graphql').graphql;
const rootSchema = require('../graphql/rootSchema');
const r = require('../database/rethinkDriver');
// r.getPoolMaster().drain();
module.exports = transformSchema(rootSchema, graphql);
