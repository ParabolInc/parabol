const path = require('path');
const resolve = require('resolve');
require('babel-register')({
  resolveModuleSource(source, filename) {
    return resolve.sync(source, {
      basedir: path.resolve(filename, '..'),
      extensions: ['.js'],
      moduleDirectory: [
        '../src',
        '../node_modules'
      ]
    });
  }
});
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
