const path = require('path');
require('babel-register')({
  /*
   * Setup require and ES6 import statements to resolve from our app's
   * root path, just like our webpack environment is configured to do.
   *
   * We need this here because getCashaySchema runs from cashay,
   * it's very own node and babel context.
   */
  resolveModuleSource: require('babel-resolver')( // eslint-disable-line global-require
    path.join(__dirname, '..', '..')
  )
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
